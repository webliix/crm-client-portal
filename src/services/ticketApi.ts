import { http } from "./http";
import { authService } from "./authService";

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
    } catch (primaryErr: any) {
      console.warn("Authenticated ticket creation failed, checking fallback:", primaryErr);
      const currentUser = authService.getCurrentUser();
      if (currentUser?.email) {
        try {
          const pubRes = await http.post("/api/v1/public/tickets", {
            name: currentUser.name || "Client",
            email: currentUser.email,
            phone: currentUser.phone || "",
            title,
            description,
            category: "SUPPORT",
          });
          return pubRes.data?.data ?? null;
        } catch (fallbackErr: any) {
          const msg = fallbackErr?.response?.data?.message || fallbackErr?.message || "Failed to create support ticket";
          throw new Error(msg);
        }
      }
      const errMsg = primaryErr?.response?.data?.message || primaryErr?.message || "Failed to create support ticket";
      throw new Error(errMsg);
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
