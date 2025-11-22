"use client";

import Image from "next/image";
import { ProfileTypes } from "./profileType";

interface ProfileIntroProps {
  profile?: ProfileTypes;
}

const ProfileIntro: React.FC<ProfileIntroProps> = ({ profile }) => {
  return (
    <>
      <div
        className="
          trezo-card
          mb-[25px]
          p-[20px] md:p-[25px]
          rounded-xl
          text-center
          shadow-lg
          bg-white dark:bg-[#0f0f0f]
          border border-[#eee] dark:border-[#222]
        "
        style={{
          background:
            "linear-gradient(90deg, rgba(158,130,255,0.12), rgba(67,38,204,0.15))",
        }}
      >
        {/* Header */}
        <div className="trezo-card-header mb-[20px] md:mb-[25px]">
          <div className="trezo-card-title relative inline-block">
            <h5 className="!mb-0 font-semibold text-[#1a1a1a] dark:text-white text-lg">
              الملف الشخصي
            </h5>

            {/* Glow Line */}
            <span
              className="
                block h-[3px] w-[80px] mx-auto mt-[6px] rounded-full
                bg-gradient-to-r from-[#6A4CFF] to-[#9E82FF]
                opacity-80
              "
            ></span>
          </div>
        </div>

        {/* Content */}
        <div className="trezo-card-content">
          <div className="flex items-center justify-center">
            {profile?.avatar_url || profile?.image_url ? (
              <Image
                src={profile?.avatar_url || profile?.image_url || ""}
                alt="user-image"
                className="rounded-full w-[75px] h-[75px] object-cover shadow-md"
                width={75}
                height={75}
              />
            ) : (
              <div className="rounded-full w-[75px] h-[75px] bg-[#6A4CFF] flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <div className="ltr:ml-[15px] rtl:mr-[15px] text-left rtl:text-right">
              <span className="block text-black dark:text-white text-[17px] font-semibold">
                {profile?.full_name?.split(" ")[0]}
              </span>
              <span className="block mt-px text-[#555] dark:text-[#ccc]">
                {profile?.job_title}
              </span>
            </div>
          </div>

          {profile?.about && (
            <>
              <span className="text-black dark:text-white font-semibold block mb-[5px] mt-[16px] text-[16px]">
                عني
              </span>

              <p className="text-[#333] dark:text-[#ccc] leading-relaxed">
                {profile?.about}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileIntro;
