"use client";

import React from "react";
import { columns } from "./columns";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateInventoryForm from "@/app/main/inventory/InventoryForm";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import { GET_INVENTORIES, Inventory } from "@/graphql/inventory";
import { Package, PackageOpen, Warehouse, Plus } from "lucide-react";

export default function InventoryPage() {
  const { data, loading } = useQuery<{ inventories: Inventory[] }>(
    GET_INVENTORIES
  );
  const inventoryItems = data?.inventories || [];

  const totalItems = inventoryItems.length;
  const totalStock = inventoryItems.reduce((acc, item) => acc + item.stock, 0);
  const totalValue = inventoryItems.reduce(
    (acc, item) => acc + item.price * item.stock,
    0
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Inventory
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="flex gap-4 mt-6 flex-wrap">
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Total Items</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Package size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">{totalItems}</h1>
          <p className=" text-xs md:text-sm text-gray-500">
            Unique inventory items
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Total Stock</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <PackageOpen size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">{totalStock}</h1>
          <p className=" text-xs md:text-sm text-gray-500">
            Total quantity in stock
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Total Value</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Warehouse size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">KSh {totalValue.toFixed(2)}</h1>
          <p className=" text-xs md:text-sm text-gray-500">
            Total inventory value
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-semibold">Inventory Table</h4>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-custom flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base text-white rounded-md">
              <Plus size={16} />
              <p>Add New</p>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Fill in the fields below to add a new inventory item
              </DialogDescription>
            </DialogHeader>
            <CreateInventoryForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4">
        <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
          <DataTable columns={columns} data={inventoryItems} />
        </div>
      </div>
    </div>
  );
}
