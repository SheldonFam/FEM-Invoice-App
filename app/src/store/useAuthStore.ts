import { create } from "zustand";
import { api, setTokens, clearTokens } from "../lib/api";
import type { Token } from "../types/invoice";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthStore {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("auth-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function fetchTokenAndUser(email: string, password: string) {
  const data = await api.post<Token>("/auth/login", { email, password });
  setTokens(data.access_token, data.refresh_token);
  const user = await api.get<AuthUser>("/users/me");
  return user;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: loadUser(),

  login: async (email, password) => {
    const user = await fetchTokenAndUser(email, password);
    localStorage.setItem("auth-user", JSON.stringify(user));
    set({ user });
  },

  register: async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
    const user = await fetchTokenAndUser(email, password);
    localStorage.setItem("auth-user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    clearTokens();
    localStorage.removeItem("auth-user");
    set({ user: null });
  },
}));
