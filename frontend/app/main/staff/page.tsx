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
import CreateStaffForm from "@/app/main/staff/StaffForm";
import { formatDate } from "@/lib/utils";
import { UserCog, Users, UserPlus } from "lucide-react";
import { useQuery } from "@apollo/client";
import { Employee, GET_EMPLOYEES } from "@/graphql/employee";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffPage() {
  const { data, loading } = useQuery<{ staffMembers: Employee[] }>(
    GET_EMPLOYEES
  );
  const staffMembers = data?.staffMembers || [];

  const totalStaff = staffMembers.length;
  const adminStaff = staffMembers.filter(
    (staff) => staff.role === "admin"
  ).length;
  const employeeStaff = staffMembers.filter(
    (staff) => staff.role === "employee"
  ).length;

  if (loading) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-6 w-[100px]" />
        </div>

        <div className="flex gap-4 mt-6 flex-wrap">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]"
            >
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="mt-4">
          <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Staff
        </h1>
        <p className="text-sm text-gray-500">{formatDate()}</p>
      </div>

      <div className="flex gap-4 mt-6 flex-wrap">
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Total Staff</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Users size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">{totalStaff}</h1>
          <p className="text-xs md:text-sm text-gray-500">All staff members</p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Admin Staff</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <UserCog size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">{adminStaff}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Staff with admin privileges
          </p>
        </div>
        <div className="bg-card_light dark:bg-card_dark rounded-md flex flex-col gap-2 shadow-md p-3 flex-1 min-w-[150px] max-w-[250px]">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">Employee Staff</p>
            <div className="p-1 rounded-md shadow-md text-white bg-gradient-custom2 w-fit">
              <Users size={16} />
            </div>
          </div>
          <h1 className="font-bold text-lg">{employeeStaff}</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Regular staff members
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-semibold">Staff Table</h4>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-custom flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 text-sm md:text-base text-white rounded-md">
              <UserPlus size={16} />
              <p>Add New</p>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Fill in the fields below to add a new staff member
              </DialogDescription>
            </DialogHeader>
            <CreateStaffForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4">
        <div className="bg-card_light dark:bg-card_dark mt-2 px-2 py-4 rounded-xl shadow-md">
          <DataTable columns={columns} data={staffMembers} />
        </div>
      </div>
    </div>
  );
}
