import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login as loginApi } from "@/services/apiauth";

export function useSignIn() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");

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
      // Clear previous error
      setErrorMessage("");
      return await loginApi({ email, password });
    },
    onSuccess: async () => {
      router.refresh(); // ⭐ ضروري علشان توصل الكوكيز للـ server
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "فشل تسجيل الدخول";
      setErrorMessage(message);
      console.error("Login failed:", error);
    },
  });

  return { login, isPending, isError, errorMessage };
}
