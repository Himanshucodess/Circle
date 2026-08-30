import jwt from "jsonwebtoken";
import { createClerkClient } from "@clerk/backend";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";
const JWT_EXPIRES = "7d";

export interface JwtPayload {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
}

export function signToken(user: { id: string; email: string; name?: string | null; avatar?: string | null }) {
  const payload: JwtPayload = { id: user.id, email: user.email, name: user.name, avatar: user.avatar };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Direct upsert from claims / frontend (no Clerk API call)
export async function upsertClerkUser(data: { clerkId: string; email: string; name?: string | null; avatar?: string | null }) {
  const { createOrUpdateClerk } = await import("../repositories/userRepository");
  return createOrUpdateClerk(data);
}

// Clerk → sync to our User table via Backend API (fallback when claims unavailable)
export async function syncClerkUser(clerkId: string) {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) return null;
  try {
    const clerk = createClerkClient({ secretKey: secret });
    const u = await clerk.users.getUser(clerkId);
    const email = u.emailAddresses[0]?.emailAddress || `${clerkId}@clerk.local`;
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || null;
    const avatar = u.imageUrl || null;
    return await upsertClerkUser({ clerkId, email, name, avatar });
  } catch {
    return null;
  }
}
