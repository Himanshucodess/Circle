import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { adminSession } from "@/services/adminApi";
import { PageLoader } from "@/components/ui/Spinner";

export function AdminGate({ children }: { children: ReactNode }) {
  const location = useLocation(); const [state, setState] = useState<"checking" | "allowed" | "denied">("checking");
  useEffect(() => { adminSession().then((session) => setState(session ? "allowed" : "denied")); }, []);
  if (state === "checking") return <PageLoader label="Loading..." />;
  if (state === "denied") return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}
