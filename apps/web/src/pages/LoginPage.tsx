import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignIn } from "@clerk/clerk-react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const isClerkValid = !!CLERK_KEY && /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(CLERK_KEY);

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/";
  const { user } = useUnifiedAuth() as any;
  useEffect(() => { if (user) navigate(next); }, [user, navigate, next]);

  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4">
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3"><Sparkles className="w-6 h-6" /></div>
        <CardTitle className="text-2xl">Welcome to CircleStore</CardTitle>
        <CardDescription>Sign in to sell, make offers and manage your marketplace activity.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {isClerkValid ? <SignIn fallbackRedirectUrl={next} signUpFallbackRedirectUrl={next} routing="hash" /> : <p className="text-sm text-muted-foreground text-center">Sign-in is temporarily unavailable. Please try again later.</p>}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to marketplace</Link>
      </CardContent>
    </Card>
  </div>;
}
