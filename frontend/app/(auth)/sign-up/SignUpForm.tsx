"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { signUpFormSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomInput from "./CustomInput";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  SIGNUP_MUTATION,
  type AuthResponse,
  setAuthToken,
} from "@/graphql/auth";

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

const SignUpForm = () => {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      address: "",
      phone: "",
    },
  });

  const [signup, { loading: isPending }] = useMutation<
    { signup: AuthResponse },
    { input: SignUpFormValues }
  >(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      if (data.signup.success && data.signup.token) {
        setAuthToken(data.signup.token.accessToken);
        toast.success("Sign Up successful");
        router.push("/main");
      } else {
        toast.error(data.signup.message || "Sign up failed");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Sign up failed");
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      await signup({
        variables: {
          input: values,
        },
      });
    } catch {
      // Error is handled by onError callback
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <CustomInput<SignUpFormValues>
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter Your Email"
            type="email"
          />
          <CustomInput<SignUpFormValues>
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter Your Password"
            type="password"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput<SignUpFormValues>
            control={form.control}
            name="name"
            label="Full Name"
            placeholder="Enter Your Name"
          />
          <CustomInput<SignUpFormValues>
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="Enter Your Phone Number"
          />
        </div>
        <CustomInput<SignUpFormValues>
          control={form.control}
          name="address"
          label="Address"
          placeholder="Enter Your Address"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              className="h-4 w-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 dark:bg-gray-800 dark:text-fuchsia-400 dark:focus:ring-fuchsia-400"
              id="terms"
              name="terms"
            />
            <Label
              className="ml-2 block text-sm text-fuchsia-600 underline cursor-pointer dark:text-gray-300"
              htmlFor="terms"
            >
              Terms & Conditions
            </Label>
          </div>
          <div className="text-sm">
            <Link
              className="font-medium text-fuchsia-600 hover:text-fuchsia-500 dark:text-fuchsia-400 dark:hover:text-fuchsia-300"
              href="/sign-in"
            >
              Already have an account?
            </Link>
          </div>
        </div>
        <div>
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
              "Create Account"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
