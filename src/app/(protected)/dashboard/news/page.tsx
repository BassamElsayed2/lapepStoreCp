"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import {
  deleteProduct,
  getProducts,
  type Product,
} from "../../../../../services/apiProducts";
import { getCategories, type Category } from "../../../../../services/apiCategories";
import toast from "react-hot-toast";
import { useProductFilters } from "../../../../hooks/useProductFilters";
import { DeleteConfirmModal } from "../../../../components/Product/DeleteConfirmModal";
import { ImagePlaceholder } from "../../../../components/Product/ImagePlaceholder";

const ProductListTable: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { localFilters, debouncedFilters, updateFilter } = useProductFilters();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const pageSize = 10;
  const currentPage = parseInt(debouncedFilters.page) || 1;

  const { isPending, data, isFetching } = useQuery({
    queryKey: [
      "products",
      currentPage,
      debouncedFilters.category,
      debouncedFilters.search,
      debouncedFilters.date,
      debouncedFilters.bestSeller,
      debouncedFilters.limitedTimeOffer,
    ],
    queryFn: () =>
      getProducts(currentPage, pageSize, {
        categoryId: debouncedFilters.category,
        search: debouncedFilters.search,
        date: debouncedFilters.date,
        isBestSeller:
          debouncedFilters.bestSeller === "true"
            ? true
            : debouncedFilters.bestSeller === "false"
            ? false
            : undefined,
        limitedTimeOffer:
          debouncedFilters.limitedTimeOffer === "true"
            ? true
            : debouncedFilters.limitedTimeOffer === "false"
            ? false
            : undefined,
      }),
    placeholderData: (previousData) => previousData, // keepPreviousData equivalent
  });

  const products: Product[] = data?.products || [];
  const total = data?.total || 0;

  // Memoized calculations
  const totalPages = useMemo(
    () => Math.ceil(total / pageSize),
    [total, pageSize]
  );

  const endIndex = useMemo(
    () => Math.min(currentPage * pageSize, total),
    [currentPage, pageSize, total]
  );

  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>(
    {}
  );

  const { data: categoriesData, isPending: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (categoriesData) {
      const map: Record<string, string> = {};
      categoriesData.forEach((cat: Category) => {
        map[cat.id.toString()] = cat.name_ar;
      });
      setCategoriesMap(map);
    }
  }, [categoriesData]);

  const queryClient = useQueryClient();

  const { mutate: deleteProductMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("تم حذف المنتج بنجاح");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.refetchQueries({ queryKey: ["products"] });
      setDeleteModalOpen(false);
      setProductToDelete(null);
    },
    onError: (err: Error) => {
      const errorMessage = err?.message || "حدث خطأ أثناء حذف المنتج";
      toast.error(errorMessage);
      console.error(err);
    },
  });

  const handleDeleteClick = (product: Product) => {
    setProductToDelete({
      id: product.id as string,
      name: product.name_ar || "غير معروف",
    });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation(productToDelete.id);
    }
  };

  // Helper function to get price display
  const getPriceDisplay = (product: Product) => {
    if (product.offer_price && product.offer_price < product.price) {
      return `${product.offer_price}$ (${product.price}$)`;
    }
    return `${product.price}$`;
  };

  // Loading state only for initial load
  if (isPending && !data)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A4CFF]"></div>
      </div>
    );

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0"> قائمة المنتجات</h5>

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
            المنتجات
          </li>
        </ol>
      </div>
      <div className="bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] sm:flex items-center justify-between">
          <div className="trezo-card-subtitle mt-[15px] sm:mt-0">
            <Link
              href="/dashboard/news/create-news/"
              className="inline-block transition-all rounded-md font-medium px-[13px] py-[6px] border-[#6A4CFF] text-[#6A4CFF] hover:bg-[#6A4CFF] hover:text-white border"
            >
              <span className="inline-block relative ltr:pl-[22px] rtl:pr-[22px]">
                <i className="material-symbols-outlined !text-[22px] absolute ltr:-left-[4px] rtl:-right-[4px] top-1/2 -translate-y-1/2">
                  add
                </i>
                أضف منتج جديد
              </span>
            </Link>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full p-2 pr-10 border transition border-purple-300 hover:bg-purple-90 rounded-lg outline-none dark:border-[#172036] dark:hover:bg-[#21123da7] dark:bg-gray-900 dark:text-white"
              aria-label="بحث عن منتج"
            />
            <i
              className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            >
              search
            </i>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={localFilters.date}
              onChange={(e) => updateFilter("date", e.target.value)}
              disabled={isFetching}
              className="w-full p-2 border transition border-[#6A4CFF] focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20 rounded-lg outline-none bg-white dark:bg-gray-900 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="تصفية حسب التاريخ"
            >
              <option value="" className="bg-white dark:bg-gray-900 text-black dark:text-white">كل التواريخ</option>
              <option value="today" className="bg-white dark:bg-gray-900 text-black dark:text-white">اليوم</option>
              <option value="week" className="bg-white dark:bg-gray-900 text-black dark:text-white">هذا الأسبوع</option>
              <option value="month" className="bg-white dark:bg-gray-900 text-black dark:text-white">هذا الشهر</option>
              <option value="year" className="bg-white dark:bg-gray-900 text-black dark:text-white">هذا العام</option>
            </select>
            {isFetching && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#6A4CFF]"></div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={localFilters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              disabled={isFetching || categoriesLoading}
              className="w-full p-2 border transition border-[#6A4CFF] focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20 rounded-lg outline-none bg-white dark:bg-gray-900 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="تصفية حسب التصنيف"
            >
              <option value="" className="bg-white dark:bg-gray-900 text-black dark:text-white">جميع التصنيفات</option>
              {Object.entries(categoriesMap).map(([id, name]) => (
                <option key={id} value={id} className="bg-white dark:bg-gray-900 text-black dark:text-white">
                  {name}
                </option>
              ))}
            </select>
            {(isFetching || categoriesLoading) && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#6A4CFF]"></div>
              </div>
            )}
          </div>

          {/* Best Seller Filter */}
          <div className="relative">
            <select
              value={localFilters.bestSeller}
              onChange={(e) => updateFilter("bestSeller", e.target.value)}
              disabled={isFetching}
              className="w-full p-2 border transition border-[#6A4CFF] focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20 rounded-lg outline-none bg-white dark:bg-gray-900 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="تصفية حسب أفضل مبيع"
            >
              <option value="" className="bg-white dark:bg-gray-900 text-black dark:text-white">جميع المنتجات</option>
              <option value="true" className="bg-white dark:bg-gray-900 text-black dark:text-white">أفضل مبيع</option>
              <option value="false" className="bg-white dark:bg-gray-900 text-black dark:text-white">غير أفضل مبيع</option>
            </select>
            {isFetching && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#6A4CFF]"></div>
              </div>
            )}
          </div>

          {/* Limited Time Offer Filter */}
          <div className="relative">
            <select
              value={localFilters.limitedTimeOffer}
              onChange={(e) => updateFilter("limitedTimeOffer", e.target.value)}
              disabled={isFetching}
              className="w-full p-2 border transition border-[#6A4CFF] focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20 rounded-lg outline-none bg-white dark:bg-gray-900 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="تصفية حسب العرض المحدود"
            >
              <option value="" className="bg-white dark:bg-gray-900 text-black dark:text-white">جميع المنتجات</option>
              <option value="true" className="bg-white dark:bg-gray-900 text-black dark:text-white">عرض محدود</option>
              <option value="false" className="bg-white dark:bg-gray-900 text-black dark:text-white">غير عرض محدود</option>
            </select>
            {isFetching && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#6A4CFF]"></div>
              </div>
            )}
          </div>
        </div>

        <div className="trezo-card-content relative">
          {isFetching && data && (
            <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 z-10 flex items-center justify-center rounded-md">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6A4CFF]"></div>
            </div>
          )}
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead className="text-black dark:text-white">
                <tr>
                  {[
                    "المنتج",
                    "تاريخ الانشاء",
                    "التصنيف",
                    "المخزون",
                    "السعر",
                    "أفضل مبيع",
                    "عرض محدود",
                    "الاجرائات",
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
                {products?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      لا توجد منتجات متاحة
                    </td>
                  </tr>
                ) : (
                  products?.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-purple-100 dark:hover:bg-[#21123da7] transition-colors cursor-pointer"
                      onClick={() => {
                        router.push(`/dashboard/news/${item.id}?${searchParams.toString()}`);
                      }}
                    >
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div className="flex items-center text-black dark:text-white transition-all hover:text-[#6A4CFF]">
                          <div className="relative w-[40px] h-[40px]">
                            {item?.image_url?.[0] ? (
                              <Image
                                className="rounded-md object-cover w-full h-full"
                                alt={`صورة ${item.name_ar || "المنتج"}`}
                                src={item.image_url[0]}
                                width={40}
                                height={40}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            ) : (
                              <ImagePlaceholder width={40} height={40} />
                            )}
                          </div>
                          <span className="block text-[15px] font-medium ltr:ml-[12px] rtl:mr-[12px]">
                            {item.name_ar && item.name_ar.length > 30
                              ? item.name_ar.slice(0, 30) + "..."
                              : item.name_ar || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "ar-EG",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "غير متاح"}
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        {categoriesMap[item.category_id?.toString() || ""] ||
                          "غير معروف"}
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {item.stock || item.quantity || 0} قطعة
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {getPriceDisplay(item)}
                        </span>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        {item.is_best_seller ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                            نعم
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                            لا
                          </span>
                        )}
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        {item.limited_time_offer ? (
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs">
                            نعم
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                            لا
                          </span>
                        )}
                      </td>

                      <td 
                        className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-[9px]">
                          <div className="relative group">
                            <Link
                              href={`/dashboard/news/${item.id}?${searchParams.toString()}`}
                              className="text-gray-500 leading-none hover:text-[#6A4CFF] transition-colors"
                              aria-label={`تعديل المنتج ${item.name_ar || ""}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <i
                                className="material-symbols-outlined !text-md"
                                aria-hidden="true"
                              >
                                edit
                              </i>
                            </Link>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              تعديل
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4326CC]"></div>
                            </div>
                          </div>

                          <div className="relative group">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(item);
                              }}
                              disabled={isDeleting}
                              className="text-danger-500 leading-none hover:text-danger-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={`حذف المنتج ${item.name_ar || ""}`}
                            >
                              <i
                                className="material-symbols-outlined !text-md"
                                aria-hidden="true"
                              >
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                عرض {endIndex} منتجات من اجمالي {total} منتج
              </p>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => updateFilter("page", (currentPage - 1).toString())}
                  disabled={currentPage === 1 || isFetching}
                  className="px-3 py-1 border border-gray-100 dark:border-[#172036] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625] transition-colors"
                  aria-label="الصفحة السابقة"
                >
                  السابق
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => updateFilter("page", (i + 1).toString())}
                    disabled={isFetching}
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
                  onClick={() => updateFilter("page", (currentPage + 1).toString())}
                  disabled={currentPage === totalPages || isFetching}
                  className="px-3 py-1 border border-gray-100 dark:border-[#172036] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#DFF3E3]
dark:hover:bg-[#0E1625] transition-colors"
                  aria-label="الصفحة التالية"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ProductListTable;
