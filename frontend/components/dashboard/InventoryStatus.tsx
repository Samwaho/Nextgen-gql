"use client";

import { useQuery } from "@apollo/client";
import { GET_INVENTORIES } from "@/graphql/inventory";
import type { Inventory } from "@/graphql/inventory";
import { Loader2, PackageIcon, AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[120px]">
    <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
    <span className="text-sm text-muted-foreground mt-2">Loading inventory...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-[120px] text-center">
    <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-900/20 rounded-full mb-2">
      <PackageIcon className="h-5 w-5 text-fuchsia-500 dark:text-fuchsia-400" />
    </div>
    <p className="text-sm text-muted-foreground">No inventory items yet</p>
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
    if (level < 30) return "bg-rose-500";
    if (level < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="glass-card space-y-4">
      <div className="flex flex-col">
        <div className="text-2xl font-bold text-foreground">
          {formatCurrency(totalValue)}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {totalItems} total items
          </span>
          <span className="text-xs font-medium text-rose-500 dark:text-rose-400">
            {lowStock} low stock
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Stock Level</span>
          <span className="text-xs font-medium text-foreground">
            {Math.round(stockLevel)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500", getStockLevelClass(stockLevel))}
            style={{ width: `${stockLevel}%` }}
          />
        </div>
      </div>

      {lowStock > 0 && (
        <div className="flex items-center gap-2 p-2 bg-rose-100 dark:bg-rose-900/20 rounded-md">
          <AlertTriangleIcon className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span className="text-xs text-rose-600 dark:text-rose-400">
            {lowStock} {lowStock === 1 ? 'item' : 'items'} need restocking
          </span>
        </div>
      )}

      <div className="space-y-2 pt-2 border-t border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full">
              <TrendingUpIcon className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Highest value</span>
          </div>
          <span className="text-xs font-medium text-foreground">
            {highestValueItem ? formatCurrency(highestValueItem.price * highestValueItem.stock) : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-900/20 rounded-full">
              <TrendingDownIcon className="h-3 w-3 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-xs text-muted-foreground">Lowest value</span>
          </div>
          <span className="text-xs font-medium text-foreground">
            {lowestValueItem ? formatCurrency(lowestValueItem.price * lowestValueItem.stock) : '-'}
          </span>
        </div>
      </div>
    </div>
  );
} 