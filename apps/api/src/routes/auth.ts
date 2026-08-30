import { Router } from "express";
import passport from "passport";
import { signToken } from "../services/authService";
import { authenticateOptional } from "../middleware/auth";

const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function issueTokenAndRedirect(req: any, res: any) {
  const user = req.user as any;
  const token = signToken(user);
  // httpOnly cookie for API + redirect with token for localStorage
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 3600 * 1000,
  });
  // also pass via query for frontend to store
  const redirect = `${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&name=${encodeURIComponent(user.name || "")}&avatar=${encodeURIComponent(user.avatar || "")}&email=${encodeURIComponent(user.email)}`;
  res.redirect(redirect);
}

// providers status
router.get("/providers", (req, res) => {
  res.json({
    success: true,
    data: {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      facebook: !!(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
    },
  });
});

router.get("/me", authenticateOptional as any, (req: any, res) => {
  if (!req.user) return res.json({ success: true, data: null });
  res.json({ success: true, data: req.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, data: { message: "Logged out" } });
});

// Demo login (when OAuth not configured) — creates a mock user
router.post("/demo", async (req, res) => {
  const { email, name } = req.body || {};
  const demoEmail = email || `demo_${Date.now()}@circlestore.local`;
  const demoName = name || "Demo User";
  const { createOrUpdateOAuth } = await import("../repositories/userRepository");
  const user = await createOrUpdateOAuth({
    email: demoEmail,
    name: demoName,
    avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(demoEmail)}`,
    provider: "demo",
    providerId: demoEmail,
  });
  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } } });
});

// Google
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(404).json({ success: false, error: { code: "NOT_CONFIGURED", message: "Google OAuth not configured. Set GOOGLE_CLIENT_ID/SECRET." } });
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google` }), issueTokenAndRedirect);

// GitHub
router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) return res.status(404).json({ success: false, error: { code: "NOT_CONFIGURED", message: "GitHub OAuth not configured." } });
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});
router.get("/github/callback", passport.authenticate("github", { session: false, failureRedirect: `${FRONTEND_URL}/login?error=github` }), issueTokenAndRedirect);

// Facebook
router.get("/facebook", (req, res, next) => {
  if (!process.env.FACEBOOK_CLIENT_ID) return res.status(404).json({ success: false, error: { code: "NOT_CONFIGURED", message: "Facebook OAuth not configured." } });
  passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
});
router.get("/facebook/callback", passport.authenticate("facebook", { session: false, failureRedirect: `${FRONTEND_URL}/login?error=facebook` }), issueTokenAndRedirect);

export default router;
