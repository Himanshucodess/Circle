import { Router } from "express";
import { z } from "zod";
import { clearAdminSession, getAdminSession, setAdminSession } from "../middleware/adminAuth";

const router = Router();
const credentialsSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });
const attempts = new Map<string, { count: number; resetAt: number }>();

router.get("/me", (req, res) => {
  const session = getAdminSession(req);
  if (!session) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } });
  res.json({ success: true, data: { username: session.username } });
});

router.post("/login", (req, res) => {
  const key = req.ip || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (current && current.resetAt > now && current.count >= 10) return res.status(429).json({ success: false, error: { code: "RATE_LIMITED", message: "Too many sign-in attempts. Try again later." } });
  if (!current || current.resetAt <= now) attempts.set(key, { count: 0, resetAt: now + 15 * 60 * 1000 });
  attempts.get(key)!.count += 1;
  const parsed = credentialsSchema.safeParse(req.body);
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!parsed.success || !configuredUsername || !configuredPassword || parsed.data.username !== configuredUsername || parsed.data.password !== configuredPassword) {
    return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password." } });
  }
  attempts.delete(key);
  setAdminSession(res, configuredUsername);
  res.json({ success: true, data: { username: configuredUsername } });
});

router.post("/logout", (req, res) => {
  clearAdminSession(res);
  res.json({ success: true, data: { message: "Logged out" } });
});

export default router;
