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
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-custom bg-clip-text text-transparent">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of your business metrics and performance
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <div className="p-2 bg-gradient-custom rounded-full">
                <UsersIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <CustomerStats />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Tickets</CardTitle>
              <div className="p-2 bg-gradient-custom rounded-full">
                <TicketIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <TicketOverview />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 bg-gradient-custom rounded-full">
                <DollarSignIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Status</CardTitle>
              <div className="p-2 bg-gradient-custom rounded-full">
                <PackageIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <InventoryStatus />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 row-span-2 glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-custom rounded-full">
                    <BarChart3Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-custom bg-clip-text text-transparent">Revenue Overview</span>
                </CardTitle>
                <CardDescription>Monthly transaction analysis</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-gradient-custom" />
                  <span>Revenue</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          
          <Card className="col-span-1 row-span-1 glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-custom rounded-full">
                    <MapPinIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-custom bg-clip-text text-transparent">Station Distribution</span>
                </CardTitle>
                <CardDescription>By building type</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <StationMap />
            </CardContent>
          </Card>

          <Card className="col-span-1 row-span-1 glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-custom rounded-full">
                    <ActivityIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-custom bg-clip-text text-transparent">Recent Activity</span>
                </CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-custom rounded-full">
                    <UsersIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">New Customer Registration</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-custom rounded-full">
                    <TicketIcon className="h-4 w-4 text-white" />
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
