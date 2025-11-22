"use client";

import React, { useState } from "react";
import Image from "next/image";
// import Link from "next/link";

import { useSignIn } from "./useSignIn";
import DarkMode from "./DarkMode";

const SignInForm: React.FC = () => {
  // State variables for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // Custom hook to handle sign-in logic
  const { login, isPending, isError, errorMessage } = useSignIn();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    login({ email, password });
  };

  return (
    <>
      <div
        className="auth-main-content relative h-screen  flex items-center"
        style={{
          backgroundImage: "url(/images/bgsign.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          backgroundPosition: "center",
        }}
      >
        <DarkMode />
        <div className="absolute inset-0 bg-white/50 dark:bg-[#0a0e19]/60 pointer-events-none"></div>

        <div className="relative z-10 mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px] w-full py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-stretch">
            <div className="hidden lg:block xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1 relative overflow-hidden shadow-2xl min-h-[500px] lg:min-h-[600px]">
              <div className="relative w-full h-full rounded-[25px]  bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
                <Image
                  src="/images/hi.gif"
                  alt="sign-in-image"
                  className="rounded-[25px] object-cover w-full h-full "
                  width={646}
                  height={804}
                  priority
                  unoptimized
                />
              </div>
            </div>

            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2 flex items-center">
              <div className="bg-white/80 dark:bg-[#1d1d1d]/80 backdrop-blur-md rounded-2xl p-10 md:p-14 lg:p-16 xl:p-20 shadow-xl border border-gray-200/50 dark:border-[#172036]/50 w-full">
                <button className="transition-none relative flex items-center justify-center outline-none mb-10 mx-auto">
                  <Image
                    src="/images/black-logo.png"
                    alt="logo-icon"
                    width={32}
                    height={32}
                  />
                  <span className="font-bold font-serif text-[#1A1A1A] dark:text-white relative ltr:ml-[10px] rtl:mr-[10px] top-px text-2xl">
                    Lapip Store
                  </span>
                </button>

                <div className="my-[20px] md:my-[28px] lg:my-[32px]">
                  <h1 className="!font-semibold !text-[24px] md:!text-2xl lg:!text-3xl !mb-[7px] md:!mb-[10px] text-[#1A1A1A] dark:text-white">
                    مرحبا
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-base">
                    سجل دخولك للوصول إلى حسابك
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-[24px] relative">
                    <label className="mb-[12px] md:mb-[14px] text-[#1A1A1A] dark:text-white font-medium block text-base">
                      عنوان البريد الإلكتروني
                    </label>
                    <input
                      type="text"
                      className="h-[65px] rounded-lg text-[#1A1A1A] dark:text-white border-2 border-gray-200 dark:border-[#172036] bg-white dark:bg-[#1d1d1d] px-[24px] block w-full outline-0 transition-all placeholder:text-[#8A8A8A] dark:placeholder:text-gray-400 focus:border-[#6A4CFF] focus:ring-2 focus:ring-primary-500/20 shadow-sm text-base"
                      placeholder="example@trezo.com"
                      id="email"
                      autoComplete="email"
                      value={email}
                      disabled={isPending}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-[24px] relative" id="passwordHideShow">
                    <label className="mb-[12px] md:mb-[14px] text-[#1A1A1A] dark:text-white font-medium block text-base">
                      كلمة المرور
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="h-[65px] rounded-lg text-[#1A1A1A] dark:text-white border-2 border-gray-200 dark:border-[#172036] bg-white dark:bg-[#1d1d1d] px-[24px] block w-full outline-0 transition-all placeholder:text-[#8A8A8A] dark:placeholder:text-gray-400 focus:border-[#6A4CFF] focus:ring-2 focus:ring-primary-500/20 shadow-sm text-base"
                      id="password"
                      placeholder="اكتب كلمة المرور"
                      autoComplete="current-password"
                      value={password}
                      disabled={isPending}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute text-lg ltr:right-[24px] rtl:left-[24px] bottom-[14px] transition-all hover:text-[#6A4CFF] text-[#8A8A8A] dark:text-gray-400"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                      }
                    >
                      <i
                        className={`ri-${
                          showPassword ? "eye-line" : "eye-off-line"
                        }`}
                      ></i>
                    </button>
                  </div>

                  {isError && errorMessage && (
                    <div className="text-red-500 text-sm mb-5 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="text-lg block w-full text-center transition-all rounded-lg font-medium mt-[30px] md:mt-[36px] py-[18px] px-[30px] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "#ACCCA7",
                    }}
                    onMouseEnter={(e) => {
                      if (!isPending) {
                        e.currentTarget.style.backgroundColor = "#9BB896";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPending) {
                        e.currentTarget.style.backgroundColor = "#ACCCA7";
                      }
                    }}
                  >
                    <span className="flex items-center justify-center gap-[5px]">
                      {isPending ? (
                        <>
                          <i className="ri-loader-4-line animate-spin"></i>
                          جاري تسجيل الدخول...
                        </>
                      ) : (
                        <>
                          <i className="material-symbols-outlined">login</i>
                          تسجيل الدخول
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* <Link
                  href="/authentication/forgot-password"
                  className="inline-block text-[#6A4CFF] transition-all font-semibold hover:underline mt-4"
                >
                  هل نسيت كلمة السر؟
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
