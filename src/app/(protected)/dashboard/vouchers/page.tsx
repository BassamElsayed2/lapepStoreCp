"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVouchers,
  findUserByPhone,
  createVoucher,
  createBulkVouchers,
  activateVoucher,
  deactivateVoucher,
  deleteVoucher,
  deactivateAllVouchers,
  deleteAllUnusedVouchers,
  deleteAllVouchers,
  getVoucherStats,
  generateVoucherCode,
  UserByPhone,
} from "../../../../../services/apiVouchers";
import toast from "react-hot-toast";

const VouchersPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "used">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Create voucher form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [foundUser, setFoundUser] = useState<UserByPhone | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);

  const [voucherCode, setVoucherCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Bulk voucher form state
  const [bulkDiscountType, setBulkDiscountType] = useState<
    "percentage" | "fixed"
  >("percentage");
  const [bulkDiscountValue, setBulkDiscountValue] = useState("");
  const [bulkExpiresAt, setBulkExpiresAt] = useState("");
  const [bulkCodePrefix, setBulkCodePrefix] = useState("");
  const [bulkCreating, setBulkCreating] = useState(false);

  // Bulk actions state
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "warning" | "danger";
    onConfirm: () => void;
  }>({
    show: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {},
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  // Fetch vouchers
  const { data, isPending } = useQuery({
    queryKey: ["vouchers", currentPage, debouncedSearchQuery, statusFilter],
    queryFn: () =>
      getVouchers(currentPage, pageSize, {
        search: debouncedSearchQuery || undefined,
        is_active:
          statusFilter === "active"
            ? true
            : statusFilter === "used"
            ? undefined
            : undefined,
        is_used: statusFilter === "used" ? true : undefined,
      }),
  });

  // Fetch voucher stats
  const { data: statsData } = useQuery({
    queryKey: ["voucherStats"],
    queryFn: getVoucherStats,
  });

  const vouchers = data?.vouchers || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const stats = statsData || { total: 0, active: 0, used: 0, inactive: 0 };

  // Create voucher mutation
  const createMutation = useMutation({
    mutationFn: createVoucher,
    onSuccess: () => {
      toast.success("تم إنشاء كود الخصم بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل إنشاء كود الخصم");
    },
  });

  // Activate voucher mutation
  const activateMutation = useMutation({
    mutationFn: activateVoucher,
    onSuccess: () => {
      toast.success("تم تفعيل كود الخصم!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل تفعيل كود الخصم");
    },
  });

  // Deactivate voucher mutation
  const deactivateMutation = useMutation({
    mutationFn: deactivateVoucher,
    onSuccess: () => {
      toast.success("تم إلغاء تفعيل كود الخصم!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل إلغاء تفعيل كود الخصم");
    },
  });

  // Delete voucher mutation
  const deleteMutation = useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => {
      toast.success("تم حذف كود الخصم!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل حذف كود الخصم");
    },
  });

  // Search for user by phone
  const handleUserSearch = async () => {
    if (!phoneSearch.trim()) {
      setUserSearchError("يرجى إدخال رقم الهاتف");
      return;
    }

    setSearchingUser(true);
    setUserSearchError(null);
    setFoundUser(null);

    try {
      const user = await findUserByPhone(phoneSearch.trim());
      if (user) {
        setFoundUser(user);
      } else {
        setUserSearchError("لم يتم العثور على مستخدم بهذا الرقم");
      }
    } catch (error: unknown) {
      setUserSearchError((error as Error).message || "حدث خطأ أثناء البحث");
    } finally {
      setSearchingUser(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setShowCreateForm(false);
    setShowBulkForm(false);
    setPhoneSearch("");
    setFoundUser(null);
    setUserSearchError(null);
    setVoucherCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setExpiresAt("");
    setBulkDiscountType("percentage");
    setBulkDiscountValue("");
    setBulkExpiresAt("");
    setBulkCodePrefix("");
  };

  // Handle bulk voucher creation
  const handleBulkCreate = async () => {
    if (!bulkDiscountValue || parseFloat(bulkDiscountValue) <= 0) {
      toast.error("يرجى إدخال قيمة خصم صحيحة");
      return;
    }

    if (
      bulkDiscountType === "percentage" &&
      parseFloat(bulkDiscountValue) > 100
    ) {
      toast.error("نسبة الخصم يجب أن تكون بين 1 و 100");
      return;
    }

    setBulkCreating(true);
    try {
      const result = await createBulkVouchers({
        discount_type: bulkDiscountType,
        discount_value: parseFloat(bulkDiscountValue),
        expires_at: bulkExpiresAt || undefined,
        code_prefix: bulkCodePrefix || undefined,
      });

      toast.success(
        `تم إنشاء ${result.created} كود خصم بنجاح! ${
          result.failed > 0 ? `(${result.failed} فشل)` : ""
        }`
      );
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["voucherStats"] });
      resetForm();
    } catch (error: unknown) {
      toast.error((error as Error).message || "فشل إنشاء أكواد الخصم");
    } finally {
      setBulkCreating(false);
    }
  };

  // Show confirmation modal helper
  const showConfirmation = (
    title: string,
    message: string,
    type: "warning" | "danger",
    onConfirm: () => void
  ) => {
    setConfirmModal({
      show: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, show: false }));
  };

  // Handle deactivate all vouchers
  const handleDeactivateAll = () => {
    showConfirmation(
      "إلغاء تفعيل جميع الأكواد",
      "هل أنت متأكد من إلغاء تفعيل جميع الأكواد النشطة؟",
      "warning",
      async () => {
        closeConfirmModal();
        setBulkActionLoading(true);
        try {
          const result = await deactivateAllVouchers();
          toast.success(`تم إلغاء تفعيل ${result.deactivated} كود خصم`);
          queryClient.invalidateQueries({ queryKey: ["vouchers"] });
          queryClient.invalidateQueries({ queryKey: ["voucherStats"] });
          setShowBulkActions(false);
        } catch (error: unknown) {
          toast.error((error as Error).message || "فشل إلغاء تفعيل الأكواد");
        } finally {
          setBulkActionLoading(false);
        }
      }
    );
  };

  // Handle delete all unused vouchers
  const handleDeleteUnused = () => {
    showConfirmation(
      "حذف الأكواد غير المستخدمة",
      "سيتم حذف جميع الأكواد النشطة وغير النشطة التي لم يتم استخدامها. هذا الإجراء لا يمكن التراجع عنه!",
      "danger",
      async () => {
        closeConfirmModal();
        setBulkActionLoading(true);
        try {
          const result = await deleteAllUnusedVouchers();
          toast.success(`تم حذف ${result.deleted} كود خصم غير مستخدم`);
          queryClient.invalidateQueries({ queryKey: ["vouchers"] });
          queryClient.invalidateQueries({ queryKey: ["voucherStats"] });
          setShowBulkActions(false);
        } catch (error: unknown) {
          toast.error((error as Error).message || "فشل حذف الأكواد");
        } finally {
          setBulkActionLoading(false);
        }
      }
    );
  };

  // Handle delete all vouchers
  const handleDeleteAll = () => {
    showConfirmation(
      "⚠️ حذف جميع الأكواد",
      "سيتم حذف جميع الأكواد بما فيها المستخدمة. هذا الإجراء خطير ولا يمكن التراجع عنه!",
      "danger",
      async () => {
        closeConfirmModal();
        setBulkActionLoading(true);
        try {
          const result = await deleteAllVouchers();
          toast.success(`تم حذف ${result.deleted} كود خصم`);
          queryClient.invalidateQueries({ queryKey: ["vouchers"] });
          queryClient.invalidateQueries({ queryKey: ["voucherStats"] });
          setShowBulkActions(false);
        } catch (error: unknown) {
          toast.error((error as Error).message || "فشل حذف الأكواد");
        } finally {
          setBulkActionLoading(false);
        }
      }
    );
  };

  // Handle delete single voucher
  const handleDeleteVoucher = (voucherId: string, voucherCode: string) => {
    showConfirmation(
      "حذف كود الخصم",
      `هل أنت متأكد من حذف الكود "${voucherCode}"؟`,
      "danger",
      () => {
        closeConfirmModal();
        deleteMutation.mutate(voucherId);
      }
    );
  };

  // Handle create voucher
  const handleCreateVoucher = () => {
    if (!foundUser) {
      toast.error("يرجى البحث عن مستخدم أولاً");
      return;
    }

    if (!discountValue || parseFloat(discountValue) <= 0) {
      toast.error("يرجى إدخال قيمة خصم صحيحة");
      return;
    }

    if (discountType === "percentage" && parseFloat(discountValue) > 100) {
      toast.error("نسبة الخصم يجب أن تكون بين 1 و 100");
      return;
    }

    createMutation.mutate({
      phone_number: foundUser.phone,
      code: voucherCode || undefined,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      expires_at: expiresAt || undefined,
    });
  };

  // Generate random code
  const handleGenerateCode = () => {
    setVoucherCode(generateVoucherCode());
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A4CFF]"></div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">إدارة كوبونات الخصم</h5>
        <ol className="breadcrumb mt-[12px] md:mt-0 rtl:flex-row-reverse">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px]">
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
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px]">
            كوبونات الخصم
          </li>
        </ol>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-[25px]">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                إجمالي الأكواد
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
              <i className="material-symbols-outlined text-purple-600 !text-2xl">
                confirmation_number
              </i>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">نشطة</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <i className="material-symbols-outlined text-green-600 !text-2xl">
                check_circle
              </i>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                مستخدمة
              </p>
              <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <i className="material-symbols-outlined text-blue-600 !text-2xl">
                shopping_cart
              </i>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1C1E] rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                غير نشطة
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.inactive}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900/30 p-3 rounded-full">
              <i className="material-symbols-outlined text-gray-600 !text-2xl">
                pause_circle
              </i>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h6 className="text-lg font-semibold text-gray-900 dark:text-white">
              إجراءات جماعية
            </h6>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              إدارة جميع أكواد الخصم دفعة واحدة
            </p>
          </div>
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className="px-4 py-2 rounded-md text-white bg-gray-500 hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <i className="material-symbols-outlined !text-lg">
              {showBulkActions ? "expand_less" : "expand_more"}
            </i>
            {showBulkActions ? "إخفاء" : "عرض الإجراءات"}
          </button>
        </div>

        {showBulkActions && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Deactivate All */}
              <button
                onClick={handleDeactivateAll}
                disabled={bulkActionLoading || stats.active === 0}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bulkActionLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <i className="material-symbols-outlined !text-xl">
                    pause_circle
                  </i>
                )}
                <span>إلغاء تفعيل الكل ({stats.active})</span>
              </button>

              {/* Delete Unused */}
              <button
                onClick={handleDeleteUnused}
                disabled={
                  bulkActionLoading || stats.active + stats.inactive === 0
                }
                className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bulkActionLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <i className="material-symbols-outlined !text-xl">
                    delete_sweep
                  </i>
                )}
                <span>حذف غير المستخدمة ({stats.active + stats.inactive})</span>
              </button>

              {/* Delete All */}
              <button
                onClick={handleDeleteAll}
                disabled={bulkActionLoading || stats.total === 0}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bulkActionLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <i className="material-symbols-outlined !text-xl">
                    delete_forever
                  </i>
                )}
                <span>حذف الكل ({stats.total})</span>
              </button>
            </div>

            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <i className="material-symbols-outlined !text-lg">warning</i>
                تحذير: عمليات الحذف لا يمكن التراجع عنها. تأكد من حفظ نسخة
                احتياطية إذا لزم الأمر.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Voucher Section */}
      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] flex items-center justify-between flex-wrap gap-3">
          <h6 className="text-lg font-semibold text-gray-900 dark:text-white">
            {showCreateForm
              ? "إنشاء كود خصم جديد"
              : showBulkForm
              ? "إنشاء كود لجميع المستخدمين"
              : "إنشاء كود خصم للتقييم"}
          </h6>
          <div className="flex gap-2">
            {!showCreateForm && !showBulkForm && (
              <>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 rounded-md text-white bg-[#6A4CFF] hover:bg-[#5a3ce6] transition-colors"
                >
                  إنشاء كود لمستخدم
                </button>
                <button
                  onClick={() => setShowBulkForm(true)}
                  className="px-4 py-2 rounded-md text-white bg-green-500 hover:bg-green-600 transition-colors"
                >
                  إنشاء كود للجميع
                </button>
              </>
            )}
            {(showCreateForm || showBulkForm) && (
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-md text-white bg-gray-500 hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white dark:bg-[#0E1625] rounded-lg p-6 space-y-6">
            {/* Note about single use */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <i className="material-symbols-outlined !text-lg">info</i>
                ملاحظة: كل كود خصم يُستخدم مرة واحدة فقط
              </p>
            </div>

            {/* Step 1: Search User */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                الخطوة 1: البحث عن المستخدم برقم الهاتف
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  placeholder="أدخل رقم الهاتف..."
                  className="flex-1 h-[50px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF]"
                />
                <button
                  onClick={handleUserSearch}
                  disabled={searchingUser}
                  className="px-6 h-[50px] bg-[#6A4CFF] text-white rounded-md hover:bg-[#5a3ce6] disabled:opacity-50"
                >
                  {searchingUser ? "جاري البحث..." : "بحث"}
                </button>
              </div>
              {userSearchError && (
                <p className="text-red-500 text-sm mt-2">{userSearchError}</p>
              )}
            </div>

            {/* Found User Info */}
            {foundUser && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                  ✓ تم العثور على المستخدم
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      الاسم:
                    </span>
                    <span className="mr-2 text-gray-900 dark:text-white">
                      {foundUser.full_name || "غير محدد"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      الهاتف:
                    </span>
                    <span className="mr-2 text-gray-900 dark:text-white">
                      {foundUser.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      الإيميل:
                    </span>
                    <span className="mr-2 text-gray-900 dark:text-white">
                      {foundUser.email || "غير محدد"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      تاريخ التسجيل:
                    </span>
                    <span className="mr-2 text-gray-900 dark:text-white">
                      {new Date(foundUser.created_at).toLocaleDateString(
                        "ar-EG"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Voucher Details */}
            {foundUser && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  الخطوة 2: تفاصيل كود الخصم
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Voucher Code */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      كود الخصم (اختياري)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) =>
                          setVoucherCode(e.target.value.toUpperCase())
                        }
                        placeholder="اتركه فارغاً للإنشاء التلقائي"
                        className="flex-1 h-[45px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF] font-mono"
                      />
                      <button
                        onClick={handleGenerateCode}
                        className="px-3 h-[45px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        title="إنشاء كود عشوائي"
                      >
                        <i className="material-symbols-outlined">autorenew</i>
                      </button>
                    </div>
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      نوع الخصم
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) =>
                        setDiscountType(
                          e.target.value as "percentage" | "fixed"
                        )
                      }
                      className="w-full h-[45px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF]"
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (جنيه)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      قيمة الخصم{" "}
                      {discountType === "percentage" ? "(%)" : "(جنيه)"}
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={
                        discountType === "percentage" ? "مثال: 10" : "مثال: 50"
                      }
                      min="1"
                      max={discountType === "percentage" ? "100" : undefined}
                      className="w-full h-[45px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF]"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      تاريخ الانتهاء (اختياري)
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-[45px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF]"
                    />
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateVoucher}
                  disabled={createMutation.isPending}
                  className="mt-6 w-full md:w-auto px-8 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 font-medium"
                >
                  {createMutation.isPending
                    ? "جاري الإنشاء..."
                    : "إنشاء وتفعيل كود الخصم"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bulk Voucher Creation Form */}
        {showBulkForm && (
          <div className="bg-white dark:bg-[#0E1625] rounded-lg p-6 space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <i className="material-symbols-outlined text-yellow-600 !text-xl mt-0.5">
                  info
                </i>
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                    تنبيه: إنشاء كود لجميع المستخدمين
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    سيتم إنشاء كود خصم منفصل لكل مستخدم مسجل في النظام. كل كود
                    يُستخدم مرة واحدة فقط.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code Prefix */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  بادئة الكود (اختياري)
                </label>
                <input
                  type="text"
                  value={bulkCodePrefix}
                  onChange={(e) =>
                    setBulkCodePrefix(e.target.value.toUpperCase())
                  }
                  placeholder="مثال: EID2024"
                  className="w-full h-[45px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF] font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الكود سيكون: بادئة-كود_عشوائي (مثال: EID2024-ABC123)
                </p>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  نوع الخصم
                </label>
                <select
                  value={bulkDiscountType}
                  onChange={(e) =>
                    setBulkDiscountType(
                      e.target.value as "percentage" | "fixed"
                    )
                  }
                  className="w-full h-[45px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF]"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (جنيه)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  قيمة الخصم{" "}
                  {bulkDiscountType === "percentage" ? "(%)" : "(جنيه)"}
                </label>
                <input
                  type="number"
                  value={bulkDiscountValue}
                  onChange={(e) => setBulkDiscountValue(e.target.value)}
                  placeholder={
                    bulkDiscountType === "percentage" ? "مثال: 10" : "مثال: 50"
                  }
                  min="1"
                  max={bulkDiscountType === "percentage" ? "100" : undefined}
                  className="w-full h-[45px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF]"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  تاريخ الانتهاء (اختياري)
                </label>
                <input
                  type="date"
                  value={bulkExpiresAt}
                  onChange={(e) => setBulkExpiresAt(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-[45px] rounded-md text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 outline-0 focus:border-[#6A4CFF]"
                />
              </div>
            </div>

            {/* Create Bulk Button */}
            <button
              onClick={handleBulkCreate}
              disabled={bulkCreating}
              className="mt-6 w-full md:w-auto px-8 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {bulkCreating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <i className="material-symbols-outlined !text-xl">
                    group_add
                  </i>
                  إنشاء كود لجميع المستخدمين
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Vouchers List */}
      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] flex items-center justify-between flex-wrap gap-3">
          <div>
            <h6 className="text-lg font-semibold text-gray-900 dark:text-white">
              قائمة كوبونات الخصم
            </h6>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              كل كود يُستخدم مرة واحدة فقط لكل مستخدم
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالكود أو رقم الهاتف أو اسم المستخدم..."
              className="h-[50px] w-full rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 pr-12 outline-0 focus:ring-2 focus:ring-[#6A4CFF]/20"
            />
            <i className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </i>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "used")
            }
            className="h-[50px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 outline-0 focus:ring-2 focus:ring-[#6A4CFF]/20"
          >
            <option value="all">جميع الكوبونات</option>
            <option value="active">النشطة فقط</option>
            <option value="used">المستخدمة</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-black dark:text-white">
              <tr>
                {[
                  "الكود",
                  "المستخدم",
                  "نوع الخصم",
                  "القيمة",
                  "الحالة",
                  "تاريخ الإنشاء",
                  "الإجراءات",
                ].map((header) => (
                  <th
                    key={header}
                    className="font-medium text-right px-4 py-3 bg-[#6A4CFF] dark:bg-[#21123da7] text-white whitespace-nowrap first:rounded-tr-md last:rounded-tl-md"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-black dark:text-white">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    لا توجد كوبونات
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-purple-100 dark:hover:bg-[#21123da7] transition-colors"
                  >
                    {/* Code */}
                    <td className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="font-mono font-bold text-[#6A4CFF]">
                        {voucher.code}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="font-medium">
                          {voucher.user_name || "غير محدد"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {voucher.phone_number}
                        </p>
                      </div>
                    </td>

                    {/* Discount Type */}
                    <td className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                      {voucher.discount_type === "percentage"
                        ? "نسبة مئوية"
                        : "مبلغ ثابت"}
                    </td>

                    {/* Value */}
                    <td className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="font-bold">
                        {voucher.discount_value}
                        {voucher.discount_type === "percentage" ? "%" : " جنيه"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                      {voucher.is_used ? (
                        <div>
                          <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                            مستخدم ✓
                          </span>
                          {voucher.used_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(voucher.used_at).toLocaleDateString(
                                "ar-EG"
                              )}
                            </p>
                          )}
                        </div>
                      ) : voucher.is_active ? (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full text-sm">
                          نشط
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-sm">
                          غير نشط
                        </span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 text-sm">
                      {new Date(voucher.created_at).toLocaleDateString(
                        "ar-EG",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {!voucher.is_used && (
                          <>
                            {voucher.is_active ? (
                              <button
                                onClick={() =>
                                  deactivateMutation.mutate(voucher.id)
                                }
                                disabled={deactivateMutation.isPending}
                                className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-md transition-colors"
                                title="إلغاء التفعيل"
                              >
                                <i className="material-symbols-outlined !text-xl">
                                  pause_circle
                                </i>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  activateMutation.mutate(voucher.id)
                                }
                                disabled={activateMutation.isPending}
                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors"
                                title="تفعيل"
                              >
                                <i className="material-symbols-outlined !text-xl">
                                  play_circle
                                </i>
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteVoucher(voucher.id, voucher.code)
                          }
                          disabled={deleteMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="حذف"
                        >
                          <i className="material-symbols-outlined !text-xl">
                            delete
                          </i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              عرض {vouchers.length} من إجمالي {total} كوبون
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                السابق
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page
                        ? "bg-[#6A4CFF] text-white border-[#6A4CFF]"
                        : "border-gray-200 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeConfirmModal}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div
              className={`p-4 ${
                confirmModal.type === "danger" ? "bg-red-500" : "bg-yellow-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <i className="material-symbols-outlined text-white !text-2xl">
                    {confirmModal.type === "danger" ? "warning" : "help"}
                  </i>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {confirmModal.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeConfirmModal}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${
                  confirmModal.type === "danger"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VouchersPage;
