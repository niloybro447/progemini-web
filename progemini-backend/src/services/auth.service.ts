import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";
import { generateToken, normalizeEmail } from "@/utils/crypto";
import { validatePassword, hashPassword, comparePassword } from "@/utils/password";
import { generateAccessToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";

// In-memory rate limiting for signup (5/hour per IP)
const signupAttempts = new Map<string, { count: number; resetTime: number }>();

function checkSignupRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = signupAttempts.get(ip);
  const limit = 5;
  const windowMs = 60 * 60 * 1000;

  if (!record || now > record.resetTime) {
    signupAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

// In-memory account lockout for admin (5 attempts / 15 min)
const failedLoginAttempts = new Map<string, { count: number; lockUntil: number }>();

function trackFailedLogin(email: string): boolean {
  const key = email.toLowerCase();
  const now = Date.now();
  const maxAttempts = 5;
  const lockoutDuration = 15 * 60 * 1000;

  const record = failedLoginAttempts.get(key);
  if (record && now < record.lockUntil) return false;
  if (!record || now > record.lockUntil) {
    failedLoginAttempts.set(key, { count: 1, lockUntil: now + lockoutDuration });
    return true;
  }
  if (record.count >= maxAttempts) {
    record.lockUntil = now + lockoutDuration;
    return false;
  }
  record.count++;
  return true;
}

function clearFailedLoginAttempts(email: string): void {
  failedLoginAttempts.delete(email.toLowerCase());
}

export async function signup(
  name: string,
  email: string,
  password: string,
  ip: string,
) {
  if (!checkSignupRateLimit(ip)) {
    throw AppError.tooManyRequests("Too many signup attempts. Please try again later.");
  }

  const normalizedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (normalizedName.length < 2) {
    throw AppError.badRequest("Name must be at least 2 characters");
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw AppError.badRequest(passwordValidation.errors.join("; "));
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw AppError.conflict("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  const verificationToken = generateToken();
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "STUDENT",
      isActive: true,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  // Attempt to send verification email — swallow failure
  try {
    const { sendVerificationEmail } = await import("@/utils/email");
    await sendVerificationEmail(user.email, user.name, verificationToken);
  } catch (emailError) {
    logger.error({ err: emailError }, "Failed to send verification email");
  }

  return {
    message: "User created successfully. Please check your email to verify your account.",
    user,
    statusCode: 201,
  };
}

export async function login(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.password) {
    throw AppError.unauthorized("Invalid credentials");
  }

  // Admin lockout check
  if (user.role === "ADMIN") {
    if (!trackFailedLogin(normalizedEmail)) {
      throw AppError.unauthorized("Account temporarily locked. Please try again later.");
    }
  }

  if (!user.isActive) {
    throw AppError.unauthorized("Account is deactivated");
  }

  // Enforce email verification for students
  if (user.role === "STUDENT" && !user.emailVerified) {
    throw AppError.unauthorized(
      "Please verify your email address before logging in. Check your inbox for the verification link.",
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw AppError.unauthorized("Invalid credentials");
  }

  if (user.role === "ADMIN") {
    clearFailedLoginAttempts(normalizedEmail);
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
  };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw AppError.badRequest("Invalid verification token");
  }

  if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
    throw AppError.badRequest("Verification link has expired. Please contact support.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return { message: "Email verified successfully" };
}

export async function forgotPassword(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // For security, don't reveal if user does not exist
  if (!user) {
    return { message: "If an account exists with this email, we have sent a password reset link." };
  }

  const resetToken = generateToken();
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpires },
  });

  try {
    const { sendPasswordResetEmail } = await import("@/utils/email");
    await sendPasswordResetEmail(user.email, user.name, resetToken);
  } catch (emailError) {
    logger.error({ err: emailError }, "Failed to send password reset email");
  }

  return { message: "If an account exists with this email, we have sent a password reset link." };
}

export async function resetPassword(token: string, password: string) {
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw AppError.badRequest(passwordValidation.errors.join("; "));
  }

  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  });

  if (!user) {
    throw AppError.badRequest("Invalid reset token");
  }

  if (user.resetTokenExpires && new Date() > user.resetTokenExpires) {
    throw AppError.badRequest("Password reset link has expired. Please request a new one.");
  }

  const hashedPassword = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return { message: "Password reset successfully" };
}
