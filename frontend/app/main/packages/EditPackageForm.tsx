"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { packageSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import CustomInput from "./CustomInput";
import { Package, usePackage } from "@/graphql/package";

// Create a modified schema for edit mode where optional fields are truly optional
const editPackageSchema = packageSchema.extend({
  burstDownload: z.coerce.number().min(0).nullable(),
  burstUpload: z.coerce.number().min(0).nullable(),
  thresholdDownload: z.coerce.number().min(0).nullable(),
  thresholdUpload: z.coerce.number().min(0).nullable(),
  burstTime: z.coerce.number().min(0).nullable(),
  radiusProfile: z.string().nullable(),
});

type PackageFormValues = z.infer<typeof editPackageSchema>;

interface EditPackageFormProps {
  package: Package;
}

export default function EditPackageForm({
  package: initialPackage,
}: EditPackageFormProps) {
  const router = useRouter();
  const { updatePackage, isUpdating } = usePackage();

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(editPackageSchema),
    defaultValues: {
      name: initialPackage.name || "",
      bandwidth: initialPackage.bandwidth || "",
      price: initialPackage.price || 0,
      type: initialPackage.type || "",
      downloadSpeed: initialPackage.downloadSpeed || 0,
      uploadSpeed: initialPackage.uploadSpeed || 0,
      burstDownload: initialPackage.burstDownload,
      burstUpload: initialPackage.burstUpload,
      thresholdDownload: initialPackage.thresholdDownload,
      thresholdUpload: initialPackage.thresholdUpload,
      burstTime: initialPackage.burstTime,
      radiusProfile: initialPackage.radiusProfile,
    },
  });

  const onSubmit = async (values: PackageFormValues) => {
    try {
      // Convert numeric fields and handle null values
      const numericFields = [
        "price",
        "downloadSpeed",
        "uploadSpeed",
        "burstDownload",
        "burstUpload",
        "thresholdDownload",
        "thresholdUpload",
        "burstTime",
      ] as const;

      const updateData = {
        ...values,
        ...Object.fromEntries(
          numericFields.map((field) => [
            field,
            values[field] ? Number(values[field]) : null,
          ])
        ),
      };

      // Remove empty/null values except for required fields
      const requiredFields = [
        "name",
        "bandwidth",
        "price",
        "type",
        "downloadSpeed",
        "uploadSpeed",
      ];
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(
          ([key, value]) =>
            requiredFields.includes(key) || (value !== null && value !== "")
        )
      );

      await updatePackage(initialPackage.id, cleanedData);
      toast.success("Package updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Failed to update package. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="name"
            label="Package Name"
            placeholder="Enter package name"
            required
          />
          <CustomInput
            control={form.control}
            name="price"
            label="Price"
            placeholder="Enter price"
            type="number"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="bandwidth"
            label="Bandwidth"
            placeholder="Enter bandwidth in the format of 5M/5M"
            required
          />
          <CustomInput
            control={form.control}
            name="type"
            label="Type"
            placeholder="Enter type"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="downloadSpeed"
            label="Download Speed"
            placeholder="Enter download speed"
            type="number"
            required
          />
          <CustomInput
            control={form.control}
            name="uploadSpeed"
            label="Upload Speed"
            placeholder="Enter upload speed"
            type="number"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="burstDownload"
            label="Burst Download (Optional)"
            placeholder="Enter burst download"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="burstUpload"
            label="Burst Upload (Optional)"
            placeholder="Enter burst upload"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="thresholdDownload"
            label="Threshold Download (Optional)"
            placeholder="Enter threshold download"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="thresholdUpload"
            label="Threshold Upload (Optional)"
            placeholder="Enter threshold upload"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="burstTime"
            label="Burst Time (Optional)"
            placeholder="Enter burst time"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="radiusProfile"
            label="Radius Profile (Optional)"
            placeholder="Enter radius profile"
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
              "Update Package"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
