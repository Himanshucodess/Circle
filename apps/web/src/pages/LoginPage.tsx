import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { SignIn } from "@clerk/clerk-react";
import { ArrowLeft, ShieldCheck, Recycle } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Aurora } from "@/components/motion/Aurora";

const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const isClerkValid = !!CLERK_KEY && /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(CLERK_KEY);

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/";
  const { user } = useUnifiedAuth() as any;
  useEffect(() => { if (user) navigate(next); }, [user, navigate, next]);

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden p-4">
      <Aurora dark={false} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }} className="relative w-full max-w-md">
        <Card className="overflow-hidden shadow-pop">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-lime" />
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="relative grid h-14 w-14 place-items-center rounded-3xl bg-ink-950 font-display text-2xl font-bold text-white dark:bg-white dark:text-ink-950">
              C<span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-lime" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Welcome <span className="font-serif font-normal italic text-primary">back</span>
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Sign in to sell, make offers and manage your circular activity.</p>
            </div>
            {isClerkValid ? <SignIn fallbackRedirectUrl={next} signUpFallbackRedirectUrl={next} routing="hash" /> : <p className="text-sm text-muted-foreground">Sign-in is temporarily unavailable. Please try again later.</p>}
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Protected
              <span>·</span>
              <Recycle className="h-3.5 w-3.5 text-primary" /> Circular
            </div>
            <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to marketplace</Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
