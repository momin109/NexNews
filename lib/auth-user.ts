import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken, UserRole } from "@/lib/auth-token";

export type AuthUser = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export async function getAuthUserFromRequest(
  req: NextRequest,
): Promise<AuthUser | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  await connectDB();

  const user = await User.findById(payload.userId)
    .select("_id name email role isActive")
    .lean<{
      _id: string;
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
    } | null>();

  if (!user || !user.isActive) return null;

  return {
    userId: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

export async function getAuthUserFromCookie(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  await connectDB();

  const user = await User.findById(payload.userId)
    .select("_id name email role isActive")
    .lean<{
      _id: string;
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
    } | null>();

  if (!user || !user.isActive) return null;

  return {
    userId: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}
