"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UsersIcon, 
  TicketIcon, 
  DollarSignIcon, 
  PackageIcon,
  ActivityIcon,
  BarChart3Icon,
  MapPinIcon
} from "lucide-react";

import { Overview } from "@/components/dashboard/Overview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TicketOverview } from "@/components/dashboard/TicketOverview";
import { CustomerStats } from "@/components/dashboard/CustomerStats";
import { StationMap } from "@/components/dashboard/StationMap";
import { InventoryStatus } from "@/components/dashboard/InventoryStatus";

export default function DashboardPage() {
  return (
    <div className="flex-1 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of your business metrics and performance
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CustomerStats />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">Active Tickets</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <TicketIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <TicketOverview />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSignIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">Inventory Status</CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <PackageIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <InventoryStatus />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 row-span-2 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3Icon className="h-5 w-5 text-gray-500" />
                  Revenue Overview
                </CardTitle>
                <CardDescription>Monthly transaction analysis</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Revenue</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          
          <Card className="col-span-1 row-span-1 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-gray-500" />
                  Station Distribution
                </CardTitle>
                <CardDescription>By building type</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <StationMap />
            </CardContent>
          </Card>

          <Card className="col-span-1 row-span-1 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-gray-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">New Customer Registration</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <TicketIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Ticket #123 Resolved</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
