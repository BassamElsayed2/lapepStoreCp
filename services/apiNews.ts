/**
 * News API Service - Uses Backend API for data and image storage
 */

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("admin_token")
    : null;
}

// Helper function for API calls
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "حدث خطأ في الاتصال بالخادم",
    }));
    throw new Error(errorData.message || `خطأ في الخادم: ${response.status}`);
  }

  return response.json();
}

export interface News {
  title_ar: string;
  title_en: string;
  status?: string;
  category_id?: string;
  author?: string;
  content_ar: string;
  content_en: string;
  images?: string[];
  yt_code?: string;
  created_at?: string;
  id?: string;
  user_id?: string;
  price?: number;
  price_medium?: number;
  price_large?: number;
  price_family?: number;
}

export interface CreateNewsInput {
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  images?: string[];
  yt_code?: string;
}

/**
 * Get news with pagination and filters
 */
export async function getNews(
  page = 1,
  limit = 10,
  filters?: {
    categoryId?: string;
    status?: string;
    search?: string;
    date?: string;
  },
): Promise<{ news: News[]; total: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.date && { date: filters.date }),
    });

    const response = await apiFetch<{
      success: boolean;
      data: News[];
      pagination: {
        total: number;
        totalPages: number;
        page: number;
        limit: number;
      };
    }>(`/content/news?${params}`);

    return {
      news: response.data || [],
      total: response.pagination?.total || 0,
    };
  } catch (error) {
    console.error("Error fetching news:", error);
    return { news: [], total: 0 };
  }
}

/**
 * Get news by ID
 */
export async function getNewsById(id: string): Promise<News> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: News;
    }>(`/content/news/${id}`);

    if (!response.data) {
      throw new Error("News not found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}

/**
 * Create new news
 */
export async function CreateNews(
  newNews: CreateNewsInput | News,
): Promise<News> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: News;
    }>("/content/news", {
      method: "POST",
      body: JSON.stringify(newNews),
    });

    return response.data;
  } catch (error) {
    console.error("Error creating news:", error);
    throw error;
  }
}

/**
 * Update news
 */
export async function updateNews(
  id: string,
  updatedNews: Partial<News>,
): Promise<News> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: News;
    }>(`/content/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedNews),
    });

    return response.data;
  } catch (error) {
    console.error("Error updating news:", error);
    throw error;
  }
}

/**
 * Delete news
 */
export async function deleteNews(id: string): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/content/news/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    throw error;
  }
}

/**
 * Upload images to backend server
 */
export async function uploadImages(
  files: (File | { base64: string; name: string })[],
  folder = "news",
): Promise<string[]> {
  const token = getToken();
  const formData = new FormData();

  for (const file of files) {
    if (file instanceof File) {
      formData.append("files", file);
    } else {
      const byteString = atob(file.base64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const ext = file.name.split(".").pop() || "jpg";
      const blob = new Blob([ab], { type: `image/${ext}` });
      formData.append("files", blob, file.name);
    }
  }

  formData.append("folder", folder);

  const response = await fetch(`${API_URL}/upload/multiple`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("فشل رفع الصور");
  }

  const result = await response.json();
  return result.data.map((f: any) => f.url);
}
