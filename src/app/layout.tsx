import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

// globals
import "./globals.css";

import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";

import QueryProvider from "@/providers/QueryProvider";

import { Toaster } from "react-hot-toast";

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-body",
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ENS - CMS",
  description: "CMS for ENS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body
        className={`${notoKufiArabic.variable} antialiased`}
        style={{ fontFamily: "var(--font-body), sans-serif" }}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
