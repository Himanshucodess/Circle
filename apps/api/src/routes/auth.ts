import { Router } from "express";
import { signToken } from "../services/authService";
import { authenticateOptional } from "../middleware/auth";

const router = Router();

// Clerk status — checks if Clerk keys are set and look valid (avoids dummy values)
function isClerkConfigured() {
  const sec = process.env.CLERK_SECRET_KEY || "";
  const pub = process.env.CLERK_PUBLISHABLE_KEY || "";
  const secValid = !!sec && /^sk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(sec);
  const pubValid = !!pub && /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(pub);
  return secValid && pubValid;
}
router.get("/providers", (req, res) => {
  const clerkConfigured = isClerkConfigured();
  // Clerk handles Google/GitHub/Facebook via its dashboard, so we report clerk as provider
  res.json({
    success: true,
    data: {
      clerk: clerkConfigured,
      google: clerkConfigured,
      github: clerkConfigured,
      facebook: clerkConfigured,
    },
  });
});

router.get("/me", authenticateOptional as any, (req: any, res) => {
  if (!req.user) return res.json({ success: true, data: null });
  res.json({ success: true, data: req.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("__session");
  res.json({ success: true, data: { message: "Logged out" } });
});

// Demo login — still works when Clerk not configured, creates local user + JWT
router.post("/demo", async (req, res) => {
  const { email, name } = req.body || {};
  const demoEmail = email || `demo_${Date.now()}@circlestore.local`;
  const demoName = name || "Demo User";
  const { createOrUpdateClerk } = await import("../repositories/userRepository");
  const clerkId = `demo_${demoEmail}`;
  const user = await createOrUpdateClerk({
    clerkId,
    email: demoEmail,
    name: demoName,
    avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(demoEmail)}`,
  });
  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } } });
});

// Sync Clerk user to our DB — called after Clerk sign-in from frontend via Authorization header
router.post("/sync", authenticateOptional as any, async (req: any, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "No Clerk session" } });
  res.json({ success: true, data: req.user });
});

// Legacy OAuth routes — now handled by Clerk, return info
router.get("/google", (req, res) => {
  res.status(410).json({ success: false, error: { code: "MOVED", message: "OAuth now handled by Clerk. Use /login with Clerk SignIn." } });
});
router.get("/github", (req, res) => {
  res.status(410).json({ success: false, error: { code: "MOVED", message: "OAuth now handled by Clerk." } });
});
router.get("/facebook", (req, res) => {
  res.status(410).json({ success: false, error: { code: "MOVED", message: "OAuth now handled by Clerk." } });
});

export default router;
