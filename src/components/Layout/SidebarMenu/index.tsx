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

  // Initialize openIndex to 0 to open the first item by default
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Common classes for menu items
  const menuItemBaseClasses = "rounded-md text-black dark:text-white mb-[6px] whitespace-nowrap";
  const menuButtonBaseClasses = "accordion-button toggle flex items-center transition-all py-[10px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c]";
  const menuLinkBaseClasses = "sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[10px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c]";
  const subMenuLinkBaseClasses = "sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[10px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c]";
  const iconBaseClasses = "material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[10px] rtl:ml-[10px] !text-[22px] leading-none flex-shrink-0";
  const subIconBaseClasses = "material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[10px] rtl:ml-[10px] !text-[20px] leading-none flex-shrink-0";
  const sectionTitleClasses = "block relative font-medium uppercase text-gray-400 dark:text-gray-500 mb-[12px] mt-[20px] text-xs tracking-wider";

  return (
    <>
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md shadow-lg">
        <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[20px] pb-[18px] absolute z-[2] right-0 top-0 left-0 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="transition-none relative flex items-center outline-none"
          >
            <Image
              src="/images/ENSs.png"
              alt="logo-icon"
              width={150}
              height={150}
              className="object-contain"
            />
          </Link>

          <button
            type="button"
            className="burger-menu inline-flex items-center justify-center w-[32px] h-[32px] rounded-md transition-all hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-[#15203c]"
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
                  openIndex === 0 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(0)}
              >
                <i className={iconBaseClasses}>inventory_2</i>
                <span className="title leading-none">المنتجات</span>
              </button>

              <div className={`accordion-collapse transition-all duration-300 ${
                openIndex === 0 ? "open block" : "hidden"
              }`}>
                <ul className="sidebar-sub-menu pt-[6px] space-y-1">
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/news"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/news" || pathname === "/dashboard/news/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
                        pathname === "/dashboard/news/create-news" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
                        pathname === "/dashboard/news/categories/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
                pathname === "/dashboard/orders" || pathname === "/dashboard/orders/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
              }`}
            >
              <i className={iconBaseClasses}>shopping_cart</i>
              <span>قائمة الطلبات</span>
            </Link>

            <div className={menuItemBaseClasses}>
              <button
                className={`${menuButtonBaseClasses} ${
                  openIndex === 2 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(2)}
              >
                <i className={iconBaseClasses}>article</i>
                <span className="title leading-none">مقالات</span>
              </button>

              <div className={`accordion-collapse transition-all duration-300 ${
                openIndex === 2 ? "open block" : "hidden"
              }`}>
                <ul className="sidebar-sub-menu pt-[6px] space-y-1">
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/blog"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/blog" || pathname === "/dashboard/blog/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>list</i>
                      <span>قائمة المقالات</span>
                    </Link>
                  </li>
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/blog/create-blog"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/blog/create-blog" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>add_circle</i>
                      <span>إنشاء مقال</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className={menuItemBaseClasses}>
              <button
                className={`${menuButtonBaseClasses} ${
                  openIndex === 5 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(5)}
              >
                <i className={iconBaseClasses}>rate_review</i>
                <span className="title leading-none">توصيات العملاء</span>
              </button>

              <div className={`accordion-collapse transition-all duration-300 ${
                openIndex === 5 ? "open block" : "hidden"
              }`}>
                <ul className="sidebar-sub-menu pt-[6px] space-y-1">
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/testimonial"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/testimonial" || pathname === "/dashboard/testimonial/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>list</i>
                      <span>قائمة التوصيات</span>
                    </Link>
                  </li>
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/testimonial/create-testimonial"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/testimonial/create-testimonial" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
                      }`}
                    >
                      <i className={subIconBaseClasses}>add_circle</i>
                      <span>إنشاء توصية</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${
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
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
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
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${
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
                  openIndex === 3 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(3)}
              >
                <i className={iconBaseClasses}>location_on</i>
                <span className="title leading-none">الفروع</span>
              </button>

              <div className={`accordion-collapse transition-all duration-300 ${
                openIndex === 3 ? "open block" : "hidden"
              }`}>
                <ul className="sidebar-sub-menu pt-[6px] space-y-1">
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/branches/"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/branches" || pathname === "/dashboard/branches/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
                        pathname === "/dashboard/branches/create-branch" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
                pathname === "/dashboard/shipping-fees" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
              }`}
            >
              <i className={iconBaseClasses}>local_shipping</i>
              <span>أسعار الشحن</span>
            </Link>

            <Link
              href="/dashboard/users"
              className={`${menuLinkBaseClasses} ${
                pathname === "/dashboard/users" || pathname === "/dashboard/users/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
                pathname === "/dashboard/my-profile" || pathname === "/dashboard/my-profile/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
              }`}
            >
              <i className={iconBaseClasses}>account_circle</i>
              <span>ملفي الشخصي</span>
            </Link>

            <div className={menuItemBaseClasses}>
              <button
                className={`${menuButtonBaseClasses} ${
                  openIndex === 29 ? "open" : ""
                }`}
                type="button"
                onClick={() => toggleAccordion(29)}
              >
                <i className={iconBaseClasses}>settings</i>
                <span className="title leading-none">إعدادات</span>
              </button>

              <div className={`accordion-collapse transition-all duration-300 ${
                openIndex === 29 ? "open block" : "hidden"
              }`}>
                <ul className="sidebar-sub-menu pt-[6px] space-y-1">
                  <li className="sidemenu-item">
                    <Link
                      href="/dashboard/my-profile/edit/"
                      className={`${subMenuLinkBaseClasses} ${
                        pathname === "/dashboard/my-profile/edit/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
                        pathname === "/dashboard/my-profile/change-password/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
                        pathname === "/dashboard/add-user" || pathname === "/dashboard/add-user/" ? "active text-primary-500 bg-primary-50 dark:bg-[#15203c]" : ""
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
              className={`${menuLinkBaseClasses} text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20`}
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
