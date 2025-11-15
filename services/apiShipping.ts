const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

export interface ShippingFee {
  id: number;
  governorate_name_ar: string;
  governorate_name_en: string;
  fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Governorate {
  ar: string;
  en: string;
}

/**
 * Get all shipping fees
 */
export async function getShippingFees(): Promise<ShippingFee[]> {
  try {
    const response = await apiFetch<{ success: boolean; data: ShippingFee[] }>(
      '/shipping/fees'
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ في جلب أسعار الشحن:', error);
    throw new Error('تعذر تحميل أسعار الشحن');
  }
}

/**
 * Get active shipping fees only
 */
export async function getActiveShippingFees(): Promise<ShippingFee[]> {
  try {
    const response = await apiFetch<{ success: boolean; data: ShippingFee[] }>(
      '/shipping/fees/active'
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ في جلب أسعار الشحن النشطة:', error);
    throw new Error('تعذر تحميل أسعار الشحن النشطة');
  }
}

/**
 * Get shipping fee by ID
 */
export async function getShippingFeeById(id: number): Promise<ShippingFee> {
  try {
    const response = await apiFetch<{ success: boolean; data: ShippingFee }>(
      `/shipping/fees/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ في جلب سعر الشحن:', error);
    throw new Error('تعذر تحميل سعر الشحن');
  }
}

/**
 * Create shipping fee
 */
export async function createShippingFee(data: {
  governorate_name_ar: string;
  governorate_name_en: string;
  fee: number;
  is_active?: boolean;
}): Promise<ShippingFee> {
  try {
    const response = await apiFetch<{ success: boolean; data: ShippingFee }>(
      '/shipping/fees',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ في إنشاء سعر الشحن:', error);
    throw new Error('تعذر إنشاء سعر الشحن');
  }
}

/**
 * Update shipping fee
 */
export async function updateShippingFee(
  id: number,
  data: {
    governorate_name_ar?: string;
    governorate_name_en?: string;
    fee?: number;
    is_active?: boolean;
  }
): Promise<ShippingFee> {
  try {
    const response = await apiFetch<{ success: boolean; data: ShippingFee }>(
      `/shipping/fees/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ في تحديث سعر الشحن:', error);
    throw new Error('تعذر تحديث سعر الشحن');
  }
}

/**
 * Delete shipping fee
 */
export async function deleteShippingFee(id: number): Promise<void> {
  try {
    await apiFetch(`/shipping/fees/${id}`, {
      method: 'DELETE',
    });
  } catch (error: any) {
    console.error('خطأ في حذف سعر الشحن:', error);
    throw new Error('تعذر حذف سعر الشحن');
  }
}

/**
 * Get Egyptian governorates list
 */
export async function getGovernorates(): Promise<Governorate[]> {
  try {
    const response = await apiFetch<{ success: boolean; data: Governorate[] }>(
      '/shipping/governorates'
    );
    return response.data;
  } catch (error: any) {
    console.error('خطأ في جلب المحافظات:', error);
    // Return static list as fallback
    return [
      { ar: "القاهرة", en: "Cairo" },
      { ar: "الجيزة", en: "Giza" },
      { ar: "الإسكندرية", en: "Alexandria" },
      { ar: "الدقهلية", en: "Dakahlia" },
      { ar: "البحيرة", en: "Beheira" },
      { ar: "المنيا", en: "Minya" },
      { ar: "القليوبية", en: "Qalyubia" },
      { ar: "سوهاج", en: "Sohag" },
      { ar: "أسيوط", en: "Asyut" },
      { ar: "الشرقية", en: "Sharqia" },
      { ar: "المنوفية", en: "Monufia" },
      { ar: "كفر الشيخ", en: "Kafr El Sheikh" },
      { ar: "الغربية", en: "Gharbia" },
      { ar: "بني سويف", en: "Beni Suef" },
      { ar: "قنا", en: "Qena" },
      { ar: "أسوان", en: "Aswan" },
      { ar: "الأقصر", en: "Luxor" },
      { ar: "البحر الأحمر", en: "Red Sea" },
      { ar: "الوادي الجديد", en: "New Valley" },
      { ar: "مطروح", en: "Matruh" },
      { ar: "شمال سيناء", en: "North Sinai" },
      { ar: "جنوب سيناء", en: "South Sinai" },
      { ar: "الإسماعيلية", en: "Ismailia" },
      { ar: "بورسعيد", en: "Port Said" },
      { ar: "السويس", en: "Suez" },
      { ar: "دمياط", en: "Damietta" },
      { ar: "الفيوم", en: "Faiyum" },
    ];
  }
}

