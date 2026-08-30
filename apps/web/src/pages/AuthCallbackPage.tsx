import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { PageLoader } from "@/components/ui/Spinner";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Support both unified (Clerk+legacy) and legacy contexts
  let login: any = () => {};
  try {
    const ctx = useAuth();
    login = ctx.login;
  } catch {
    const uni = useUnifiedAuth() as any;
    login = uni.login || uni.refresh || (() => {});
  }

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const avatar = searchParams.get("avatar");
    const email = searchParams.get("email");
    if (token) {
      const user = { id: "oauth", email: email || "oauth@circlestore.local", name: name || "OAuth User", avatar: avatar || null } as any;
      // Also store token and let refresh fetch real user from /api/auth/me
      localStorage.setItem("token", token);
      // try to store user immediately
      try {
        login(token, user);
      } catch {}
      // refresh will fetch real user — navigate after short delay
      setTimeout(() => navigate("/"), 300);
    } else {
      // Clerk flow lands elsewhere; just go home if no token (maybe Clerk authenticated)
      const hasClerk = !!(import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY;
      if (hasClerk) {
        setTimeout(() => navigate("/"), 300);
        return;
      }
      navigate("/login?error=callback");
    }
  }, [searchParams, login, navigate]);

  return <PageLoader label="Signing you in..." />;
}
