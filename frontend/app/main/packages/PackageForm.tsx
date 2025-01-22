"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { packageSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomInput from "./CustomInput";
import { usePackage, PackageInput } from "@/graphql/package";
import CustomSelect from "./CustomSelect";

type FormValues = z.infer<typeof packageSchema>;

const SERVICE_TYPES = [
  { value: "pppoe", label: "PPPoE" },
  { value: "hotspot", label: "Hotspot" },
  { value: "dhcp", label: "DHCP" },
  { value: "static", label: "Static" },
];

export default function PackageForm() {
  const router = useRouter();
  const { createPackage, isCreating } = usePackage();

  const form = useForm<FormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: 0,
      // Network settings
      downloadSpeed: 0,
      uploadSpeed: 0,
      // Burst configuration
      burstDownload: null,
      burstUpload: null,
      thresholdDownload: null,
      thresholdUpload: null,
      burstTime: null,
      // MikroTik service configuration
      serviceType: null,
      addressPool: null,
      // Session management
      sessionTimeout: null,
      idleTimeout: null,
      // QoS and VLAN
      priority: null,
      vlanId: null,
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

      const formattedValues: PackageInput = {
        ...values,
        ...Object.fromEntries(
          numericFields.map((field) => [
            field,
            values[field] !== null ? Number(values[field]) : null,
          ])
        ),
      };

      await createPackage(formattedValues);
      toast.success("Package created successfully");
      router.push("/main/packages");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create package");
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
}
