"use client";

import React from "react";
import { ProfileTypes } from "./profileType";

interface ProfileIntroProps {
  profile?: ProfileTypes;
}

const ProfileInformation: React.FC<ProfileIntroProps> = ({ profile }) => {
  return (
    <>
      <div
        className="
          trezo-card
          mb-[25px]
          p-[20px] md:p-[25px]
          rounded-xl
          shadow-lg
          bg-white dark:bg-[#0f0f0f]
          border border-[#eee] dark:border-[#222]
        "
        style={{
          background:
            "linear-gradient(90deg, rgba(158, 130, 255, 0.08), rgba(67, 38, 204, 0.1))",
        }}
      >
        {/* Header */}
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title relative">
            <h5
              className="
                !mb-0 font-semibold text-[#1a1a1a] dark:text-white text-lg
                relative
              "
            >
              معلومات الملف الشخصي
            </h5>

            {/* Glow Line Under Title */}
            <span
              className="
                block h-[3px] w-[90px] mt-[6px] rounded-full
                bg-gradient-to-r from-[#6A4CFF] to-[#9E82FF]
                opacity-80
              "
            ></span>
          </div>
        </div>

        {/* Content */}
        <div className="trezo-card-content">
          <ul className="text-[15px] leading-[1.9] text-[#333] dark:text-[#dcdcdc]">
            <li className="mb-[12.5px] last:mb-0">
              رقم المستخدم الخاص:
              <span className="text-black dark:text-white font-medium ml-1">
                {profile?.user_id}
              </span>
            </li>

            <li className="mb-[12.5px] last:mb-0">
              الاسم الكامل:
              <span className="text-black dark:text-white font-medium ml-1">
                {profile?.full_name}
              </span>
            </li>

            <li className="mb-[12.5px] last:mb-0">
              البريد الإلكتروني:
              <span className="text-black dark:text-white font-medium ml-1">
                {profile?.email}
              </span>
            </li>

            <li className="mb-[12.5px] last:mb-0">
              الدور:
              <span className="text-black dark:text-white font-medium ml-1">
                {profile?.job_title}
              </span>
            </li>

            <li className="mb-[12.5px] last:mb-0">
              الموقع:
              <span className="text-black dark:text-white font-medium ml-1">
                {profile?.address}
              </span>
            </li>

            <li className="mb-[12.5px] last:mb-0">
              تاريخ الانضمام:
              <span className="text-black dark:text-white font-medium ml-1">
                {profile?.joined_at
                  ? new Date(profile.joined_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ProfileInformation;
