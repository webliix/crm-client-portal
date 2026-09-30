import { http } from "./http";

export interface ClientUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  email: string;
  name: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
  timezone?: string;
  roles?: string[];
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: ClientUser }> {
    const res = await http.post("/api/v1/auth/login", { email, password });
    const token = res.data?.data?.accessToken || res.data?.accessToken || res.data?.token;
    const userRes = res.data?.data?.user || res.data?.user || { email, name: email.split("@")[0], roles: ["ROLE_CLIENT"] };
    const user: ClientUser = {
      ...userRes,
      name: (userRes.firstName ? `${userRes.firstName} ${userRes.lastName || ""}` : userRes.email.split("@")[0]).trim(),
    };

    if (token) {
      localStorage.setItem("client_token", token);
      localStorage.setItem("client_user", JSON.stringify(user));
    }

    return { token, user };
  },

  async getProfile(): Promise<ClientUser | null> {
    try {
      const res = await http.get("/api/v1/auth/me");
      const data = res.data?.data;
      if (data) {
        const user: ClientUser = {
          ...data,
          name: (data.firstName ? `${data.firstName} ${data.lastName || ""}` : data.email.split("@")[0]).trim(),
        };
        localStorage.setItem("client_user", JSON.stringify(user));
        return user;
      }
    } catch {
      // Return cached user if offline
    }
    return this.getCurrentUser();
  },

  async updateProfile(payload: Partial<ClientUser>): Promise<ClientUser | null> {
    try {
      const res = await http.put("/api/v1/auth/profile", payload);
      const data = res.data?.data;
      if (data) {
        const user: ClientUser = {
          ...data,
          name: (data.firstName ? `${data.firstName} ${data.lastName || ""}` : data.email.split("@")[0]).trim(),
        };
        localStorage.setItem("client_user", JSON.stringify(user));
        return user;
      }
    } catch (err) {
      console.error("Profile update failed:", err);
    }
    return null;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await http.put("/api/v1/auth/change-password", { currentPassword, newPassword });
      return true;
    } catch {
      return false;
    }
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
