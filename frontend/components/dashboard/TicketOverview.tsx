"use client";

import { useQuery } from "@apollo/client";
import { GET_TICKETS } from "@/graphql/ticket";
import type { Ticket } from "@/graphql/ticket";
import { Loader2, TicketIcon, TrendingUpIcon, AlertCircleIcon, CheckCircle2Icon, Clock8Icon } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-[120px]">
    <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
    <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading tickets...</span>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-[120px] text-center">
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2">
      <TicketIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">No tickets yet</p>
  </div>
);

export function TicketOverview() {
  const { data, loading } = useQuery(GET_TICKETS);

  if (loading) return <LoadingState />;

  const tickets = data?.tickets || [];
  if (tickets.length === 0) return <EmptyState />;

  const openTickets = tickets.filter((t: Ticket) => t.status === "open").length;
  const totalTickets = tickets.length;
  const openPercentage = ((openTickets / totalTickets) * 100).toFixed(1);

  // Calculate urgent tickets (high priority and open)
  const urgentTickets = tickets.filter(
    (t: Ticket) => t.priority === "high" && t.status === "open"
  ).length;

  // Get tickets by type (based on title)
  const ticketsByType = tickets.reduce((acc: Record<string, number>, ticket: Ticket) => {
    const type = ticket.title.split(' ')[0] || 'Other'; // Use first word of title as type
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Find most common type
  const mostCommonType = (Object.entries(ticketsByType) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalTickets}
          </div>
          {urgentTickets > 0 && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <AlertCircleIcon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {urgentTickets} urgent
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "h-2 w-2 rounded-full",
              openTickets > 0 ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
            )} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {openTickets} open now
            </span>
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {openPercentage}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Clock8Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Open</p>
            <p className="text-xs text-gray-500 truncate">{openTickets} tickets</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Resolved</p>
            <p className="text-xs text-gray-500 truncate">{totalTickets - openTickets} tickets</p>
          </div>
        </div>
      </div>

      {mostCommonType && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Most common issue</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {mostCommonType[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 