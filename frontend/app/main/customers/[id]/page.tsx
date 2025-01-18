"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MailIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  PackageIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  RadioIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery } from "@apollo/client";
import { GET_CUSTOMER, Customer, useCustomer } from "@/graphql/customer";
import { GET_PACKAGES, Package } from "@/graphql/package";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface ViewCustomerProps {
  params: Promise<{ id: string }>;
}

export default function ViewCustomer({ params }: ViewCustomerProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { data, loading } = useQuery<{ customer: Customer }>(GET_CUSTOMER, {
    variables: { id: resolvedParams.id },
  });

  const { data: packagesData } = useQuery<{ packages: Package[] }>(GET_PACKAGES);
  const packages = packagesData?.packages || [];

  const { deleteCustomer } = useCustomer();

  const handleDelete = () => {
    try {
      deleteCustomer(resolvedParams.id);
      toast.success("Customer deleted successfully");
      router.push("/main/customers");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete customer");
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!data?.customer) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">Customer not found</h2>
        <Button onClick={() => router.push("/main/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const customer = data.customer;
  const customerPackage = packages.find((p) => p.id === customer.package);

  const getBadgeVariant = () => {
    return "outline" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/main/customers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Customer Details</h1>
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-tl from-pink-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-semibold">
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <p className="text-gray-500">{customer.email}</p>
            </div>
          </div>
          <Badge
            variant={getBadgeVariant()}
            className={`ml-4 ${
              customer.status === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : customer.status === "expired"
                ? "bg-red-100 text-red-800 hover:bg-red-100"
                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }`}
          >
            {customer.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/main/customers/${customer.id}/edit`}>
            <Button variant="outline" size="icon">
              <PencilIcon className="h-4 w-4" />
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  customer and remove their data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={handleDelete}>
                    Yes, delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Username:</span>
              <span className="font-medium">{customer.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <RadioIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Radius Username:</span>
              <span className="font-medium">
                {customer.radiusUsername || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Package:</span>
              <span className="font-medium">
                {customerPackage?.name || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Expiry:</span>
              <span className="font-medium">
                {new Date(customer.expiry).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Phone:</span>
              <span className="font-medium">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">Address:</span>
              <span className="font-medium">{customer.address || "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
