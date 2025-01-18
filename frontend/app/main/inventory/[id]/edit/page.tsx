"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import { GET_INVENTORY } from "@/graphql/inventory";
import { formatDate } from "@/lib/utils";
import EditInventoryForm from "../../EditInventoryForm";
import { Loader2 } from "lucide-react";

export default function EditInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { data, loading } = useQuery(GET_INVENTORY, {
    variables: { id: resolvedParams.id },
  });

  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-sm font-normal text-gray-500">page/ </span>
            Edit Inventory Item
          </h1>
          <p className="text-sm text-gray-500">{formatDate()}</p>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Edit Inventory Item
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="mt-6 bg-card_light dark:bg-card_dark p-6 rounded-xl shadow-md">
        <EditInventoryForm inventory={data?.inventory} />
      </div>
    </div>
  );
} 