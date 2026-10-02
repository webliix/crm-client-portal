import { http } from "./http";

export interface ClientProject {
  id: number;
  projectName: string;
  projectCode: string;
  description: string;
  startDate?: string;
  expectedEndDate?: string;
  dueDate?: string;
  actualEndDate?: string;
  status: string;
  priority?: string;
  progressPercentage: number;
  budget?: number;
  documentationUrl?: string;
  architectureNotes?: string;
  customerName?: string;
  customerCompanyName?: string;
}

export interface ClientMilestone {
  id: number;
  title?: string;
  milestoneName?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  status?: string;
}

export interface ClientTask {
  id: number;
  title?: string;
  taskName?: string;
  description?: string;
  status: string;
}

export interface ClientComment {
  id: number;
  authorName: string;
  authorRole?: string;
  message?: string;
  comment?: string;
  createdAt: string;
}

export const projectApi = {
  async getMyProjects(): Promise<ClientProject[]> {
    try {
      const res = await http.get("/api/v1/projects");
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      return data?.content ?? [];
    } catch {
      return [];
    }
  },

  async getProjectDetails(id: number | string): Promise<ClientProject | null> {
    try {
      const res = await http.get(`/api/v1/projects/${id}`);
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },

  async getMilestones(projectId: number | string): Promise<ClientMilestone[]> {
    try {
      const res = await http.get(`/api/v1/projects/${projectId}/milestones`);
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  async getTasks(projectId: number | string): Promise<ClientTask[]> {
    try {
      const res = await http.get(`/api/v1/projects/${projectId}/tasks`);
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  async getComments(projectId: number | string): Promise<ClientComment[]> {
    try {
      const res = await http.get(`/api/v1/projects/${projectId}/comments`);
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  async addInstruction(projectId: number | string, message: string, authorName?: string): Promise<ClientComment | null> {
    try {
      const res = await http.post(`/api/v1/projects/${projectId}/comments`, {
        message,
        comment: message,
        authorName: authorName || "Client",
        authorRole: "CLIENT",
      });
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },
};
