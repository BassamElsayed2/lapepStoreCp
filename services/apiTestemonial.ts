/**
 * Testimonials API Service - Uses Backend API for data and image storage
 */

import { extractPathFromUrl } from "./supabase";

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

export interface Testimonial {
  id: string;
  name_ar: string;
  name_en: string;
  message_ar: string;
  message_en: string;
  image?: string;
  created_at?: string;
}

export interface CreateTestimonialData {
  name_ar: string;
  name_en: string;
  message_ar: string;
  message_en: string;
  image?: string;
}

export interface UpdateTestimonialData {
  name_ar?: string;
  name_en?: string;
  message_ar?: string;
  message_en?: string;
  image?: string;
}

/**
 * Get testimonials with pagination and filters
 */
export async function getTestemonial(
  page = 1,
  limit = 10,
  filters?: {
    search?: string;
    date?: string;
    status?: "draft" | "published";
  },
): Promise<{ testimonials: Testimonial[]; total: number }> {
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
      data: Testimonial[];
      pagination: {
        total: number;
        totalPages: number;
        page: number;
        limit: number;
      };
    }>(`/content/testimonials?${params}`);

    return {
      testimonials: response.data || [],
      total: response.pagination?.total || 0,
    };
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    throw error;
  }
}

/**
 * Get testimonial by ID
 */
export async function getTestemonialById(id: string): Promise<Testimonial> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Testimonial;
    }>(`/content/testimonials/${id}`);

    if (!response.data) {
      throw new Error("Testimonial not found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    throw error;
  }
}

/**
 * Create new testimonial
 */
export async function createTestemonial(
  data: CreateTestimonialData,
): Promise<Testimonial> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Testimonial;
    }>("/content/testimonials", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error creating testimonial:", error);
    throw error;
  }
}

/**
 * Update testimonial
 */
export async function updateTestemonial(
  id: string,
  data: UpdateTestimonialData,
): Promise<Testimonial> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Testimonial;
    }>(`/content/testimonials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error updating testimonial:", error);
    throw error;
  }
}

/**
 * Delete testimonial
 */
export async function deleteTestemonial(id: string): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/content/testimonials/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    throw error;
  }
}

/**
 * Upload testimonial image to backend server
 */
export async function uploadTestimonialImage(file: File): Promise<string> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "testimonials");

    const response = await fetch(`${API_URL}/upload/single`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("فشل رفع الصورة");
    }

    const result = await response.json();
    return result.data.url;
  } catch (error) {
    console.error("Error uploading testimonial image:", error);
    throw error;
  }
}

/**
 * Delete testimonial image from backend server
 */
export async function deleteTestimonialImage(imageUrl: string): Promise<void> {
  try {
    const filePath = extractPathFromUrl(imageUrl);
    if (!filePath) {
      throw new Error("Invalid image URL");
    }

    const token = getToken();
    const response = await fetch(`${API_URL}/upload`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ path: filePath }),
    });

    if (!response.ok) {
      throw new Error("فشل حذف الصورة");
    }
  } catch (error) {
    console.error("Error deleting testimonial image:", error);
    throw error;
  }
}

export const CreateTestemonial = createTestemonial;
