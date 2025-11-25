"use client";

import { useEffect, useState } from "react";
import SignInForm from "@/components/Authentication/SignInForm";
import { isAuthenticated } from "@/services/apiauth";

export default function Home() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // User has token, redirect to dashboard
          window.location.href = "/dashboard";
          return;
        }
        setIsChecking(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0a0e19]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جارٍ التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignInForm />
    </>
  );
}
