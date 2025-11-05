/**
 * About Us / Site Settings API Service - Uses Backend API
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
  data: UpdateSiteSettingsData
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
 * Upload logo to Supabase Storage
 */
export async function uploadLogo(file: File): Promise<string> {
  try {
    const fileName = `logo_${Date.now()}_${file.name}`;
    const filePath = `site-settings/${fileName}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`فشل رفع الشعار: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw error;
  }
}

/**
 * Upload favicon to Supabase Storage
 */
export async function uploadFavicon(file: File): Promise<string> {
  try {
    const fileName = `favicon_${Date.now()}_${file.name}`;
    const filePath = `site-settings/${fileName}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`فشل رفع الأيقونة: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading favicon:", error);
    throw error;
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteSiteImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting site image:", error);
    throw error;
  }
}
