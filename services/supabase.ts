/**
 * Upload Service - Uses Backend API for file storage
 *
 * Note: Supabase has been completely removed.
 * All image uploads/deletes now go through the backend server.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("admin_token")
    : null;
}

/**
 * Upload single image to backend server
 */
export async function uploadImage(
  folder: string,
  _path: string,
  file: File,
): Promise<{ url: string | null; error: any }> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch(`${API_URL}/upload/single`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "فشل رفع الصورة" }));
      return {
        url: null,
        error: errorData.message || "فشل رفع الصورة",
      };
    }

    const result = await response.json();
    return { url: result.data.url, error: null };
  } catch (error) {
    return { url: null, error };
  }
}

/**
 * Upload multiple images to backend server
 */
export async function uploadMultipleImages(
  folder: string,
  files: File[],
): Promise<{ urls: string[]; error: any }> {
  try {
    const token = getToken();
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("folder", folder);

    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "فشل رفع الصور" }));
      return { urls: [], error: errorData.message || "فشل رفع الصور" };
    }

    const result = await response.json();
    const urls = result.data.map((f: any) => f.url);
    return { urls, error: null };
  } catch (error) {
    return { urls: [], error };
  }
}

/**
 * Delete image from backend server
 */
export async function deleteImage(
  _bucket: string,
  path: string,
): Promise<{ success: boolean; error: any }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/upload`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "فشل حذف الصورة" }));
      return {
        success: false,
        error: errorData.message || "فشل حذف الصورة",
      };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Extract the upload path from a server image URL
 * e.g. "https://example.com/uploads/products/uuid.jpg" → "products/uuid.jpg"
 */
export function extractPathFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const match = url.pathname.match(/\/uploads\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Get public URL for a file path
 */
export function getPublicUrl(_bucket: string, path: string): string {
  const baseUrl = API_URL?.replace(/\/api$/, "") || "";
  return `${baseUrl}/uploads/${path}`;
}

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getPublicUrl,
  extractPathFromUrl,
};
