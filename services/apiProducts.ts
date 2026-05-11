import { extractPathFromUrl } from "./supabase";

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function للاتصال بـ Backend API
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
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
    throw new Error(
      errorData.error ||
        errorData.message ||
        `خطأ في الخادم: ${response.status}`,
    );
  }

  return response.json();
}

function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("admin_token")
    : null;
}

export interface ProductAttribute {
  id?: string;
  product_id?: string;
  attribute_name: string;
  attribute_value: string;
}

export interface Product {
  id?: string;
  name_ar: string;
  name_en: string;
  price: number;
  offer_price?: number;
  images?: string[];
  description_ar?: string;
  description_en?: string;
  category_id?: string;
  quantity?: number;
  is_best_seller?: boolean;
  limited_time_offer?: boolean;
  created_at?: string;
  updated_at?: string;
  title?: string;
  stock_quantity?: number;
  image_url?: string[];
  stock?: number;
  description?: string;
  attributes?: ProductAttribute[];
}

/**
 * `images || image_url` breaks when `images` is [] (truthy) or when URLs are a single string
 * (then `url[0]` is only the first character). Normalize to a list of absolute URLs.
 */
export function normalizeProductImageList(product: {
  images?: unknown;
  image_url?: unknown;
}): string[] {
  const coerce = (raw: unknown): string[] | null => {
    if (raw == null) return null;
    if (Array.isArray(raw)) {
      const urls = raw
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter(Boolean);
      return urls.length ? urls : null;
    }
    if (typeof raw === "string") {
      const t = raw.trim();
      if (!t) return null;
      if (t.startsWith("[")) {
        try {
          const parsed = JSON.parse(t) as unknown;
          if (Array.isArray(parsed)) {
            const urls = parsed
              .filter((x): x is string => typeof x === "string")
              .map((x) => x.trim())
              .filter(Boolean);
            return urls.length ? urls : null;
          }
        } catch {
          return null;
        }
        return null;
      }
      return [t];
    }
    return null;
  };

  return coerce(product.images) ?? coerce(product.image_url) ?? [];
}

export async function getProducts(
  page = 1,
  limit = 10,
  filters?: {
    categoryId?: string;
    search?: string;
    date?: string;
    isBestSeller?: boolean;
    limitedTimeOffer?: boolean;
  },
): Promise<{ products: Product[]; total: number }> {
  try {
    const fetchLimit = filters?.search && filters.search.trim() ? 1000 : limit;
    const fetchPage = filters?.search && filters.search.trim() ? 1 : page;

    const params = new URLSearchParams({
      page: fetchPage.toString(),
      limit: fetchLimit.toString(),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.isBestSeller !== undefined && {
        isBestSeller: filters.isBestSeller.toString(),
      }),
      ...(filters?.limitedTimeOffer !== undefined && {
        limitedTimeOffer: filters.limitedTimeOffer.toString(),
      }),
    });

    const response = await apiFetch<{
      success: boolean;
      data: Product[];
      pagination: {
        total: number;
        totalPages: number;
        page: number;
        limit: number;
      };
    }>(`/products?${params}`);

    let products = (response.data || []).map((product) => {
      const imageList = normalizeProductImageList(product);
      return {
        ...product,
        images: imageList,
        image_url: imageList,
        stock: product.stock_quantity || product.quantity,
      };
    });

    let total = response.pagination?.total || 0;

    if (filters?.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      products = products.filter((product) => {
        const nameAr = (product.name_ar || "").toLowerCase();
        const nameEn = (product.name_en || "").toLowerCase();
        return nameAr.includes(searchTerm) || nameEn.includes(searchTerm);
      });
      total = products.length;

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      products = products.slice(startIndex, endIndex);
    }

    return {
      products: products,
      total: total,
    };
  } catch (error: any) {
    console.error("❌ خطأ في جلب المنتجات:", error);
    throw new Error(error.message || "تعذر تحميل المنتجات");
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await apiFetch<{ success: boolean; data: Product }>(
      `/products/${id}`,
    );
    const product = response.data;
    const imageList = normalizeProductImageList(product);

    return {
      ...product,
      images: imageList,
      image_url: imageList,
      stock: product.quantity,
      description: product.description_ar || product.description_en,
    };
  } catch (error: any) {
    console.error("❌ خطأ في جلب المنتج:", error);
    throw new Error(error.message || "تعذر تحميل المنتج");
  }
}

