/**
 * Products API Service - Uses Backend API (SQL Server)
 * الصور فقط على Supabase (bucket: product_images)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function للاتصال بـ Backend API
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('admin_token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'حدث خطأ في الاتصال بالخادم',
    }));
    throw new Error(errorData.message || `خطأ في الخادم: ${response.status}`);
  }

  return response.json();
}

// Product Interface
export interface Product {
  id?: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  offer_price?: number;
  images?: string[]; // URLs من Supabase
  category_id?: string;
  quantity?: number;
  is_best_seller?: boolean;
  limited_time_offer?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create Product - Backend API
 */
export async function createProductBackend(productData: Product): Promise<Product> {
  try {
    const response = await apiFetch<{ success: boolean; data: { id: string } }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return { ...productData, id: response.data.id };
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المنتج:', error);
    throw new Error(error.message || 'فشل إنشاء المنتج');
  }
}

/**
 * Get Products - Backend API
 */
export async function getProductsBackend(
  page = 1,
  limit = 10,
  filters?: {
    categoryId?: string;
    search?: string;
    isBestSeller?: boolean;
    limitedTimeOffer?: boolean;
  }
): Promise<{ products: Product[]; total: number; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.isBestSeller !== undefined && { isBestSeller: filters.isBestSeller.toString() }),
      ...(filters?.limitedTimeOffer !== undefined && { limitedTimeOffer: filters.limitedTimeOffer.toString() }),
    });

    const response = await apiFetch<{ 
      success: boolean; 
      data: Product[];
      pagination: { total: number; totalPages: number; page: number; limit: number };
    }>(`/products?${params}`);
    
    return {
      products: response.data || [],
      total: response.pagination?.total || 0,
      totalPages: response.pagination?.totalPages || 0,
    };
  } catch (error: any) {
    console.error('❌ خطأ في جلب المنتجات:', error);
    throw new Error(error.message || 'فشل جلب المنتجات');
  }
}

/**
 * Get Product by ID - Backend API
 */
export async function getProductByIdBackend(id: string): Promise<Product> {
  try {
    const response = await apiFetch<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ خطأ في جلب المنتج:', error);
    throw new Error(error.message || 'فشل جلب المنتج');
  }
}

/**
 * Update Product - Backend API
 */
export async function updateProductBackend(id: string, productData: Partial<Product>): Promise<Product> {
  try {
    const response = await apiFetch<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ خطأ في تحديث المنتج:', error);
    throw new Error(error.message || 'فشل تحديث المنتج');
  }
}

/**
 * Delete Product - Backend API
 */
export async function deleteProductBackend(id: string): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    console.error('❌ خطأ في حذف المنتج:', error);
    throw new Error(error.message || 'فشل حذف المنتج');
  }
}

