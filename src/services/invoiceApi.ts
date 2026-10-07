import { http } from "./http";

export interface InvoiceItem {
  id?: number;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface ClientInvoice {
  id: number;
  invoiceNumber: string;
  projectId?: number;
  customerId?: number;
  customerName?: string;
  customerCompanyName?: string;
  projectName?: string;
  projectCode?: string;
  totalAmount: number;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  items?: InvoiceItem[];
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

  async getInvoiceDetails(id: number | string): Promise<ClientInvoice | null> {
    try {
      const res = await http.get(`/api/v1/invoices/${id}`);
      return res.data?.data ?? null;
    } catch {
      return null;
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

