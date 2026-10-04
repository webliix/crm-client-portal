import { http } from "./http";

export interface ClientInvoice {
  id: number;
  invoiceNumber: string;
  projectId?: number;
  customerId?: number;
  customerName?: string;
  projectName?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  project?: {
    id?: number;
    projectName?: string;
  };
}

export interface ProjectBillingSummary {
  projectId: number;
  projectCode: string;
  projectName: string;
  customerId: number;
  customerName: string;
  customerCompanyName: string;
  budget: number;
  totalBilled: number;
  totalPaid: number;
  pendingDueOnInvoices: number;
  remainingProjectBalance: number;
  unbilledContractAmount: number;
  invoices: ClientInvoice[];
  paymentSubmissions: any[];
}

export const invoiceApi = {
  async getMyInvoices(projectId?: number | string): Promise<ClientInvoice[]> {
    try {
      const url = projectId ? `/api/v1/projects/${projectId}/invoices` : "/api/v1/invoices";
      const res = await http.get(url);
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      return data?.content ?? [];
    } catch {
      return [];
    }
  },

  async getProjectBilling(projectId: number | string): Promise<ProjectBillingSummary | null> {
    try {
      const res = await http.get(`/api/v1/projects/${projectId}/billing`);
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },
};

