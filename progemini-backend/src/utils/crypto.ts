import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

function getCipherKey(): Buffer {
  const secret = process.env.JWT_SECRET || "progemini-cert-secret-key-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Encrypts an arbitrary object or string into a URL-safe encrypted token.
 */
export function encryptPayload(payload: any): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getCipherKey(), iv);
  const str = typeof payload === "string" ? payload : JSON.stringify(payload);
  let encrypted = cipher.update(str, "utf8", "base64url");
  encrypted += cipher.final("base64url");
  return `${iv.toString("base64url")}.${encrypted}`;
}

/**
 * Decrypts a URL-safe encrypted token back into the original payload.
 * Returns null if tampering or invalid key is detected.
 */
export function decryptPayload<T = any>(token: string): T | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], "base64url");
    const decipher = crypto.createDecipheriv(ALGORITHM, getCipherKey(), iv);
    let decrypted = decipher.update(parts[1], "base64url", "utf8");
    decrypted += decipher.final("utf8");
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as unknown as T;
    }
  } catch (err) {
    return null;
  }
}
