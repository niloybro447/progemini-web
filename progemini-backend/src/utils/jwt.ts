import jwt from "jsonwebtoken";
import { config } from "@/config";

export interface TokenPayload {
  id: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  avatar?: string | null;
}

export function generateAccessToken(user: TokenPayload): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, avatar: user.avatar },
    config.jwtSecret,
    { expiresIn: "24h" },
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}
