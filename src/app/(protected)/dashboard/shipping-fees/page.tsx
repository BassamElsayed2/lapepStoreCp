"use client";

import { useEffect, useState } from "react";
import {
  getShippingFees,
  createShippingFee,
  updateShippingFee,
  deleteShippingFee,
  getGovernorates,
  type ShippingFee,
  type Governorate,
} from "../../../../../services/apiShipping";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

type ShippingFeeFormData = {
  governorate_name_ar: string;
  governorate_name_en: string;
  fee: number;
  is_active: boolean;
};

const ShippingFeesPage: React.FC = () => {
  const [shippingFees, setShippingFees] = useState<ShippingFee[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<ShippingFee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ShippingFeeFormData>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feesData, govsData] = await Promise.all([
        getShippingFees(),
        getGovernorates(),
      ]);
      setShippingFees(feesData);
      setGovernorates(govsData);
    } catch (error: unknown) {
      toast.error((error as Error).message || "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingFee(null);
    reset({
      governorate_name_ar: "",
      governorate_name_en: "",
      fee: 0,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (fee: ShippingFee) => {
    setEditingFee(fee);
    reset({
      governorate_name_ar: fee.governorate_name_ar,
      governorate_name_en: fee.governorate_name_en,
      fee: fee.fee,
      is_active: fee.is_active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
    reset();
  };

  const onSubmit = async (data: ShippingFeeFormData) => {
    try {
      setLoading(true);
      if (editingFee) {
        await updateShippingFee(editingFee.id, data);
        toast.success("تم تحديث سعر الشحن بنجاح");
      } else {
        await createShippingFee(data);
        toast.success("تم إضافة سعر الشحن بنجاح");
      }
      await fetchData();
      closeModal();
    } catch (error: unknown) {
      toast.error((error as Error).message || "فشل حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف سعر الشحن هذا؟")) {
      return;
    }

    try {
      setLoading(true);
      await deleteShippingFee(id);
      toast.success("تم حذف سعر الشحن بنجاح");
      await fetchData();
    } catch (error: unknown) {
      toast.error((error as Error).message || "فشل حذف البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (fee: ShippingFee) => {
    try {
      setLoading(true);
      await updateShippingFee(fee.id, {
        is_active: !fee.is_active,
      });
      toast.success(
        fee.is_active
          ? "تم تعطيل سعر الشحن"
          : "تم تفعيل سعر الشحن"
      );
      await fetchData();
    } catch (error: unknown) {
      toast.error((error as Error).message || "فشل تحديث البيانات");
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = shippingFees.filter(
    (fee) =>
      fee.governorate_name_ar
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      fee.governorate_name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة أسعار الشحن</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + إضافة سعر شحن جديد
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ابحث عن محافظة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المحافظة (عربي)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المحافظة (إنجليزي)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سعر الشحن (ج.م)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && shippingFees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  جاري التحميل...
                </td>
              </tr>
            ) : filteredFees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              filteredFees.map((fee) => (
                <tr key={fee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {fee.governorate_name_ar}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.governorate_name_en}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fee.fee.toFixed(2)} ج.م
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(fee)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        fee.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {fee.is_active ? "نشط" : "معطل"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(fee)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(fee.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingFee ? "تعديل سعر الشحن" : "إضافة سعر شحن جديد"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المحافظة <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("governorate_name_ar", {
                    required: "يرجى اختيار المحافظة",
                    onChange: (e) => {
                      const selectedGov = governorates.find(
                        (gov) => gov.ar === e.target.value
                      );
                      if (selectedGov) {
                        setValue("governorate_name_ar", selectedGov.ar);
                        setValue("governorate_name_en", selectedGov.en);
                      }
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="" disabled>
                    {editingFee ? editingFee.governorate_name_ar : "اختر المحافظة"}
                  </option>
                  {/* Show current governorate if editing */}
                  {editingFee && (
                    <option value={editingFee.governorate_name_ar}>
                      {editingFee.governorate_name_ar} - {editingFee.governorate_name_en}
                    </option>
                  )}
                  {governorates
                    .filter(
                      (gov) =>
                        !shippingFees.some(
                          (fee) =>
                            fee.governorate_name_ar === gov.ar &&
                            fee.id !== editingFee?.id
                        )
                    )
                    .map((gov) => (
                      <option key={gov.ar} value={gov.ar}>
                        {gov.ar} - {gov.en}
                      </option>
                    ))}
                </select>
                {errors.governorate_name_ar && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.governorate_name_ar.message}
                  </p>
                )}
                {/* Hidden input for English name */}
                <input
                  type="hidden"
                  {...register("governorate_name_en", {
                    required: "المحافظة بالإنجليزي مطلوبة",
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  سعر الشحن (ج.م) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("fee", {
                    required: "سعر الشحن مطلوب",
                    min: { value: 0, message: "السعر يجب أن يكون أكبر من أو يساوي صفر" },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                />
                {errors.fee && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fee.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register("is_active")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="mr-2 text-sm text-gray-700">
                  نشط
                </label>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "جاري الحفظ..." : editingFee ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingFeesPage;

