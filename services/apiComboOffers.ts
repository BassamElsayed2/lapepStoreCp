/**
 * Combo Offers API Service - Uses Backend API for data and image storage
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
  data: CreateComboOfferData,
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
  data: UpdateComboOfferData,
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
 * Upload combo offer image to backend server
 */
export async function uploadComboOfferImage(file: File): Promise<string> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "combo-offers");

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
    console.error("Error uploading combo offer image:", error);
    throw error;
  }
}

/**
 * Delete combo offer image from backend server
 */
export async function deleteComboOfferImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting combo offer image:", error);
    throw error;
  }
}
