import { Request, Response, NextFunction } from "express";
import { verifyToken, syncClerkUser, upsertClerkUser } from "../services/authService";
import { getAuth } from "@clerk/express";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name?: string | null; avatar?: string | null };
  auth?: any;
}

function extractClaims(claims: any): { email?: string; name?: string | null; avatar?: string | null } {
  if (!claims || typeof claims !== "object") return {};
  // Clerk sessionClaims may contain various email/name shapes
  const email =
    claims.email ||
    claims.email_address ||
    claims.primary_email ||
    claims.emailAddress ||
    (Array.isArray(claims.email_addresses) ? claims.email_addresses[0] : undefined);
  let name: string | null =
    claims.name ||
    claims.full_name ||
    null;
  if (!name && (claims.first_name || claims.firstName || claims.given_name)) {
    const first = claims.first_name || claims.firstName || claims.given_name || "";
    const last = claims.last_name || claims.lastName || claims.family_name || "";
    name = [first, last].filter(Boolean).join(" ") || null;
  }
  if (!name) name = claims.username || null;
  const avatar = claims.image_url || claims.imageUrl || claims.avatar || claims.picture || null;
  return { email, name: name || null, avatar: avatar || null };
}

async function tryClerkAuth(req: AuthRequest): Promise<{ id: string; email: string; name?: string | null; avatar?: string | null } | null> {
  try {
    const auth = getAuth(req as any) as any;
    const clerkId: string | undefined = auth?.userId || (req as any).auth?.userId;
    if (!clerkId) return null;

    const claims = auth?.sessionClaims || auth?.claims || (req as any).auth?.sessionClaims;
    const { email: claimEmail, name: claimName, avatar: claimAvatar } = extractClaims(claims);

    if (claimEmail) {
      try {
        const dbUser = await upsertClerkUser({ clerkId, email: claimEmail, name: claimName, avatar: claimAvatar });
        return { id: dbUser.id, email: dbUser.email, name: dbUser.name, avatar: dbUser.avatar };
      } catch {}
    }

    // Fallback to Clerk Backend API if claims missing or upsert failed
    try {
      const dbViaApi = await syncClerkUser(clerkId);
      if (dbViaApi) return { id: dbViaApi.id, email: dbViaApi.email, name: dbViaApi.name, avatar: dbViaApi.avatar };
    } catch {}

    // Final fallback: ensure a DB row exists with synthetic email (prevents FK violation)
    try {
      const syntheticEmail = claimEmail || `${clerkId}@clerk.local`;
      const dbFallback = await upsertClerkUser({ clerkId, email: syntheticEmail, name: claimName, avatar: claimAvatar });
      return { id: dbFallback.id, email: dbFallback.email, name: dbFallback.name, avatar: dbFallback.avatar };
    } catch {
      // last resort: return clerkId as id (will work for auth but may fail FK; caller handles)
      return { id: clerkId, email: claimEmail || `${clerkId}@clerk.local`, name: claimName, avatar: claimAvatar };
    }
  } catch {
    return null;
  }
}

export async function authenticateOptional(req: AuthRequest, _res: Response, next: NextFunction) {
  const clerkUser = await tryClerkAuth(req);
  if (clerkUser) {
    req.user = clerkUser;
    return next();
  }
  // 2. Legacy JWT / demo
  const auth = req.headers.authorization;
  const cookieToken = (req as any).cookies?.token;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : cookieToken;
  if (token) {
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
}

export async function authenticateRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const clerkUser = await tryClerkAuth(req);
  if (clerkUser) {
    req.user = clerkUser;
    return next();
  }
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
