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
import CustomSelect from "./CustomSelect";
import { Package, usePackage, ServiceType, toMikrotikFormat, fromMikrotikFormat } from "@/graphql/package";

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

const serviceTypeOptions = [
  { value: ServiceType.pppoe, label: "PPPoE" },
  { value: ServiceType.hotspot, label: "Hotspot" },
  { value: ServiceType.static, label: "Static" },
  { value: ServiceType.dhcp, label: "DHCP" },
];

export default function EditPackageForm({
  package: initialPackage,
}: EditPackageFormProps) {
  const router = useRouter();
  const { updatePackage, isUpdating } = usePackage();

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(editPackageSchema),
    defaultValues: {
      name: initialPackage.name || "",
      price: initialPackage.price || 0,
      type: initialPackage.type || ServiceType.pppoe,
      downloadSpeed: initialPackage.rateLimit ? Number(fromMikrotikFormat(initialPackage.rateLimit.rxRate).value) : 0,
      uploadSpeed: initialPackage.rateLimit ? Number(fromMikrotikFormat(initialPackage.rateLimit.txRate).value) : 0,
      burstDownload: initialPackage.rateLimit?.burstRxRate ? Number(fromMikrotikFormat(initialPackage.rateLimit.burstRxRate).value) : null,
      burstUpload: initialPackage.rateLimit?.burstTxRate ? Number(fromMikrotikFormat(initialPackage.rateLimit.burstTxRate).value) : null,
      thresholdDownload: initialPackage.rateLimit?.burstThresholdRx ? Number(fromMikrotikFormat(initialPackage.rateLimit.burstThresholdRx).value) : null,
      thresholdUpload: initialPackage.rateLimit?.burstThresholdTx ? Number(fromMikrotikFormat(initialPackage.rateLimit.burstThresholdTx).value) : null,
      burstTime: initialPackage.rateLimit?.burstTime ? Number(initialPackage.rateLimit.burstTime.replace('s', '')) : null,
      radiusProfile: initialPackage.radiusProfile,
    },
  });

  const onSubmit = async (values: PackageFormValues) => {
    try {
      const updateData = {
        name: values.name,
        price: Number(values.price),
        type: values.type,
        rateLimit: {
          rxRate: toMikrotikFormat(values.downloadSpeed),
          txRate: toMikrotikFormat(values.uploadSpeed),
          burstRxRate: values.burstDownload ? toMikrotikFormat(values.burstDownload) : null,
          burstTxRate: values.burstUpload ? toMikrotikFormat(values.burstUpload) : null,
          burstThresholdRx: values.thresholdDownload ? toMikrotikFormat(values.thresholdDownload) : null,
          burstThresholdTx: values.thresholdUpload ? toMikrotikFormat(values.thresholdUpload) : null,
          burstTime: values.burstTime ? `${values.burstTime}s` : null,
        },
        radiusProfile: values.radiusProfile,
      };

      await updatePackage(initialPackage.id, updateData);
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
          <CustomSelect
            control={form.control}
            name="type"
            label="Service Type"
            placeholder="Select service type"
            options={serviceTypeOptions}
            required
          />
          <CustomInput
            control={form.control}
            name="downloadSpeed"
            label="Download Speed (Mbps)"
            placeholder="Enter download speed"
            type="number"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="uploadSpeed"
            label="Upload Speed (Mbps)"
            placeholder="Enter upload speed"
            type="number"
            required
          />
          <CustomInput
            control={form.control}
            name="burstDownload"
            label="Burst Download (Mbps)"
            placeholder="Enter burst download speed"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="burstUpload"
            label="Burst Upload (Mbps)"
            placeholder="Enter burst upload speed"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="thresholdDownload"
            label="Threshold Download (Mbps)"
            placeholder="Enter threshold download speed"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="thresholdUpload"
            label="Threshold Upload (Mbps)"
            placeholder="Enter threshold upload speed"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="burstTime"
            label="Burst Time (seconds)"
            placeholder="Enter burst time"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="radiusProfile"
            label="RADIUS Profile Name"
            placeholder="Leave empty to use package name"
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
