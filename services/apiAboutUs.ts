/**
 * About Us / Site Settings API Service - Uses Backend API for data and image storage
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

export interface SiteSettings {
  id?: string;
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  about_us_ar?: string;
  about_us_en?: string;
  contact_email?: string;
  contact_phone?: string;
  address_ar?: string;
  address_en?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  logo_url?: string;
  favicon_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateSiteSettingsData {
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  about_us_ar?: string;
  about_us_en?: string;
  contact_email?: string;
  contact_phone?: string;
  address_ar?: string;
  address_en?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  logo_url?: string;
  favicon_url?: string;
}

/**
 * Get site settings / about us information
 */
export async function getAboutUs(): Promise<SiteSettings> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: SiteSettings;
    }>("/content/about-us");

    return response.data || {};
  } catch (error) {
    console.error("Error fetching site settings:", error);
    throw error;
  }
}

/**
 * Update site settings
 */
export async function updateSiteSettings(
  data: UpdateSiteSettingsData,
): Promise<SiteSettings> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: SiteSettings;
    }>("/content/about-us", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error updating site settings:", error);
    throw error;
  }
}

/**
 * Upload logo to backend server
 */
export async function uploadLogo(file: File): Promise<string> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "site-settings");

    const response = await fetch(`${API_URL}/upload/single`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("فشل رفع الشعار");
    }

    const result = await response.json();
    return result.data.url;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw error;
  }
}

/**
 * Upload favicon to backend server
 */
export async function uploadFavicon(file: File): Promise<string> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "site-settings");

    const response = await fetch(`${API_URL}/upload/single`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("فشل رفع الأيقونة");
    }

    const result = await response.json();
    return result.data.url;
  } catch (error) {
    console.error("Error uploading favicon:", error);
    throw error;
  }
}

/**
 * Delete image from backend server
 */
export async function deleteSiteImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting site image:", error);
    throw error;
  }
}
