"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLogout } from "@/components/Authentication/useLogout";

interface SidebarMenuProps {
  toggleActive: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();

  const { logout } = useLogout();

  // Helper function to check if pathname matches exactly or with trailing slash
  const isActive = (path: string) => {
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    return normalizedPathname === normalizedPath;
  };

  // Initialize openIndex to null (closed by default)
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Close accordions when navigating to dashboard home page
  React.useEffect(() => {
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    if (normalizedPathname === '/dashboard') {
      setOpenIndex(null);
    } else {
      // Auto-open accordion based on current path
      if (normalizedPathname.startsWith('/dashboard/news')) {
        setOpenIndex(0);
      } else if (normalizedPathname.startsWith('/dashboard/branches')) {
        setOpenIndex(3);
      } else if (normalizedPathname.startsWith('/dashboard/my-profile') || normalizedPathname.startsWith('/dashboard/add-user')) {
        setOpenIndex(29);
      } else {
        setOpenIndex(null);
      }
    }
  }, [pathname]);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Common classes for menu items
  const menuItemBaseClasses = "rounded-md text-gray-900 dark:text-white mb-[6px] whitespace-nowrap";
  const menuButtonBaseClasses = "accordion-button toggle flex items-center transition-all duration-200 ease-in-out py-[10px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-gray-900 dark:text-white hover-gradient focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 focus:ring-offset-1 text-left group";
  const menuLinkBaseClasses = "sidemenu-link rounded-md flex items-center relative transition-all duration-200 ease-in-out font-medium text-gray-900 dark:text-white py-[10px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover-gradient focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 focus:ring-offset-1 w-full text-left group";
  const subMenuLinkBaseClasses = "sidemenu-link rounded-md flex items-center relative transition-all duration-200 ease-in-out font-medium text-gray-900 dark:text-white py-[10px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover-gradient focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 focus:ring-offset-1 w-full text-left group";
  const iconBaseClasses = "material-symbols-outlined transition-all duration-200 text-purple-600 dark:text-purple-400 ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none flex-shrink-0";
  const subIconBaseClasses = "material-symbols-outlined transition-all duration-200 text-purple-600 dark:text-purple-400 ltr:mr-[10px] rtl:ml-[10px] !text-[20px] leading-none flex-shrink-0";
  const sectionTitleClasses = "block relative font-medium uppercase text-purple-500 dark:text-purple-400 mb-[12px] mt-[20px] text-xs tracking-wider";

