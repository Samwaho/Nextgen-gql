"use client";

import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, UserCheck, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@apollo/client";
import { GET_CUSTOMERS, Customer } from "@/graphql/customer";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const Page = () => {
  const { data, loading } = useQuery(GET_CUSTOMERS);
  const customers: Customer[] = data?.customers || [];

  const totalCustomers = customers.length;
  const onlineCustomers = customers.filter(
    (customer) => customer.status === "online"
  ).length;
  const expiredCustomers = customers.filter(
    (customer) => new Date(customer.expiry) < new Date()
  ).length;
  const activeCustomers = customers.filter(
    (customer) => new Date(customer.expiry) >= new Date()
  ).length;

  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-muted-foreground text-sm font-normal">page/ </span>
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate()}</p>
        </div>

        <div className="flex gap-4 mt-6 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 p-3 flex-1 min-w-[150px] max-w-[250px]"
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
          <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl">
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
          <span className="text-muted-foreground text-sm font-normal">page/ </span>
          <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            Customers
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate()}</p>
      </div>

      <div className="flex gap-4 mt-6 flex-wrap">
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Total customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom w-fit">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{totalCustomers}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            All registered customers
          </p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Online customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom w-fit">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{onlineCustomers}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Currently connected customers
          </p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Active customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom w-fit">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{activeCustomers}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Customers with valid subscription
          </p>
        </div>
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Expired customers</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom w-fit">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <h1 className="font-bold text-lg text-foreground">{expiredCustomers}</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Customers past expiry date
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
          Customer Table
        </h4>
        <Link href="/main/customers/new">
          <Button className="bg-gradient-custom hover:bg-gradient-custom2 flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base text-white rounded-lg transition-all duration-300">
            <UserPlus className="h-4 w-4" />
            <p>Add New</p>
          </Button>
        </Link>
      </div>
      <div className="mt-4">
        <Tabs defaultValue="all" className="">
          <TabsList className="mx-auto">
            <TabsTrigger value="all">ALL</TabsTrigger>
            <TabsTrigger value="pppoe">PPPOE</TabsTrigger>
            <TabsTrigger value="hotspot">HOTSPOT</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl">
              <DataTable columns={columns} data={customers} />
            </div>
          </TabsContent>
          <TabsContent value="pppoe">
            <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl">
              <DataTable
                columns={columns}
                data={customers.filter(
                  (customer) => customer.package?.serviceType === "pppoe"
                )}
              />
            </div>
          </TabsContent>
          <TabsContent value="hotspot">
            <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl">
              <DataTable
                columns={columns}
                data={customers.filter(
                  (customer) => customer.package?.serviceType === "hotspot"
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
