"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/services/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/components/Social/SettingsForm/lib/validations/schema";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type SignUpData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
  };

  const submit = async (data: SignUpData) => {
    setIsLoading(true);

    try {
      let imageUrl = "";

      if (profilePicture) {
        const fileExt = profilePicture.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { url, error: uploadError } = await uploadImage(
          "avatars",
          filePath,
          profilePicture
        );

        if (uploadError || !url) {
          throw new Error("فشل رفع الصورة");
        }

        imageUrl = url;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("admin_token");

      const response = await fetch(`${API_URL}/admin/users/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.full_name || data.email.split("@")[0],
          phone: data.phone,
          image_url: imageUrl,
          job_title: data.job_title,
          address: data.address,
          about: data.about,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "فشل إنشاء المستخدم",
        }));
        throw new Error(errorData.message || "فشل إنشاء المستخدم");
      }

      toast.success("تم إنشاء الحساب بنجاح");
      router.push("/dashboard/users");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`فشل التسجيل: ${error.message}`);
      } else {
        toast.error("فشل التسجيل: حدث خطأ غير متوقع");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submit)}>
        <div className="gap-[25px]">
          <div className="xl:col-span-3 2xl:col-span-2">
            <div
              className="
                trezo-card 
                mb-[25px] p-[20px] md:p-[25px] rounded-md 
                bg-[linear-gradient(90deg,rgba(158,130,255,0.08),rgba(67,38,204,0.12))] 
                dark:bg-[#141414]
                border border-[#6A4CFF33] shadow-md
              "
            >
              <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                <div className="trezo-card-title">
                  <h5 className="!mb-0 text-[#2a2266] dark:text-white font-semibold">
                    تسجيل حساب جديد
                  </h5>
                </div>
              </div>

              {/* المحتوى */}
              <div className="trezo-card-content">
                <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
                  {/* عنصر إدخال عام (مختصر) */}
                  {/** ———————— EMAIL ———————— */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      البريد الإلكتروني *
                    </label>

                    <input
                      type="email"
                      {...register("email")}
                      className="
                        h-[55px] rounded-md text-black dark:text-white
                        border border-gray-300 dark:border-[#2a2a2a]
                        bg-white dark:bg-[#1d1d1d]
                        px-[17px] block w-full outline-0 transition-all
                        focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
                      "
                    />

                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/** ———————— PASSWORD ———————— */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      كلمة المرور *
                    </label>

                    <input
                      type="password"
                      {...register("password")}
                      className="
                        h-[55px] rounded-md text-black dark:text-white
                        border border-gray-300 dark:border-[#2a2a2a]
                        bg-white dark:bg-[#1d1d1d]
                        px-[17px] block w-full outline-0 transition-all
                        focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
                      "
                    />

                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/** ———————— PHONE ———————— */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      رقم الهاتف *
                    </label>

                    <input
                      type="text"
                      {...register("phone")}
                      className="
                        h-[55px] rounded-md text-black dark:text-white
                        border border-gray-300 dark:border-[#2a2a2a]
                        bg-white dark:bg-[#1d1d1d]
                        px-[17px] block w-full outline-0 transition-all
                        focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
                      "
                    />

                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/** ———————— FULL NAME ———————— */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      {...register("full_name")}
                      className="
                        h-[55px] rounded-md text-black dark:text-white
                        border border-gray-300 dark:border-[#2a2a2a]
                        bg-white dark:bg-[#1d1d1d]
                        px-[17px] block w-full outline-0 transition-all
                        focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
                      "
                    />
                  </div>

                  {/** ———————— JOB TITLE ———————— */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      الوظيفة
                    </label>
                    <input
                      type="text"
                      {...register("job_title")}
                      className="
                        h-[55px] rounded-md text-black dark:text-white
                        border border-gray-300 dark:border-[#2a2a2a]
                        bg-white dark:bg-[#1d1d1d]
                        px-[17px] block w-full outline-0 transition-all
                        focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
                      "
                    />
                  </div>

                  {/** ———————— ADDRESS ———————— */}
                  <div className="mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      العنوان
                    </label>
                    <input
                      type="text"
                      {...register("address")}
                      className="
                        h-[55px] rounded-md text-black dark:text-white
                        border border-gray-300 dark:border-[#2a2a2a]
                        bg-white dark:bg-[#1d1d1d]
                        px-[17px] block w-full outline-0 transition-all
                        focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
                      "
                    />
                  </div>

                  {/** ———————— ABOUT ———————— */}
                  <div className="sm:col-span-2 mb-[20px] sm:mb-0">
                    <label className="mb-[10px] block font-medium text-black dark:text-white">
                      عنك
                    </label>
                    <textarea
                      {...register("about")}
                      className="
                        h-[140px] rounded-md text-black dark:text-white
                        border border-gray-300 dark:border-[#2a2a2a]
                        bg-white dark:bg-[#1d1d1d]
                        p-[17px] block w-full outline-0 transition-all
                        focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
                      "
                    ></textarea>
                  </div>

                  {/** ———————— PROFILE PICTURE ———————— */}
                  <div className="mb-[20px] sm:mb-0 space-y-3">
                    <label className="block font-medium text-black dark:text-white">
                      صورة الملف الشخصي
                    </label>

                    <div
                      className="
      relative flex items-center justify-center overflow-hidden
      rounded-md py-[88px] px-[20px]
      border border-[#6A4CFF44]
      bg-white dark:bg-[#1d1d1d]
      hover:border-[#6A4CFF] transition-all cursor-pointer
    "
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-[35px] h-[35px] border border-[#6A4CFF] flex items-center justify-center rounded-md text-[#6A4CFF] text-lg">
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
                        className="absolute inset-0 rounded-md opacity-0 cursor-pointer"
                        onChange={handleProfilePictureChange}
                      />
                    </div>

                    {profilePicture && (
                      <div className="pt-2">
                        <div className="relative w-[80px] h-[80px]">
                          <Image
                            src={URL.createObjectURL(profilePicture)}
                            alt="profile-preview"
                            width={80}
                            height={80}
                            className="rounded-md"
                          />
                          <button
                            type="button"
                            className="
            absolute -top-2 -right-2 
            bg-red-500 text-white 
            w-[20px] h-[20px] flex items-center justify-center 
            rounded-full text-xs
          "
                            onClick={handleRemoveProfilePicture}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* زر الإنشاء */}
                <div className="mt-[20px] sm:mt-[25px]">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="
                      font-medium inline-block transition-all rounded-md
                      py-[10px] md:py-[12px] px-[20px] md:px-[22px]
                      bg-[#6A4CFF] text-white hover:bg-[#5436ff]
                      shadow-lg shadow-[#6A4CFF40]
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {isLoading ? "جارٍ الإنشاء..." : "إنشاء حساب"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
