/**
 * Categories API Service
 * يستخدم Backend API (SQL Server) فقط - لا يستخدم Supabase
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function للاتصال بـ Backend API
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("admin_token");

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

// Category Interface
export interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  image_url?: string;
  created_at?: string;
}

/**
 * جلب جميع التصنيفات من Backend API
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiFetch<{ success: boolean; data: Category[] }>(
      "/categories"
    );
    return response.data || [];
  } catch (error: any) {
    console.error("❌ خطأ في جلب التصنيفات:", error);
    throw new Error(error.message || "فشل جلب التصنيفات");
  }
}

/**
 * جلب تصنيف واحد بواسطة ID
 */
export async function getCategoryById(id: number): Promise<Category> {
  try {
    const response = await apiFetch<{ success: boolean; data: Category }>(
      `/categories/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ خطأ في جلب التصنيف:", error);
    throw new Error(error.message || "فشل جلب التصنيف");
  }
}

/**
 * إنشاء تصنيف جديد (Admin فقط)
 */
export async function createCategory(
  categoryData: Omit<Category, "id" | "created_at">
): Promise<Category> {
  try {
    const response = await apiFetch<{ success: boolean; data: Category }>(
      "/categories",
      {
        method: "POST",
        body: JSON.stringify(categoryData),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء التصنيف:", error);
    throw new Error(error.message || "فشل إنشاء التصنيف");
  }
}

/**
 * تحديث تصنيف (Admin فقط)
 */
export async function updateCategory(
  id: number,
  categoryData: Partial<Category>
): Promise<Category> {
  try {
    const response = await apiFetch<{ success: boolean; data: Category }>(
      `/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(categoryData),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ خطأ في تحديث التصنيف:", error);
    throw new Error(error.message || "فشل تحديث التصنيف");
  }
}

/**
 * حذف تصنيف (Admin فقط)
 */
export async function deleteCategory(id: number): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/categories/${id}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    console.error("❌ خطأ في حذف التصنيف:", error);
    throw new Error(error.message || "فشل حذف التصنيف");
  }
}
