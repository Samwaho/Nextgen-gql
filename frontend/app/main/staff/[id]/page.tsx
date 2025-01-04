import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosHeaders } from "@/lib/actions";
import { axiosInstance, dateFormat } from "@/lib/utils";
import {
  MailIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditStaffForm from "@/app/main/staff/EditStaffForm";

const ViewStaff = async ({ params }: { params: { id: string } }) => {
  const res = await axiosInstance.get(
    `/staff/${params.id}`,
    await axiosHeaders()
  );

  const staff = res.data;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <span className="text-sm font-normal text-gray-500">page/ </span>
          Staff Details
        </h1>
        <p className="text-sm text-gray-500">{dateFormat()}</p>
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
                  Created: {new Date(staff.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="text-gray-500" size={20} />
                <span>
                  Last Updated: {new Date(staff.updatedAt).toLocaleDateString()}
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
          <Button variant="destructive">Delete Staff</Button>
        </div>
      </div>
    </div>
  );
};

export default ViewStaff;
