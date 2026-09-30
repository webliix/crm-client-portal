import { http } from "./http";

export interface ClientTicket {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

export const ticketApi = {
  async getMyTickets(): Promise<ClientTicket[]> {
    try {
      const res = await http.get("/api/v1/tickets");
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      return data?.content ?? [];
    } catch {
      return [];
    }
  },

  async createTicket(subject: string, description: string): Promise<ClientTicket | null> {
    try {
      const res = await http.post("/api/v1/tickets", { subject, description, priority: "MEDIUM" });
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },
};
