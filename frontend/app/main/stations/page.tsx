"use client";

import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Building, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@apollo/client";
import { GET_STATIONS, Station } from "@/graphql/station";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const Page = () => {
  const { data, loading } = useQuery(GET_STATIONS);
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
            <span className="text-sm font-normal text-gray-500">page/ </span>
            Stations
          </h1>
          <p className="text-sm text-gray-500">{formatDate()}</p>
        </div>

        <div className="flex gap-4 mt-6 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]"
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
          <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
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

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Stations
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="flex gap-4 mt-6 flex-wrap">
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Total stations</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg">{totalStations}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            All registered stations
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Active stations</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg">{activeStations}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Currently active stations
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Total customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg">{totalCustomers}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Customers across all stations
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Inactive stations</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg">{inactiveStations}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Currently inactive stations
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-semibold">Station Table</h4>
        <Link href="/main/stations/new">
          <Button className="bg-gradient-custom flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base text-white rounded-md">
            <Building className="h-4 w-4" />
            <p>Add New</p>
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        <Tabs defaultValue="all" className="">
          <TabsList className="mx-auto">
            <TabsTrigger value="all">ALL</TabsTrigger>
            <TabsTrigger value="active">ACTIVE</TabsTrigger>
            <TabsTrigger value="inactive">INACTIVE</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable columns={columns} data={stations} />
            </div>
          </TabsContent>
          <TabsContent value="active">
            <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable
                columns={columns}
                data={stations.filter((station) => station.status === "active")}
              />
            </div>
          </TabsContent>
          <TabsContent value="inactive">
            <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
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
