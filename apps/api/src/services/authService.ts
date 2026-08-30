import jwt from "jsonwebtoken";

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
