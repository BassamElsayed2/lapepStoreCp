"use client";

import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrderStats } from "../../../../services/apiOrders";
import Link from "next/link";

const NotificationBell: React.FC = () => {
  const prevCountRef = useRef<number>(0);

  // Fetch order stats with auto-refresh
  const { data: stats } = useQuery({
    queryKey: ["orderStats"],
    queryFn: getOrderStats,
    refetchInterval: 30000, // Refresh every 30 seconds (reduced from 5s to prevent rate limiting)
    staleTime: 20000, // Consider data fresh for 20 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Count new paid/confirmed orders (combined)
  const newOrdersCount = (stats?.paid || 0) + (stats?.confirmed || 0);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Play notification sound when new order arrives
  useEffect(() => {
    if (prevCountRef.current > 0 && newOrdersCount > prevCountRef.current) {
      // New order detected! Play sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => console.log('Could not play notification sound'));
      } catch {
        console.log('Notification sound not available');
      }
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('طلب جديد مدفوع! 🔔', {
          body: `لديك ${newOrdersCount} طلب مدفوع جديد`,
          icon: '/favicon.ico',
        });
      }
    }
    prevCountRef.current = newOrdersCount;
  }, [newOrdersCount]);

  return (
    <div className="relative ltr:mr-[15px] rtl:ml-[15px] group">
      <Link
        href="/dashboard/orders"
        className="relative inline-block text-center hover:text-purple-500 dark:hover:text-purple-400 transition-all"
        title={newOrdersCount > 0 ? `${newOrdersCount} طلب مدفوع جديد` : "الطلبات"}
      >
        <i className="material-symbols-outlined !text-[23px]">
          notifications
        </i>
        
        {newOrdersCount > 0 && (
          <span className="absolute -top-[5px] ltr:-right-[5px] rtl:-left-[5px] bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse shadow-lg">
            {newOrdersCount > 99 ? '99+' : newOrdersCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default NotificationBell;

