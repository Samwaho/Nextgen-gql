"use client";

import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "@/graphql/mutations";
import { toast } from "sonner";

export function LoginForm() {
  const [loginUser, { loading }] = useMutation(LOGIN_USER);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { data } = await loginUser({
        variables: {
          email: formData.get("email"),
          password: formData.get("password"),
        },
      });

      if (data.login.success) {
        toast.success(data.login.message);
        // Handle successful login (e.g., redirect)
      } else {
        toast.error(data.login.message);
      }
    } catch (error) {
      toast.error("An error occurred during login");
    }
  };

  return <form onSubmit={handleSubmit}>{/* Your form fields */}</form>;
}
