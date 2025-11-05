/**
 * Banners API Service - Uses Backend API
 */
import { createClient } from "@supabase/supabase-js";

// Supabase client for image storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function for API calls
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

export interface Banner {
  id: number;
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  image_url: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBannerData {
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface UpdateBannerData {
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
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
  data: UpdateBannerData
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
 * Upload banner image to Supabase Storage
 */
export async function uploadBannerImage(file: File): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `banners/${fileName}`;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`فشل رفع الصورة: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading banner image:", error);
    throw error;
  }
}

/**
 * Delete banner image from Supabase Storage
 */
export async function deleteBannerImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/images/");
    if (pathParts.length < 2) {
      throw new Error("Invalid image URL");
    }
    const filePath = pathParts[1];

    const { error } = await supabase.storage.from("images").remove([filePath]);

    if (error) {
      throw new Error(`فشل حذف الصورة: ${error.message}`);
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
  is_active: boolean
): Promise<Banner> {
  return updateBanner(id, { is_active });
}

/**
 * Update banner display order
 */
export async function updateBannerOrder(
  id: number,
  display_order: number
): Promise<Banner> {
  return updateBanner(id, { display_order });
}
