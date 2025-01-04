"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomInput from "./CustomInput";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import { EmployeeInput, useEmployee } from "@/graphql/employee";

const CreateStaffForm = () => {
  const router = useRouter();
  const { createEmployee, isCreating } = useEmployee();

  const defaultValues: EmployeeInput = {
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    role: "employee",
  };

  const form = useForm<EmployeeInput>({
    defaultValues,
  });

  const onSubmit = async (values: EmployeeInput) => {
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
          />
          <CustomInput
            control={form.control}
            name="password"
            label="Password"
            placeholder="123xyz"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="name"
            label="Full Name"
            placeholder="John Doe"
          />
          <CustomInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="jd@gmail.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <CustomInput
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="Enter Your Phone Number"
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-1">Role</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between h-10",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Select Role"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search role..." />
                      <CommandList>
                        <CommandEmpty>No role found.</CommandEmpty>
                        <CommandGroup>
                          {["admin", "employee"].map((role) => (
                            <CommandItem
                              value={role}
                              key={role}
                              onSelect={() => {
                                form.setValue(
                                  "role",
                                  role as "admin" | "employee"
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  role === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {role}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
