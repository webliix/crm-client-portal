import { http } from "./http";

export interface ClientArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  category?: string;
  readTimeMinutes?: number;
  publishedAt?: string;
  createdAt: string;
  authorName?: string;
  featured?: boolean;
}

export function getExternalArticleUrl(slug?: string): string {
  const base = "https://webliix.in";
  return slug ? `${base}/blog/${slug}` : `${base}/blog`;
}

export const articleApi = {
  async getPublishedArticles(): Promise<ClientArticle[]> {
    try {
      const res = await http.get("/api/v1/public/blogs");
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      return [];
    } catch {
      return [];
    }
  },

  async getFeaturedArticles(): Promise<ClientArticle[]> {
    try {
      const res = await http.get("/api/v1/public/blogs/featured");
      const data = res.data?.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch {
      return [];
    }
  },

  async getArticleBySlug(slug: string): Promise<ClientArticle | null> {
    try {
      const res = await http.get(`/api/v1/public/blogs/${slug}`);
      return res.data?.data ?? null;
    } catch {
      return null;
    }
  },

  async subscribeNewsletter(email: string, name?: string): Promise<boolean> {
    try {
      await http.post("/api/v1/public/newsletter/subscribe", { email, name });
      return true;
    } catch {
      return false;
    }
  },
};