  return (
    <>
      <div className="sidebar-area bg-gray-50 dark:bg-gray-900 fixed z-[7] top-0 h-screen transition-all rounded-r-md shadow-lg">
        <div className="logo bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[20px] pb-[18px] absolute z-[2] right-0 top-0 left-0 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="transition-none relative flex items-center outline-none"
          >
            <Image
              src="/images/ENS-copy.png"
              alt="logo-icon"
              width={150}
              height={150}
              className="object-contain"
            />
          </Link>

          <button
            type="button"
            className="burger-menu inline-flex items-center justify-center w-[32px] h-[32px] rounded-md transition-all duration-200 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-[#21123da7] dark:hover:text-purple-400"
            onClick={toggleActive}
            aria-label="إغلاق القائمة"
          >
            <i className="material-symbols-outlined text-[24px]">close</i>
          </button>
        </div>

        <div className="pt-[90px] px-[20px] pb-[24px] h-screen overflow-y-auto sidebar-custom-scrollbar">
          <div className="accordion space-y-1">
            <span className={sectionTitleClasses} style={{ marginTop: 0 }}>
              رئيسي
            </span>

            <div className={menuItemBaseClasses}>
              <button
                className={`${menuButtonBaseClasses} ${
                  openIndex === 0 ? "open active" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(0)}
              >
                <i className={iconBaseClasses}>inventory_2</i>
                <span className="title leading-none">المنتجات</span>
              </button>

              <div className={`accordion-collapse transition-all duration-300 ease-in-out ${
                openIndex === 0 ? "open block" : "hidden"
              }`}>
                <ul className="sidebar-sub-menu pt-[6px] space-y-1">
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/news"
                      className={`${subMenuLinkBaseClasses} ${
                        isActive("/dashboard/news") && pathname !== "/dashboard/news/create-news" && pathname !== "/dashboard/news/create-news/" && pathname !== "/dashboard/news/categories" && pathname !== "/dashboard/news/categories/" ? "active font-medium dark:bg-[#21123da7]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>list</i>
                      <span>قائمة المنتجات</span>
                    </Link>
                  </li>
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/news/create-news"
                      className={`${subMenuLinkBaseClasses} ${
                        isActive("/dashboard/news/create-news") ? "active font-medium dark:bg-[#21123da7]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>add_circle</i>
                      <span>إنشاء منتج</span>
                    </Link>
                  </li>
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/news/categories/"
                      className={`${subMenuLinkBaseClasses} ${
                        isActive("/dashboard/news/categories") ? "active font-medium dark:bg-[#21123da7]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>category</i>
                      <span>تصنيفات</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <Link
              href="/dashboard/orders"
              className={`${menuLinkBaseClasses} ${
                pathname === "/dashboard/orders" || pathname === "/dashboard/orders/" ? "active font-medium dark:bg-[#21123da7]" : ""
              }`}
            >
              <i className={iconBaseClasses}>shopping_cart</i>
              <span>قائمة الطلبات</span>
            </Link>

            {/* <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#21123da7] ${
                  openIndex === 6 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(6)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  image
                </i>
                <span className="title leading-none">البانرات</span>
              </button>

              <div className="pt-[4px]">
                <ul className="sidebar-sub-menu">
                  <div
                    className={`accordion-collapse ${
                      openIndex === 6 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/banners"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-[#6A4CFF] hover:bg-primary-50 w-full text-left dark:hover:bg-[#21123da7] ${
                          pathname === "/dashboard/banners" ? "active" : ""
                        }`}
                      >
                        <i className="ri-list-check-2  transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        قائمة البانرات
                      </Link>
                    </li>
                  </div>
                  <div
                    className={`accordion-collapse ${
                      openIndex === 6 ? "open" : "hidden"
                    }`}
                  >
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/banners/create"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-[#6A4CFF] hover:bg-primary-50 w-full text-left dark:hover:bg-[#21123da7] ${
                          pathname === "/dashboard/banners/create"
                            ? "active"
                            : ""
                        }`}
                      >
                        <i className="ri-add-line  transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px"></i>
                        إنشاء بانر جديد
                      </Link>
                    </li>
                  </div>
                </ul>
              </div>
            </div> */}

            <div className={menuItemBaseClasses}>
              <button
                className={`${menuButtonBaseClasses} ${
                  openIndex === 3 ? "open active" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(3)}
              >
                <i className={iconBaseClasses}>location_on</i>
                <span className="title leading-none">الفروع</span>
              </button>

              <div className={`accordion-collapse transition-all duration-300 ease-in-out ${
                openIndex === 3 ? "open block" : "hidden"
              }`}>
                <ul className="sidebar-sub-menu pt-[6px] space-y-1">
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/branches/"
                      className={`${subMenuLinkBaseClasses} ${
                        isActive("/dashboard/branches") && pathname !== "/dashboard/branches/create-branch" && pathname !== "/dashboard/branches/create-branch/" ? "active font-medium dark:bg-[#21123da7]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>list</i>
                      <span>قائمة الفروع</span>
                    </Link>
                  </li>
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/branches/create-branch"
                      className={`${subMenuLinkBaseClasses} ${
                        isActive("/dashboard/branches/create-branch") ? "active font-medium dark:bg-[#21123da7]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>add_location</i>
                      <span>إنشاء فرع</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <Link
              href="/dashboard/shipping-fees"
              className={`${menuLinkBaseClasses} ${
                pathname === "/dashboard/shipping-fees" ? "active font-medium dark:bg-[#21123da7]" : ""
              }`}
            >
              <i className={iconBaseClasses}>local_shipping</i>
              <span>أسعار الشحن</span>
            </Link>

            <Link
              href="/dashboard/users"
              className={`${menuLinkBaseClasses} ${
                pathname === "/dashboard/users" || pathname === "/dashboard/users/" ? "active font-medium dark:bg-[#21123da7]" : ""
              }`}
            >
              <i className={iconBaseClasses}>people</i>
              <span>المستخدمين</span>
            </Link>

            <span className={sectionTitleClasses}>
              أخري
            </span>

            <Link
              href="/dashboard/my-profile/"
              className={`${menuLinkBaseClasses} ${
                pathname === "/dashboard/my-profile" || pathname === "/dashboard/my-profile/" ? "active font-medium dark:bg-[#21123da7]" : ""
              }`}
            >
              <i className={iconBaseClasses}>account_circle</i>
              <span>ملفي الشخصي</span>
            </Link>

            <div className={menuItemBaseClasses}>
              <button
                className={`${menuButtonBaseClasses} ${
                  openIndex === 29 ? "open active" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(29)}
              >
                <i className={iconBaseClasses}>settings</i>
                <span className="title leading-none">إعدادات</span>
              </button>

              <div className={`accordion-collapse transition-all duration-300 ease-in-out ${
                openIndex === 29 ? "open block" : "hidden"
              }`}>
                <ul className="sidebar-sub-menu pt-[6px] space-y-1">
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/my-profile/edit/"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/my-profile/edit/" ? "active font-medium dark:bg-[#21123da7]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>edit</i>
                      <span>إعدادات الحساب</span>
                    </Link>
                  </li>
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/my-profile/change-password/"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/my-profile/change-password/" ? "active font-medium dark:bg-[#21123da7]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>lock</i>
                      <span>تغيير كلمة المرور</span>
                    </Link>
                  </li>
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/add-user/"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/add-user" || pathname === "/dashboard/add-user/" ? "active font-medium dark:bg-[#21123da7]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>person_add</i>
                      <span>أضف مستخدم</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className={`${menuLinkBaseClasses} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-sm font-medium`}
            >
              <i className={iconBaseClasses}>logout</i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
