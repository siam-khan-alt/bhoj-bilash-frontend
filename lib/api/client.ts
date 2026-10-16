/**
 * Dhap 6 — mock -> real adapter.
 * NEXT_PUBLIC_API_URL set thakle real Django backend, na thakle localStorage mock.
 * Sob lib/api/* file ei helper use kore — page/component e kono change lage na.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export const isRealApi = () => API_BASE.length > 0;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", ...extra };
  const t = getToken();
  // mock-jwt token real backend e pathale SimpleJWT decode fail kore PUBLIC endpoint eo 401 dey —
  // tai mock token kokhono header e jabe na (mock mode e apiFetch use-i hoy na).
  if (t && !t.startsWith("mock-jwt-")) h["Authorization"] = `Bearer ${t}`;
  return h;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: authHeaders(init.headers as Record<string, string> | undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `Request failed (${res.status})`);
  }
  return data as T;
}

/** Backend paginated {results,...} hole unwrap kore bare array dey — frontend code same thake. */
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}
