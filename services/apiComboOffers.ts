/**
 * Combo Offers API Service - Uses Backend API
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

export interface ComboOffer {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  total_price: number;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateComboOfferData {
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  total_price?: number;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface CreateComboOfferData {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string | null;
  total_price: number;
  starts_at?: string | null;
  ends_at?: string | null;
}

/**
 * Get all combo offers
 */
export async function getComboOffers(): Promise<ComboOffer[]> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: ComboOffer[];
    }>("/content/combo-offers");

    return response.data || [];
  } catch (error) {
    console.error("Error fetching combo offers:", error);
    throw error;
  }
}

/**
 * Get combo offer by ID
 */
export async function getComboOfferById(id: string): Promise<ComboOffer> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: ComboOffer;
    }>(`/content/combo-offers/${id}`);

    if (!response.data) {
      throw new Error("Combo offer not found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching combo offer:", error);
    throw error;
  }
}

/**
 * Create new combo offer
 */
export async function createComboOffer(
  data: CreateComboOfferData
): Promise<ComboOffer> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: ComboOffer;
    }>("/content/combo-offers", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error creating combo offer:", error);
    throw error;
  }
}

/**
 * Update combo offer
 */
export async function updateComboOffer(
  id: string,
  data: UpdateComboOfferData
): Promise<ComboOffer> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: ComboOffer;
    }>(`/content/combo-offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error updating combo offer:", error);
    throw error;
  }
}

/**
 * Delete combo offer
 */
export async function deleteComboOffer(id: string): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/content/combo-offers/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting combo offer:", error);
    throw error;
  }
}

/**
 * Upload combo offer image to Supabase Storage
 */
export async function uploadComboOfferImage(file: File): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `combo-offers/${fileName}`;

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
    console.error("Error uploading combo offer image:", error);
    throw error;
  }
}

/**
 * Delete combo offer image from Supabase Storage
 */
export async function deleteComboOfferImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting combo offer image:", error);
    throw error;
  }
}
