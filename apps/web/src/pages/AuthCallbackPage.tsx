import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/ui/Spinner";

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

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
      login(token, user);
      // refresh will fetch real user
      setTimeout(() => navigate("/"), 300);
    } else {
      navigate("/login?error=callback");
    }
  }, [searchParams, login, navigate]);

  return <PageLoader label="Signing you in..." />;
}
