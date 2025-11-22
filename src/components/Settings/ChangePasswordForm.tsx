"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleChangePassword = async () => {
    setMessage("");
    setLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("يرجى ملء جميع الحقول.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("كلمة السر الجديدة غير متطابقة.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClientComponentClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        setMessage("لم يتم العثور على المستخدم.");
        setLoading(false);
        return;
      }

      // تسجيل الدخول لتأكيد كلمة السر الحالية
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setMessage("كلمة السر الحالية غير صحيحة.");
        setLoading(false);
        return;
      }

      // تحديث كلمة السر
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setMessage("حدث خطأ أثناء تحديث كلمة السر.");
      } else {
        setMessage("تم تحديث كلمة السر بنجاح.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.push("/dashboard/my-profile");
      }
    } catch (err) {
      setMessage("حدث خطأ غير متوقع.");
      console.error("Error changing password:", err);
    }

    setLoading(false);
  };

  return (
    <>
      <form className="trezo-card mb-[25px] p-[20px] md:p-[25px] rounded-md 
        bg-[linear-gradient(90deg,rgba(158,130,255,0.08),rgba(67,38,204,0.12))] 
        dark:bg-[#141414] shadow-md border border-[#6A4CFF22]">

        <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">

          {/* حقل كلمة السر الحالية */}
          <div className="mb-[20px] sm:mb-0 relative">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              الرقم السري الحالي
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="
                h-[55px] rounded-md text-black dark:text-white
                border border-gray-300 dark:border-[#2a2a2a]
                bg-white dark:bg-[#1d1d1d]
                px-[17px] block w-full outline-0 transition-all
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
              "
              placeholder="ادخل كلمة السر الحالية"
            />
          </div>

          {/* حقل كلمة السر الجديدة */}
          <div className="mb-[20px] sm:mb-0 relative">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              الرقم السري الجديد
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="
                h-[55px] rounded-md text-black dark:text-white
                border border-gray-300 dark:border-[#2a2a2a]
                bg-white dark:bg-[#1d1d1d]
                px-[17px] block w-full outline-0 transition-all
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
              "
              placeholder="ادخل كلمة السر الجديدة"
            />
          </div>

          {/* تأكيد كلمة السر */}
          <div className="sm:col-span-2 mb-[20px] sm:mb-0 relative">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              تاكيد الرقم السري
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="
                h-[55px] rounded-md text-black dark:text-white
                border border-gray-300 dark:border-[#2a2a2a]
                bg-white dark:bg-[#1d1d1d]
                px-[17px] block w-full outline-0 transition-all
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF55]
              "
              placeholder="ادخل تاكيد كلمة السر الجديدة"
            />
          </div>
        </div>

        {/* رسالة الخطأ */}
        {message && (
          <div className="text-sm text-red-500 mt-4">{message}</div>
        )}

        {/* زر التأكيد */}
        <div className="mt-[20px] md:mt-[25px]">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={loading}
            className="
              font-medium inline-block transition-all rounded-md 
              md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] 
              bg-[#6A4CFF] text-white hover:bg-[#5436ff]
              shadow-lg shadow-[#6A4CFF40]
            "
          >
            <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
              <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                check
              </i>
              {loading ? "جاري التحديث..." : "تاكيد"}
            </span>
          </button>
        </div>

      </form>
    </>
  );
};

export default ChangePasswordForm;
