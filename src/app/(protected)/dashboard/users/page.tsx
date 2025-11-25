"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../../../../services/apiUsers";

const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"admin" | "user">("admin");
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
    queryKey: [
      "users",
      currentPage,
      activeTab,
      debouncedSearchQuery,
      dateFilter,
    ],
    queryFn: () =>
      getUsers(currentPage, pageSize, {
        role: activeTab,
        search: debouncedSearchQuery,
        date: dateFilter,
      }),
  });

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const endIndex = Math.min(currentPage * pageSize, total);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, dateFilter]);

  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A4CFF]"></div>
      </div>
    );

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">إدارة المستخدمين</h5>

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
            المستخدمين
          </li>
        </ol>
      </div>

      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px]">
          <h6 className="text-lg font-semibold text-gray-900 dark:text-white">
            قائمة المستخدمين
          </h6>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("admin")}
              className={`pb-3 px-4 font-medium transition-all ${
                activeTab === "admin"
                  ? "border-b-2 border-[#6A4CFF] text-[#6A4CFF]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <i className="material-symbols-outlined !text-[20px]">
                  admin_panel_settings
                </i>
                مستخدمي الداشبورد
              </span>
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`pb-3 px-4 font-medium transition-all ${
                activeTab === "user"
                  ? "border-b-2 border-[#6A4CFF] text-[#6A4CFF]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <i className="material-symbols-outlined !text-[20px]">people</i>
                مستخدمي التطبيق
              </span>
            </button>
          </nav>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المستخدم، الإيميل، أو رقم الهاتف..."
              className="h-[55px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-[17px] ltr:pl-[45px] rtl:pr-[45px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
            />
            <i className="material-symbols-outlined absolute ltr:left-[15px] rtl:right-[15px] top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              search
            </i>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute ltr:right-[15px] rtl:left-[15px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <i className="material-symbols-outlined text-sm">close</i>
              </button>
            )}
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-[55px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-[17px] block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
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
                  {["الاسم", "الإيميل", "رقم الهاتف", "تاريخ التسجيل"].map(
                    (header) => (
                      <th
                        key={header}
                        className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-[#6A4CFF] dark:bg-[#21123da7] text-white whitespace-nowrap ltr:first:rounded-tl-md ltr:last:rounded-tr-md rtl:first:rounded-tr-md rtl:last:rounded-tl-md"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="text-black dark:text-white">
                {users?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-black dark:text-white"
                    >
                      {activeTab === "admin"
                        ? "لا يوجد مستخدمين للداشبورد"
                        : "لا يوجد مستخدمين للتطبيق"}
                    </td>
                  </tr>
                ) : (
                  users?.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-purple-100 dark:hover:bg-[#21123da7] transition-colors"
                    >
                      {/* Name */}
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <div className="flex items-center text-black dark:text-white">
                          <span className="block text-[15px] font-medium">
                            {user.full_name || user.name || "غير محدد"}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="ltr:text-left rtl:text-right px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {user.email || "غير محدد"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="text-gray-600 dark:text-gray-300">
                          {user.phone || "غير محدد"}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(
                            user.created_at as string
                          ).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                عرض {endIndex} مستخدمين من إجمالي {total} مستخدم
              </p>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-100 dark:border-[#172036] rounded text-black dark:text-white hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border border-gray-100 dark:border-[#172036] rounded text-black dark:text-white hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625] transition-colors ${
                      currentPage === i + 1
                        ? "bg-[#6A4CFF] text-white border-[#6A4CFF] hover:bg-[#5a3ce6]"
                        : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-100 dark:border-[#172036] rounded text-black dark:text-white hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default UsersPage;
