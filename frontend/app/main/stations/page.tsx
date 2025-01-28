"use client";

import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Building, Building2, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@apollo/client";
import { GET_STATIONS, Station } from "@/graphql/station";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const Page = () => {
  const { data, loading, error } = useQuery(GET_STATIONS);
  const stations: Station[] = data?.stations || [];

  const totalStations = stations.length;
  const activeStations = stations.filter(
    (station) => station.status === "active"
  ).length;
  const inactiveStations = stations.filter(
    (station) => station.status === "inactive"
  ).length;
  const totalCustomers = stations.reduce(
    (sum, station) => sum + station.totalCustomers,
    0
  );

  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-sm font-normal text-muted-foreground">page/ </span>
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Stations
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate()}</p>
        </div>

        <div className="flex gap-4 mt-6 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]"
            >
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="mt-4">
          <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <Skeleton className="h-8 w-48 rounded-lg" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/20">
          <Building className="h-12 w-12 text-rose-500 dark:text-rose-400" />
        </div>
        <p className="text-sm text-rose-500 dark:text-rose-400 mt-4">Error loading stations</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="mt-2 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/20"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-muted-foreground">page/ </span>
          <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            Stations
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate()}</p>
      </div>

      <div className="flex gap-4 mt-6 flex-wrap">
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Total stations</p>
            <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
              <Building className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{totalStations}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            All registered stations
          </p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Active stations</p>
            <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
              <Building2 className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{activeStations}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Currently active stations
          </p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Total customers</p>
            <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
              <Building2 className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{totalCustomers}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Customers across all stations
          </p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Inactive stations</p>
            <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
              <Building className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{inactiveStations}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Currently inactive stations
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
          Station Table
        </h4>
        <Link href="/main/stations/new">
          <Button className="bg-gradient-custom hover:bg-gradient-custom2 transition-all duration-300 flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base text-white rounded-md">
            <Plus className="h-4 w-4" />
            <p>Add New</p>
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        <Tabs defaultValue="all" className="">
          <TabsList className="mx-auto bg-card">
            <TabsTrigger value="all" className="data-[state=active]:bg-fuchsia-100 dark:data-[state=active]:bg-fuchsia-900/20 data-[state=active]:text-fuchsia-500 dark:data-[state=active]:text-fuchsia-400">ALL</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-fuchsia-100 dark:data-[state=active]:bg-fuchsia-900/20 data-[state=active]:text-fuchsia-500 dark:data-[state=active]:text-fuchsia-400">ACTIVE</TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-fuchsia-100 dark:data-[state=active]:bg-fuchsia-900/20 data-[state=active]:text-fuchsia-500 dark:data-[state=active]:text-fuchsia-400">INACTIVE</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable columns={columns} data={stations} />
            </div>
          </TabsContent>
          <TabsContent value="active">
            <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable
                columns={columns}
                data={stations.filter((station) => station.status === "active")}
              />
            </div>
          </TabsContent>
          <TabsContent value="inactive">
            <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable
                columns={columns}
                data={stations.filter((station) => station.status === "inactive")}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
