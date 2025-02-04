"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useStation } from "@/graphql/station";
import { stationSchema } from "@/lib/schemas";
import { z } from "zod";
import CustomInput from "./CustomInput";
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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Station } from "@/graphql/station";

type FormValues = z.infer<typeof stationSchema>;

interface StationFormProps {
  station?: Station;
  isEditing?: boolean;
}

const buildingTypes = [
  "apartment",
  "office",
  "house",
  "mall",
  "hotel",
  "school",
  "other",
];

export default function StationForm({ station, isEditing }: StationFormProps) {
  const router = useRouter();
  const { createStation, updateStation, isCreating, isUpdating } = useStation();
  const [mounted, setMounted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      name: station?.name || "",
      location: station?.location || "",
      address: station?.address || "",
      coordinates: station?.coordinates || "",
      buildingType: station?.buildingType || "",
      contactPerson: station?.contactPerson || "",
      contactPhone: station?.contactPhone || "",
      notes: station?.notes || "",
      status: station?.status || "active",
    },
  });

  // Only show the form after first mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && station) {
        await updateStation(station.id, values);
        toast.success("Station updated successfully");
      } else {
        await createStation(values);
        toast.success("Station created successfully");
      }
      router.push("/isp-manager/stations");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "create"} station`);
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
            placeholder="Enter station name"
            required
          />
          <CustomInput
            control={form.control}
            name="location"
            label="Location"
            placeholder="Enter location"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="address"
            label="Address"
            placeholder="Enter full address"
            required
          />
          <CustomInput
            control={form.control}
            name="coordinates"
            label="Coordinates"
            placeholder="latitude,longitude"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="buildingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Building Type
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  required
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select building type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buildingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
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
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue="active"
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="contactPerson"
            label="Contact Person"
            placeholder="Enter contact person name"
          />
          <CustomInput
            control={form.control}
            name="contactPhone"
            label="Contact Phone"
            placeholder="Enter contact phone number"
          />
        </div>

        <div className="grid grid-cols-1">
          <CustomInput
            control={form.control}
            name="notes"
            label="Notes"
            placeholder="Enter any additional notes"
          />
        </div>

        <div className="flex justify-center">
          <Button
            className="w-[200px] justify-center rounded-md bg-gradient-to-tl from-pink-500 to-purple-600 text-white py-2 px-4 hover:opacity-85"
            type="submit"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update" : "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
