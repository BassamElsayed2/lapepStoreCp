"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useAdminProfile } from "@/components/MyProfile/useAdminProfile";
import { useUser } from "@/components/Authentication/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/services/supabase";
import { updateAdminProfile } from "@/services/apiauth";
import { profileSchema } from "./lib/validations/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const SettingsForm: React.FC = () => {
  const { data: profile } = useAdminProfile();
  const { user } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePicture(event.target.files[0]);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
  };

  const submit = async (formData: z.infer<typeof profileSchema>) => {
    try {
      setIsSubmitting(true);

      const userId = user?.id;
      if (!userId) throw new Error("User ID is required");

      let image_url = profile?.image_url;

      if (profilePicture) {
        const fileExt = profilePicture.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { url, error: uploadError } = await uploadImage(
          "avatars",
          filePath,
          profilePicture
        );

        if (uploadError) throw new Error("فشل رفع الصورة");
        image_url = url || undefined;
      }

      const profileData = {
        ...formData,
        avatar_url: image_url,
      };

      const updatedProfile = await updateAdminProfile(profileData);

      router.refresh();
      router.push("/dashboard/my-profile");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A4CFF] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <div className="gap-[25px]">
          <div className="xl:col-span-3 2xl:col-span-2">
            <div
              className="
                trezo-card mb-[25px] p-[20px] md:p-[25px] rounded-xl shadow-lg
                bg-white dark:bg-[#0f0f0f]
                border border-[#ececf1]/60 dark:border-[#1c1c1c]
              "
              style={{
                background:
                  "linear-gradient(90deg, rgba(158,130,255,0.12), rgba(67,38,204,0.15))",
              }}
            >
              <div className="trezo-card-header mb-[20px] md:mb-[25px]">
                <div className="trezo-card-title relative inline-block">
                  <h5 className="!mb-0 font-semibold text-[#1a1a1a] dark:text-white text-lg">
                    إعدادات الملف الشخصي
                  </h5>
                  <span
                    className="block h-[3px] w-[110px] mx-auto mt-[6px] rounded-full
                    bg-gradient-to-r from-[#6A4CFF] to-[#9E82FF] opacity-90"
                  ></span>
                </div>
              </div>

              {/* FORM FIELDS */}
              <div className="trezo-card-content">
                <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                  {/* INPUT — Template */}
                  {[
                    { id: "full_name", label: "الاسم الكامل" },
                    { id: "email", label: "عنوان البريد الإلكتروني" },
                    { id: "phone", label: "رقم الهاتف" },
                    { id: "job_title", label: "الوظيفة" },
                    { id: "address", label: "العنوان" },
                  ].map((field) => (
                    <div className="mb-[20px] sm:mb-0" key={field.id}>
                      <label className="mb-[10px] block font-medium text-black dark:text-white">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        id={field.id}
                        {...register(field.id as any)}
                        className="
                          h-[55px] rounded-lg text-black dark:text-white
                          border border-[#dcd6ff] dark:border-[#342a66]
                          bg-white dark:bg-[#121212]
                          px-[17px] block w-full outline-0 transition-all
                          focus:border-[#6A4CFF] dark:focus:border-[#9E82FF]
                          shadow-sm
                        "
                      />
                      {errors[field.id as keyof typeof errors] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[field.id as keyof typeof errors]?.message}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* ABOUT */}
                  <div className="sm:col-span-2 mb-[20px]">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      عنك
                    </label>
                    <textarea
                      id="about"
                      {...register("about")}
                      className="
                        h-[140px] rounded-lg text-black dark:text-white
                        border border-[#dcd6ff] dark:border-[#342a66]
                        bg-white dark:bg-[#121212]
                        p-[17px] block w-full outline-0 transition-all
                        focus:border-[#6A4CFF] dark:focus:border-[#9E82FF]
                        shadow-sm
                      "
                    ></textarea>
                    {errors.about && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.about.message}
                      </p>
                    )}
                  </div>

                  {/* UPLOAD */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      صورة الملف الشخصي
                    </label>
                    <div
                      className="
                        relative flex items-center justify-center overflow-hidden rounded-lg
                        py-[88px] px-[20px]
                        border border-[#dcd6ff] dark:border-[#342a66]
                        bg-white/60 dark:bg-[#161616]
                        hover:border-[#6A4CFF] transition-all cursor-pointer
                      "
                    >
                      <div className="flex items-center justify-center">
                        <div className="w-[35px] h-[35px] border border-[#cbbfff] dark:border-[#3e2d7e]
                        flex items-center justify-center rounded-md text-[#6A4CFF] text-lg ltr:mr-[12px] rtl:ml-[12px]">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="leading-[1.5] text-black dark:text-white">
                          <strong>انقر للتحميل</strong>
                          <br /> ملفك هنا
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        className="absolute top-0 left-0 right-0 bottom-0 rounded-md z-[1] opacity-0 cursor-pointer"
                        onChange={handleProfilePictureChange}
                      />
                    </div>

                    {(profilePicture || profile?.image_url) && (
                      <div className="mt-[10px]">
                        <div className="relative w-[80px] h-[80px]">
                          <Image
                            src={
                              profilePicture
                                ? URL.createObjectURL(profilePicture)
                                : profile?.image_url || ""
                            }
                            alt="profile-preview"
                            width={80}
                            height={80}
                            className="rounded-md shadow-md"
                          />

                          {profilePicture && (
                            <button
                              type="button"
                              className="
                                absolute top-[-5px] right-[-5px] bg-red-500 text-white
                                w-[20px] h-[20px] flex items-center justify-center
                                rounded-full text-xs
                              "
                              onClick={handleRemoveProfilePicture}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="mt-[20px] sm:mt-[25px] flex gap-3">
                  <button
                    type="reset"
                    disabled={isSubmitting}
                    className="
                      font-medium rounded-md py-[10px] md:py-[12px] px-[22px]
                      bg-red-500 text-white hover:bg-red-400
                      transition-all
                    "
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      font-medium rounded-md py-[10px] md:py-[12px] px-[22px]
                      bg-[#6A4CFF] hover:bg-[#5430ff] text-white
                      transition-all disabled:opacity-50
                    "
                  >
                    <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                      <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                        {isSubmitting ? "hourglass_empty" : "save"}
                      </i>
                      {isSubmitting ? "جاري الحفظ..." : "حفظ المعلومات"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default SettingsForm;
