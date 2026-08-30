export async function fetchProviders(): Promise<{ google: boolean; github: boolean; facebook: boolean }> {
  const res = await fetch("/api/auth/providers");
  const body = await res.json();
  return body.data;
}

export async function demoLogin(email?: string, name?: string) {
  const res = await fetch("/api/auth/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  const body = await res.json();
  if (!body.success) throw new Error(body.error?.message || "Demo login failed");
  return body.data as { token: string; user: { id: string; email: string; name: string; avatar: string } };
}
