// Users API Service - Uses Backend API with fetch (no axios)
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

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string; // 'user' or 'admin'
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  // Profile fields
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

/**
 * Get all users with pagination and filters
 * Note: This requires a backend endpoint for admin to list all users
 */
export async function getUsers(
  page = 1,
  limit = 10,
  filters?: {
    search?: string;
    role?: string;
    is_active?: boolean;
    date?: string;
  }
): Promise<{ users: User[]; total: number }> {
  try {
    // TODO: Implement backend endpoint GET /api/admin/users
    // For now, return empty array
    console.warn(
      "getUsers: Backend endpoint /api/admin/users not implemented yet"
    );

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.is_active !== undefined && {
        is_active: filters.is_active.toString(),
      }),
      ...(filters?.date && { date: filters.date }),
    });

    const response = await apiFetch<{
      success: boolean;
      data: { users: User[]; total: number };
    }>(`/admin/users?${params.toString()}`);

    return {
      users: response.data.users || [],
      total: response.data.total || 0,
    };
  } catch (error: unknown) {
    console.error("Error fetching users:", error);

    // Return empty data for now if endpoint doesn't exist
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("404")) {
      return { users: [], total: 0 };
    }

    throw new Error(errorMessage || "Failed to fetch users");
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User> {
  try {
    // TODO: Implement backend endpoint GET /api/admin/users/:id
    const response = await apiFetch<{ success: boolean; data: User }>(
      `/admin/users/${id}`
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch user";
    throw new Error(errorMessage);
  }
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User> {
  try {
    // TODO: Implement backend endpoint PUT /api/admin/users/:id
    const response = await apiFetch<{ success: boolean; data: User }>(
      `/admin/users/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update user";
    throw new Error(errorMessage);
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    // TODO: Implement backend endpoint DELETE /api/admin/users/:id
    await apiFetch(`/admin/users/${id}`, {
      method: "DELETE",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete user";
    throw new Error(errorMessage);
  }
}

/**
 * Toggle user status (activate/deactivate)
 */
export async function toggleUserStatus(
  id: string,
  is_active: boolean
): Promise<User> {
  try {
    // TODO: Implement backend endpoint POST /api/admin/users/:id/toggle-status
    const response = await apiFetch<{ success: boolean; data: User }>(
      `/admin/users/${id}/toggle-status`,
      {
        method: "POST",
        body: JSON.stringify({ is_active }),
      }
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to toggle user status";
    throw new Error(errorMessage);
  }
}

/**
 * Update user role (customer/admin)
 */
export async function updateUserRole(
  id: string,
  role: "user" | "admin"
): Promise<User> {
  try {
    // TODO: Implement backend endpoint POST /api/admin/users/:id/role
    const response = await apiFetch<{ success: boolean; data: User }>(
      `/admin/users/${id}/role`,
      {
        method: "POST",
        body: JSON.stringify({ role }),
      }
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update user role";
    throw new Error(errorMessage);
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  admins: number;
  users: number;
}> {
  try {
    // TODO: Implement backend endpoint GET /api/admin/users/stats
    const response = await apiFetch<{
      success: boolean;
      data: {
        total: number;
        active: number;
        inactive: number;
        admins: number;
        users: number;
      };
    }>("/admin/users/stats");
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching user stats:", error);

    // Return default stats if endpoint doesn't exist
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("404")) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
        users: 0,
      };
    }

    throw new Error(errorMessage || "Failed to fetch user stats");
  }
}

/**
 * Create new admin user (from dashboard)
 */
export async function createAdminUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<User> {
  try {
    // TODO: Implement backend endpoint POST /api/admin/users/create-admin
    const response = await apiFetch<{ success: boolean; data: User }>(
      "/admin/users/create-admin",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create admin user";
    throw new Error(errorMessage);
  }
}

/**
 * Reset user password (admin action)
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  try {
    // TODO: Implement backend endpoint POST /api/admin/users/:id/reset-password
    await apiFetch(`/admin/users/${userId}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to reset password";
    throw new Error(errorMessage);
  }
}

// Legacy function - no longer needed
export async function checkProfilesTableStructure() {
  console.warn(
    "checkProfilesTableStructure: This function is deprecated. Backend API is used now."
  );
  return null;
}
