import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Store } from "lucide-react";
import { adminLogin } from "@/services/adminApi";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setLoading(true); setError(null); try { await adminLogin(username, password); navigate("/admin", { replace: true }); } catch (e: any) { setError(e.message || "Invalid username or password."); } finally { setLoading(false); } };
  return <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4"><Card className="w-full max-w-md"><CardHeader className="text-center"><div className="mx-auto w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center"><Store className="w-6 h-6" /></div><CardTitle className="mt-4 text-2xl">CircleStore Admin</CardTitle><CardDescription>Sign in to manage categories, fields and requests.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /><Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />{error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full rounded-full" loading={loading}>Sign in</Button></form><Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground mt-5">Back to marketplace</Link></CardContent></Card></div>;
}
