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

type FormValues = z.infer<typeof packageSchema>;

const CreatePackageForm = () => {
  const router = useRouter();
  const { createPackage, isCreating } = usePackage();

  const form = useForm<FormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: 0,
      bandwidth: "",
      type: "",
      downloadSpeed: 0,
      uploadSpeed: 0,
      burstDownload: 0,
      burstUpload: 0,
      thresholdDownload: 0,
      thresholdUpload: 0,
      burstTime: 0,
      radiusProfile: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert string values to numbers for numeric fields
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

      const formattedValues: PackageInput = {
        ...values,
        ...Object.fromEntries(
          numericFields.map((field) => [field, Number(values[field])])
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

export default CreatePackageForm;
