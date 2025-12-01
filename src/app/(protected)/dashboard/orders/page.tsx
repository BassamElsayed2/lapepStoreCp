"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  getCustomerName,
} from "../../../../../services/apiOrders";
import toast from "react-hot-toast";

const OrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Status filter (instead of tabs)
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { isPending, data } = useQuery({
    queryKey: [
      "orders",
      currentPage,
      statusFilter,
      debouncedSearchQuery,
      dateFilter,
    ],
    queryFn: () =>
      getOrders(currentPage, pageSize, {
        status: statusFilter,
        search: debouncedSearchQuery,
        date: dateFilter,
      }),
    refetchInterval: 60000, // Auto-refresh every 60 seconds (reduced from 10s to prevent rate limiting)
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  const { data: stats } = useQuery({
    queryKey: ["orderStats"],
    queryFn: getOrderStats,
    refetchInterval: 60000, // Auto-refresh every 60 seconds (reduced from 10s to prevent rate limiting)
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  const orders = useMemo(() => data?.orders || [], [data?.orders]);
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const queryClient = useQueryClient();

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(
        id,
        status as "pending" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled"
      ),
    onSuccess: (updatedOrder, variables) => {
      console.log("Order status updated successfully:", updatedOrder);
      toast.success("تم تحديث حالة الطلب بنجاح");

      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderStats"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });

      // Optionally update the cache directly for immediate feedback
      queryClient.setQueryData(["order", variables.id], updatedOrder);
    },
    onError: (err: Error) => {
      console.error("Order update error:", err);

      // Show specific error message based on the error
      if (err.message.includes("لم يتم العثور على الطلب")) {
        toast.error("الطلب غير موجود أو تم حذفه");
      } else if (err.message.includes("الطلب غير موجود")) {
        toast.error("الطلب المطلوب غير موجود");
      } else if (err.message.includes("لم يتم تحديث أي طلب")) {
        toast.error("فشل في تحديث الطلب، يرجى المحاولة مرة أخرى");
      } else {
        toast.error(`خطأ في تحديث الطلب: ${err.message}`);
      }
    },
  });

  const { mutate: deleteOrderMutation } = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success("تم حذف الطلب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderStats"] });
    },
    onError: (err) => {
      toast.error("حدث خطأ أثناء حذف الطلب");
      console.error(err);
    },
  });

  const endIndex = Math.min(currentPage * pageSize, total);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, dateFilter]);

  // Test search functionality
  useEffect(() => {
    if (debouncedSearchQuery) {
      console.log("Testing search with:", debouncedSearchQuery);
      console.log("Current orders:", orders);
    }
  }, [debouncedSearchQuery, orders]);

  // Helper function to get status display
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      pending: {
        text: "في الانتظار",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
      paid: {
        text: "مدفوع",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      confirmed: {
        text: "مدفوع",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      shipped: {
        text: "تم الشحن",
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      },
      delivered: {
        text: "تم التوصيل",
        color:
          "bg-[#DFF3E3] text-[#2A5B47] dark:bg-green-900 dark:text-green-200",
      },
      cancelled: {
        text: "ملغي",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        text: status,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Helper function to get payment method display

  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A4CFF]"></div>
      </div>
    );

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">إدارة الطلبات</h5>

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
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            الطلبات
          </li>
        </ol>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="trezo-card bg-[linear-gradient(90deg,rgba(158,130,255,0.25),rgba(67,38,204,0.3))] dark:bg-[#1C1C1E] p-4 rounded-md">
          <div className="flex items-center justify-between ">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي الطلبات
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total || 0}
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <i className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                shopping_cart
              </i>
            </div>
          </div>
        </div>

        <div className="trezo-card bg-[linear-gradient(90deg,rgba(158,130,255,0.25),rgba(67,38,204,0.3))] dark:bg-[#1C1C1E] p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مدفوع</p>
              <p className="text-2xl font-bold text-blue-600">
                {(stats?.paid || 0) + (stats?.confirmed || 0)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <i className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                payments
              </i>
            </div>
          </div>
        </div>

        <div className="trezo-card bg-[linear-gradient(90deg,rgba(158,130,255,0.25),rgba(67,38,204,0.3))] dark:bg-[#1C1C1E] p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تم الشحن
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.shipped || 0}
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <i className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                local_shipping
              </i>
            </div>
          </div>
        </div>

        <div className="trezo-card bg-[linear-gradient(90deg,rgba(158,130,255,0.25),rgba(67,38,204,0.3))] dark:bg-[#1C1C1E] p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تم التوصيل
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.delivered || 0}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <i className="material-symbols-outlined text-green-600 dark:text-green-400">
                check_circle
              </i>
            </div>
          </div>
        </div>
      </div>

      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-headerbg-[linear-gradient(90deg,rgba(158,130,255,0.25),rgba(67,38,204,0.3))] mb-[20px] md:mb-[25px]">
          <h6 className="text-lg font-semibold text-black dark:text-white">
            قائمة الطلبات
          </h6>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف..."
              className="w-full p-2 pr-10 border transition border-purple-300 hover:bg-purple-90 rounded-lg outline-none dark:border-[#172036] dark:hover:bg-[#21123da7] dark:bg-gray-900 dark:text-white"
            />
            <i className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              search
            </i>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <i className="material-symbols-outlined text-sm">close</i>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border transition border-[#6A4CFF] focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20 rounded-lg outline-none bg-white dark:bg-gray-900 text-black dark:text-white"
          >
            <option value="">جميع الطلبات</option>
            <option value="paid">مدفوع</option>
            <option value="confirmed">مدفوع</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التوصيل</option>
            <option value="cancelled">ملغي</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full p-2 border transition border-[#6A4CFF] focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20 rounded-lg outline-none bg-white dark:bg-gray-900 text-black dark:text-white"
          >
            <option value="">كل التواريخ</option>
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
          </select>
        </div>

        <div className="trezo-card-content">
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead className="text-black dark:text-white">
                <tr>
                  {[
                    "رقم الطلب",
                    "اسم العميل",
                    "المنتجات",
                    "الحالة",

                    "السعر الإجمالي",
                    "تاريخ الطلب",
                    "الإجراءات",
                  ].map((header) => (
                    <th
                      key={header}
                      className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-[#6A4CFF] text-white dark:bg-[#21123da7] dark:text-white whitespace-nowrap ltr:first:rounded-tl-md ltr:last:rounded-tr-md rtl:first:rounded-tr-md rtl:last:rounded-tl-md"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-black dark:text-white">
                {orders?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      لا توجد طلبات متاحة
                    </td>
                  </tr>
                ) : (
                  orders?.map((order) => (
                    <tr 
                      key={order.id}
                      className="hover:bg-purple-100 dark:hover:bg-[#21123da7] transition-colors"
                    >
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {order.id?.slice(0, 8)}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getCustomerName(order)}
                          </p>
                        </div>
                      </td>

                      <td className="ltr:text-left rtl:text-right px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div className="max-w-[200px]">
                          {order.order_items && order.order_items.length > 0 ? (
                            <div className="space-y-1">
                              {order.order_items
                                .slice(0, 2)
                                .map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center text-sm"
                                  >
                                    {item.products?.image_url &&
                                      item.products.image_url[0] && (
                                        <Image
                                          src={item.products.image_url[0]}
                                          alt={item.products?.name_ar || "منتج"}
                                          width={24}
                                          height={24}
                                          className="object-cover rounded mr-2"
                                        />
                                      )}
                                    <span className="font-medium text-gray-900 dark:text-white truncate">
                                      {item.products?.name_ar ||
                                        "منتج غير محدد"}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                      ×{item.quantity}
                                    </span>
                                  </div>
                                ))}
                              {order.order_items.length > 2 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  و {order.order_items.length - 2} منتج آخر...
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              لا توجد منتجات
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getStatusDisplay(order.status).color
                          }`}
                        >
                          {getStatusDisplay(order.status).text}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div className="flex flex-col items-end">
                          {order.voucher_code && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                              🎫 {order.voucher_code}
                            </span>
                          )}
                          {order.original_price && order.original_price !== order.total_price && (
                            <span className="text-xs text-gray-400 line-through mb-1">
                              {order.original_price.toFixed(2)} ج.م
                            </span>
                          )}
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {order.total_price.toFixed(2)} ج.م
                          </span>
                        </div>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        {new Date(
                          order.created_at as string
                        ).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div className="flex items-center gap-[9px]">
                          {/* Status Update Dropdown */}
                          <div className="relative group">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateStatus({
                                  id: order.id!,
                                  status: e.target.value,
                                })
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm border border-[#6A4CFF] rounded px-2 py-1 bg-white dark:bg-gray-900 text-black dark:text-white focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                            >
                              <option value="pending">في الانتظار</option>
                              <option value="paid">مدفوع</option>
                              <option value="confirmed">مدفوع</option>
                              <option value="shipped">تم الشحن</option>
                              <option value="delivered">تم التوصيل</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </div>

                          {/* View Details */}
                          <div className="relative group">
                            <Link
                              href={`/dashboard/orders/${order.id}`}
                              className="text-gray-500 leading-none hover:text-[#6A4CFF] transition-colors"
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <i className="material-symbols-outlined !text-md">
                                visibility
                              </i>
                            </Link>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              عرض التفاصيل
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4326CC]"></div>
                            </div>
                          </div>

                          {/* Delete */}
                          <div className="relative group">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast(
                                  (t) => (
                                    <span>
                                      هل أنت متأكد أنك تريد حذف هذا الطلب؟
                                      <div
                                        style={{
                                          marginTop: 8,
                                          display: "flex",
                                          gap: 8,
                                        }}
                                      >
                                        <button
                                          onClick={() => {
                                            deleteOrderMutation(order.id!);
                                            toast.dismiss(t.id);
                                          }}
                                          style={{
                                            background: "#ef4444",
                                            color: "white",
                                            border: "none",
                                            padding: "4px 12px",
                                            borderRadius: 4,
                                            marginRight: 8,
                                            cursor: "pointer",
                                          }}
                                        >
                                          نعم
                                        </button>
                                        <button
                                          onClick={() => toast.dismiss(t.id)}
                                          style={{
                                            background: "#e5e7eb",
                                            color: "#111827",
                                            border: "none",
                                            padding: "4px 12px",
                                            borderRadius: 4,
                                            cursor: "pointer",
                                          }}
                                        >
                                          إلغاء
                                        </button>
                                      </div>
                                    </span>
                                  ),
                                  { duration: 6000 }
                                );
                              }}
                              disabled={isPending}
                              className="text-danger-500 leading-none hover:text-danger-600 transition-colors"
                            >
                              <i className="material-symbols-outlined !text-md">
                                delete
                              </i>
                            </button>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              مسح
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4326CC]"></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                عرض {endIndex} طلبات من إجمالي {total} طلب
              </p>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-100 dark:border-[#172036] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625] transition-colors"
                  aria-label="الصفحة السابقة"
                >
                  السابق
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border border-gray-100 dark:border-[#172036] rounded transition-colors ${
                      currentPage === i + 1
                        ? "bg-[#6A4CFF] text-white border-[#6A4CFF]"
                        : "hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={`الصفحة ${i + 1}`}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-100 dark:border-[#172036] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625] transition-colors"
                  aria-label="الصفحة التالية"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
