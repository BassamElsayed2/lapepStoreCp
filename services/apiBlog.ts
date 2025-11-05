/**
 * Blog API Service
 *
 * This service handles blog operations:
 * - Blog data: Stored in SQL database via backend API
 * - Images: Uploaded to Supabase Storage (blog-images bucket)
 */

import { uploadImage } from "./supabase";

// Base API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

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
  }
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
      `/content/blogs/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("خطأ في جلب المقال:", error);
    throw new Error(error.message || "تعذر تحميل المقال");
  }
}

/**
 * Create new blog (stores data in SQL database)
 */
export async function Createblog(newBlog: Blog): Promise<Blog> {
  try {
    const response = await apiFetch<{ success: boolean; data: Blog }>(
      "/content/blogs",
      {
        method: "POST",
        body: JSON.stringify(newBlog),
      }
    );

    console.log("✅ تم إنشاء المقال بنجاح:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء المقال:", error);
    throw new Error(error.message || "فشل إنشاء المقال");
  }
}

/**
 * Update blog (stores data in SQL database)
 */
export async function updateBlog(
  id: string,
  updatedBlog: Partial<Blog>
): Promise<Blog> {
  try {
    const response = await apiFetch<{ success: boolean; data: Blog }>(
      `/content/blogs/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedBlog),
      }
    );

    console.log("✅ تم تحديث المقال بنجاح:", response.data);
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

    console.log("✅ تم حذف المقال بنجاح");
  } catch (error: any) {
    console.error("❌ خطأ في حذف المقال:", error);
    throw new Error(error.message || "فشل حذف المقال");
  }
}

/**
 * Upload images to Supabase Storage (blog-images bucket)
 * Returns array of public URLs
 */
export async function uploadImages(
  files: File[],
  folder = "blog"
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    try {
      const fileExt = file.name.split(".").pop()!;
      const fileName = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const result = await uploadImage("blog-images", fileName, file);

      if (result.error) {
        console.error("خطأ أثناء رفع الصورة:", result.error);
        continue;
      }

      if (result.url) {
        uploadedUrls.push(result.url);
      }
    } catch (error) {
      console.error("خطأ أثناء رفع الصورة:", error);
      continue;
    }
  }

  if (uploadedUrls.length === 0) {
    throw new Error("فشل في رفع جميع الصور");
  }

  return uploadedUrls;
}
