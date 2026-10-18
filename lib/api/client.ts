/**
 * Real API adapter — sob data Django backend theke (NEXT_PUBLIC_API_URL).
 * Sob lib/api/* file ei helper use kore.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", ...extra };
  const t = getToken();
  // Purono mock-jwt token backend e pathale SimpleJWT decode fail kore public endpoint eo 401 dey —
  // tai oita kokhono header e jabe na (AuthContext o mount-e clear kore dey).
  if (t && !t.startsWith("mock-jwt-")) h["Authorization"] = `Bearer ${t}`;
  return h;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL missing — .env.local e backend URL set koro");
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

/** Paginated ({results, next}) list hole sob page follow kore puro array dey; bare array hole jemon ache. */
export async function apiFetchAll<T>(path: string): Promise<T[]> {
  type Page = { results?: T[]; next?: string | null } | T[];
  const all: T[] = [];
  let next: string | null = path;
  while (next) {
    const data: Page = await apiFetch<Page>(next);
    if (Array.isArray(data)) return data;
    all.push(...(data.results ?? []));
    next = data.next ? nextPath(data.next) : null;
  }
  return all;
}

/** DRF `next` field-er absolute URL → ei adapter-er relative path (API_BASE bad diye). */
function nextPath(url: string): string {
  const i = url.indexOf(API_BASE);
  if (i !== -1) return url.slice(i + API_BASE.length);
  const u = new URL(url, API_BASE);
  const basePath = new URL(API_BASE).pathname.replace(/\/$/, "");
  const p = u.pathname.startsWith(basePath) ? u.pathname.slice(basePath.length) : u.pathname;
  return (p || "/") + u.search;
}
