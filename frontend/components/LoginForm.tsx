"use client";

import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "@/graphql/mutations";
import { toast } from "sonner";
import { useRouter } from "next/router";

export function LoginForm() {
  const [loginUser] = useMutation(LOGIN_USER);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const { data } = await loginUser({
        variables: {
          email,
          password,
        },
      });

      if (data?.login?.token) {
        toast.success("Login successful!");
        router.push("/main");
      }
    } catch {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return <form onSubmit={handleSubmit}>{/* Your form fields */}</form>;
}
