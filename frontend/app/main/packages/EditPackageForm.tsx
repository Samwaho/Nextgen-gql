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

type PackageFormValues = z.infer<typeof packageSchema>;

interface EditPackageFormProps {
  package: Package;
}

export default function EditPackageForm({
  package: initialPackage,
}: EditPackageFormProps) {
  const router = useRouter();
  const { updatePackage, isUpdating } = usePackage();

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: initialPackage.name,
      bandwidth: initialPackage.bandwidth,
      price: initialPackage.price,
      type: initialPackage.type,
      downloadSpeed: initialPackage.downloadSpeed,
      uploadSpeed: initialPackage.uploadSpeed,
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
      const input = {
        ...values,
        burstDownload: values.burstDownload || undefined,
        burstUpload: values.burstUpload || undefined,
        thresholdDownload: values.thresholdDownload || undefined,
        thresholdUpload: values.thresholdUpload || undefined,
        burstTime: values.burstTime || undefined,
        radiusProfile: values.radiusProfile || undefined,
      };

      await updatePackage(initialPackage.id, input);
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
          />
          <CustomInput
            control={form.control}
            name="price"
            label="Price"
            placeholder="Enter price"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="bandwidth"
            label="Bandwidth"
            placeholder="Enter bandwidth in the format of 5M/5M"
          />
          <CustomInput
            control={form.control}
            name="type"
            label="Type"
            placeholder="Enter type"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="downloadSpeed"
            label="Download Speed"
            placeholder="Enter download speed"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="uploadSpeed"
            label="Upload Speed"
            placeholder="Enter upload speed"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="burstDownload"
            label="Burst Download"
            placeholder="Enter burst download"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="burstUpload"
            label="Burst Upload"
            placeholder="Enter burst upload"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="thresholdDownload"
            label="Threshold Download"
            placeholder="Enter threshold download"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="thresholdUpload"
            label="Threshold Upload"
            placeholder="Enter threshold upload"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="burstTime"
            label="Burst Time"
            placeholder="Enter burst time"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="radiusProfile"
            label="Radius Profile"
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
