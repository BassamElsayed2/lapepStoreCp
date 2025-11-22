"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminProfile } from "@/components/MyProfile/useAdminProfile";
import { useLogout } from "@/components/Authentication/useLogout";

const ProfileMenu: React.FC = () => {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();
  const { data: profile } = useAdminProfile();

  const [active, setActive] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDropdownToggle = () => setActive((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="relative profile-menu mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={handleDropdownToggle}
        className={`flex items-center -mx-[5px] relative ltr:pr-[14px] rtl:pl-[14px] text-[#1A1A1A] ${
          active ? "active" : ""
        }`}
      >
        <Image
          src={profile?.avatar_url || profile?.image_url || "/images/admin.png"}
          className="w-[35px] h-[35px] md:w-[42px] md:h-[42px] rounded-full ltr:md:mr-[2px] ltr:lg:mr-[8px] rtl:md:ml-[2px] rtl:lg:ml-[8px] border-[2px] border-[#8A63FF] inline-block object-cover"
          alt="admin-image"
          width={35}
          height={35}
        />
        <span className="block font-semibold text-[0px] lg:text-base">
          {profile?.full_name}
        </span>
        <i className="ri-arrow-down-s-line text-[#5A3FFF] absolute ltr:-right-[3px] rtl:-left-[3px] top-1/2 -translate-y-1/2 mt-px"></i>
      </button>

      {active && (
        <div className="profile-menu-dropdown bg-white shadow-md border border-[#E8E8E8] rounded-xl py-[22px] absolute mt-[13px] md:mt-[14px] w-[195px] z-[1] top-full ltr:right-0 rtl:left-0">
          <div className="flex items-center border-b border-[#E8E8E8] pb-[12px] mx-[20px] mb-[10px]">
            <Image
              src={profile?.avatar_url || profile?.image_url || "/images/admin.png"}
              className="rounded-full w-[31px] h-[31px] ltr:mr-[9px] rtl:ml-[9px] border-2 border-[#8A63FF] inline-block object-cover"
              alt="admin-image"
              width={31}
              height={31}
            />
            <div>
              <span className="block text-[#1A1A1A] font-medium font-serif">
                {profile?.full_name}
              </span>
              <span className="block text-[#6B6B6B] text-xs font-serif">{profile?.job_title}</span>
            </div>
          </div>

          <ul>
            <li>
              <Link
                href="/dashboard/my-profile/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-[#1A1A1A] transition-all hover:text-[#5A3FFF] ${
                  pathname === "/my-profile/" ? "text-[#5A3FFF]" : ""
                }`}
              >
                <i className="material-symbols-outlined !text-[#5A3FFF] absolute ltr:left-[20px] rtl:right-[20px] top-1/2 -translate-y-1/2 !text-[22px]">
                  account_circle
                </i>
                ملفي الشخصي
              </Link>
            </li>
          </ul>

          <div className="border-t border-[#E8E8E8] mx-[20px] my-[9px]"></div>

          <ul>
            <li>
              <Link
                href="/dashboard/my-profile/edit/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-[#1A1A1A] transition-all hover:text-[#5A3FFF] ${
                  pathname === "/dashboard/my-profile/edit/"
                    ? "text-[#5A3FFF]"
                    : ""
                }`}
              >
                <i className="material-symbols-outlined !text-[#5A3FFF] absolute ltr:left-[20px] rtl:right-[20px] top-1/2 -translate-y-1/2 !text-[22px]">
                  settings
                </i>
                الإعدادات
              </Link>
            </li>
            <li>
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-[#1A1A1A] transition-all hover:text-[#5A3FFF]"
              >
                <i className="material-symbols-outlined !text-[#5A3FFF] absolute ltr:left-[20px] rtl:right-[20px] top-1/2 -translate-y-1/2 !text-[22px]">
                  logout
                </i>
                تسجيل الخروج
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
