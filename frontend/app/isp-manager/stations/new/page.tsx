"use client";

import { Building } from "lucide-react";
import { formatDate } from "@/lib/utils";
import StationForm from "../StationForm";

export default function Page() {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          New Station
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="mt-6">
        <div className="glass-card bg-card_light dark:bg-card_dark rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-md shadow-md text-white bg-gradient-custom2">
              <Building className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold">Create New Station</h2>
          </div>
          <StationForm />
        </div>
      </div>
    </div>
  );
}
