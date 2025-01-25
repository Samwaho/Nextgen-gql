"use client";

import React, { useEffect, useState } from "react";
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
  WifiIcon,
  ClockIcon,
  UploadIcon,
  DownloadIcon,
  ActivityIcon,
  NetworkIcon,
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
import { GET_CUSTOMER, Customer, useCustomer, useCustomerAccounting } from "@/graphql/customer";
import { GET_PACKAGES, Package } from "@/graphql/package";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { DetailedAccounting } from "@/components/DetailedAccounting";

interface ViewCustomerProps {
  params: Promise<{ id: string }>;
}

export default function ViewCustomer({ params }: ViewCustomerProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, loading } = useQuery<{ customer: Customer }>(GET_CUSTOMER, {
    variables: { id: resolvedParams.id },
  });

  const { data: packagesData } = useQuery<{ packages: Package[] }>(GET_PACKAGES);
  const packages = packagesData?.packages || [];

  const { deleteCustomer } = useCustomer();

  // Get accounting data
  const customer = data?.customer;
  const { accounting, accountingHistory, isLoading: loadingAccounting } = useCustomerAccounting(customer?.username || "");

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

  if (loading || loadingAccounting) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">Customer not found</h2>
        <Button onClick={() => router.push("/main/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const customerPackage = packages.find((p) => p.id === customer.package?.id);

  const getBadgeVariant = () => {
    return "outline" as const;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    return parts.join(" ");
  };

  const formatDate = (date: Date) => {
    if (!mounted) return ''; // Return empty string during SSR
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isConnected = (status?: string) => {
    if (!status) return false;
    // Consider these statuses as "connected" states
    return ["Start", "Interim-Update"].includes(status) && status !== "Stop";
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            className={`mt-2 sm:mt-0 ${
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Username:</span>
                </div>
                <span className="font-medium">{customer.username}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <RadioIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">PPPoE Password:</span>
                </div>
                <span className="font-medium">{customer.password}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <PackageIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Package:</span>
                </div>
                <span className="font-medium">
                  {customerPackage?.name || "N/A"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Expiry:</span>
                </div>
                <span className="font-medium">
                  {mounted ? formatDate(new Date(customer.expiry)) : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <MailIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Email:</span>
                </div>
                <span className="font-medium break-all">{customer.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <PhoneIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Phone:</span>
                </div>
                <span className="font-medium">{customer.phone}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Address:</span>
                </div>
                <span className="font-medium">{customer.address || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <div className="col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Connection Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <WifiIcon className={`h-4 w-4 ${isConnected(accounting?.status) ? "text-green-500" : "text-gray-500"}`} />
                  <span className="font-medium">
                    {isConnected(accounting?.status) ? "Connected" : "Disconnected"}
                  </span>
                </div>
                {accounting?.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last seen: {new Date(accounting.timestamp).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Total Sessions Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ActivityIcon className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{accountingHistory.length}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">All time sessions</p>
              </CardContent>
            </Card>

            {/* Total Online Time Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Online Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">
                    {formatDuration(accounting?.sessionTime || 0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Current session time</p>
              </CardContent>
            </Card>

            {/* Total Data Usage Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Data Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <NetworkIcon className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">
                    {formatBytes((accounting?.totalInputBytes || 0) + (accounting?.totalOutputBytes || 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <DownloadIcon className="h-3 w-3" />
                    {formatBytes(accounting?.totalInputBytes || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <UploadIcon className="h-3 w-3" />
                    {formatBytes(accounting?.totalOutputBytes || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Accounting Data */}
          {customer.username && (
            <div className="mt-6">
              <DetailedAccounting username={customer.username} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
