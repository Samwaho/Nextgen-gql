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
import { Package, usePackage } from "@/graphql/package";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ActionCellProps {
  package: Package;
}

function ActionCell({ package: pkg }: ActionCellProps) {
  const { deletePackage } = usePackage();

  const handleDelete = async () => {
    try {
      await deletePackage(pkg.id);
      toast.success("Package deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete package");
    }
  };

  return (
    <div className="flex items-center text-gray-500">
      <Link href={`/isp-manager/packages/${pkg.id}`} passHref>
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

      <Link href={`/isp-manager/packages/${pkg.id}/edit`}>
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
              package and remove its data from our servers.
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

export const columns: ColumnDef<Package>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-fuchsia-500">Name</div>,
  },
  {
    accessorKey: "downloadSpeed",
    header: () => <div className="text-fuchsia-500">Download Speed</div>,
    cell: ({ row }) => {
      const speed = row.getValue("downloadSpeed") as number;
      return <div>{speed} Mbps</div>;
    },
  },
  {
    accessorKey: "uploadSpeed",
    header: () => <div className="text-fuchsia-500">Upload Speed</div>,
    cell: ({ row }) => {
      const speed = row.getValue("uploadSpeed") as number;
      return <div>{speed} Mbps</div>;
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-fuchsia-500">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
      }).format(price);
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "serviceType",
    header: () => <div className="text-fuchsia-500">Service Type</div>,
    cell: ({ row }) => {
      const type = row.getValue("serviceType") as string;
      const typeColor =
        type === "pppoe"
          ? "bg-green-100 text-green-800"
          : type === "hotspot"
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-800";

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}
        >
          {type ? type.toUpperCase() : "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell package={row.original} />,
  },
];
