"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

const LoginSuccess = () => {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const isProcessing = useRef(false);

  useEffect(() => {
    const handleLoginSuccess = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
          toast.error("No authentication token received");
          router.push("/sign-in");
          return;
        }

        const success = await googleLogin(token);
        if (success) {
          toast.success("Google login successful");
          router.push("/main");
        } else {
          toast.error("Failed to authenticate with Google");
          router.push("/sign-in");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Login failed. Please try again."
        );
        router.push("/sign-in");
      } finally {
        isProcessing.current = false;
      }
    };

    handleLoginSuccess();
  }, [router, googleLogin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Loader2Icon size={48} className="animate-spin text-fuchsia-600 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Logging in...
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Please wait while we complete your login...
      </p>
    </div>
  );
};

export default LoginSuccess;
