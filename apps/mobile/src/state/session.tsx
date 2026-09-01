import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { AuthSession, User } from "@tanafus/types";
import { apiFetch } from "../lib/api";

interface SessionState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  requestOtp: (mobile: string) => Promise<void>;
  verifyOtp: (
    mobile: string,
    code: string,
    role?: User["role"],
    extra?: { nameAr?: string; nameEn?: string; companyId?: string }
  ) => Promise<AuthSession>;
  signOut: () => Promise<void>;
}

const TOKEN_KEY = "tanafus_token";
const USER_KEY = "tanafus_user";

export const useSession = create<SessionState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const [token, userRaw] = await Promise.all([SecureStore.getItemAsync(TOKEN_KEY), SecureStore.getItemAsync(USER_KEY)]);
      set({ token, user: userRaw ? (JSON.parse(userRaw) as User) : null, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
  requestOtp: async (mobile) => {
    await apiFetch("/auth/otp/request", null, { method: "POST", body: JSON.stringify({ mobile }) });
  },
  verifyOtp: async (mobile, code, role, extra) => {
    const session = await apiFetch<AuthSession>("/auth/otp/verify", null, {
      method: "POST",
      body: JSON.stringify({ mobile, code, role, ...extra }),
    });
    await SecureStore.setItemAsync(TOKEN_KEY, session.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));
    set({ token: session.token, user: session.user });
    return session;
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ token: null, user: null });
  },
}));
