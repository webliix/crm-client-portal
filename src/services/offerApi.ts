import { http } from "./http";

export interface ClientOffer {
  id: number | string;
  title: string;
  description: string;
  code: string;
  discount: string;
  badge?: string;
  badgeColor?: "primary" | "secondary" | "success" | "warning";
  features?: string;
  expiresAt?: string;
  active?: boolean;
}

export const offerApi = {
  async getActiveOffers(): Promise<ClientOffer[]> {
    try {
      const res = await http.get("/api/v1/offers");
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      return data?.content ?? [];
    } catch {
      return [];
    }
  },
};
