import { Router } from "express";
import { authenticateOptional } from "../middleware/auth";

const router = Router();

function isClerkConfigured() {
  const sec = process.env.CLERK_SECRET_KEY || "";
  const pub = process.env.CLERK_PUBLISHABLE_KEY || "";
  return /^sk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(sec) && /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(pub);
}

router.get("/providers", (_req, res) => res.json({ success: true, data: { clerk: isClerkConfigured() } }));
router.get("/me", authenticateOptional as any, (req: any, res) => res.json({ success: true, data: req.user || null }));
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.clearCookie("__session");
  res.json({ success: true, data: { message: "Logged out" } });
});
router.post("/sync", authenticateOptional as any, (req: any, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in" } });
  res.json({ success: true, data: req.user });
});

export default router;
