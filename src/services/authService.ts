import { http } from "./http";

export interface ClientUser {
  email: string;
  name: string;
  roles: string[];
}

export const authService = {
  async login(email: string, password: String): Promise<{ token: string; user: ClientUser }> {
    const res = await http.post("/api/v1/auth/login", { email, password });
    const token = res.data?.data?.accessToken || res.data?.token || res.data?.data?.token;
    const user = res.data?.data?.user || { email, name: email.split("@")[0], roles: ["ROLE_CLIENT"] };

    if (token) {
      localStorage.setItem("client_token", token);
      localStorage.setItem("client_user", JSON.stringify(user));
    }

    return { token, user };
  },

  getCurrentUser(): ClientUser | null {
    const stored = localStorage.getItem("client_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem("client_token"));
  },
};
