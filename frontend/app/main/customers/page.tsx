"use client";

import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, UserCheck, Clock, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateCustomerForm from "@/app/main/customers/CustomerForm";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerProps } from "@/lib/schemas";
import { useQuery } from "@apollo/client";
import { GET_CUSTOMERS } from "@/graphql/customer";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { data, loading } = useQuery(GET_CUSTOMERS);
  const customers: CustomerProps[] = data?.customers || [];

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) => customer.status === "active"
  ).length;
  const expiredCustomers = customers.filter(
    (customer) => customer.status === "expired"
  ).length;
  const inactiveCustomers = customers.filter(
    (customer) => customer.status === "inactive"
  ).length;

  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-sm font-normal text-gray-500">page/ </span>
            Customers
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
          Customers
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="flex gap-4 mt-6 flex-wrap">
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Total customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg">{totalCustomers}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            All registered customers
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Active customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg">{activeCustomers}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            +21.4% from last month
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Expired customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg">{expiredCustomers}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            -41% from last month
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Inactive customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg">{inactiveCustomers}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            +8.2% from last month
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-semibold">Customer Table</h4>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-custom flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base text-white rounded-md">
              <UserPlus className="h-4 w-4" />
              <p>Add New</p>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Fill in the fields below to add a new customer
              </DialogDescription>
            </DialogHeader>
            <CreateCustomerForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4">
        <Tabs defaultValue="all" className="">
          <TabsList className="mx-auto">
            <TabsTrigger value="all">ALL</TabsTrigger>
            <TabsTrigger value="pppoe">PPPOE</TabsTrigger>
            <TabsTrigger value="hotspot">HOTSPOT</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable columns={columns} data={customers} />
            </div>
          </TabsContent>
          <TabsContent value="pppoe">
            <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable
                columns={columns}
                data={customers.filter(
                  (customer) => customer.package === "pppoe"
                )}
              />
            </div>
          </TabsContent>
          <TabsContent value="hotspot">
            <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable
                columns={columns}
                data={customers.filter(
                  (customer) => customer.package === "hotspot"
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
