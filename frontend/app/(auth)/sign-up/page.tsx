"use client";
import AuroraBackground from "@/components/AuroraBackground";
import SignUpForm from "./SignUpForm";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { LockIcon } from "lucide-react";
import Link from "next/link";

const SignUp = () => {
  const handleGoogleSignUp = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/login`;
  };

  return (
    <AuroraBackground>
      <section className="flex min-h-[100dvh] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-8 glass dark:glass-dark p-8 rounded-lg">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-fuchsia-100 flex items-center justify-center">
              <LockIcon className="h-6 w-6 text-fuchsia-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                className="font-medium text-fuchsia-600 hover:text-fuchsia-500 dark:text-fuchsia-400 dark:hover:text-fuchsia-300 transition-colors duration-200"
                href="/sign-in"
              >
                Sign in
              </Link>
            </p>
          </div>
          <SignUpForm />
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
                onClick={handleGoogleSignUp}
              >
                <Chrome className="h-5 w-5" />
                <span className="font-semibold">Google</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AuroraBackground>
  );
};

export default SignUp;
