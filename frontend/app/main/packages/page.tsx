"use client";

import React from "react";
import { columns } from "@/app/main/packages/columns";
import { DataTable } from "@/components/shared/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Box, Radio, Satellite, Plus } from "lucide-react";
import CreatePackageForm from "@/app/main/packages/createPackageForm";
import { Button } from "@/components/ui/button";
import { useQuery } from "@apollo/client";
import { GET_PACKAGES, Package } from "@/graphql/package";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { data, loading, error } = useQuery<{ packages: Package[] }>(
    GET_PACKAGES
  );

  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-sm font-normal text-gray-500">page/ </span>
            Packages
          </h1>
          <p className="text-sm text-gray-500">{format(new Date(), "PPP")}</p>
        </div>

        <div className="flex gap-4 mt-6 flex-wrap">
          {[1, 2, 3].map((i) => (
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
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div>Error loading packages</div>;

  const packages = data?.packages || [];
  const totalPackages = packages.length;
  const broadbandPackages = packages.filter(
    (pkg) => pkg.type === "broadband"
  ).length;
  const satellitePackages = packages.filter(
    (pkg) => pkg.type === "satellite"
  ).length;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Packages
        </h1>
        <p className="text-sm text-gray-500">{format(new Date(), "PPP")}</p>
      </div>

      <div className="flex gap-4 mt-6 flex-wrap">
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Total Packages</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Box size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">{totalPackages}</h1>
          <p className="text-xs md:text-sm text-gray-500">All packages</p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Broadband Packages</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Radio size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">{broadbandPackages}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Broadband internet packages
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Satellite Packages</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Satellite size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">{satellitePackages}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Satellite internet packages
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-semibold">Package Table</h4>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-custom flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base text-white rounded-md">
              <Plus size={18} />
              <p>Add New</p>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Package</DialogTitle>
              <DialogDescription>
                Fill in the fields below to add a new package
              </DialogDescription>
            </DialogHeader>
            <CreatePackageForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4">
        <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
          <DataTable columns={columns} data={packages} />
        </div>
      </div>
    </div>
  );
};

export default Page;
