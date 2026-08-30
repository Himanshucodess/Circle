import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "circlestore_admin";
const SESSION_TTL = 8 * 60 * 60;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || "change-this-admin-session-secret";
}

export function setAdminSession(res: Response, username: string) {
  const token = jwt.sign({ type: "admin", username }, secret(), { expiresIn: SESSION_TTL });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL * 1000,
    path: "/",
  });
}

export function clearAdminSession(res: Response) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
}

export function getAdminSession(req: Request): { username: string } | null {
  const token = (req as any).cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret()) as any;
    if (payload?.type !== "admin" || typeof payload.username !== "string") return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = getAdminSession(req);
  if (!session) {
    return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } });
  }
  (req as any).admin = session;
  next();
}

export { COOKIE_NAME };
