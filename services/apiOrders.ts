/**
 * Orders API Service - Uses Backend API
 * Supabase is NOT used here anymore
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to make API calls with fetch
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
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  full_name?: string;
  phone?: string;
  role: string;
}

export interface ProductInfo {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url?: string[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  products?: ProductInfo;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  payment_provider?: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id?: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
  // Guest customer fields
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_street_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_postcode?: string;
  order_notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  order_items?: OrderItem[];
  payments?: Payment[];
}

// Helper functions for customer data display
export function getCustomerName(order: Order): string {
  if (order.customer_first_name && order.customer_last_name) {
    return `${order.customer_first_name} ${order.customer_last_name}`;
  }
  if (order.customer_first_name || order.customer_last_name) {
    return order.customer_first_name || order.customer_last_name || '';
  }
  if (order.user?.full_name) {
    return order.user.full_name;
  }
  if (order.user?.name) {
    return order.user.name;
  }
  return 'غير محدد';
}

export function getCustomerPhone(order: Order): string | undefined {
  return order.customer_phone || order.user?.phone;
}

export function getCustomerEmail(order: Order): string | undefined {
  return order.customer_email || order.user?.email;
}

export function getCustomerCity(order: Order): string | undefined {
  return order.customer_city;
}

export function getCustomerAddress(order: Order): string {
  const components = [
    order.customer_street_address,
    order.customer_city,
    order.customer_state,
    order.customer_postcode,
  ].filter(Boolean);

  return components.join(', ') || 'غير محدد';
}

export function isGuestOrder(order: Order): boolean {
  return !order.user_id && !!(
    order.customer_first_name ||
    order.customer_last_name ||
    order.customer_phone
  );
}

export function getOrderCustomerType(order: Order): 'registered' | 'guest' | 'unknown' {
  if (order.user_id) {
    return 'registered';
  }
  if (
    order.customer_first_name ||
    order.customer_last_name ||
    order.customer_phone
  ) {
    return 'guest';
  }
  return 'unknown';
}

/**
 * Get all orders with pagination and filters
 */
export async function getOrders(
  page = 1,
  limit = 10,
  filters?: {
    status?: string;
    search?: string;
    date?: string;
  }
): Promise<{ orders: Order[]; total: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.date && { date: filters.date }),
    });

    const response = await apiFetch<{
      success: boolean;
      data: { orders: Order[]; total: number; page: number; limit: number; totalPages: number };
    }>(`/admin/orders?${params.toString()}`);

    return {
      orders: response.data.orders || [],
      total: response.data.total || 0,
    };
  } catch (error: any) {
    console.error('خطأ في جلب الطلبات:', error);
    // Return empty data instead of throwing to avoid breaking the UI
    return { orders: [], total: 0 };
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<Order> {
  try {
    const response = await apiFetch<{ success: boolean; data: Order }>(
      `/orders/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ في جلب الطلب:', error);
    throw new Error('تعذر تحميل الطلب');
  }
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<Order> {
  try {
    const response = await apiFetch<{ success: boolean; data: Order }>(
      `/orders/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ في تحديث حالة الطلب:', error);
    throw new Error('تعذر تحديث حالة الطلب');
  }
}

/**
 * Delete order (Admin only)
 */
export async function deleteOrder(id: string): Promise<void> {
  try {
    await apiFetch(`/orders/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    console.error('خطأ في حذف الطلب:', error);
    throw new Error('تعذر حذف الطلب');
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<{
  total: number;
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}> {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: {
        total: number;
        pending: number;
        paid: number;
        shipped: number;
        delivered: number;
        cancelled: number;
      };
    }>('/admin/orders/stats');
    return response.data;
  } catch (error: any) {
    console.error('خطأ في جلب إحصائيات الطلبات:', error);
    // Return default stats instead of throwing
    return {
      total: 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
  }
}

// Remove all Supabase-specific debug functions
// These are no longer needed with Backend API
