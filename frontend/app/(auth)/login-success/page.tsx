"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      toast.error("No authentication token received");
      router.push("/sign-in");
      return;
    }

    const completeAuth = async () => {
      try {
        const success = await googleLogin(token);
        if (success) {
          toast.success("Successfully logged in");
          router.push("/main");
        } else {
          toast.error("Failed to complete authentication");
          router.push("/sign-in");
        }
      } catch {
        toast.error("An error occurred during authentication");
        router.push("/sign-in");
      }
    };

    completeAuth();
  }, [router, searchParams, googleLogin]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing login...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      }
    >
      <LoginSuccessContent />
    </Suspense>
  );
}
