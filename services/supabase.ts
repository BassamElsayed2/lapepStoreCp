/**
 * Upload Service - Uses Backend API for file storage
 *
 * Note: Supabase has been completely removed.
 * All image uploads/deletes now go through the backend server.
 *
 * روابط عرض الملفات: نفس فكرة الـ backend `PUBLIC_UPLOAD_BASE_URL` — في الـ CP:
 *   NEXT_PUBLIC_PUBLIC_UPLOAD_BASE_URL=https://api.lapip.net
 * (بدون /uploads). إن لم يُعرَّف، يُستخرج الأصل من NEXT_PUBLIC_API_URL بإزالة /api؛
 * وإذا كان الناتج https://lapip.net يُستخدم افتراضياً https://api.lapip.net (مثل الـ backend).
 * تعطيل إعادة التوجيه في الـ CP: NEXT_PUBLIC_PUBLIC_UPLOAD_USE_API_SUBDOMAIN=0
 */

function getApiBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("admin_token")
    : null;
}

/** أصل GET /uploads/* في الواجهة (يطابق backend PUBLIC_UPLOAD_BASE_URL / ASSET_PUBLIC_URL). */
export function getUploadsPublicOrigin(): string {
  const dedicated =
    process.env.NEXT_PUBLIC_PUBLIC_UPLOAD_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_ASSET_PUBLIC_URL?.trim();
  if (dedicated) {
    try {
      const u = new URL(dedicated);
      return `${u.protocol}//${u.host}`;
    } catch {
      return dedicated.replace(/\/+$/, "");
    }
  }
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!api) return "";
  const derived = api.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  if (/^https:\/\/lapip\.net$/i.test(derived)) {
    if (process.env.NEXT_PUBLIC_PUBLIC_UPLOAD_USE_API_SUBDOMAIN === "0") {
      return derived;
    }
    return "https://api.lapip.net";
  }
  return derived;
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

    const base = getApiBaseUrl();
    if (!base) {
      return { url: null, error: "NEXT_PUBLIC_API_URL غير مُعرّف" };
    }

    const response = await fetch(`${base}/upload/single`, {
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
        error:
          (typeof errorData.error === "string" && errorData.error) ||
          (typeof errorData.message === "string" && errorData.message) ||
          "فشل رفع الصورة",
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

    const base = getApiBaseUrl();
    if (!base) {
      return { urls: [], error: "NEXT_PUBLIC_API_URL غير مُعرّف" };
    }

    const response = await fetch(`${base}/upload/multiple`, {
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
      return {
        urls: [],
        error:
          (typeof errorData.error === "string" && errorData.error) ||
          (typeof errorData.message === "string" && errorData.message) ||
          "فشل رفع الصور",
      };
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
    const base = getApiBaseUrl();
    if (!base) {
      return { success: false, error: "NEXT_PUBLIC_API_URL غير مُعرّف" };
    }

    const response = await fetch(`${base}/upload`, {
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
        error:
          (typeof errorData.error === "string" && errorData.error) ||
          (typeof errorData.message === "string" && errorData.message) ||
          "فشل حذف الصورة",
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
 * رابط عام لمسار تحت uploads/ (مثل product-images/products/uuid.jpg)
 */
export function getPublicUrl(_bucket: string, path: string): string {
  const base = getUploadsPublicOrigin().replace(/\/+$/, "");
  if (!base) return "";
  const rel = path
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^uploads\/?/i, "");
  return `${base}/uploads/${rel}`;
}

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getPublicUrl,
  getUploadsPublicOrigin,
  extractPathFromUrl,
};
