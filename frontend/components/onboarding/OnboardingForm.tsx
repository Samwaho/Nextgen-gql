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
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAgency, AgencyInput } from "@/graphql/agency";

type AgencyProps = z.infer<typeof agencySchema>;

const OnboardingForm = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [showAlert, setShowAlert] = useState(false);
  const { createAgency, isCreating } = useAgency();

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
    },
  });

  const onSubmit = async (values: AgencyProps) => {
    const isFormComplete = Object.values(values).every((value) => value !== "");
    if (isFormComplete) {
      try {
        await createAgency({
          ...values,
          mpesaConsumerKey: values.mpesaConsumerKey,
          mpesaConsumerSecret: values.mpesaConsumerSecret,
          mpesaShortcode: values.mpesaShortcode,
          mpesaPasskey: values.mpesaPasskey,
          mpesaEnv: values.mpesaEnv,
        } as AgencyInput);
        toast.success("Agency created successfully");
        router.refresh();
      } catch (error) {
        console.error("Error creating agency:", error);
        toast.error("Failed to create agency. Please try again.");
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
                  placeholder="Enter M-Pesa Consumer Key"
                />
                <CustomInput
                  control={form.control}
                  name="mpesaConsumerSecret"
                  label="M-Pesa Consumer Secret"
                  placeholder="Enter M-Pesa Consumer Secret"
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
                  placeholder="Enter M-Pesa Passkey"
                />
              </div>
              <CustomInput
                control={form.control}
                name="mpesaEnv"
                label="M-Pesa Environment"
                placeholder="Enter M-Pesa Environment"
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
            disabled={isCreating}
          >
            {isCreating ? (
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
                Creating Agency...
              </div>
            ) : (
              "Create Agency"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OnboardingForm;
