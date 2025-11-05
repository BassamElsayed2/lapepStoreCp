// app/(protected)/layout.tsx
import LayoutProvider from "@/providers/LayoutProvider";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import ProtectedWrapper from "./ProtectedWrapper";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Note: Authentication check is now handled client-side in ProtectedWrapper
  // because we're using JWT tokens stored in localStorage instead of cookies

  return (
    <ProtectedWrapper>
      <LayoutProvider>
        {children}
        <Toaster />
      </LayoutProvider>
    </ProtectedWrapper>
  );
}
