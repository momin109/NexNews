import jwt from "jsonwebtoken";

export type UserRole = "super_admin" | "admin" | "editor" | "reporter";

export type AuthTokenPayload = {
  userId: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Please define JWT_SECRET in .env.local");
  }

  return secret;
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}
