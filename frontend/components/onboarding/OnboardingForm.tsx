"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { agencySchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomInput from "./CustomInput";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAgency, AgencyInput, Agency } from "@/graphql/agency";

type AgencyProps = z.infer<typeof agencySchema>;

interface OnboardingFormProps {
  initialData?: Agency;
}

const OnboardingForm = ({ initialData }: OnboardingFormProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [showAlert, setShowAlert] = useState(false);
  const { createAgency, updateAgency, isCreating, isUpdating } = useAgency();

  const form = useForm<AgencyProps>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      logo: "",
      banner: "",
      description: "",
      mpesaConsumerKey: "",
      mpesaConsumerSecret: "",
      mpesaShortcode: "",
      mpesaPasskey: "",
      mpesaEnv: "sandbox",
      mpesaB2cShortcode: "",
      mpesaB2bShortcode: "",
      mpesaInitiatorName: "",
      mpesaInitiatorPassword: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        address: initialData.address || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        website: initialData.website || "",
        logo: initialData.logo || "",
        banner: initialData.banner || "",
        description: initialData.description || "",
        mpesaShortcode: initialData.mpesaShortcode || "",
        mpesaEnv: initialData.mpesaEnv || "sandbox",
        mpesaB2cShortcode: initialData.mpesaB2cShortcode || "",
        mpesaB2bShortcode: initialData.mpesaB2bShortcode || "",
        mpesaInitiatorName: initialData.mpesaInitiatorName || "",
        mpesaConsumerKey: "",
        mpesaConsumerSecret: "",
        mpesaPasskey: "",
        mpesaInitiatorPassword: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: AgencyProps) => {
    // Check only required fields
    const requiredFields = {
      name: values.name,
      email: values.email,
      mpesaShortcode: values.mpesaShortcode,
      mpesaEnv: values.mpesaEnv,
      mpesaInitiatorName: values.mpesaInitiatorName,
    };

    const isRequiredFieldsComplete = Object.values(requiredFields).every(
      (value) => value && value !== ""
    );

    if (isRequiredFieldsComplete) {
      try {
        if (initialData) {
          // For updates, only include fields that have values
          const updateData: Partial<AgencyInput> = {
            name: values.name,
            email: values.email,
            mpesaShortcode: values.mpesaShortcode,
            mpesaEnv: values.mpesaEnv,
            mpesaInitiatorName: values.mpesaInitiatorName,
          };

          // Only include optional fields if they have values
          if (values.address) updateData.address = values.address;
          if (values.phone) updateData.phone = values.phone;
          if (values.website) updateData.website = values.website;
          if (values.logo) updateData.logo = values.logo;
          if (values.banner) updateData.banner = values.banner;
          if (values.description) updateData.description = values.description;
          if (values.mpesaConsumerKey) updateData.mpesaConsumerKey = values.mpesaConsumerKey;
          if (values.mpesaConsumerSecret) updateData.mpesaConsumerSecret = values.mpesaConsumerSecret;
          if (values.mpesaPasskey) updateData.mpesaPasskey = values.mpesaPasskey;
          if (values.mpesaB2cShortcode) updateData.mpesaB2cShortcode = values.mpesaB2cShortcode;
          if (values.mpesaB2bShortcode) updateData.mpesaB2bShortcode = values.mpesaB2bShortcode;
          if (values.mpesaInitiatorPassword) updateData.mpesaInitiatorPassword = values.mpesaInitiatorPassword;

          await updateAgency(initialData.id, updateData);
          toast.success("Agency updated successfully");
        } else {
          // For creation, include all fields
          await createAgency({
            ...values,
          } as AgencyInput);
          toast.success("Agency created successfully");
        }
        router.refresh();
      } catch (error) {
        console.error("Error saving agency:", error);
        toast.error("Failed to save agency. Please try again.");
      }
    } else {
      setShowAlert(true);
      window.scrollTo(0, 0);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {showAlert && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Incomplete Form</AlertTitle>
            <AlertDescription>
              Please fill out all fields in all tabs before submitting.
            </AlertDescription>
          </Alert>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 border-b">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="mpesa">M-PESA</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  control={form.control}
                  name="name"
                  label="Agency Name"
                  placeholder="Enter Your Agency Name"
                />
                <CustomInput
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="Enter Agency Email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  control={form.control}
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter Agency Phone Number"
                />
                <CustomInput
                  control={form.control}
                  name="website"
                  label="Website"
                  placeholder="Enter Agency Website"
                />
              </div>
              <CustomInput
                control={form.control}
                name="address"
                label="Address"
                placeholder="Enter Agency Address"
              />
              <CustomInput
                control={form.control}
                name="description"
                label="Description"
                placeholder="Enter Agency Description"
              />
            </div>
          </TabsContent>
          <TabsContent value="media" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  control={form.control}
                  name="logo"
                  label="Logo URL"
                  placeholder="Enter Logo URL"
                />
                <CustomInput
                  control={form.control}
                  name="banner"
                  label="Banner URL"
                  placeholder="Enter Banner URL"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="mpesa" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  control={form.control}
                  name="mpesaConsumerKey"
                  label="M-Pesa Consumer Key"
                  placeholder={initialData ? "Leave blank to keep existing" : "Enter M-Pesa Consumer Key"}
                />
                <CustomInput
                  control={form.control}
                  name="mpesaConsumerSecret"
                  label="M-Pesa Consumer Secret"
                  placeholder={initialData ? "Leave blank to keep existing" : "Enter M-Pesa Consumer Secret"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  control={form.control}
                  name="mpesaShortcode"
                  label="M-Pesa Shortcode"
                  placeholder="Enter M-Pesa Shortcode"
                />
                <CustomInput
                  control={form.control}
                  name="mpesaPasskey"
                  label="M-Pesa Passkey"
                  placeholder={initialData ? "Leave blank to keep existing" : "Enter M-Pesa Passkey"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  control={form.control}
                  name="mpesaB2cShortcode"
                  label="M-Pesa B2C Shortcode"
                  placeholder="Enter M-Pesa B2C Shortcode"
                />
                <CustomInput
                  control={form.control}
                  name="mpesaB2bShortcode"
                  label="M-Pesa B2B Shortcode"
                  placeholder="Enter M-Pesa B2B Shortcode"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  control={form.control}
                  name="mpesaInitiatorName"
                  label="M-Pesa Initiator Name"
                  placeholder="Enter M-Pesa Initiator Name"
                />
                <CustomInput
                  control={form.control}
                  name="mpesaInitiatorPassword"
                  label="M-Pesa Initiator Password"
                  placeholder={initialData ? "Leave blank to keep existing" : "Enter M-Pesa Initiator Password"}
                  type="password"
                />
              </div>
              <CustomInput
                control={form.control}
                name="mpesaEnv"
                label="M-Pesa Environment"
                placeholder="sandbox or production"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const tabs = ["general", "media", "mpesa"];
              const currentIndex = tabs.indexOf(activeTab);
              const prevTab = tabs[currentIndex - 1] || tabs[tabs.length - 1];
              setActiveTab(prevTab);
            }}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const tabs = ["general", "media", "mpesa"];
              const currentIndex = tabs.indexOf(activeTab);
              const nextTab = tabs[currentIndex + 1] || tabs[0];
              setActiveTab(nextTab);
            }}
          >
            Next
          </Button>
        </div>

        <div>
          <Button
            className="flex w-full justify-center rounded-md bg-gradient-to-tl from-pink-500 to-purple-600 text-white py-2 px-4 hover:opacity-85"
            type="submit"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {initialData ? "Updating Agency..." : "Creating Agency..."}
              </div>
            ) : (
              initialData ? "Update Agency" : "Create Agency"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OnboardingForm;
