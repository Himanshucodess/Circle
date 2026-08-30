import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { fetchProviders, demoLogin } from "@/services/authApi";
import { Globe, Code2, Users, Sparkles, ArrowLeft } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";

const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const isClerkValid = !!CLERK_KEY && /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(CLERK_KEY);

export function LoginPage() {
  const [providers, setProviders] = useState({ google: false, github: false, facebook: false, clerk: false } as any);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoName, setDemoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refresh: unifiedRefresh } = useUnifiedAuth() as any;
  // legacy login only for demo (Clerk uses its own flow)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    fetchProviders().then(setProviders).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) navigate(next);
  }, [user, navigate, next]);

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await demoLogin(demoEmail || undefined, demoName || undefined);
      localStorage.setItem("token", data.token);
      // Refresh legacy context then navigate; works with Clerk enabled due to merged providers
      try {
        await unifiedRefresh?.();
      } catch {}
      navigate(next);
      // Fallback hard reload if navigation didn't update auth
      setTimeout(() => {
        if (!localStorage.getItem("token")) return;
        // ensure page reflects new user
        window.location.href = next;
      }, 400);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const oauthUrl = (provider: string) => `http://localhost:4000/api/auth/${provider}`;

  // If Clerk is configured, show Clerk's SignIn (handles Google/GitHub/Facebook via Clerk dashboard)
  if (isClerkValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 gap-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">Welcome to CircleStore</CardTitle>
            <CardDescription>Sign in with Clerk — Google, GitHub, Facebook configured via Clerk Dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignIn fallbackRedirectUrl={next} signUpFallbackRedirectUrl={next} routing="hash" />
          </CardContent>
        </Card>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-3">
            <div className="text-center text-sm font-medium">Or continue as demo (no Clerk account needed)</div>
            <Input placeholder="Email (optional)" value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} />
            <Input placeholder="Name (optional)" value={demoName} onChange={(e) => setDemoName(e.target.value)} />
            <Button className="w-full rounded-full" onClick={handleDemo} loading={loading}>Continue as Demo User</Button>
            {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3">{error}</div>}
            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to marketplace</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Welcome to CircleStore</CardTitle>
          <CardDescription>Sign in to sell, make offers and track your listings. No password needed — use OAuth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams.get("error") && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3">
              OAuth failed: {searchParams.get("error")}. Check env vars or try demo login.
            </div>
          )}
          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3">{error}</div>}

          <div className="grid gap-3">
            <a href={oauthUrl("google")} className={`inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-medium hover:bg-accent ${!providers.google ? "opacity-50" : ""}`}>
              <Globe className="w-4 h-4" /> Continue with Google {!providers.google && <span className="text-xs text-muted-foreground">(not configured)</span>}
            </a>
            <a href={oauthUrl("github")} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#24292f] text-white px-4 py-3 text-sm font-medium hover:bg-[#1b1f23] ${!providers.github ? "opacity-60" : ""}`}>
              <Code2 className="w-4 h-4" /> Continue with GitHub {!providers.github && <span className="text-xs text-white/60">(not configured)</span>}
            </a>
            <a href={oauthUrl("facebook")} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] text-white px-4 py-3 text-sm font-medium hover:bg-[#166fe5] ${!providers.facebook ? "opacity-60" : ""}`}>
              <Users className="w-4 h-4" /> Continue with Facebook {!providers.facebook && <span className="text-xs text-white/60">(not configured)</span>}
            </a>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">or demo login (no OAuth setup needed)</span></div>
          </div>

          <div className="space-y-3">
            <Input placeholder="Email (optional)" value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} />
            <Input placeholder="Name (optional)" value={demoName} onChange={(e) => setDemoName(e.target.value)} />
            <Button className="w-full rounded-full" onClick={handleDemo} loading={loading}>Continue as Demo User</Button>
            <p className="text-xs text-muted-foreground text-center">Demo creates a local user with avatar and JWT — perfect for HR review without Google/GitHub apps.</p>
          </div>

          <div className="flex items-center justify-between pt-2 text-sm">
            <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to marketplace</Link>
            <span className="text-xs text-muted-foreground">Secure OAuth • JWT • httpOnly</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
