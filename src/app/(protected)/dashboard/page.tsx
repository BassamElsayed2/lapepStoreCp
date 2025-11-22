"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  getOrders,
  getOrderStats,
  Order,
  getCustomerName,
} from "../../../../services/apiOrders";
import { getProducts } from "../../../../services/apiProducts";
import { getUserStats } from "../../../../services/apiUsers";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Dynamically import react-apexcharts with Next.js dynamic import
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardStats {
  totalOrders: number;
  totalSales: number;
  totalProducts: number;
  totalUsers: number;
  totalAdmins: number;
  paidOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  todaySales: number;
  todayOrders: number;
  weekSales: number;
  monthSales: number;
}

interface ChartData {
  salesData: number[];
  ordersData: number[];
  labels: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalAdmins: 0,
    paidOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    todaySales: 0,
    todayOrders: 0,
    weekSales: 0,
    monthSales: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    salesData: [],
    ordersData: [],
    labels: [],
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side and DOM is ready
    if (typeof window !== "undefined") {
      // Use a small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        setChartLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [orderStats, orders, products, userStats] = await Promise.all([
          getOrderStats(),
          getOrders(1, 1000),
          getProducts(1, 1000),
          getUserStats(),
        ]);

        // Calculate date ranges
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        // Calculate sales and orders by time period
        const todayOrders = orders.orders.filter(
          (order: Order) => new Date(order.created_at as string) >= today
        );
        const weekOrders = orders.orders.filter(
          (order: Order) => new Date(order.created_at as string) >= weekAgo
        );
        const monthOrders = orders.orders.filter(
          (order: Order) => new Date(order.created_at as string) >= monthAgo
        );

        const todaySales = todayOrders.reduce(
          (sum: number, order: Order) => sum + order.total_price,
          0
        );
        const weekSales = weekOrders.reduce(
          (sum: number, order: Order) => sum + order.total_price,
          0
        );
        const monthSales = monthOrders.reduce(
          (sum: number, order: Order) => sum + order.total_price,
          0
        );

        // Calculate total sales from all orders
        const totalSales = orders.orders.reduce(
          (sum: number, order: Order) => sum + order.total_price,
          0
        );
        const averageOrderValue =
          orders.orders.length > 0 ? totalSales / orders.orders.length : 0;

        // Generate chart data for last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split("T")[0];
        }).reverse();

        const salesData = last7Days.map((date) => {
          const dayOrders = orders.orders.filter((order: Order) =>
            order.created_at?.startsWith(date)
          );
          return dayOrders.reduce(
            (sum: number, order: Order) => sum + order.total_price,
            0
          );
        });

        const ordersData = last7Days.map((date) => {
          return orders.orders.filter((order: Order) =>
            order.created_at?.startsWith(date)
          ).length;
        });

        const finalStats = {
          totalOrders: orderStats.total,
          totalSales,
          totalProducts: products.total,
          totalUsers: userStats.users,
          totalAdmins: userStats.admins,
          paidOrders: (orderStats.paid || 0) + (orderStats.confirmed || 0),
          shippedOrders: orderStats.shipped,
          deliveredOrders: orderStats.delivered,
          cancelledOrders: orderStats.cancelled,
          averageOrderValue,
          todaySales,
          todayOrders: todayOrders.length,
          weekSales,
          monthSales,
        };

        setStats(finalStats);

        setChartData({
          salesData,
          ordersData,
          labels: last7Days.map((date) =>
            new Date(date).toLocaleDateString("ar-EG", {
              month: "short",
              day: "numeric",
            })
          ),
        });

        setRecentOrders(orders.orders.slice(0, 10));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart options
  const salesChartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#5A3FFF"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: "#5A3FFF", opacity: 0.7 },
          { offset: 100, color: "#8A63FF", opacity: 0.2 },
        ],
      },
    },
    xaxis: {
      categories: chartData.labels || [],
      labels: {
        style: { 
          colors: typeof window !== "undefined" && document.documentElement.classList.contains("dark") 
            ? "#9CA3AF" 
            : "#6B6B6B", 
          fontFamily: "inherit" 
        },
      },
    },
    yaxis: {
      labels: {
        style: { 
          colors: typeof window !== "undefined" && document.documentElement.classList.contains("dark") 
            ? "#9CA3AF" 
            : "#6B6B6B", 
          fontFamily: "inherit" 
        },
        formatter: (value) => `$${value.toFixed(0)}`,
      },
    },
    tooltip: {
      theme: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
      y: { formatter: (value) => `$${value.toFixed(2)}` },
    },
    grid: { 
      borderColor: typeof window !== "undefined" && document.documentElement.classList.contains("dark") 
        ? "#374151" 
        : "#E8E8E8" 
    },
  };

  const ordersChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    colors: ["#5A3FFF"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "60%",
      },
    },
    xaxis: {
      categories: chartData.labels || [],
      labels: {
        style: { 
          colors: typeof window !== "undefined" && document.documentElement.classList.contains("dark") 
            ? "#9CA3AF" 
            : "#6B6B6B", 
          fontFamily: "inherit" 
        },
      },
    },
    yaxis: {
      labels: {
        style: { 
          colors: typeof window !== "undefined" && document.documentElement.classList.contains("dark") 
            ? "#9CA3AF" 
            : "#6B6B6B", 
          fontFamily: "inherit" 
        },
      },
    },
    tooltip: { 
      theme: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light" 
    },
    grid: { 
      borderColor: typeof window !== "undefined" && document.documentElement.classList.contains("dark") 
        ? "#374151" 
        : "#E8E8E8" 
    },
  };

  const statusPieChartOptions: ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: ["مدفوع", "تم الشحن", "تم التوصيل", "ملغي"],
    colors: ["#5A3FFF", "#8A63FF", "#7ED85F", "#EF4444"],
    legend: {
      position: "bottom",
      labels: {
        colors: typeof window !== "undefined" && document.documentElement.classList.contains("dark") 
          ? "#9CA3AF" 
          : "#6B6B6B",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
    },
    tooltip: {
      theme: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
    },
  };

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      pending: {
        text: "قيد الانتظار",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#5A3FFF] dark:border-[#8A63FF] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B] dark:text-gray-400 text-lg">
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-semibold text-[#1A1A1A] dark:text-white">
            لوحة التحكم
          </h1>
          <p className="text-[#6B6B6B] dark:text-gray-400 mt-1">
            مرحباً بك، إليك نظرة عامة على نشاطك
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B6B6B] dark:text-gray-400">
          <i className="material-symbols-outlined text-lg text-[#5A3FFF]">calendar_today</i>
          <span>
            {new Date().toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <i className="material-symbols-outlined text-xl">
                shopping_cart
              </i>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              إجمالي
            </span>
          </div>
          <h3 className="text-xs font-normal opacity-90">إجمالي الطلبات</h3>
          <p className="text-xl font-bold mt-2">{stats.totalOrders}</p>
          <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
            <span>اليوم: {stats.todayOrders}</span>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <i className="material-symbols-outlined text-xl">attach_money</i>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              مبيعات
            </span>
          </div>
          <h3 className="text-xs font-normal opacity-90">إجمالي المبيعات</h3>
          <p className="text-xl font-bold mt-2">
            ${stats.totalSales.toFixed(2)}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
            <span>اليوم: ${stats.todaySales.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-gradient-to-r from-[#5A3FFF] to-[#8A63FF] rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <i className="material-symbols-outlined text-xl">inventory_2</i>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              منتجات
            </span>
          </div>
          <h3 className="text-xs font-normal opacity-90">إجمالي المنتجات</h3>
          <p className="text-xl font-bold mt-2">{stats.totalProducts}</p>
          <Link
            href="/dashboard/news"
            className="mt-4 flex items-center gap-1 text-sm opacity-90 hover:opacity-100 transition-all duration-200 ease-in-out hover:text-white/100"
          >
            <span>عرض الكل</span>
            <i className="material-symbols-outlined text-sm">arrow_back</i>
          </Link>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <i className="material-symbols-outlined text-xl">people</i>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              مستخدمين
            </span>
          </div>
          <h3 className="text-xs font-normal opacity-90">إجمالي المستخدمين</h3>
          <p className="text-xl font-bold mt-2">{stats.totalUsers}</p>
          <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
            <span>أدمنز: {stats.totalAdmins}</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-[#E8E8E8] dark:border-gray-700 transition-all duration-200 ease-in-out hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">مدفوع</p>
              <p className="text-xl font-bold text-[#5A3FFF]">
                {stats.paidOrders}
              </p>
            </div>
            <div className="p-3 bg-[#5A3FFF]/10 rounded-lg">
              <i className="material-symbols-outlined text-[#5A3FFF]">
                payments
              </i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-[#E8E8E8] dark:border-gray-700 transition-all duration-200 ease-in-out hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                تم الشحن
              </p>
              <p className="text-xl font-bold text-[#5A3FFF]">
                {stats.shippedOrders}
              </p>
            </div>
            <div className="p-3 bg-[#5A3FFF]/10 rounded-lg">
              <i className="material-symbols-outlined text-[#5A3FFF]">
                local_shipping
              </i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-[#E8E8E8] dark:border-gray-700 transition-all duration-200 ease-in-out hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                تم التوصيل
              </p>
              <p className="text-xl font-bold text-green-600">
                {stats.deliveredOrders}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <i className="material-symbols-outlined text-green-600 dark:text-green-400">
                check_circle
              </i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-[#E8E8E8] dark:border-gray-700 transition-all duration-200 ease-in-out hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                متوسط الطلب
              </p>
              <p className="text-xl font-bold text-[#5A3FFF]">
                ${stats.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-[#5A3FFF]/10 rounded-lg">
              <i className="material-symbols-outlined text-[#5A3FFF]">
                analytics
              </i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#E8E8E8] dark:border-gray-700 transition-all duration-200 ease-in-out hover:shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-[#1A1A1A] dark:text-white">
              المبيعات الأسبوعية
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B] dark:text-gray-400">
              <span>آخر 7 أيام</span>
            </div>
          </div>
          {isChartLoaded && chartData.salesData && chartData.salesData.length > 0 && (
            <Chart
              options={salesChartOptions}
              series={[{ name: "المبيعات", data: chartData.salesData }]}
              type="area"
              height={300}
            />
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#E8E8E8] dark:border-gray-700 transition-all duration-200 ease-in-out hover:shadow-xl">
          <h2 className="text-sm font-medium text-[#1A1A1A] dark:text-white mb-6">
            توزيع حالة الطلبات
          </h2>
          {isChartLoaded && (
            <Chart
              options={statusPieChartOptions}
              series={[
                stats.paidOrders || 0,
                stats.shippedOrders || 0,
                stats.deliveredOrders || 0,
                stats.cancelledOrders || 0,
              ]}
              type="donut"
              height={280}
            />
          )}
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#E8E8E8] dark:border-gray-700 transition-all duration-200 ease-in-out hover:shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-[#1A1A1A] dark:text-white">
            عدد الطلبات اليومية
          </h2>
          <div className="flex items-center gap-2 text-sm text-[#6B6B6B] dark:text-gray-400">
            <span>آخر 7 أيام</span>
          </div>
        </div>
        {isChartLoaded && chartData.ordersData && chartData.ordersData.length > 0 && (
          <Chart
            options={ordersChartOptions}
            series={[{ name: "الطلبات", data: chartData.ordersData }]}
            type="bar"
            height={250}
          />
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#E8E8E8] dark:border-gray-700 transition-all duration-200 ease-in-out hover:shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-[#1A1A1A] dark:text-white">
            أحدث الطلبات
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-sm text-[#5A3FFF] dark:text-[#8A63FF] hover:text-[#5A3FFF] dark:hover:text-[#8A63FF] flex items-center gap-1 transition-all duration-200 ease-in-out"
          >
            <span>عرض الكل</span>
            <i className="material-symbols-outlined text-sm">arrow_back</i>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E8] dark:border-gray-700">
                <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6B6B] dark:text-gray-400">
                  رقم الطلب
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6B6B] dark:text-gray-400">
                  العميل
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6B6B] dark:text-gray-400">
                  المبلغ
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6B6B] dark:text-gray-400">
                  الحالة
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[#6B6B6B] dark:text-gray-400">
                  التاريخ
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-[#6B6B6B] dark:text-gray-400">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#E8E8E8] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ease-in-out"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-[#1A1A1A] dark:text-white">
                      #{order.id?.slice(0, 8)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1A1A1A] dark:text-white">
                      {getCustomerName(order)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${order.total_price.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        getStatusDisplay(order.status).color
                      }`}
                    >
                      {getStatusDisplay(order.status).text}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B6B6B] dark:text-gray-400">
                    {new Date(order.created_at as string).toLocaleDateString(
                      "ar-EG"
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-[#5A3FFF] dark:text-[#8A63FF] hover:text-[#5A3FFF] dark:hover:text-[#8A63FF] text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] dark:focus:ring-[#8A63FF] focus:ring-offset-1 rounded px-2 py-1"
                    >
                      <i className="material-symbols-outlined text-sm">
                        visibility
                      </i>
                      <span>عرض</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/news/create-news"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#E8E8E8] dark:border-gray-700 hover:shadow-lg transition-all duration-200 ease-in-out group dashboard-card-gradient focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] dark:focus:ring-[#8A63FF] focus:ring-offset-1"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#5A3FFF]/10 rounded-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-[#5A3FFF] text-2xl">
                add_circle
              </i>
            </div>
            <div>
              <h3 className="text-xs font-medium text-[#1A1A1A] dark:text-white">
                إضافة منتج
              </h3>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                منتج جديد
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/orders"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#E8E8E8] dark:border-gray-700 hover:shadow-lg transition-all duration-200 ease-in-out group dashboard-card-gradient focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] dark:focus:ring-[#8A63FF] focus:ring-offset-1"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                receipt_long
              </i>
            </div>
            <div>
              <h3 className="text-xs font-medium text-[#1A1A1A] dark:text-white">
                إدارة الطلبات
              </h3>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                عرض الطلبات
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/users"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-[#E8E8E8] dark:border-gray-700 hover:shadow-lg transition-all duration-200 ease-in-out group dashboard-card-gradient focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] dark:focus:ring-[#8A63FF] focus:ring-offset-1"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#5A3FFF]/10 rounded-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-[#5A3FFF] text-2xl">
                group
              </i>
            </div>
            <div>
              <h3 className="text-xs font-medium text-[#1A1A1A] dark:text-white">
                المستخدمين
              </h3>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                إدارة المستخدمين
              </p>
            </div>
          </div>
        </Link>

        {/* <Link
          href="/dashboard/site-settings"
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">
                settings
              </i>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                الإعدادات
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إعدادات الموقع
              </p>
            </div>
          </div>
        </Link> */}
      </div>
    </div>
  );
}
