// app/(protected)/ProtectedWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/apiauth";

export default function ProtectedWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          // No user or not authenticated
          router.replace("/");
          return;
        }

        if (user.role !== 'admin') {
          // User is not admin
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.replace("/");
          return;
        }

        // User is authenticated and is admin
        setLoading(false);
      } catch (error) {
        console.error('Session check failed:', error);
        router.replace("/");
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
