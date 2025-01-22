import { gql, useMutation } from "@apollo/client";

// Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  address: string;
  package: {
    id: string;
    name: string;
    serviceType: string;
  } | null;
  status: "active" | "inactive" | "expired";
  expiry: string;
  displayPassword: string;
  createdAt: string;
  updatedAt: string | null;
  agency?: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  address?: string | null;
  package?: string | null;
  status?: string;
  expiry: string;
}

export type CustomerUpdateInput = Partial<Omit<CustomerInput, "password">> & {
  password?: string;
};

// Queries
export const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      id
      name
      email
      phone
      username
      address
      agency
      package {
        id
        name
        serviceType
      }
      status
      expiry
      displayPassword
      createdAt
      updatedAt
    }
  }
`;

export const GET_CUSTOMER = gql`
  query GetCustomer($id: String!) {
    customer(id: $id) {
      id
      name
      email
      phone
      username
      address
      agency
      package {
        id
        name
        serviceType
      }
      status
      expiry
      displayPassword
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($customerInput: CustomerInput!) {
    createCustomer(customerInput: $customerInput) {
      id
      name
      email
      phone
      username
      address
      agency
      package {
        id
        name
        serviceType
      }
      status
      expiry
      displayPassword
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: String!, $customerInput: CustomerUpdateInput!) {
    updateCustomer(id: $id, customerInput: $customerInput) {
      id
      name
      email
      phone
      username
      address
      agency
      package {
        id
        name
        serviceType
      }
      status
      expiry
      displayPassword
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: String!) {
    deleteCustomer(id: $id)
  }
`;

interface CreateCustomerResponse {
  createCustomer: Customer;
}

interface UpdateCustomerResponse {
  updateCustomer: Customer;
}

interface DeleteCustomerResponse {
  deleteCustomer: boolean;
}

// Example usage functions
export const useCustomer = () => {
  const [createCustomerMutation, { loading: isCreating }] = useMutation<
    CreateCustomerResponse,
    { customerInput: CustomerInput }
  >(CREATE_CUSTOMER);

  const [updateCustomerMutation, { loading: isUpdating }] = useMutation<
    UpdateCustomerResponse,
    { id: string; customerInput: CustomerUpdateInput }
  >(UPDATE_CUSTOMER);

  const [deleteCustomerMutation, { loading: isDeleting }] = useMutation<
    DeleteCustomerResponse,
    { id: string }
  >(DELETE_CUSTOMER);

  const handleCreateCustomer = async (input: CustomerInput) => {
    try {
      const { data } = await createCustomerMutation({
        variables: { customerInput: input },
        refetchQueries: [{ query: GET_CUSTOMERS }],
      });
      return data?.createCustomer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  };

  const handleUpdateCustomer = async (
    id: string,
    input: CustomerUpdateInput
  ) => {
    try {
      const { data } = await updateCustomerMutation({
        variables: { id, customerInput: input },
        refetchQueries: [{ query: GET_CUSTOMERS }],
      });
      return data?.updateCustomer;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const { data } = await deleteCustomerMutation({
        variables: { id },
        refetchQueries: [{ query: GET_CUSTOMERS }],
      });
      return data?.deleteCustomer;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  };

  return {
    createCustomer: handleCreateCustomer,
    updateCustomer: handleUpdateCustomer,
    deleteCustomer: handleDeleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
