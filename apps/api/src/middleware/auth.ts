import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/authService";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name?: string | null; avatar?: string | null };
}

export function authenticateOptional(req: AuthRequest, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const cookieToken = (req as any).cookies?.token;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : cookieToken;
  if (token) {
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
}

export function authenticateRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const cookieToken = (req as any).cookies?.token;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : cookieToken;
  if (!token) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in" } });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
  }
  req.user = payload;
  next();
}
