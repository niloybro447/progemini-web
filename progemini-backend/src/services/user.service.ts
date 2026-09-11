import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";
import { hashPassword } from "@/utils/password";
import { normalizeEmail } from "@/utils/crypto";

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw AppError.notFound("User not found");
  }

  return user;
}

export async function updateProfile(
  userId: string,
  data: { name: string; phone?: string | null; bio?: string | null; avatar?: string | null },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      bio: data.bio?.trim() || null,
      avatar: data.avatar?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      avatar: true,
      role: true,
    },
  });

  return user;
}

export async function listUsers(role?: string) {
  const where: Record<string, string> = {};
  if (role) {
    where.role = role.toUpperCase();
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      avatar: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      phone: true,
      address: true,
      isActive: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });

  if (!user) {
    throw AppError.notFound("User not found");
  }

  return user;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STUDENT";
}) {
  const normalizedEmail = normalizeEmail(data.email);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw AppError.conflict("Email already registered");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    bio?: string | null;
    avatar?: string | null;
    phone?: string | null;
    address?: string | null;
    isActive?: boolean;
  },
) {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw AppError.notFound("User not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.email !== undefined) {
    const normalizedEmail = normalizeEmail(data.email);
    if (normalizedEmail !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (emailTaken) {
        throw AppError.conflict("Email already in use");
      }
    }
    updateData.email = normalizedEmail;
  }
  if (data.password !== undefined) {
    updateData.password = await hashPassword(data.password);
  }
  if (data.bio !== undefined) updateData.bio = data.bio?.trim() || null;
  if (data.avatar !== undefined) updateData.avatar = data.avatar?.trim() || null;
  if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
  if (data.address !== undefined) updateData.address = data.address?.trim() || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      phone: true,
      address: true,
      isActive: true,
    },
  });

  return user;
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw AppError.notFound("User not found");
  }

  await prisma.user.delete({ where: { id } });
  return { message: "User deleted successfully" };
}
