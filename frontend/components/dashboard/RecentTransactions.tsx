"use client";

import { useQuery } from "@apollo/client";
import { GET_TRANSACTIONS } from "@/graphql/transactions";
import type { MpesaTransaction } from "@/graphql/transactions";
import { Loader2, CreditCardIcon, ArrowUpIcon, ArrowDownIcon, BanknoteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[120px]">
    <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
    <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading transactions...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-[120px] text-center">
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2">
      <CreditCardIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
  </div>
);

export function RecentTransactions() {
  const { data, loading } = useQuery(GET_TRANSACTIONS);

  if (loading) return <LoadingState />;

  const transactions = data?.mpesaTransactions || [];
  if (transactions.length === 0) return <EmptyState />;

  const totalAmount = transactions.reduce((sum: number, t: MpesaTransaction) => sum + t.amount, 0);
  const incomingAmount = transactions
    .filter((t: MpesaTransaction) => t.type === "c2b")
    .reduce((sum: number, t: MpesaTransaction) => sum + t.amount, 0);
  const outgoingAmount = transactions
    .filter((t: MpesaTransaction) => t.type === "b2c" || t.type === "b2b")
    .reduce((sum: number, t: MpesaTransaction) => sum + t.amount, 0);

  // Calculate percentage of incoming vs total
  const incomingPercentage = ((incomingAmount / totalAmount) * 100).toFixed(1);

  // Get transactions by status
  const transactionsByStatus = transactions.reduce((acc: Record<string, number>, transaction: MpesaTransaction) => {
    const status = transaction.status || 'unknown';
    acc[status] = (acc[status] || 0) + transaction.amount;
    return acc;
  }, {});

  // Find most common status
  const mostCommonStatus = (Object.entries(transactionsByStatus) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            KES {totalAmount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ArrowUpIcon className="h-4 w-4" />
            <span className="text-xs font-medium">
              {incomingPercentage}% incoming
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "h-2 w-2 rounded-full",
              incomingAmount > outgoingAmount ? "bg-emerald-500" : "bg-red-500"
            )} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {transactions.length} total transactions
            </span>
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            KES {(incomingAmount - outgoingAmount).toLocaleString()} net
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <ArrowUpIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Income</p>
            <p className="text-xs text-gray-500 truncate">KES {incomingAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
            <ArrowDownIcon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Expenses</p>
            <p className="text-xs text-gray-500 truncate">KES {outgoingAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {mostCommonStatus && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <BanknoteIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Most common status</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {mostCommonStatus[0]} (KES {mostCommonStatus[1].toLocaleString()})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 