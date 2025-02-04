"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCustomer } from "@/graphql/customer";
import { customerSchema } from "@/lib/schemas";
import { z } from "zod";
import CustomInput from "./CustomInput";
import { useQuery } from "@apollo/client";
import { GET_PACKAGES, Package } from "@/graphql/package";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { TimePicker } from "@/components/shared/time-picker";
import { useEffect, useState } from "react";
import { GET_STATIONS } from "@/graphql/station";

// Create a modified schema for edit mode where password is optional
const editCustomerSchema = customerSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type FormValues = z.infer<typeof editCustomerSchema>;

interface PackagesData {
  packages: Package[];
}

interface StationsData {
  stations: {
    id: string;
    name: string;
    location: string;
    buildingType: string;
  }[];
}

interface EditCustomerFormProps {
  customer: {
    id: string;
    name: string;
    email: string;
    address: string;
    phone: string;
    username: string;
    expiry: string;
    package: {
      id: string;
      name: string;
      serviceType: string;
    } | null;
    station: {
      id: string;
      name: string;
      location: string;
      address: string;
    } | null;
    password: string;
  };
}

export default function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const router = useRouter();
  const { updateCustomer, isUpdating } = useCustomer();
  const { data: packagesData, loading: packagesLoading } =
    useQuery<PackagesData>(GET_PACKAGES);
  const { data: stationsData, loading: stationsLoading } = useQuery<StationsData>(GET_STATIONS);
  const [mounted, setMounted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      address: customer?.address || "",
      phone: customer?.phone || "",
      username: customer?.username || "",
      expiry: customer?.expiry || new Date().toISOString(),
      package: customer?.package?.id || null,
      station: customer?.station?.id || null,
      password: customer?.password || "",
    },
  });

  // Only show the form after first mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const updateData = Object.fromEntries(
        Object.entries(values).filter(([key, value]) => {
          if (key === "package") return true;
          return value !== "" && value !== null;
        })
      );

      await updateCustomer(customer.id, updateData);
      toast.success("Customer updated successfully");
      router.push("/isp-manager/customers");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update customer");
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="name"
            label="Name"
            placeholder="Enter name"
            required
          />
          <CustomInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter email"
            type="email"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="address"
            label="Address"
            placeholder="Enter address"
            required
          />
          <CustomInput
            control={form.control}
            name="phone"
            label="Phone"
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="username"
            label="PPPoE Username"
            placeholder="Enter PPPoE username"
            required
          />
          <CustomInput
            control={form.control}
            name="password"
            label="PPPoE Password"
            placeholder="Enter PPPoE password"
            type="text"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="package"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Internet Package
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select
                  disabled={packagesLoading}
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  required
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select internet package">
                        {(() => {
                          const selectedPackage = packagesData?.packages.find(p => p.id === field.value);
                          return selectedPackage 
                            ? `${selectedPackage.name} - ${selectedPackage.serviceType}`
                            : "Select internet package";
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {packagesData?.packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.serviceType}
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
            name="station"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Station
                </FormLabel>
                <Select
                  disabled={stationsLoading}
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select station">
                        {(() => {
                          const selectedStation = stationsData?.stations.find(s => s.id === field.value);
                          return selectedStation 
                            ? `${selectedStation.name} - ${selectedStation.location} (${selectedStation.buildingType})`
                            : "Select station";
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stationsData?.stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name} - {station.location} ({station.buildingType})
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
            name="expiry"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Expiry Date
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal truncate",
                          !field.value && "text-muted-foreground"
                        )}
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {field.value ? (
                          <span className="block truncate">
                            {format(new Date(field.value), "MMM d, yyyy HH:mm")}
                          </span>
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentValue = field.value
                            ? new Date(field.value)
                            : new Date();
                          date.setHours(currentValue.getHours());
                          date.setMinutes(currentValue.getMinutes());
                          date.setSeconds(0); // Always set seconds to 0
                          field.onChange(date.toISOString());
                        }
                      }}
                      disabled={(date) =>
                        date < startOfDay(new Date()) ||
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                    <div className="p-3 border-t border-border">
                      <TimePicker
                        setDate={(date) => {
                          if (date) {
                            date.setSeconds(0); // Always set seconds to 0
                            field.onChange(date.toISOString());
                          }
                        }}
                        date={field.value ? new Date(field.value) : new Date()}
                      />
                    </div>
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
}
