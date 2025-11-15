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
    setChartLoaded(true);
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
    colors: ["#10B981"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: chartData.labels,
      labels: {
        style: { colors: "#64748B", fontFamily: "inherit" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748B", fontFamily: "inherit" },
        formatter: (value) => `$${value.toFixed(0)}`,
      },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (value) => `$${value.toFixed(2)}` },
    },
    grid: { borderColor: "#e2e8f0" },
  };

  const ordersChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    colors: ["#3B82F6"],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "60%",
      },
    },
    xaxis: {
      categories: chartData.labels,
      labels: {
        style: { colors: "#64748B", fontFamily: "inherit" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748B", fontFamily: "inherit" },
      },
    },
    tooltip: { theme: "dark" },
    grid: { borderColor: "#e2e8f0" },
  };

  const statusPieChartOptions: ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: ["مدفوع", "تم الشحن", "تم التوصيل", "ملغي"],
    colors: ["#3B82F6", "#8B5CF6", "#10B981", "#EF4444"],
    legend: {
      position: "bottom",
      labels: {
        colors: "#64748B",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
    },
    tooltip: {
      theme: "dark",
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
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            لوحة التحكم
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            مرحباً بك، إليك نظرة عامة على نشاطك
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <i className="material-symbols-outlined text-lg">calendar_today</i>
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
              <i className="material-symbols-outlined text-3xl">
                shopping_cart
              </i>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              إجمالي
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90">إجمالي الطلبات</h3>
          <p className="text-4xl font-bold mt-2">{stats.totalOrders}</p>
          <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
            <span>اليوم: {stats.todayOrders}</span>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <i className="material-symbols-outlined text-3xl">attach_money</i>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              مبيعات
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90">إجمالي المبيعات</h3>
          <p className="text-4xl font-bold mt-2">
            ${stats.totalSales.toFixed(2)}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
            <span>اليوم: ${stats.todaySales.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <i className="material-symbols-outlined text-3xl">inventory_2</i>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              منتجات
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90">إجمالي المنتجات</h3>
          <p className="text-4xl font-bold mt-2">{stats.totalProducts}</p>
          <Link
            href="/dashboard/news"
            className="mt-4 flex items-center gap-1 text-sm opacity-90 hover:opacity-100"
          >
            <span>عرض الكل</span>
            <i className="material-symbols-outlined text-sm">arrow_back</i>
          </Link>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <i className="material-symbols-outlined text-3xl">people</i>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              مستخدمين
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90">إجمالي المستخدمين</h3>
          <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
          <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
            <span>أدمنز: {stats.totalAdmins}</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مدفوع</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.paidOrders}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <i className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                payments
              </i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تم الشحن
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.shippedOrders}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <i className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                local_shipping
              </i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تم التوصيل
              </p>
              <p className="text-2xl font-bold text-green-600">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                متوسط الطلب
              </p>
              <p className="text-2xl font-bold text-indigo-600">
                ${stats.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <i className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">
                analytics
              </i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              المبيعات الأسبوعية
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>آخر 7 أيام</span>
            </div>
          </div>
          {isChartLoaded && (
            <Chart
              options={salesChartOptions}
              series={[{ name: "المبيعات", data: chartData.salesData }]}
              type="area"
              height={300}
            />
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            توزيع حالة الطلبات
          </h2>
          {isChartLoaded && (
            <Chart
              options={statusPieChartOptions}
              series={[
                stats.paidOrders,
                stats.shippedOrders,
                stats.deliveredOrders,
                stats.cancelledOrders,
              ]}
              type="donut"
              height={280}
            />
          )}
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            عدد الطلبات اليومية
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>آخر 7 أيام</span>
          </div>
        </div>
        {isChartLoaded && (
          <Chart
            options={ordersChartOptions}
            series={[{ name: "الطلبات", data: chartData.ordersData }]}
            type="bar"
            height={250}
          />
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            أحدث الطلبات
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <i className="material-symbols-outlined text-sm">arrow_back</i>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  رقم الطلب
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  العميل
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  المبلغ
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  الحالة
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  التاريخ
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      #{order.id?.slice(0, 8)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-white">
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
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.created_at as string).toLocaleDateString(
                      "ar-EG"
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/news/create-news"
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
                add_circle
              </i>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                إضافة منتج
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                منتج جديد
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/orders"
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                receipt_long
              </i>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                إدارة الطلبات
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                عرض الطلبات
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/users"
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:scale-110 transition-transform">
              <i className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">
                group
              </i>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                المستخدمين
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إدارة المستخدمين
              </p>
            </div>
          </div>
        </Link>

        <Link
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
        </Link>
      </div>
    </div>
  );
}