export async function createProduct(productData: Product): Promise<Product> {
  try {
    const payload: any = {
      name_ar: productData.name_ar,
      name_en: productData.name_en,
      price: Number(productData.price),
      stock_quantity: Number(
        productData.quantity || productData.stock_quantity || 0,
      ),
      is_best_seller: productData.is_best_seller ?? false,
      limited_time_offer: productData.limited_time_offer ?? false,
    };

    if (
      productData.offer_price !== null &&
      productData.offer_price !== undefined
    ) {
      payload.offer_price = Number(productData.offer_price);
    }
    if (productData.images) {
      payload.images = productData.images;
    }
    if (productData.description_ar) {
      payload.description_ar = productData.description_ar;
    }
    if (productData.description_en) {
      payload.description_en = productData.description_en;
    }
    if (productData.category_id) {
      payload.category_id = parseInt(productData.category_id);
    }

    const response = await apiFetch<{ success: boolean; data: Product }>(
      "/products",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ خطأ في إنشاء المنتج:", error);
    throw new Error(error.message || "تعذر إنشاء المنتج");
  }
}

export async function uploadProductImage(
  file: File | { base64: string; name: string },
  folder = "products",
): Promise<string> {
  const token = getToken();
  const formData = new FormData();

  if (file instanceof File) {
    formData.append("file", file);
  } else {
    const byteString = atob(file.base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const ext = file.name.split(".").pop() || "jpg";
    const blob = new Blob([ab], { type: `image/${ext}` });
    formData.append("file", blob, file.name);
  }

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
      .catch(() => ({ message: "تعذر رفع صورة المنتج" }));
    throw new Error(errorData.message || "تعذر رفع صورة المنتج");
  }

  const result = await response.json();
  return result.data.url;
}

export async function deleteProduct(id: string) {
  try {
    const product = await getProductById(id);

    if (product?.images && product.images.length > 0) {
      const token = getToken();
      for (const imageUrl of product.images) {
        try {
          const filePath = extractPathFromUrl(imageUrl);
          if (filePath) {
            await fetch(`${API_URL}/upload`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: JSON.stringify({ path: filePath }),
            });
          }
        } catch (error) {
          console.error("⚠️ خطأ في حذف صورة المنتج:", error);
        }
      }
    }

    await apiFetch<{ success: boolean }>(`/products/${id}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    console.error("❌ خطأ في حذف المنتج:", error);
    throw new Error(error.message || "حدث خطأ أثناء حذف المنتج");
  }
}

export async function updateProduct(
  id: string,
  updatedProduct: Partial<Product>,
) {
  try {
    const { stock, image_url, quantity, ...product } = updatedProduct;

    const updateData: any = {
      ...product,
      stock_quantity: quantity || stock || undefined,
    };

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }
    if (
      updateData.offer_price !== undefined &&
      updateData.offer_price !== null
    ) {
      updateData.offer_price = Number(updateData.offer_price);
    }
    if (updateData.stock_quantity !== undefined) {
      updateData.stock_quantity = Number(updateData.stock_quantity);
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    if (updateData.category_id) {
      updateData.category_id = parseInt(updateData.category_id);
    }

    const response = await apiFetch<{ success: boolean; data: Product }>(
      `/products/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ خطأ في تحديث المنتج:", error);
    throw new Error(error.message || "تعذر تحديث المنتج");
  }
}
