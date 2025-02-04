"use client";

import React from "react";
import InventoryForm from "../InventoryForm";
import { formatDate } from "@/lib/utils";

export default function NewInventoryPage() {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Add New Inventory Item
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="mt-6 glass-card bg-card_light dark:bg-card_dark p-6 rounded-xl shadow-md">
        <InventoryForm />
      </div>
    </div>
  );
} 