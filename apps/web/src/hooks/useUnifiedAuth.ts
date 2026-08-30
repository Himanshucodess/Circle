import React from "react";
import { AuthContext } from "@/context/AuthContext";
import { ClerkAuthContext } from "@/context/ClerkAuthContext";

const CLERK_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const isClerkValid = !!CLERK_KEY && /^pk_(test|live)_[A-Za-z0-9_\-]{10,}$/.test(CLERK_KEY);

export function useUnifiedAuth() {
  const clerkCtx = React.useContext(ClerkAuthContext as any) as any;
  const legacyCtx = React.useContext(AuthContext as any) as any;
  if (isClerkValid && clerkCtx && legacyCtx) {
    return {
      user: clerkCtx.user ?? legacyCtx.user ?? null,
      token: clerkCtx.token ?? legacyCtx.token ?? null,
      loading: clerkCtx.loading || legacyCtx.loading,
      logout: async () => { await clerkCtx.logout().catch(() => {}); await legacyCtx.logout().catch(() => {}); },
      login: legacyCtx.login,
      refresh: legacyCtx.refresh,
    } as any;
  }
  if (isClerkValid && clerkCtx) return clerkCtx;
  if (legacyCtx) return legacyCtx;
  return { user: null, token: null, loading: false, logout: async () => {}, refresh: async () => {}, login: async () => {} } as any;
}
