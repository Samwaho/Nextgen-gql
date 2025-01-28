"use client";

import React from "react";

import { formatDate } from "@/lib/utils";
import PackageForm from "../PackageForm";

export default function NewPackagePage() {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Add New Package
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="mt-6 glass-card bg-card_light dark:bg-card_dark p-6 rounded-xl shadow-md">
        <PackageForm />
      </div>
    </div>
  );
} 