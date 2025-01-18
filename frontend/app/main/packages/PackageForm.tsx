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
import CustomSelect from "./CustomSelect";
import { usePackage, PackageInput, ServiceType } from "@/graphql/package";

type FormValues = z.infer<typeof packageSchema>;

const serviceTypeOptions = [
  { value: ServiceType.pppoe, label: "PPPoE" },
  { value: ServiceType.hotspot, label: "Hotspot" },
  { value: ServiceType.static, label: "Static" },
  { value: ServiceType.dhcp, label: "DHCP" },
];

export default function PackageForm() {
  const router = useRouter();
  const { createPackage, isCreating } = usePackage();

  const form = useForm<FormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: 0,
      type: ServiceType.pppoe,
      downloadSpeed: 0,
      uploadSpeed: 0,
      burstDownload: null,
      burstUpload: null,
      thresholdDownload: null,
      thresholdUpload: null,
      burstTime: null,
      radiusProfile: null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const packageInput: PackageInput = {
        name: values.name,
        price: Number(values.price),
        type: values.type as ServiceType,
        rateLimit: {
          rxRate: values.downloadSpeed.toString(),
          txRate: values.uploadSpeed.toString(),
          burstRxRate: values.burstDownload ? values.burstDownload.toString() : null,
          burstTxRate: values.burstUpload ? values.burstUpload.toString() : null,
          burstThresholdRx: values.thresholdDownload ? values.thresholdDownload.toString() : null,
          burstThresholdTx: values.thresholdUpload ? values.thresholdUpload.toString() : null,
          burstTime: values.burstTime ? values.burstTime.toString() : null,
        },
        radiusProfile: values.radiusProfile,
      };

      await createPackage(packageInput);
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
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="burstDownload"
            label="Burst Download (Mbps)"
            placeholder="Enter burst download speed"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="burstUpload"
            label="Burst Upload (Mbps)"
            placeholder="Enter burst upload speed"
            type="number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="thresholdDownload"
            label="Threshold Download (Mbps)"
            placeholder="Enter threshold download speed"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="thresholdUpload"
            label="Threshold Upload (Mbps)"
            placeholder="Enter threshold upload speed"
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
