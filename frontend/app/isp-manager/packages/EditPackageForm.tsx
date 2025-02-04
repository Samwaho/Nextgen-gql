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
import { Package, usePackage } from "@/graphql/package";

type FormValues = z.infer<typeof packageSchema>;

type ServiceType = "pppoe" | "hotspot" | "dhcp" | "static";

interface Option {
  value: ServiceType;
  label: string;
}

const SERVICE_TYPES: Option[] = [
  { value: "pppoe", label: "PPPoE" },
  { value: "hotspot", label: "Hotspot" },
  { value: "dhcp", label: "DHCP" },
  { value: "static", label: "Static" },
];

interface EditPackageFormProps {
  package: Package & {
    serviceType: ServiceType | null;
  };
}

export default function EditPackageForm({
  package: initialPackage,
}: EditPackageFormProps) {
  const router = useRouter();
  const { updatePackage, isUpdating } = usePackage();

  const form = useForm<FormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: initialPackage.name,
      price: initialPackage.price,
      downloadSpeed: initialPackage.downloadSpeed,
      uploadSpeed: initialPackage.uploadSpeed,
      burstDownload: initialPackage.burstDownload,
      burstUpload: initialPackage.burstUpload,
      thresholdDownload: initialPackage.thresholdDownload,
      thresholdUpload: initialPackage.thresholdUpload,
      burstTime: initialPackage.burstTime,
      serviceType: initialPackage.serviceType as ServiceType | null,
      addressPool: initialPackage.addressPool,
      sessionTimeout: initialPackage.sessionTimeout,
      idleTimeout: initialPackage.idleTimeout,
      priority: initialPackage.priority,
      vlanId: initialPackage.vlanId,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert string values to numbers for numeric fields and handle null values
      const numericFields = [
        "price",
        "downloadSpeed",
        "uploadSpeed",
        "burstDownload",
        "burstUpload",
        "thresholdDownload",
        "thresholdUpload",
        "burstTime",
        "sessionTimeout",
        "idleTimeout",
        "priority",
        "vlanId",
      ] as const;

      const formattedValues = {
        ...values,
        ...Object.fromEntries(
          numericFields.map((field) => [
            field,
            values[field] !== null ? Number(values[field]) : null,
          ])
        ),
      };

      await updatePackage(initialPackage.id, formattedValues);
      toast.success("Package updated successfully");
      router.push("/isp-manager/packages");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update package");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
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

        {/* Network Settings */}
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="downloadSpeed"
            label="Download Speed (Mbps)"
            placeholder="Enter download speed"
            type="number"
            required
          />
          <CustomInput
            control={form.control}
            name="uploadSpeed"
            label="Upload Speed (Mbps)"
            placeholder="Enter upload speed"
            type="number"
            required
          />
        </div>

        {/* Burst Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="burstDownload"
            label="Burst Download (Mbps)"
            placeholder="Enter burst download"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="burstUpload"
            label="Burst Upload (Mbps)"
            placeholder="Enter burst upload"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="thresholdDownload"
            label="Threshold Download (Mbps)"
            placeholder="Enter threshold download"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="thresholdUpload"
            label="Threshold Upload (Mbps)"
            placeholder="Enter threshold upload"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="burstTime"
            label="Burst Time (seconds)"
            placeholder="Enter burst time"
            type="number"
          />
        </div>

        {/* MikroTik Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <CustomSelect
            control={form.control}
            name="serviceType"
            label="Service Type"
            placeholder="Select service type"
            options={SERVICE_TYPES}
          />
          <CustomInput
            control={form.control}
            name="addressPool"
            label="Address Pool"
            placeholder="Enter IP address pool name"
          />
        </div>

        {/* Session Management */}
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="sessionTimeout"
            label="Session Timeout (seconds)"
            placeholder="Enter session timeout"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="idleTimeout"
            label="Idle Timeout (seconds)"
            placeholder="Enter idle timeout"
            type="number"
          />
        </div>

        {/* QoS and VLAN */}
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="priority"
            label="Priority (1-8)"
            placeholder="Enter queue priority"
            type="number"
            min={1}
            max={8}
          />
          <CustomInput
            control={form.control}
            name="vlanId"
            label="VLAN ID"
            placeholder="Enter VLAN ID"
            type="number"
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
