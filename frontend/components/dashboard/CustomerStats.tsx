"use client";

import { useQuery } from "@apollo/client";
import { GET_CUSTOMERS } from "@/graphql/customer";
import type { Customer } from "@/graphql/customer";
import { Loader2, UsersIcon, TrendingUpIcon, SignalIcon, WifiIcon, WifiOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[120px]">
    <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
    <span className="text-sm text-muted-foreground mt-2">Loading customers...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-[120px] text-center">
    <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-900/20 rounded-full mb-2">
      <UsersIcon className="h-5 w-5 text-fuchsia-500 dark:text-fuchsia-400" />
    </div>
    <p className="text-sm text-muted-foreground">No customers yet</p>
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
          <div className="text-2xl font-bold text-foreground">
            {totalCustomers}
          </div>
          {expiringNextWeek > 0 && (
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
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
              activeCustomers > 0 ? "bg-emerald-500" : "bg-muted"
            )} />
            <span className="text-xs text-muted-foreground">
              {activeCustomers} active now
            </span>
          </div>
          <span className="text-xs font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            {activePercentage}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 glass-card rounded-lg">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
            <WifiIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">Online</p>
            <p className="text-xs text-muted-foreground truncate">{activeCustomers} users</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 glass-card rounded-lg">
          <div className="p-1.5 bg-slate-100 dark:bg-slate-900/20 rounded-full">
            <WifiOffIcon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">Offline</p>
            <p className="text-xs text-muted-foreground truncate">{totalCustomers - activeCustomers} users</p>
          </div>
        </div>
      </div>

      {mostPopularPackage && (
        <div className="pt-3 border-t border-border/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full">
              <TrendingUpIcon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Most popular plan</p>
              <p className="text-sm font-medium text-foreground truncate">
                {mostPopularPackage[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 