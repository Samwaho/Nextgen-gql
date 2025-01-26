"use client";

import { useQuery } from "@apollo/client";
import { GET_CUSTOMERS } from "@/graphql/customer";
import type { Customer } from "@/graphql/customer";
import { Loader2, UsersIcon, TrendingUpIcon, SignalIcon, WifiIcon, WifiOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[120px]">
    <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
    <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading customers...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-[120px] text-center">
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2">
      <UsersIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">No customers yet</p>
  </div>
);

export function CustomerStats() {
  const { data, loading } = useQuery(GET_CUSTOMERS);

  if (loading) return <LoadingState />;

  const customers = data?.customers || [];
  if (customers.length === 0) return <EmptyState />;

  const activeCustomers = customers.filter((c: Customer) => c.status === "online").length;
  const totalCustomers = customers.length;
  const activePercentage = ((activeCustomers / totalCustomers) * 100).toFixed(1);

  // Calculate trend (example: based on expiry dates in next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiringNextWeek = customers.filter(
    (c: Customer) => new Date(c.expiry) <= nextWeek && new Date(c.expiry) > today
  ).length;

  // Get customers by package type
  const customersByPackage = customers.reduce((acc: Record<string, number>, customer: Customer) => {
    const packageName = customer.package?.name || 'No Package';
    acc[packageName] = (acc[packageName] || 0) + 1;
    return acc;
  }, {});

  // Find most popular package
  const mostPopularPackage = (Object.entries(customersByPackage) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalCustomers}
          </div>
          {expiringNextWeek > 0 && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <SignalIcon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {expiringNextWeek} expiring soon
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "h-2 w-2 rounded-full",
              activeCustomers > 0 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            )} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activeCustomers} active now
            </span>
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {activePercentage}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <WifiIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Online</p>
            <p className="text-xs text-gray-500 truncate">{activeCustomers} users</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
            <WifiOffIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Offline</p>
            <p className="text-xs text-gray-500 truncate">{totalCustomers - activeCustomers} users</p>
          </div>
        </div>
      </div>

      {mostPopularPackage && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Most popular plan</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {mostPopularPackage[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 