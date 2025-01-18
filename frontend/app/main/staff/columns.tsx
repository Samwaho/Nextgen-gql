"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Employee, useEmployee } from "@/graphql/employee";
import { useRouter } from "next/navigation";

function ActionsCell({ employee }: { employee: Employee }) {
  const router = useRouter();
  const { deleteEmployee } = useEmployee();

  const handleDelete = async () => {
    try {
      await deleteEmployee(employee.id);
      toast.success("Staff member deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete staff member");
    }
  };

  return (
    <div className="flex items-center text-gray-500">
      <Link href={`/main/staff/${employee.id}`} passHref>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Eye size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View details</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Link>

      <Link href={`/main/staff/${employee.id}/edit`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Pencil size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit staff member</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Link>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Trash2 size={16} />
                </TooltipTrigger>
                <TooltipContent>Delete staff member</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Button>
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
  );
}

export const columns: ColumnDef<Employee>[] = [
  {
    id: "avatar",
    accessorKey: "name",
    header: () => <div className=""></div>,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center bg-gradient-to-tl from-pink-500 to-purple-600 text-white text-md">
          {name[0].toUpperCase()}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div className="text-fuchsia-500">Name</div>,
  },
  {
    accessorKey: "username",
    header: () => <div className="text-fuchsia-500">Username</div>,
  },
  {
    accessorKey: "email",
    header: () => <div className="text-fuchsia-500">Email</div>,
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`mailto:${email}`}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <Mail size={14} />
                <span>{email}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Send email</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-fuchsia-500">Phone</div>,
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`tel:${phone}`}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <Phone size={14} />
                <span>{phone}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Call</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => <div className="text-fuchsia-500">Role</div>,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleColor =
        role === "admin"
          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor}`}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell employee={row.original} />,
  },
];
