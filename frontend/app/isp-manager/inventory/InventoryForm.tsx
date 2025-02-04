"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { inventorySchema } from "@/lib/schemas";
import { z } from "zod";
import CustomInput from "./CustomInput";
import { useInventory } from "@/graphql/inventory";
import { Loader2 } from "lucide-react";

type FormValues = z.infer<typeof inventorySchema>;

export default function InventoryForm() {
  const router = useRouter();
  const { createInventory, isCreating } = useInventory();

  const form = useForm<FormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert numeric fields
      const numericFields = ["price", "stock"] as const;
      const formattedValues = {
        ...values,
        ...Object.fromEntries(
          numericFields.map((field) => [field, Number(values[field])])
        ),
      };

      await createInventory(formattedValues);
      toast.success("Inventory item created successfully");
      router.push("/isp-manager/inventory");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create inventory item");
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="name"
            label="Item Name"
            placeholder="Enter item name"
            required
          />
          <CustomInput
            control={form.control}
            name="category"
            label="Category"
            placeholder="Enter category"
            required
          />
        </div>

        <CustomInput
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter item description"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="price"
            label="Price"
            placeholder="Enter price"
            type="number"
            required
          />
          <CustomInput
            control={form.control}
            name="stock"
            label="Stock"
            placeholder="Enter stock quantity"
            type="number"
            required
          />
        </div>

        <div className="flex justify-center">
          <Button
            className="w-[200px] justify-center rounded-md bg-gradient-to-tl from-pink-500 to-purple-600 text-white py-2 px-4 hover:opacity-85"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
