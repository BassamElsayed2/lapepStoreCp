// Dashboard Auth Service - Uses Backend API with fetch (no axios)
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

  // Check if API_URL is configured
  if (!API_URL) {
    throw new Error("عنوان API غير موجود. يرجى التحقق من ملف .env");
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...config,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (networkError) {
    clearTimeout(timeoutId);
    
    // Handle different types of network errors
    if (networkError instanceof Error) {
      if (networkError.name === 'AbortError') {
        throw new Error(
          "انتهت مهلة الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى"
        );
      }
      
      // Check for CORS errors
      if (networkError.message.includes('CORS') || networkError.message.includes('Failed to fetch')) {
        throw new Error(
          `فشل الاتصال بالخادم. قد تكون هناك مشكلة في إعدادات CORS أو الخادم غير متاح على ${API_URL}`
        );
      }
      
      // Check for SSL/HTTPS errors
      if (networkError.message.includes('certificate') || networkError.message.includes('SSL')) {
        throw new Error(
          "فشل الاتصال بسبب مشكلة في شهادة SSL. يرجى التحقق من إعدادات الخادم"
        );
      }
    }
    
    throw new Error(
      `فشل الاتصال بالخادم. يرجى التأكد من أن الخادم يعمل على ${API_URL}. الخطأ: ${networkError instanceof Error ? networkError.message : 'خطأ غير معروف'}`
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = errorData.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      } else if (response.status === 404) {
        errorMessage = errorData.message || "المسار المطلوب غير موجود";
      } else if (response.status === 429) {
        // Too Many Requests - provide user-friendly message
        errorMessage = errorData.message || "تم إرسال طلبات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مرة أخرى";
      } else if (response.status === 500) {
        errorMessage = errorData.message || "حدث خطأ في الخادم";
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
      
      if (response.status === 401) {
        errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      } else if (response.status === 429) {
        errorMessage = "تم إرسال طلبات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مرة أخرى";
      }
    }
    
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (jsonError) {
    throw new Error(
      "فشل في قراءة استجابة الخادم. قد تكون الاستجابة غير صحيحة"
    );
  }
}

// Define the admin user type
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  // Profile fields
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  image_url?: string;
  job_title?: string;
  address?: string;
  about?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: AdminUser;
    token: string;
  };
  message: string;
}

export interface ProfileData {
  full_name?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  job_title?: string;
  address?: string;
  about?: string;
}

/**
 * Login admin user
 * Only users with role='admin' can login to dashboard
 */
export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  // Validate input
  if (!email || !password) {
    throw new Error("يجب إدخال البريد الإلكتروني وكلمة المرور");
  }

  try {
    const response = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Validate response structure
    if (!response || !response.data || !response.data.user || !response.data.token) {
      throw new Error("استجابة غير صحيحة من الخادم");
    }

    // Check if user is admin
    if (response.data.user.role !== "admin") {
      throw new Error("هذا الحساب ليس لديه صلاحيات الدخول للداشبورد");
    }

    // Save token to localStorage
    localStorage.setItem("admin_token", response.data.token);
    localStorage.setItem("admin_user", JSON.stringify(response.data.user));

    return response;
  } catch (error: unknown) {
    // Re-throw error with its message (already formatted by apiFetch)
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("فشل تسجيل الدخول");
  }
}

/**
 * Get current admin user
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      return null;
    }

    const response = await apiFetch<{ success: boolean; data: AdminUser }>(
      "/auth/me"
    );

    // Verify user is admin
    if (response.data.role !== "admin") {
      // Clear localStorage and return null
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      return null;
    }

    // Update stored user
    localStorage.setItem("admin_user", JSON.stringify(response.data));

    return response.data;
  } catch (error) {
    console.error("Failed to get current user:", error);
    // Clear localStorage on error
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    return null;
  }
}

/**
 * Get admin profile
 */
export async function getAdminProfile(): Promise<AdminUser> {
  try {
    const response = await apiFetch<{ success: boolean; data: AdminUser }>(
      "/auth/me"
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "فشل جلب البيانات";
    throw new Error(errorMessage);
  }
}

/**
 * Update admin profile
 */
export async function updateAdminProfile(
  profileData: ProfileData
): Promise<AdminUser> {
  try {
    const response = await apiFetch<{ success: boolean; data: AdminUser }>(
      "/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify(profileData),
      }
    );
    return response.data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "فشل تحديث البيانات";
    throw new Error(errorMessage);
  }
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    await apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "فشل تغيير كلمة المرور";
    throw new Error(errorMessage);
  }
}

/**
 * Logout admin user
 */
export async function logout(): Promise<void> {
  try {
    // Clear localStorage
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");

    // Optional: call backend logout endpoint if exists
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout endpoint errors
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("admin_token");
  return !!token;
}

/**
 * Get stored admin user from localStorage
 */
export function getStoredUser(): AdminUser | null {
  const userStr = localStorage.getItem("admin_user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check backend connection
 */
export async function checkBackendConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const baseUrl = API_URL || "http://localhost:5000/api";
    const response = await fetch(`${baseUrl.replace("/api", "")}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        success: true,
        message: "Backend متصل بنجاح",
      };
    }

    return {
      success: false,
      message: "فشل الاتصال بـ Backend",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "فشل الاتصال بـ Backend";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Legacy functions for backward compatibility
export async function testSupabaseConnection() {
  // This function is no longer needed but kept for backward compatibility
  return {
    success: false,
    error: "Supabase is no longer used. Using Backend API instead.",
  };
}

export function checkEnvironmentVariables() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return {
    apiUrl: !!apiUrl,
    allSet: !!apiUrl,
  };
}
