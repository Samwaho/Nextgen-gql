"use client";

import React, { Suspense } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import SignInForm from "@/app/(auth)/sign-in/SignInForm";
import { Button } from "@/components/ui/button";
import { LockIcon, Chrome } from "lucide-react";
import Link from "next/link";

function SignInContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const errorMessages: { [key: string]: string } = {
        missing_auth_code: "Authorization code not received from Google",
        invalid_auth_code: "Invalid authorization code",
        missing_credentials: "Failed to obtain Google credentials",
        invalid_token: "Invalid authentication token",
        access_denied: "Access was denied by Google",
        invalid_request: "Invalid authentication request",
        server_error: "Server error occurred during authentication",
      };
      toast.error(errorMessages[error] || "Authentication failed");
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      toast.error("Base API URL not configured");
      return;
    }
    window.location.href = `${baseUrl}/auth/google/login`;
  };

  return (
    <section className="flex min-h-[100dvh] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-8 glass dark:glass-dark p-8 rounded-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-fuchsia-100 flex items-center justify-center">
            <LockIcon className="h-6 w-6 text-fuchsia-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              className="font-medium text-fuchsia-600 hover:text-fuchsia-500 dark:text-fuchsia-400 dark:hover:text-fuchsia-300 transition-colors duration-200"
              href="/sign-up"
            >
              sign up for a new account
            </Link>
          </p>
        </div>
        <SignInForm />
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6">
            <Button
              className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600 transition-colors duration-200"
              variant="outline"
              onClick={handleGoogleLogin}
            >
              <Chrome className="h-5 w-5" />
              <span className="font-semibold">Sign in with Google</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
