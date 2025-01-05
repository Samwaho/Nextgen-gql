"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomInput from "./CustomInput";
import { useEmployee } from "@/graphql/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema } from "@/lib/schemas";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = z.infer<typeof staffSchema>;

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Employee", value: "employee" },
] as const;

const CreateStaffForm = () => {
  const router = useRouter();
  const { createEmployee, isCreating } = useEmployee();

  const form = useForm<FormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      phone: "",
      role: "employee",
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      await createEmployee(values);
      toast.success("Staff member created successfully.");
      router.push("/main/staff");
      router.refresh();
    } catch (error) {
      console.error("Error creating staff member:", error);
      toast.error("Failed to create staff member. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="username"
            label="Username"
            placeholder="EXAMPLE09"
            required
          />
          <CustomInput
            control={form.control}
            name="password"
            label="Password"
            placeholder="123xyz"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="name"
            label="Full Name"
            placeholder="John Doe"
            required
          />
          <CustomInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="jd@gmail.com"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <CustomInput
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="Enter Your Phone Number"
            required
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center">
          <Button
            className="w-[200px] justify-center rounded-md bg-gradient-to-tl from-pink-500 to-purple-600 text-white py-2 px-4 hover:opacity-85"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateStaffForm;
