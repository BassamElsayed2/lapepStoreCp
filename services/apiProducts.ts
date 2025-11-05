import { decode } from "base64-arraybuffer";
import { createClient } from "@supabase/supabase-js";
import supabaseStorage from "./supabase";

// إنشاء Supabase client للصور فقط
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function للاتصال بـ Backend API
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  
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

export interface ProductAttribute {
  id?: string;
  product_id?: string;
  attribute_name: string;
  attribute_value: string;
}

export interface Product {
  id?: string;
  name_ar: string; // Required field
  name_en: string; // Required field
  price: number; // Required field
  offer_price?: number;
  images?: string[]; // URLs من Supabase Storage
  description_ar?: string;
  description_en?: string;
  category_id?: string;
  quantity?: number; // integer with default 0 (replaces stock_quantity)
  is_best_seller?: boolean; // boolean with default false
  limited_time_offer?: boolean; // boolean with default false
  created_at?: string;
  updated_at?: string;
  // Keep for backward compatibility
  title?: string; // old field
  stock_quantity?: number; // old field
  image_url?: string[]; // old field
  stock?: number; // old field
  description?: string; // old field
  attributes?: ProductAttribute[];
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
  }
): Promise<{ products: Product[]; total: number }> {
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
    
    // Map images to image_url for backward compatibility
    const products = (response.data || []).map(product => ({
      ...product,
      image_url: product.images || product.image_url, // Ensure compatibility
      stock: product.stock_quantity || product.quantity, // Map stock_quantity to stock
    }));
    
    return {
      products,
      total: response.pagination?.total || 0,
    };
  } catch (error: any) {
    console.error('❌ خطأ في جلب المنتجات:', error);
    throw new Error(error.message || 'تعذر تحميل المنتجات');
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await apiFetch<{ success: boolean; data: Product }>(`/products/${id}`);
    const product = response.data;
    
    // Map for backward compatibility
    return {
      ...product,
      image_url: product.images || product.image_url,
      stock: product.quantity,
      description: product.description_ar || product.description_en,
    };
  } catch (error: any) {
    console.error('❌ خطأ في جلب المنتج:', error);
    throw new Error(error.message || 'تعذر تحميل المنتج');
  }
}

export async function createProduct(productData: Product): Promise<Product> {
  try {
    // Prepare data without null values for optional fields
    const payload: any = {
      name_ar: productData.name_ar,
      name_en: productData.name_en,
      price: Number(productData.price),
      stock_quantity: Number(productData.quantity || productData.stock_quantity || 0),
      is_best_seller: productData.is_best_seller ?? false,
      limited_time_offer: productData.limited_time_offer ?? false,
    };

    // Only add optional fields if they have values
    if (productData.offer_price !== null && productData.offer_price !== undefined) {
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

    const response = await apiFetch<{ success: boolean; data: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    console.log('✅ Product created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المنتج:', error);
    throw new Error(error.message || 'تعذر إنشاء المنتج');
  }
}

export async function uploadProductImage(
  file: File | { base64: string; name: string },
  folder = "products"
): Promise<string> {
  let fileExt: string;
  let fileName: string;
  let fileData: File | ArrayBuffer;

  if (file instanceof File) {
    fileExt = file.name.split(".").pop()!;
    fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = file;
  } else {
    // Base64 case
    fileExt = file.name.split(".").pop()!;
    fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    fileData = decode(file.base64);
  }

  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, fileData, {
      contentType: file instanceof File ? file.type : `image/${fileExt}`,
    });

  if (error) {
    console.error("خطأ أثناء رفع صورة المنتج:", error.message);
    throw new Error("تعذر رفع صورة المنتج");
  }

  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function deleteProduct(id: string) {
  try {
    // First, get the product to check if it has images
    const product = await getProductById(id);

    // Delete the images from Supabase Storage if they exist
    if (product?.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          const path = new URL(imageUrl).pathname;
          // استخراج اسم الملف من URL - bucket: product-images
          const match = path.match(
            /\/storage\/v1\/object\/public\/product-images\/(.+)/
          );
          const filePath = match?.[1];

          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from("product-images")
              .remove([filePath]);

            if (storageError) {
              console.error("⚠️ فشل حذف صورة المنتج:", storageError);
            } else {
              console.log("✅ تم حذف الصورة:", filePath);
            }
          }
        } catch (error) {
          console.error("⚠️ خطأ في معالجة URL الصورة:", error);
        }
      }
    }

    // Delete the product from SQL Server
    await apiFetch<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    });
    
    console.log('✅ تم حذف المنتج بنجاح');
  } catch (error: any) {
    console.error('❌ خطأ في حذف المنتج:', error);
    throw new Error(error.message || 'حدث خطأ أثناء حذف المنتج');
  }
}

export async function updateProduct(
  id: string,
  updatedProduct: Partial<Product>
) {
  try {
    const { stock, image_url, quantity, ...product } = updatedProduct;

    // Map data for backend
    const updateData: any = {
      ...product,
      stock_quantity: quantity || stock || undefined, // Backend uses stock_quantity
    };

    // Convert numeric fields
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }
    if (updateData.offer_price !== undefined && updateData.offer_price !== null) {
      updateData.offer_price = Number(updateData.offer_price);
    }
    if (updateData.stock_quantity !== undefined) {
      updateData.stock_quantity = Number(updateData.stock_quantity);
    }

    // Clean up undefined and null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    // Convert category_id to integer if exists
    if (updateData.category_id) {
      updateData.category_id = parseInt(updateData.category_id);
    }

    const response = await apiFetch<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    console.log('✅ Product updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ خطأ في تحديث المنتج:', error);
    throw new Error(error.message || 'تعذر تحديث المنتج');
  }
}
