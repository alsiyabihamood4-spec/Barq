import Constants from "expo-constants";

export const API_URL: string = (Constants.expoConfig?.extra?.apiUrl as string) ?? "http://localhost:4000";
/** Live tender feed (2b) — apps/api's /ws/tenders fans out `tenders:new` /
 * `tenders:bid` Redis pub/sub events over this. */
export const WS_URL: string = API_URL.replace(/^http/, "ws");

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
