"use client";

import Link from "next/link";
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
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">إدارة أسعار الشحن</h5>

        <ol className="breadcrumb mt-[12px] md:mt-0 rtl:flex-row-reverse">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-[#6A4CFF]"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-[#6A4CFF] top-1/2 -translate-y-1/2">
                home
              </i>
              رئيسية
            </Link>
          </li>
          <li className="breadcrumb-item inline-block  relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            أسعار الشحن
          </li>
        </ol>
      </div>

      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between flex-wrap gap-[15px]">
          <div className="trezo-card-title">
            <h5 className="!mb-0">قائمة أسعار الشحن</h5>
          </div>

          <button
            onClick={openCreateModal}
            className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-[#6A4CFF] text-white hover:bg-[#5a3ce6]"
          >
            <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
              <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                add
              </i>
              إضافة سعر شحن جديد
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-[20px] relative">
          <input
            type="text"
            placeholder="ابحث عن محافظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[55px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-[17px] ltr:pl-[45px] rtl:pr-[45px] block w-full max-w-md outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
          />
          <i className="material-symbols-outlined absolute ltr:left-[15px] rtl:right-[15px] top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            search
          </i>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#172036]">
            <thead className="bg-[#6A4CFF] dark:bg-[#21123da7]">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  المحافظة (عربي)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  المحافظة (إنجليزي)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  سعر الشحن (ج.م)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1d1d1d] divide-y divide-gray-200 dark:divide-[#172036]">
              {loading && shippingFees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-black dark:text-white">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-black dark:text-white">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="hover:bg-purple-100 dark:hover:bg-[#21123da7] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">
                      {fee.governorate_name_ar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {fee.governorate_name_en}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white font-medium">
                      {fee.fee.toFixed(2)} ج.م
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(fee);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          fee.is_active
                            ? "bg-[#DFF3E3] text-[#2A5B47] dark:bg-[#1a3d2e] dark:text-[#4ade80]"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {fee.is_active ? "نشط" : "معطل"}
                      </button>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-[9px]">
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(fee);
                            }}
                            className="text-gray-500 leading-none hover:text-[#6A4CFF] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                            type="button"
                            aria-label={`تعديل سعر الشحن: ${fee.governorate_name_ar}`}
                          >
                            <i
                              className="material-symbols-outlined !text-md"
                              aria-hidden="true"
                            >
                              edit
                            </i>
                          </button>

                          {/* Tooltip */}
                          <div
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                            role="tooltip"
                          >
                            تعديل
                            {/* Arrow */}
                            <div
                              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4326CC]"
                              aria-hidden="true"
                            ></div>
                          </div>
                        </div>

                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(fee.id);
                            }}
                            className="text-danger-500 leading-none hover:text-danger-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                            type="button"
                            aria-label={`حذف سعر الشحن: ${fee.governorate_name_ar}`}
                          >
                            <i
                              className="material-symbols-outlined !text-md"
                              aria-hidden="true"
                            >
                              delete
                            </i>
                          </button>

                          {/* Tooltip */}
                          <div
                            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                            role="tooltip"
                          >
                            مسح
                            {/* Arrow */}
                            <div
                              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4326CC]"
                              aria-hidden="true"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-10 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        >
          <div className="bg-white dark:bg-[#1d1d1d] rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
            <h2
                  id="edit-modal-title"
                  className="text-2xl font-bold text-black dark:text-white"
                >
              {editingFee ? "تعديل سعر الشحن" : "إضافة سعر شحن جديد"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-1">
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
                  className="w-full h-[55px] px-3 py-2 border border-[#6A4CFF] bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
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
                <label className="block text-sm font-medium text-black dark:text-white mb-1">
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
                  className="w-full h-[55px] px-3 py-2 border border-[#6A4CFF] bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
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
                  className="h-4 w-4 text-[#6A4CFF] focus:ring-[#6A4CFF] border-[#6A4CFF] rounded"
                />
                <label htmlFor="is_active" className="mr-2 text-sm text-black dark:text-white">
                  نشط
                </label>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#6A4CFF] text-white py-2 px-4 rounded-lg hover:bg-[#5a3ce6] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "جاري الحفظ..." : editingFee ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 dark:bg-[#21123da7] text-gray-700 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-[#1a2942] transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ShippingFeesPage;

