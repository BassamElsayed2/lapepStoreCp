import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { login as loginApi } from "@/services/apiauth";

export function useSignIn() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const lastRequestTimeRef = useRef<number>(0);
  const REQUEST_COOLDOWN = 2000; // 2 seconds cooldown between requests

  const {
    mutate: login,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      // Prevent rapid successive requests
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTimeRef.current;

      if (timeSinceLastRequest < REQUEST_COOLDOWN) {
        const waitTime = REQUEST_COOLDOWN - timeSinceLastRequest;
        throw new Error(
          `يرجى الانتظار ${Math.ceil(
            waitTime / 1000
          )} ثانية قبل المحاولة مرة أخرى`
        );
      }

      lastRequestTimeRef.current = now;

      // Clear previous error
      setErrorMessage("");
      return await loginApi({ email, password });
    },
    onSuccess: async () => {
      // استخدام window.location.href لضمان حدوث full page reload
      // وتحميل الـ cookies والـ localStorage بشكل صحيح
      window.location.href = "/dashboard";
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "فشل تسجيل الدخول";
      setErrorMessage(message);
      console.error("Login failed:", error);
    },
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors or validation errors
      if (
        error instanceof Error &&
        (error.message.includes("طلبات كثيرة") ||
          error.message.includes("الانتظار") ||
          error.message.includes("البريد الإلكتروني") ||
          error.message.includes("يجب إدخال"))
      ) {
        return false;
      }
      // Only retry once for other errors
      return failureCount < 1;
    },
    retryDelay: 2000, // Wait 2 seconds before retry
  });

  return { login, isPending, isError, errorMessage };
}
