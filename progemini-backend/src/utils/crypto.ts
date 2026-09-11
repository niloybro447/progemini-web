import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
