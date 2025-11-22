"use client";

import ProfileInformation from "@/components/MyProfile/ProfileInformation";
import ProfileIntro from "@/components/MyProfile/ProfileIntro";
import { useAdminProfile } from "@/components/MyProfile/useAdminProfile";
import Nav from "@/components/Settings/Nav";

import Link from "next/link";

export default function Page() {
  const { data: profile } = useAdminProfile();

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
      <h5 className="!mb-0 flex items-center gap-2 text-xl font-semibold text-gray-800">
          {" "}
          <Link href="/dashboard/my-profile/edit" className="ml-2">
          <i className="ri-edit-2-line text-2xl text-purple-600 hover:text-purple-800 transition cursor-pointer"></i>
 
          </Link>{" "}
          ملفي الشخصي
        </h5>

        <ol className="breadcrumb mt-[12px] md:mt-0">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard/ecommerce/"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-[#6A4CFF]"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-[#6A4CFF] top-1/2 -translate-y-1/2">
                home
              </i>
              لوحة التحكم
            </Link>
          </li>

          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            ملفي الشخصي
          </li>
        </ol>
      </div>

      <div className=" gap-[25px]">
        <div className="lg:col-span-1">
          <Nav />
          <ProfileIntro profile={profile} />

          <ProfileInformation profile={profile} />
        </div>
      </div>
    </>
  );
}
