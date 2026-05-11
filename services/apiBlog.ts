/**
 * Blog API Service
 *
 * This service handles blog operations:
 * - Blog data: Stored in SQL database via backend API
 * - Images: Uploaded to backend server
 */

// Base API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("admin_token")
    : null;
}

export interface Blog {
  id?: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  images?: string[];
  yt_code?: string;
  author?: string;
  status?: "draft" | "published";
  created_at?: string;
  updated_at?: string;
}

/**
 * Helper function to make API calls with fetch
 */
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

/**
 * Get all blogs with pagination and filters
 */
export async function getBlog(
  page = 1,
  limit = 10,
  filters?: {
    search?: string;
    date?: string;
    status?: string;
  },
): Promise<{ blogs: Blog[]; total: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.date && { date: filters.date }),
      ...(filters?.status && { status: filters.status }),
    });

    const response = await apiFetch<{
      success: boolean;
      data: Blog[];
      total: number;
    }>(`/content/blogs?${params}`);

    return {
      blogs: response.data || [],
      total: response.total || response.data?.length || 0,
    };
  } catch (error: any) {
    console.error("خطأ في جلب المقالات:", error);
    throw new Error(error.message || "تعذر تحميل المقالات");
  }
}

/**
 * Get blog by ID
 */
export async function getBlogById(id: string): Promise<Blog> {
  try {
    const response = await apiFetch<{ success: boolean; data: Blog }>(
      `/content/blogs/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("خطأ في جلب المقال:", error);
    throw new Error(error.message || "تعذر تحميل المقال");
  }
}

/**
 * Create new blog
 */
export async function Createblog(newBlog: Blog): Promise<Blog> {
  try {
    const response = await apiFetch<{ success: boolean; data: Blog }>(
      "/content/blogs",
      {
        method: "POST",
        body: JSON.stringify(newBlog),
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء المقال:", error);
    throw new Error(error.message || "فشل إنشاء المقال");
  }
}

/**
 * Update blog
 */
export async function updateBlog(
  id: string,
  updatedBlog: Partial<Blog>,
): Promise<Blog> {
  try {
    const response = await apiFetch<{ success: boolean; data: Blog }>(
      `/content/blogs/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedBlog),
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ خطأ في تحديث المقال:", error);
    throw new Error(error.message || "فشل تحديث المقال");
  }
}

/**
 * Delete blog
 */
export async function deleteBlog(id: string): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/content/blogs/${id}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    console.error("❌ خطأ في حذف المقال:", error);
    throw new Error(error.message || "فشل حذف المقال");
  }
}

/**
 * Upload images to backend server
 * Returns array of public URLs
 */
export async function uploadImages(
  files: File[],
  folder = "blog",
): Promise<string[]> {
  const token = getToken();
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
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
    throw new Error("فشل في رفع جميع الصور");
  }

  const result = await response.json();
  return result.data.map((f: any) => f.url);
}
