import { http } from "./http";

export interface ClientInvoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  issueDate?: string;
  dueDate?: string;
  project?: {
    projectName: string;
  };
}

export const invoiceApi = {
  async getMyInvoices(): Promise<ClientInvoice[]> {
    try {
      const res = await http.get("/api/v1/invoices");
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      return data?.content ?? [];
    } catch {
      return [];
    }
  },
};
