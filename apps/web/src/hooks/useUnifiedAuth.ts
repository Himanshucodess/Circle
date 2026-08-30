import React from "react";
import { AuthContext } from "@/context/AuthContext";
import { ClerkAuthContext } from "@/context/ClerkAuthContext";

const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const isClerkValid = !!CLERK_KEY && /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(CLERK_KEY);

export function useUnifiedAuth() {
  const clerkCtx = React.useContext(ClerkAuthContext as any) as { user: any; token: string | null; loading: boolean; logout: () => Promise<void> } | null;
  const legacyCtx = React.useContext(AuthContext as any) as { user: any; token: string | null; loading: boolean; logout: () => Promise<void>; login: any; refresh: any } | null;

  const hasClerk = !!isClerkValid;

  if (hasClerk && clerkCtx && legacyCtx) {
    // Merge — prefer Clerk when signed in, otherwise fall back to demo/legacy JWT
    const user = clerkCtx.user ?? legacyCtx.user ?? null;
    const token = clerkCtx.token ?? legacyCtx.token ?? null;
    const loading = clerkCtx.loading || legacyCtx.loading;
    const logout = async () => {
      try {
        await clerkCtx.logout();
      } catch {}
      try {
        await legacyCtx.logout();
      } catch {}
      // Ensure both storages cleared
      try {
        localStorage.removeItem("clerk_token");
        localStorage.removeItem("token");
      } catch {}
    };
    // expose legacy helpers when Clerk not active
    return { user, token, loading, logout, login: legacyCtx.login, refresh: legacyCtx.refresh } as any;
  }

  if (hasClerk && clerkCtx) {
    // Clerk provider without legacy (edge: App not nested) — still allow demo fallback via localStorage
    if (clerkCtx.user) return clerkCtx as any;
    // No Clerk user: check if legacy token exists in storage (demo when Clerk enabled but AuthProvider not mounted)
    try {
      const demoToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (demoToken) {
        // Return a shallow legacy-like object that still shows not fully logged but will be refreshed by AuthContext when mounted
        // If AuthProvider is not mounted, we still want to avoid showing "not logged in" when demo token exists;
        // Caller will trigger refresh via legacyCtx if available, otherwise treat as unauthenticated until App fixed.
      }
    } catch {}
    return clerkCtx as any;
  }

  if (legacyCtx) return legacyCtx as any;
  // fallback: if no provider, return a dummy that will show not logged in
  // This handles cases where App is not yet wrapped (should not happen)
  return { user: null, token: null, loading: false, logout: async () => {}, refresh: async () => {}, login: async () => {} } as any;
}
