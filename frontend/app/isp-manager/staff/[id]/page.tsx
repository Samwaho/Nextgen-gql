"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MailIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import EditStaffForm from "@/app/isp-manager/staff/EditStaffForm";
import { useQuery } from "@apollo/client";
import { GET_EMPLOYEE, Employee, useEmployee } from "@/graphql/employee";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ViewStaffProps {
  params: Promise<{ id: string }>;
}

export default function ViewStaff({ params }: ViewStaffProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { data, loading } = useQuery<{ staffMember: Employee }>(GET_EMPLOYEE, {
    variables: { id: resolvedParams.id },
  });

  const { deleteEmployee } = useEmployee();

  const handleDelete = async () => {
    try {
      await deleteEmployee(resolvedParams.id);
      toast.success("Staff member deleted successfully");
      router.push("/main/staff");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete staff member");
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!data?.staffMember) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">Staff member not found</h2>
        <Button onClick={() => router.push("/main/staff")}>
          Back to Staff
        </Button>
      </div>
    );
  }

  const staff = data.staffMember;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/main/staff")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">
            <span className="text-sm font-normal text-gray-500">page/ </span>
            Staff Details
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="mt-6 bg-card_light dark:bg-card_dark rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-custom2 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
            {staff.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            <p className="text-gray-500">{staff.email}</p>
          </div>
          <div className="ml-auto">
            <Badge
              variant={staff.role === "admin" ? "active" : "outline"}
              className="text-lg px-3 py-1"
            >
              {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MailIcon className="text-gray-500" size={20} />
                <span>{staff.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="text-gray-500" size={20} />
                <span>{staff.phone}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon className="text-gray-500" size={20} />
                <span>Username: {staff.username}</span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="text-gray-500" size={20} />
                <span>
                  Created:{" "}
                  {staff.createdAt
                    ? new Date(staff.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="text-gray-500" size={20} />
                <span>
                  Last Updated:{" "}
                  {staff.updatedAt
                    ? new Date(staff.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
                <DialogDescription>
                  Make changes to the staff member&apos;s information here.
                </DialogDescription>
              </DialogHeader>
              <EditStaffForm staff={staff} />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  staff member and remove their data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" onClick={handleDelete}>
                    Yes, delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
