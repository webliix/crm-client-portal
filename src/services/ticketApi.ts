import { http } from "./http";

export interface ClientTicket {
  id: number;
  ticketNumber: string;
  title?: string;
  subject?: string;
  description: string;
  status: string;
  priority: string;
  assignedToName?: string;
  assignedToId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  comment: string;
  commentedBy: string;
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

  async createTicket(title: string, description: string): Promise<ClientTicket | null> {
    try {
      const res = await http.post("/api/v1/tickets", {
        title,
        description,
        priority: "MEDIUM",
        category: "SUPPORT",
      });
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },

  async getTicket(id: number): Promise<ClientTicket | null> {
    try {
      const res = await http.get(`/api/v1/tickets/${id}`);
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },

  async getComments(ticketId: number): Promise<TicketComment[]> {
    try {
      const res = await http.get(`/api/v1/tickets/${ticketId}/comments`);
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  async addComment(ticketId: number, comment: string, commentedBy: string): Promise<TicketComment | null> {
    try {
      const res = await http.post(`/api/v1/tickets/${ticketId}/comments`, {
        comment,
        commentedBy,
      });
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },
};
