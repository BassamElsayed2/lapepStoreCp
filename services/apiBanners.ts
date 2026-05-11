/**
 * Banners API Service - Uses Backend API for data and image storage
 */

import { extractPathFromUrl } from "./supabase";

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export interface Banner {
  id: number;
  desc_ar?: string;
  desc_en?: string;
  image: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateBannerData {
  desc_ar?: string;
  desc_en?: string;
  image?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateBannerData {
  desc_ar?: string;
  desc_en?: string;
  image?: string;
  display_order?: number;
  is_active?: boolean;
}

/**
 * Get all banners
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Banner[];
    }>("/content/banners");

    return response.data || [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
}

/**
 * Get banner by ID
 */
export async function getBannerById(id: number): Promise<Banner> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Banner;
    }>(`/content/banners/${id}`);

    if (!response.data) {
      throw new Error("Banner not found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching banner:", error);
    throw error;
  }
}

/**
 * Create new banner
 */
export async function createBanner(data: CreateBannerData): Promise<Banner> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Banner;
    }>("/content/banners", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error;
  }
}

/**
 * Update banner
 */
export async function updateBanner(
  id: number,
  data: UpdateBannerData,
): Promise<Banner> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Banner;
    }>(`/content/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
}

/**
 * Delete banner
 */
export async function deleteBanner(id: number): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/content/banners/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
}

/**
 * Upload banner image to backend server
 */
export async function uploadBannerImage(file: File): Promise<string> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "banners");

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
    console.error("Error uploading banner image:", error);
    throw error;
  }
}

/**
 * Delete banner image from backend server
 */
export async function deleteBannerImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting banner image:", error);
    throw error;
  }
}

/**
 * Toggle banner active status
 */
export async function toggleBannerStatus(
  id: number,
  is_active: boolean,
): Promise<Banner> {
  return updateBanner(id, { is_active });
}

/**
 * Update banner display order
 */
export async function updateBannerOrder(
  id: number,
  display_order: number,
): Promise<Banner> {
  return updateBanner(id, { display_order });
}
