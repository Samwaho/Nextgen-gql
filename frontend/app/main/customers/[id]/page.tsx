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
  Loader2,
  ArrowLeft,
  WifiIcon,
  ClockIcon,
  UploadIcon,
  DownloadIcon,
  ActivityIcon,
  NetworkIcon,
  KeyIcon,
  ExternalLinkIcon,
  PhoneCallIcon,
  MessageCircleIcon,
  MapIcon,
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
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Customer Details</h1>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-semibold shadow-sm">
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <div className="flex items-center gap-2 text-gray-500">
                <MailIcon className="h-4 w-4" />
                <p>{customer.email}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Badge variant={customer.status === "online" ? "active" : "offline"}>
              {customer.status === "online" ? "Online" : "Offline"}
            </Badge>
            {new Date(customer.expiry) < new Date() && (
              <Badge variant="expired">Expired</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/main/customers/${customer.id}/edit`}>
            <Button variant="outline" size="icon" className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <PencilIcon className="h-4 w-4" />
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors">
                <TrashIcon className="h-4 w-4 text-red-600" />
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
        <Card className="h-fit bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <UserIcon className="h-4 w-4" />
              </div>
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 group">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="p-1.5 rounded-md bg-purple-100 text-purple-600">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-500">Username:</span>
                </div>
                <span className="font-medium">{customer.username}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                    <KeyIcon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-500">PPPoE Pass:</span>
                </div>
                <span className="font-medium">{customer.password}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="p-1.5 rounded-md bg-green-100 text-green-600">
                    <PackageIcon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-500">Package:</span>
                </div>
                <span className="font-medium">
                  {customerPackage?.name || "N/A"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="p-1.5 rounded-md bg-orange-100 text-orange-600">
                    <NetworkIcon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-500">Station:</span>
                </div>
                <div className="font-medium">
                  {customer.station ? (
                    <div className="flex flex-col">
                      <span>{customer.station.name}</span>
                      <span className="text-xs text-gray-500">{customer.station.location}</span>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="p-1.5 rounded-md bg-pink-100 text-pink-600">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-500">Expiry:</span>
                </div>
                <span className="font-medium">
                  {mounted ? formatDate(new Date(customer.expiry)) : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <PhoneIcon className="h-4 w-4" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="p-1.5 rounded-md bg-purple-100 text-purple-600">
                    <MailIcon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-500">Email:</span>
                </div>
                <Link 
                  href={`mailto:${customer.email}`}
                  className="font-medium hover:text-fuchsia-600 hover:underline flex items-center gap-2 transition-colors"
                >
                  <span className="break-all">{customer.email}</span>
                  <ExternalLinkIcon className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                    <PhoneIcon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-500">Phone:</span>
                </div>
                <div className="flex gap-3">
                  <Link 
                    href={`tel:${customer.phone}`}
                    className="font-medium hover:text-fuchsia-600 hover:underline flex items-center gap-2 transition-colors"
                  >
                    <span>{customer.phone}</span>
                    <PhoneCallIcon className="h-4 w-4 text-gray-400" />
                  </Link>
                  <Link 
                    href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    className="font-medium hover:text-green-600 hover:underline flex items-center gap-2 transition-colors"
                  >
                    <span>WhatsApp</span>
                    <MessageCircleIcon className="h-4 w-4 text-gray-400" />
                  </Link>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <div className="p-1.5 rounded-md bg-green-100 text-green-600">
                    <MapPinIcon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-500">Address:</span>
                </div>
                {customer.address ? (
                  <Link 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`}
                    target="_blank"
                    className="font-medium hover:text-fuchsia-600 hover:underline flex items-center gap-2 transition-colors"
                  >
                    <span>{customer.address}</span>
                    <MapIcon className="h-4 w-4 text-gray-400" />
                  </Link>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <div className="col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 px-1">Usage Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Connection Status Card */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${isConnected(accounting?.status) ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <WifiIcon className={`h-4 w-4 ${isConnected(accounting?.status) ? "text-green-600 dark:text-green-400" : "text-gray-500"}`} />
                  </div>
                  <span className="font-medium">
                    {isConnected(accounting?.status) ? "Connected" : "Disconnected"}
                  </span>
                </div>
                {accounting?.timestamp && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last seen: {new Date(accounting.timestamp).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Total Sessions Card */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                    <ActivityIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium">{accountingHistory.length}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">All time sessions</p>
              </CardContent>
            </Card>

            {/* Total Online Time Card */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Online Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">
                    {formatDuration(accounting?.sessionTime || 0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Current session time</p>
              </CardContent>
            </Card>

            {/* Total Data Usage Card */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Data Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                    <NetworkIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium">
                    {formatBytes((accounting?.totalInputBytes || 0) + (accounting?.totalOutputBytes || 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-green-100 dark:bg-green-900/30">
                      <DownloadIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    {formatBytes(accounting?.totalInputBytes || 0)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <UploadIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
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
