import { gql, useMutation } from "@apollo/client";

// Types
export interface Inventory {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  agency: string;
  created_at: string;
  updated_at: string | null;
}

export interface InventoryInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export type InventoryUpdateInput = Partial<InventoryInput>;

// Queries
export const GET_INVENTORIES = gql`
  query GetInventories {
    inventories {
      id
      name
      description
      price
      stock
      category
      agency
      createdAt
      updatedAt
    }
  }
`;

export const GET_INVENTORY = gql`
  query GetInventory($id: String!) {
    inventory(id: $id) {
      id
      name
      description
      price
      stock
      category
      agency
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const CREATE_INVENTORY = gql`
  mutation CreateInventory($inventoryInput: InventoryInput!) {
    createInventory(inventoryInput: $inventoryInput) {
      id
      name
      description
      price
      stock
      category
      agency
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_INVENTORY = gql`
  mutation UpdateInventory(
    $id: String!
    $inventoryInput: InventoryUpdateInput!
  ) {
    updateInventory(id: $id, inventoryInput: $inventoryInput) {
      id
      name
      description
      price
      stock
      category
      agency
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_INVENTORY = gql`
  mutation DeleteInventory($id: String!) {
    deleteInventory(id: $id)
  }
`;

interface CreateInventoryResponse {
  createInventory: Inventory;
}

interface UpdateInventoryResponse {
  updateInventory: Inventory;
}

interface DeleteInventoryResponse {
  deleteInventory: boolean;
}

// Example usage functions
export const useInventory = () => {
  const [createInventoryMutation, { loading: isCreating }] = useMutation<
    CreateInventoryResponse,
    { inventoryInput: InventoryInput }
  >(CREATE_INVENTORY);

  const [updateInventoryMutation, { loading: isUpdating }] = useMutation<
    UpdateInventoryResponse,
    { id: string; inventoryInput: InventoryUpdateInput }
  >(UPDATE_INVENTORY);

  const [deleteInventoryMutation, { loading: isDeleting }] = useMutation<
    DeleteInventoryResponse,
    { id: string }
  >(DELETE_INVENTORY);

  const handleCreateInventory = async (input: InventoryInput) => {
    try {
      const { data } = await createInventoryMutation({
        variables: { inventoryInput: input },
        refetchQueries: [{ query: GET_INVENTORIES }],
      });
      return data?.createInventory;
    } catch (error) {
      console.error("Error creating inventory:", error);
      throw error;
    }
  };

  const handleUpdateInventory = async (
    id: string,
    input: InventoryUpdateInput
  ) => {
    try {
      const { data } = await updateInventoryMutation({
        variables: { id, inventoryInput: input },
        refetchQueries: [{ query: GET_INVENTORIES }],
      });
      return data?.updateInventory;
    } catch (error) {
      console.error("Error updating inventory:", error);
      throw error;
    }
  };

  const handleDeleteInventory = async (id: string) => {
    try {
      const { data } = await deleteInventoryMutation({
        variables: { id },
        refetchQueries: [{ query: GET_INVENTORIES }],
      });
      return data?.deleteInventory;
    } catch (error) {
      console.error("Error deleting inventory:", error);
      throw error;
    }
  };

  return {
    createInventory: handleCreateInventory,
    updateInventory: handleUpdateInventory,
    deleteInventory: handleDeleteInventory,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
