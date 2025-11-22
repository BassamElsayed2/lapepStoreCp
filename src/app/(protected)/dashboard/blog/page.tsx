"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { deleteBlog, getBlog } from "../../../../../services/apiBlog";

const NewsListTable: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { isPending, data } = useQuery({
    queryKey: ["blog", currentPage, debouncedSearchQuery, dateFilter],
    queryFn: () =>
      getBlog(currentPage, pageSize, {
        search: debouncedSearchQuery,
        date: dateFilter,
      }),
  });

  const blogs = data?.blogs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      toast.success("تم حذف المقال بنجاح");
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
    onError: (err) => {
      toast.error("حدث خطأ أثناء حذف المقال");
      console.error(err);
    },
  });

  const endIndex = Math.min(currentPage * pageSize, total);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter]);

  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A4CFF]"></div>
      </div>
    );

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0"> قائمة المقالات</h5>

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
            الخدمات
          </li>
        </ol>
      </div>
      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] sm:flex items-center justify-between">
          <div className="trezo-card-subtitle mt-[15px] sm:mt-0">
            <Link
              href="/dashboard/blog/create-blog/"
              className="inline-block transition-all rounded-md font-medium px-[13px] py-[6px] text-[#6A4CFF] border border-[#6A4CFF] hover:bg-[#6A4CFF] hover:text-white"
            >
              <span className="inline-block relative ltr:pl-[22px] rtl:pr-[22px]">
                <i className="material-symbols-outlined !text-[22px] absolute ltr:-left-[4px] rtl:-right-[4px] top-1/2 -translate-y-1/2">
                  add
                </i>
                أضف مقال جديد
              </span>
            </Link>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مقال..."
              className="w-full p-2 pr-10 border transition border-purple-300 hover:bg-purple-90 rounded-lg outline-none dark:border-[#172036] dark:hover:bg-[#21123da7] dark:bg-gray-900 dark:text-white"
            />
            <i className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              search
            </i>
          </div>

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
                  {["المقال", "تاريخ الانشاء", "الاجرائات"].map((header) => (
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
                {blogs?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      لا توجد مقالات متاحة
                    </td>
                  </tr>
                ) : (
                  blogs?.map((item) => (
                    <tr 
                      key={item.id}
                      className="hover:bg-purple-100 dark:hover:bg-[#21123da7] transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/blog/${item.id}`)}
                    >
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div className="flex items-center text-black dark:text-white transition-all hover:text-[#6A4CFF]">
                          <div className="relative w-[40px] h-[40px]">
                            <Image
                              className="rounded-md"
                              alt="event-image"
                              src={
                                item?.images?.[0] ||
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23999'%3E؟%3C/text%3E%3C/svg%3E"
                              }
                              width={40}
                              height={40}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23999'%3E؟%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <span className="block text-[15px] font-medium ltr:ml-[12px] rtl:mr-[12px]">
                            {item.title_ar.length > 30
                              ? item.title_ar.slice(0, 30) + "..."
                              : item.title_ar}
                          </span>
                        </div>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        {new Date(item.created_at as string).toLocaleDateString(
                          "ar-EG",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </td>

                      <td 
                        className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-[9px]">
                          <div className="relative group">
                            <Link
                              href={`/dashboard/blog/${item.id}`}
                              className="text-gray-500 leading-none hover:text-[#6A4CFF] transition-colors"
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <i className="material-symbols-outlined !text-md">
                                edit
                              </i>
                            </Link>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              تعديل
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4326CC]"></div>
                            </div>
                          </div>

                          <div className="relative group">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                mutate(item.id as string);
                              }}
                              disabled={isPending}
                              className="text-danger-500 leading-none hover:text-danger-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <i className="material-symbols-outlined !text-md">
                                delete
                              </i>
                            </button>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              مسح
                              {/* Arrow */}
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
                عرض {endIndex} مقالات من اجمالي {total} مقال
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

export default NewsListTable;
