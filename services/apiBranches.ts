/**
 * Branches API Service - Uses Backend API
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

export interface Branch {
  id: number;
  created_at: string;
  name_en?: string | null;
  name_ar?: string | null;
  area_ar?: string | null;
  area_en?: string | null;
  address_ar?: string | null;
  address_en?: string | null;
  google_map?: string | null;
  image?: string | null;
  works_hours?: string | null;
  phone?: string | null;
}

export interface CreateBranchData {
  name_en?: string;
  name_ar?: string;
  area_ar?: string;
  area_en?: string;
  address_ar?: string;
  address_en?: string;
  google_map?: string;
  image?: string;
  works_hours?: string;
  phone?: string;
}

export interface UpdateBranchData {
  name_en?: string;
  name_ar?: string;
  area_ar?: string;
  area_en?: string;
  address_ar?: string;
  address_en?: string;
  google_map?: string;
  image?: string;
  works_hours?: string;
  phone?: string;
}

/**
 * Get all branches
 */
export async function getBranches(): Promise<Branch[]> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Branch[];
    }>("/content/branches");

    return response.data || [];
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
}

/**
 * Get branch by ID
 */
export async function getBranchById(id: number): Promise<Branch> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Branch;
    }>(`/content/branches/${id}`);

    if (!response.data) {
      throw new Error("Branch not found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching branch:", error);
    throw error;
  }
}

/**
 * Create new branch
 */
export async function createBranch(data: CreateBranchData): Promise<Branch> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Branch;
    }>("/content/branches", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
}

/**
 * Update branch
 */
export async function updateBranch(
  id: number,
  data: UpdateBranchData
): Promise<Branch> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Branch;
    }>(`/content/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response.data;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
}

/**
 * Delete branch
 */
export async function deleteBranch(id: number): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/content/branches/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw error;
  }
}

/**
 * Upload branch image to Supabase Storage
 */
export async function uploadBranchImage(file: File): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `branches/${fileName}`;

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
    console.error("Error uploading branch image:", error);
    throw error;
  }
}

/**
 * Delete branch image from Supabase Storage
 */
export async function deleteBranchImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting branch image:", error);
    throw error;
  }
}
