import { apiClient, USE_MOCK_API } from "@/api/client";
import { mockDb, networkDelay } from "@/api/mockDb";
import type { AuthUser } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

const TOKEN_KEY = "kl7_auth_token";
const USER_KEY = "kl7_auth_user";

export const authService = {
  async login({ email, password }: LoginInput): Promise<LoginResponse> {
    if (USE_MOCK_API) {
      await networkDelay(500, 900);
      if (password.length < 4) {
        throw new Error("Incorrect email or password.");
      }
      const match = mockDb.get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const user: AuthUser = match
        ? { id: match.id, name: match.name, email: match.email, role: match.role, avatar: match.avatar }
        : { id: "usr-1", name: "Nershel K.", email, role: "Owner" };
      const token = `mock.${btoa(email)}.${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { user, token };
    }
    const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    if (!USE_MOCK_API) {
      try {
        await apiClient.post("/auth/logout");
      } catch {
        // best-effort; clear local state regardless
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(authService.getToken());
  },
};
