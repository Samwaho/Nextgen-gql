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
import { Employee, useEmployee } from "@/graphql/employee";
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

// Create a partial version of staffSchema where all fields are optional except role
const editStaffSchema = staffSchema.partial().required({ role: true });
type FormData = z.infer<typeof editStaffSchema>;

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Employee", value: "employee" },
] as const;

const EditStaffForm = ({ staff }: { staff: Employee }) => {
  const router = useRouter();
  const { updateEmployee, isUpdating } = useEmployee();

  const form = useForm<FormData>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      name: staff.name,
      email: staff.email,
      username: staff.username,
      phone: staff.phone,
      role: staff.role,
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      // Only include fields that have values
      const updateData = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== "")
      );

      await updateEmployee(staff.id, updateData);
      toast.success("Staff member updated successfully.");
      router.push("/isp-manager/staff");
      router.refresh();
    } catch (error) {
      console.error("Error updating staff member:", error);
      toast.error("Failed to update staff member. Please try again.");
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
            name="name"
            label="Full Name"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="jd@gmail.com"
            required
          />
          <CustomInput
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="Enter Your Phone Number"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditStaffForm;
