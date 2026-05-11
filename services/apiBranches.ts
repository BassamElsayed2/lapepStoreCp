/**
 * Branches API Service - Uses Backend API for data and image storage
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
  data: UpdateBranchData,
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
 * Upload branch image to backend server
 */
export async function uploadBranchImage(file: File): Promise<string> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "branches");

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
    console.error("Error uploading branch image:", error);
    throw error;
  }
}

/**
 * Delete branch image from backend server
 */
export async function deleteBranchImage(imageUrl: string): Promise<void> {
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
    console.error("Error deleting branch image:", error);
    throw error;
  }
}
