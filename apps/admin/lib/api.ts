export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Thin fetch wrapper shared by every admin page — attaches the admin JWT
 * (set by app/api/dev-login) and throws on non-2xx so pages can catch and
 * show a friendly "API not reachable" state instead of a blank screen. */
export async function apiFetch<T>(path: string, token: string | undefined, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? "Request failed");
  }
  return res.json() as Promise<T>;
}
