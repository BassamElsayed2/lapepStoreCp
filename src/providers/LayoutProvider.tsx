"use client";

import React, { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import SidebarMenu from "@/components/Layout/SidebarMenu";
import Header from "@/components/Layout/Header";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname();

  const [active, setActive] = useState<boolean>(false);

  const toggleActive = () => {
    setActive(!active);
  };

  const isAuthPage = [
    "/authentication/sign-in/",
    "/authentication/sign-up/",
    "/authentication/forgot-password/",
    "/authentication/reset-password/",
    "/authentication/confirm-email/",
    "/authentication/lock-screen/",
    "/authentication/logout/",
    "/coming-soon/",
    "/",
    "/front-pages/features/",
    "/front-pages/team/",
    "/front-pages/faq/",
    "/front-pages/contact/",
  ].includes(pathname);

  return (
    <>
      <div
        className={`main-content-wrap transition-all bg-gray-50 dark:bg-gray-900 ${active ? "active" : ""}`}
      >
        {!isAuthPage && (
          <>
            <SidebarMenu toggleActive={toggleActive} />

            <Header toggleActive={toggleActive} />
          </>
        )}

        <div className="main-content transition-all flex flex-col overflow-hidden min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </div>
    </>
  );
};

export default LayoutProvider;
