"use client";

import { useQuery } from "@apollo/client";
import { GET_INVENTORIES } from "@/graphql/inventory";
import type { Inventory } from "@/graphql/inventory";
import { Loader2, PackageIcon, AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[120px]">
    <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
    <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading inventory...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-[120px] text-center">
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2">
      <PackageIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">No inventory items yet</p>
  </div>
);

export function InventoryStatus() {
  const { data, loading } = useQuery(GET_INVENTORIES);

  if (loading) return <LoadingState />;

  const inventory = data?.inventories || [];
  if (inventory.length === 0) return <EmptyState />;

  const totalItems = inventory.length;
  const lowStock = inventory.filter((item: Inventory) => item.stock < 10).length;
  const totalValue = inventory.reduce((sum: number, item: Inventory) => sum + (item.price * item.stock), 0);
  const stockLevel = ((totalItems - lowStock) / totalItems) * 100;

  // Find highest and lowest value items
  const sortedByValue = [...inventory].sort((a, b) => (b.price * b.stock) - (a.price * a.stock));
  const highestValueItem = sortedByValue[0];
  const lowestValueItem = sortedByValue[sortedByValue.length - 1];

  const getStockLevelClass = (level: number) => {
    if (level < 30) return "bg-red-600 dark:bg-red-400";
    if (level < 70) return "bg-amber-600 dark:bg-amber-400";
    return "bg-green-600 dark:bg-green-400";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          ${totalValue.toLocaleString()}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalItems} total items
          </span>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            {lowStock} low stock
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Stock Level</span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {Math.round(stockLevel)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500", getStockLevelClass(stockLevel))}
            style={{ width: `${stockLevel}%` }}
          />
        </div>
      </div>

      {lowStock > 0 && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
          <AlertTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {lowStock} {lowStock === 1 ? 'item' : 'items'} need restocking
          </span>
        </div>
      )}

      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUpIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Highest value</span>
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {highestValueItem ? `$${(highestValueItem.price * highestValueItem.stock).toLocaleString()}` : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingDownIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Lowest value</span>
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {lowestValueItem ? `$${(lowestValueItem.price * lowestValueItem.stock).toLocaleString()}` : '-'}
          </span>
        </div>
      </div>
    </div>
  );
} 