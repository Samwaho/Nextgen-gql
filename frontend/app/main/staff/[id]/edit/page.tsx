"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import EditStaffForm from "@/app/main/staff/EditStaffForm";
import { useQuery } from "@apollo/client";
import { Employee, GET_EMPLOYEE } from "@/graphql/employee";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { data, loading } = useQuery<{ staffMember: Employee }>(GET_EMPLOYEE, {
    variables: { id: resolvedParams.id },
  });

  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-6 w-[100px]" />
        </div>

        <div className="mt-6">
          <div className="bg-card_light dark:bg-card_dark p-6 rounded-xl shadow-md">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-[200px] mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const staff = data?.staffMember;

  if (!staff) {
    return <div>Staff member not found</div>;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Edit Staff Member
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="mt-6">
        <div className="bg-card_light dark:bg-card_dark p-6 rounded-xl shadow-md">
          <EditStaffForm staff={staff} />
        </div>
      </div>
    </div>
  );
} 