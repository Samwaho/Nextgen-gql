"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useTicket } from "@/graphql/ticket";
import CustomInput from "./CustomInput";
import { useQuery } from "@apollo/client";
import { GET_CUSTOMERS } from "@/graphql/customer";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ticketSchema } from "@/lib/schemas";
import { z } from "zod";

// Create a modified schema for edit mode
const editTicketSchema = ticketSchema.extend({
  assignedEmployee: z.string().nullable(),
});

type TicketFormValues = z.infer<typeof editTicketSchema>;

interface CustomersData {
  customers: Array<{
    id: string;
    name: string;
    username: string;
  }>;
}

interface EditTicketFormProps {
  ticket: {
    id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in-progress" | "closed";
    customer: string;
    assignedEmployee: string | null;
  };
}

export default function EditTicketForm({ ticket }: EditTicketFormProps) {
  const router = useRouter();
  const { updateTicket, isUpdating } = useTicket();
  const { data: customersData, loading: customersLoading } =
    useQuery<CustomersData>(GET_CUSTOMERS);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(editTicketSchema),
    defaultValues: {
      title: ticket?.title || "",
      description: ticket?.description || "",
      priority: ticket?.priority || "medium",
      status: ticket?.status || "open",
      customer: ticket?.customer || "",
      assignedEmployee: ticket?.assignedEmployee,
    },
  });

  const onSubmit = async (values: TicketFormValues) => {
    if (!ticket?.id) {
      toast.error("Ticket ID is required");
      return;
    }

    try {
      const updateData = {
        ...values,
        assignedEmployee: values.assignedEmployee || null,
      };

      await updateTicket(ticket.id, updateData);
      toast.success("Ticket updated successfully");
      router.push("/main/tickets");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update ticket");
      }
    }
  };

  if (!ticket) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="title"
            label="Title"
            placeholder="Enter ticket title"
            required
          />
          <CustomInput
            control={form.control}
            name="description"
            label="Description"
            placeholder="Enter ticket description"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Priority
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["low", "medium", "high"].map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["open", "in-progress", "closed"].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() +
                          status.slice(1).replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Customer
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select
                  disabled={customersLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customersData?.customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.username} - {customer.name}
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
            disabled={isUpdating || customersLoading}
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
}
