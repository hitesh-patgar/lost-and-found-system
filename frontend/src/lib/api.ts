import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export type Item = {
  id: string | number;
  item_name: string;
  category?: string;
  description?: string;
  location?: string;
  date?: string;
  contact_number?: string;
  image_url?: string;
  reporter_name?: string;
  email?: string;
  type?: "lost" | "found";
  user_id?: number;
  userId?: number;
};

export const normalizeItem = (raw: any): Item => ({
  id: raw?.id ?? raw?.item_id ?? "",
  item_name: raw?.item_name ?? "",
  category: raw?.category,
  description: raw?.description,
  location: raw?.location,
  date: raw?.date ?? raw?.date_reported,
  contact_number: raw?.contact_number,
  image_url: raw?.image_url,
  reporter_name: raw?.reporter_name,
  email: raw?.email ?? raw?.reporter_email,
  type: raw?.type,
  user_id: raw?.user_id,
  userId: raw?.userId,
});
