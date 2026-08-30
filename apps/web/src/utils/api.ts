import { ApiError } from "../types/apiError";

export class ApiClientError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers, credentials: "include" });
  } catch (e) {
    throw new ApiClientError(0, "NETWORK_ERROR", "Unable to reach the server. Please try again.");
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const err = body?.error;
    throw new ApiClientError(
      response.status,
      err?.code ?? "REQUEST_FAILED",
      err?.message ?? "Something went wrong",
      err?.fields
    );
  }

  return body?.data as T;
}
