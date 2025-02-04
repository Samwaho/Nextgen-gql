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
import { Eye, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Station, useStation } from "@/graphql/station";
import { useRouter } from "next/navigation";

interface ActionsCellProps {
  station: Station;
}

const ActionsCell = ({ station }: ActionsCellProps) => {
  const router = useRouter();
  const { deleteStation } = useStation();

  const handleDelete = async () => {
    try {
      await deleteStation(station.id);
      toast.success("Station deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete station");
    }
  };

  return (
    <div className="flex items-center text-gray-500">
      <Link href={`/isp-manager/stations/${station.id}`} passHref>
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

      <Link href={`/isp-manager/stations/${station.id}/edit`}>
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
              station and remove its data from our servers.
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

export const columns: ColumnDef<Station>[] = [
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
    accessorKey: "location",
    header: () => <div className="text-fuchsia-500">Location</div>,
  },
  {
    accessorKey: "address",
    header: () => <div className="text-fuchsia-500">Address</div>,
  },
  {
    accessorKey: "buildingType",
    header: () => <div className="text-fuchsia-500">Building Type</div>,
    cell: ({ row }) => {
      const type = row.getValue("buildingType") as string;
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
  },
  {
    accessorKey: "totalCustomers",
    header: () => <div className="text-fuchsia-500">Customers</div>,
    cell: ({ row }) => {
      const count = row.getValue("totalCustomers") as number;
      return (
        <div className="flex items-center gap-1">
          <Users size={16} className="text-gray-500" />
          <span>{count}</span>
        </div>
      );
    },
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
    cell: ({ row }) => <ActionsCell station={row.original} />,
  },
]; 