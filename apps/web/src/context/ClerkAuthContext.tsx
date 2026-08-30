import React, { createContext, useContext } from "react";
import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";

interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => void;
}

export const ClerkAuthContext = createContext<AuthState | null>(null);
const Ctx = ClerkAuthContext;

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useClerkAuth();
  const [token, setToken] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem("clerk_token");
    } catch {
      return null;
    }
  });

  // Keep token in sync — fetch fresh JWT for apiFetch (Authorization: Bearer <clerk JWT>)
  React.useEffect(() => {
    let cancelled = false;
    if (isSignedIn && clerkUser) {
      getToken()
        .then((t) => {
          if (cancelled) return;
          if (t) {
            localStorage.setItem("clerk_token", t);
            setToken(t);
            // Fire-and-forget sync to ensure user row exists (optional, claims path already upserts)
            fetch("/api/auth/sync", {
              method: "POST",
              headers: { Authorization: `Bearer ${t}` },
              credentials: "include",
            }).catch(() => {});
          }
        })
        .catch(() => {});
      // Refresh token every 50s (Clerk tokens are short-lived ~60s)
      const id = setInterval(() => {
        getToken()
          .then((t) => {
            if (t) {
              localStorage.setItem("clerk_token", t);
              setToken(t);
            }
          })
          .catch(() => {});
      }, 50_000);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    } else {
      localStorage.removeItem("clerk_token");
      setToken(null);
    }
  }, [isSignedIn, clerkUser, getToken]);

  const user: User | null = isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || `${clerkUser.id}@clerk.local`,
        name: clerkUser.fullName || clerkUser.username || null,
        avatar: clerkUser.imageUrl || null,
      }
    : null;

  const logout = async () => {
    await signOut();
    localStorage.removeItem("clerk_token");
    setToken(null);
    // Clear any legacy session token as well.
    localStorage.removeItem("token");
  };

  return <Ctx.Provider value={{ user, token, loading: !isLoaded, logout }}>{children}</Ctx.Provider>;
}

export function useClerkAuthContext() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useClerkAuthContext must be within ClerkAuthProvider");
  return v;
}
