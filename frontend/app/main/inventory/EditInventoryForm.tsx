"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { inventorySchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "../../../components/ui/form";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomInput from "./CustomInput";
import { Inventory, useInventory } from "@/graphql/inventory";

type InventoryProps = z.infer<typeof inventorySchema> & { id: string };

const EditInventoryForm = ({ inventory }: { inventory: Inventory }) => {
  const router = useRouter();
  const { updateInventory, isUpdating } = useInventory();

  const form = useForm<InventoryProps>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      ...inventory,
    },
  });

  const onSubmit = async (values: InventoryProps) => {
    try {
      await updateInventory(inventory.id, values);
      toast.success("Inventory item updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("Error updating inventory item:", error);
      toast.error("Failed to update inventory item. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="name"
            label="Item Name"
            placeholder="Enter item name"
          />
          <CustomInput
            control={form.control}
            name="category"
            label="Category"
            placeholder="Enter category"
          />
        </div>

        <CustomInput
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter item description"
        />

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="price"
            label="Price"
            placeholder="Enter price"
            type="number"
          />
          <CustomInput
            control={form.control}
            name="stock"
            label="Stock"
            placeholder="Enter stock quantity"
            type="number"
          />
        </div>

        <div className="flex justify-center">
          <Button
            className="w-[200px] justify-center rounded-md bg-gradient-to-tl from-pink-500 to-purple-600 text-white py-2 px-4 hover:opacity-85"
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2Icon size={20} className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditInventoryForm;
