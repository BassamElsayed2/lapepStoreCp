// Vouchers API Service - Uses Backend API with fetch (no axios)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to make API calls with fetch
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
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

export interface Voucher {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  user_id: string;
  phone_number: string;
  is_active: boolean;
  is_used: boolean;
  used_at: string | null;
  used_order_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export interface UserByPhone {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

export interface CreateVoucherData {
  phone_number: string;
  code?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  expires_at?: string;
}

export interface VouchersResponse {
  vouchers: Voucher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all vouchers with pagination and filters (Admin only)
 */
export async function getVouchers(
  page = 1,
  limit = 10,
  filters?: {
    search?: string;
    is_active?: boolean;
    is_used?: boolean;
  }
): Promise<VouchersResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.is_active !== undefined && {
        is_active: filters.is_active.toString(),
      }),
      ...(filters?.is_used !== undefined && {
        is_used: filters.is_used.toString(),
      }),
    });

    const response = await apiFetch<{
      success: boolean;
      data: VouchersResponse;
    }>(`/vouchers/admin?${params.toString()}`);

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching vouchers:", error);
    const errorMessage = error instanceof Error ? error.message : "";
    throw new Error(errorMessage || "Failed to fetch vouchers");
  }
}

/**
 * Get voucher by ID
 */
export async function getVoucherById(id: string): Promise<Voucher> {
  try {
    const response = await apiFetch<{ success: boolean; data: Voucher }>(
      `/vouchers/admin/${id}`
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch voucher";
    throw new Error(errorMessage);
  }
}

/**
 * Find user by phone number
 */
export async function findUserByPhone(phone: string): Promise<UserByPhone | null> {
  try {
    const response = await apiFetch<{ success: boolean; data: UserByPhone }>(
      `/vouchers/admin/user-by-phone/${encodeURIComponent(phone)}`
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      return null;
    }
    throw new Error(errorMessage || "Failed to find user");
  }
}

/**
 * Create a new voucher
 */
export async function createVoucher(data: CreateVoucherData): Promise<Voucher> {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
      data: Voucher;
    }>("/vouchers/admin", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create voucher";
    throw new Error(errorMessage);
  }
}

/**
 * Activate a voucher
 */
export async function activateVoucher(id: string): Promise<Voucher> {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
      data: Voucher;
    }>(`/vouchers/admin/${id}/activate`, {
      method: "PUT",
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to activate voucher";
    throw new Error(errorMessage);
  }
}

/**
 * Deactivate a voucher
 */
export async function deactivateVoucher(id: string): Promise<Voucher> {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
      data: Voucher;
    }>(`/vouchers/admin/${id}/deactivate`, {
      method: "PUT",
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to deactivate voucher";
    throw new Error(errorMessage);
  }
}

/**
 * Delete a voucher
 */
export async function deleteVoucher(id: string): Promise<void> {
  try {
    await apiFetch(`/vouchers/admin/${id}`, {
      method: "DELETE",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete voucher";
    throw new Error(errorMessage);
  }
}

export interface CreateBulkVouchersData {
  discount_type: "percentage" | "fixed";
  discount_value: number;
  expires_at?: string;
  code_prefix?: string;
}

export interface BulkVouchersResult {
  created: number;
  failed: number;
  total_users: number;
}

/**
 * Create vouchers for all users (bulk)
 */
export async function createBulkVouchers(
  data: CreateBulkVouchersData
): Promise<BulkVouchersResult> {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
      data: BulkVouchersResult;
    }>("/vouchers/admin/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create bulk vouchers";
    throw new Error(errorMessage);
  }
}

export interface VoucherStats {
  total: number;
  active: number;
  used: number;
  inactive: number;
}

/**
 * Get voucher statistics
 */
export async function getVoucherStats(): Promise<VoucherStats> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: VoucherStats;
    }>("/vouchers/admin/stats");
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get voucher stats";
    throw new Error(errorMessage);
  }
}

/**
 * Deactivate all vouchers
 */
export async function deactivateAllVouchers(): Promise<{ deactivated: number }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
      data: { deactivated: number };
    }>("/vouchers/admin/deactivate-all", {
      method: "PUT",
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to deactivate vouchers";
    throw new Error(errorMessage);
  }
}

/**
 * Delete all unused vouchers
 */
export async function deleteAllUnusedVouchers(): Promise<{ deleted: number }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
      data: { deleted: number };
    }>("/vouchers/admin/delete-unused", {
      method: "DELETE",
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete unused vouchers";
    throw new Error(errorMessage);
  }
}

/**
 * Delete all vouchers
 */
export async function deleteAllVouchers(): Promise<{ deleted: number }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
      data: { deleted: number };
    }>("/vouchers/admin/delete-all", {
      method: "DELETE",
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete all vouchers";
    throw new Error(errorMessage);
  }
}

/**
 * Generate a random voucher code
 */
export function generateVoucherCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "LAPIP-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Format discount display text
 */
export function formatDiscountText(voucher: Voucher): string {
  if (voucher.discount_type === "percentage") {
    return `${voucher.discount_value}% خصم`;
  }
  return `${voucher.discount_value} جنيه خصم`;
}

