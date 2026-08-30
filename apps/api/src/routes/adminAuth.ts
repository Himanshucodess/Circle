import { Router } from "express";
import { z } from "zod";
import { clearAdminSession, getAdminSession, setAdminSession } from "../middleware/adminAuth";

const router = Router();
const credentialsSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

router.get("/me", (req, res) => {
  const session = getAdminSession(req);
  if (!session) return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } });
  res.json({ success: true, data: { username: session.username } });
});

router.post("/login", (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!parsed.success || !configuredUsername || !configuredPassword || parsed.data.username !== configuredUsername || parsed.data.password !== configuredPassword) {
    return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password." } });
  }
  setAdminSession(res, configuredUsername);
  res.json({ success: true, data: { username: configuredUsername } });
});

router.post("/logout", (req, res) => {
  clearAdminSession(res);
  res.json({ success: true, data: { message: "Logged out" } });
});

export default router;
