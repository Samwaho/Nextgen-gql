"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { signInFormSchema } from "@/lib/schemas";
import CustomInput from "./CustomInput";
import {
  LOGIN_MUTATION,
  type AuthResponse,
  setAuthToken,
  isValidToken,
} from "@/graphql/auth";

type SignInFormValues = z.infer<typeof signInFormSchema>;

const SignInForm = () => {
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [login, { loading: isPending }] = useMutation<
    { login: AuthResponse },
    { input: { email: string; password: string } }
  >(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data.login.success && data.login.token) {
        const token = data.login.token.accessToken;

        if (isValidToken(token) && setAuthToken(token)) {
          toast.success("Sign In Successful");
          router.push("/");
        } else {
          toast.error("Failed to save authentication token");
        }
      } else {
        toast.error(data.login.message || "Authentication failed");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Authentication failed");
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await login({
        variables: {
          input: {
            email: data.username,
            password: data.password,
          },
        },
      });
    } catch {
      // Error is handled by onError callback
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CustomInput<SignInFormValues>
          control={form.control}
          name="username"
          label="Email"
          placeholder="Enter Your Email"
          type="email"
        />
        <CustomInput<SignInFormValues>
          control={form.control}
          name="password"
          label="Password"
          placeholder="Enter Your Password"
          type="password"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              className="h-4 w-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 dark:bg-gray-800 dark:text-fuchsia-400 dark:focus:ring-fuchsia-400"
              id="remember-me"
              name="remember-me"
              aria-label="Remember me"
            />
            <Label
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              htmlFor="remember-me"
            >
              Remember me
            </Label>
          </div>
          <Link
            className="text-sm font-medium text-fuchsia-600 hover:text-fuchsia-500 dark:text-fuchsia-400 dark:hover:text-fuchsia-300"
            href="/forgot-password"
          >
            Forgot your password?
          </Link>
        </div>

        <Button
          className="flex w-full justify-center rounded-md bg-gradient-to-tl from-pink-500 to-purple-600 text-white py-2 px-4 hover:opacity-85"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2Icon size={20} className="animate-spin mr-2" />
              Loading...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SignInForm;
