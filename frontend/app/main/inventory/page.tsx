"use client";

import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import { GET_INVENTORIES, Inventory } from "@/graphql/inventory";
import { Package, PackageOpen, Warehouse, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function LoadingSkeleton() {
  return (
    <>
      <div className="flex gap-4 mt-6 flex-wrap">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="mt-4">
        <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-8 w-[200px]" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-4">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function InventoryPage() {
  const { data, loading, error } = useQuery<{ inventories: Inventory[] }>(
    GET_INVENTORIES
  );
  const inventoryItems = data?.inventories || [];

  const totalItems = inventoryItems.length;
  const totalStock = inventoryItems.reduce((acc, item) => acc + item.stock, 0);
  const totalValue = inventoryItems.reduce(
    (acc, item) => acc + item.price * item.stock,
    0
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/20">
          <Package className="h-12 w-12 text-rose-500 dark:text-rose-400" />
        </div>
        <p className="text-sm text-rose-500 dark:text-rose-400 mt-4">Error loading inventory</p>
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
            Inventory
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate()}</p>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="flex gap-4 mt-6 flex-wrap">
            <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total Items</p>
                <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
                  <Package className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
                </div>
              </div>
              <h1 className="font-bold text-lg text-foreground">{totalItems}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Unique inventory items
              </p>
            </div>
            <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
                  <PackageOpen className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
                </div>
              </div>
              <h1 className="font-bold text-lg text-foreground">{totalStock}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Total quantity in stock
              </p>
            </div>
            <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <div className="p-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/20">
                  <Warehouse className="h-4 w-4 text-fuchsia-500 dark:text-fuchsia-400" />
                </div>
              </div>
              <h1 className="font-bold text-lg text-foreground">KSh {totalValue.toFixed(2)}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Total inventory value
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <h4 className="text-lg font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Inventory Table
            </h4>
            <Link href="/main/inventory/new">
              <Button className="bg-gradient-custom hover:bg-gradient-custom2 transition-all duration-300 flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base text-white rounded-md">
                <Plus className="h-4 w-4" />
                <p>Add New</p>
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <div className="glass-card bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
              <DataTable columns={columns} data={inventoryItems} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
