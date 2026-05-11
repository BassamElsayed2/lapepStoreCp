/**
 * Gallery API Service - Uses Backend API for data and image storage
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
 * Upload multiple images to backend server
 */
async function uploadGalleryImages(files: File[]): Promise<string[]> {
  const token = getToken();
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("folder", "galleries");

  const response = await fetch(`${API_URL}/upload/multiple`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("فشل رفع الصور");
  }

  const result = await response.json();
  return result.data.map((f: any) => f.url);
}

/**
 * Create new gallery
 */
export async function CreateGallery(data: CreateGalleryData): Promise<Gallery> {
  try {
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
  data: UpdateGalleryData,
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
 * Upload single gallery image to backend server
 */
export async function uploadGalleryImage(file: File): Promise<string> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "galleries");

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
    console.error("Error uploading gallery image:", error);
    throw error;
  }
}

/**
 * Delete gallery image from backend server
 */
export async function deleteGalleryImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting gallery image:", error);
    throw error;
  }
}

/**
 * Add images to existing gallery
 */
export async function addImagesToGallery(
  galleryId: string,
  files: File[],
): Promise<Gallery> {
  try {
    const gallery = await getGalleryById(galleryId);
    const newImageUrls = await uploadGalleryImages(files);
    const allImageUrls = [...gallery.image_urls, ...newImageUrls];

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
  imageUrl: string,
): Promise<Gallery> {
  try {
    const gallery = await getGalleryById(galleryId);
    await deleteGalleryImage(imageUrl);

    const updatedImageUrls = gallery.image_urls.filter(
      (url) => url !== imageUrl,
    );

    return await updateGallery(galleryId, {
      image_urls: updatedImageUrls,
    });
  } catch (error) {
    console.error("Error removing image from gallery:", error);
    throw error;
  }
}

export const getGalleriesById = getGalleryById;
export const deleteGalleries = deleteGallery;
