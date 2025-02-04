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
import { Inventory, useInventory } from "@/graphql/inventory";
import { useRouter } from "next/navigation";

interface ActionsCellProps {
  inventory: Inventory;
}

function ActionsCell({ inventory }: ActionsCellProps) {
  const router = useRouter();
  const { deleteInventory } = useInventory();

  const handleDelete = async () => {
    try {
      await deleteInventory(inventory.id);
      toast.success("Inventory item deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete inventory item");
    }
  };

  return (
    <div className="flex items-center text-gray-500">
      <Link href={`/isp-manager/inventory/${inventory.id}`} passHref>
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

      <Link href={`/isp-manager/inventory/${inventory.id}/edit`}>
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
              inventory item and remove its data from our servers.
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

export const columns: ColumnDef<Inventory>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-fuchsia-500">Name</div>,
  },
  {
    accessorKey: "category",
    header: () => <div className="text-fuchsia-500">Category</div>,
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
    accessorKey: "stock",
    header: () => <div className="text-fuchsia-500">Stock</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell inventory={row.original} />,
  },
];
