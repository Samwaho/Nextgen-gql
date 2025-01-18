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
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Customer, useCustomer } from "@/graphql/customer";
import { useRouter } from "next/navigation";

interface ActionsCellProps {
  customer: Customer;
}

const ActionsCell = ({ customer }: ActionsCellProps) => {
  const router = useRouter();
  const { deleteCustomer } = useCustomer();

  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete customer");
    }
  };

  return (
    <div className="flex items-center text-gray-500">
      <Link href={`/main/customers/${customer.id}`} passHref>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Eye size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Link>
      
      <Link href={`/main/customers/${customer.id}/edit`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="ghost">
                <Pencil size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
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
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              customer and remove their data from our servers.
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
};

export const columns: ColumnDef<Customer>[] = [
  {
    id: "avatar",
    accessorFn: (row) => row.name,
    header: () => <div className=""></div>,
    cell: ({ row }) => {
      const name = row.getValue("avatar") as string;
      return (
        <div className="px-2 py-1 rounded-full w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-800 dark:text-white text-md">
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
                className="cursor-pointer underline"
              >
                {email}
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
              <Link href={`tel:${phone}`} className="cursor-pointer underline">
                {phone}
              </Link>
            </TooltipTrigger>
            <TooltipContent>Call</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "address",
    header: () => <div className="text-fuchsia-500">Address</div>,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-fuchsia-500">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColor =
        {
          active:
            "bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-100",
          inactive:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100",
          expired: "bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-100",
        }[status] ||
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell customer={row.original} />,
  },
];
