/**
 * Gallery API Service - Uses Backend API
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

export interface Gallery {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image_urls: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateGalleryData {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image_urls: File[];
}

export interface UpdateGalleryData {
  title_ar?: string;
  title_en?: string;
  description_ar?: string;
  description_en?: string;
  image_urls?: string[];
}

/**
 * Get all galleries
 */
export async function getGalleries(): Promise<Gallery[]> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Gallery[];
    }>("/content/galleries");

    return response.data || [];
  } catch (error) {
    console.error("Error fetching galleries:", error);
    throw error;
  }
}

/**
 * Get gallery by ID
 */
export async function getGalleryById(id: string): Promise<Gallery> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Gallery;
    }>(`/content/galleries/${id}`);

    if (!response.data) {
      throw new Error("Gallery not found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching gallery:", error);
    throw error;
  }
}

/**
 * Upload multiple images to Supabase Storage
 */
async function uploadGalleryImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}_${file.name}`;
    const filePath = `galleries/${fileName}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`فشل رفع الصورة ${file.name}: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
}

/**
 * Create new gallery
 */
export async function CreateGallery(data: CreateGalleryData): Promise<Gallery> {
  try {
    // Upload images first
    const imageUrls = await uploadGalleryImages(data.image_urls);

    const galleryData = {
      title_ar: data.title_ar,
      title_en: data.title_en,
      description_ar: data.description_ar,
      description_en: data.description_en,
      image_urls: imageUrls,
    };

    const response = await apiFetch<{
      success: boolean;
      data: Gallery;
    }>("/content/galleries", {
      method: "POST",
      body: JSON.stringify(galleryData),
    });

    return response.data;
  } catch (error) {
    console.error("Error creating gallery:", error);
    throw error;
  }
}

/**
 * Update gallery
 */
export async function updateGallery(
  id: string,
  data: UpdateGalleryData
): Promise<Gallery> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Gallery;
    }>(`/content/galleries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error updating gallery:", error);
    throw error;
  }
}

/**
 * Delete gallery
 */
export async function deleteGallery(id: string): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/content/galleries/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    throw error;
  }
}

/**
 * Upload single gallery image to Supabase Storage
 */
export async function uploadGalleryImage(file: File): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `galleries/${fileName}`;

    const { error } = await supabase.storage
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
    console.error("Error uploading gallery image:", error);
    throw error;
  }
}

/**
 * Delete gallery image from Supabase Storage
 */
export async function deleteGalleryImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting gallery image:", error);
    throw error;
  }
}

/**
 * Add images to existing gallery
 */
export async function addImagesToGallery(
  galleryId: string,
  files: File[]
): Promise<Gallery> {
  try {
    // Get current gallery
    const gallery = await getGalleryById(galleryId);

    // Upload new images
    const newImageUrls = await uploadGalleryImages(files);

    // Combine with existing images
    const allImageUrls = [...gallery.image_urls, ...newImageUrls];

    // Update gallery
    return await updateGallery(galleryId, {
      image_urls: allImageUrls,
    });
  } catch (error) {
    console.error("Error adding images to gallery:", error);
    throw error;
  }
}

/**
 * Remove image from gallery
 */
export async function removeImageFromGallery(
  galleryId: string,
  imageUrl: string
): Promise<Gallery> {
  try {
    // Get current gallery
    const gallery = await getGalleryById(galleryId);

    // Remove image from storage
    await deleteGalleryImage(imageUrl);

    // Remove from gallery's image_urls array
    const updatedImageUrls = gallery.image_urls.filter(
      (url) => url !== imageUrl
    );

    // Update gallery
    return await updateGallery(galleryId, {
      image_urls: updatedImageUrls,
    });
  } catch (error) {
    console.error("Error removing image from gallery:", error);
    throw error;
  }
}

// Export aliases for backward compatibility
export const getGalleriesById = getGalleryById;
export const deleteGalleries = deleteGallery;
