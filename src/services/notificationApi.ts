import { http } from "./http";

export interface ClientNotificationItem {
  id: number;
  title: string;
  message: string;
  recipient?: string;
  channel?: string;
  status: "UNREAD" | "READ" | "ARCHIVED" | string;
  referenceType?: "PROJECT" | "INVOICE" | "TICKET" | "BLOG" | "ARTICLE" | "NEWSLETTER" | "UPDATE" | string;
  referenceId?: number;
  linkUrl?: string;
  createdAt: string;
  readAt?: string;
}

export const notificationApi = {
  async getMyNotifications(): Promise<ClientNotificationItem[]> {
    try {
      const res = await http.get("/api/v1/notifications");
      const list = res.data?.data;
      if (Array.isArray(list)) return list;
      return [];
    } catch {
      return [];
    }
  },

  async markAsRead(id: number | string): Promise<void> {
    try {
      await http.put(`/api/v1/notifications/${id}/read`);
    } catch {
      // ignore
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await http.put("/api/v1/notifications/read-all");
    } catch {
      // ignore
    }
  },

  async deleteNotification(id: number | string): Promise<void> {
    try {
      await http.delete(`/api/v1/notifications/${id}`);
    } catch {
      // ignore
    }
  },

  async clearAll(): Promise<void> {
    try {
      await http.delete("/api/v1/notifications/clear");
    } catch {
      // ignore
    }
  },

  resolveRoute(item: ClientNotificationItem): string {
    const type = (item.referenceType || "").toUpperCase();
    if (item.linkUrl) return item.linkUrl;
    if (type === "PROJECT" && item.referenceId) return `/projects/${item.referenceId}`;
    if (type === "PROJECT" || item.title?.toLowerCase().includes("project")) return "/projects";
    if (type === "INVOICE" || item.title?.toLowerCase().includes("invoice")) return "/invoices";
    if ((type === "TICKET" || item.title?.toLowerCase().includes("ticket")) && item.referenceId) {
      return `/tickets?ticketId=${item.referenceId}`;
    }
    if (type === "TICKET" || item.title?.toLowerCase().includes("ticket") || item.title?.toLowerCase().includes("support")) {
      return "/tickets";
    }
    if (type === "BLOG" || type === "ARTICLE" || item.title?.toLowerCase().includes("article") || item.title?.toLowerCase().includes("newsletter")) {
      return "/articles";
    }
    if (type === "NEWSLETTER") return "/articles";
    if (type === "UPDATE") return "/updates";
    return "/dashboard";
  },
};
