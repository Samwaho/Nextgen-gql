import { gql, useMutation, useQuery } from "@apollo/client";

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
  password: string;  // PPPoE password
  createdAt: string;
  updatedAt: string | null;
  agency?: string;
}

export interface AccountingData {
  username: string;
  sessionId: string;
  status: string;
  sessionTime: number;
  inputOctets: number;
  outputOctets: number;
  inputPackets: number;
  outputPackets: number;
  inputGigawords: number;
  outputGigawords: number;
  calledStationId: string;
  callingStationId: string;
  terminateCause: string;
  nasIpAddress: string;
  nasIdentifier: string;
  nasPort: string;
  nasPortType: string;
  serviceType: string;
  framedProtocol: string;
  framedIpAddress: string;
  idleTimeout: number;
  sessionTimeout: number;
  mikrotikRateLimit: string;
  timestamp: string;
  totalInputBytes: number;
  totalOutputBytes: number;
  totalBytes: number;
  inputMbytes: number;
  outputMbytes: number;
  totalMbytes: number;
  sessionTimeHours: number;
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
      password
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
      password
      createdAt
      updatedAt
    }
  }
`;

export const GET_CUSTOMER_ACCOUNTING = gql`
  query GetCustomerAccounting($username: String!) {
    customerAccounting(username: $username) {
      username
      sessionId
      status
      sessionTime
      inputOctets
      outputOctets
      inputPackets
      outputPackets
      inputGigawords
      outputGigawords
      calledStationId
      callingStationId
      terminateCause
      nasIpAddress
      nasIdentifier
      nasPort
      nasPortType
      serviceType
      framedProtocol
      framedIpAddress
      idleTimeout
      sessionTimeout
      mikrotikRateLimit
      timestamp
      totalInputBytes
      totalOutputBytes
      totalBytes
      inputMbytes
      outputMbytes
      totalMbytes
      sessionTimeHours
    }
  }
`;

export const GET_CUSTOMER_ACCOUNTING_HISTORY = gql`
  query GetCustomerAccountingHistory($username: String!) {
    customerAccountingHistory(username: $username) {
      username
      sessionId
      status
      sessionTime
      inputOctets
      outputOctets
      inputPackets
      outputPackets
      inputGigawords
      outputGigawords
      calledStationId
      callingStationId
      terminateCause
      nasIpAddress
      nasIdentifier
      nasPort
      nasPortType
      serviceType
      framedProtocol
      framedIpAddress
      idleTimeout
      sessionTimeout
      mikrotikRateLimit
      timestamp
      totalInputBytes
      totalOutputBytes
      totalBytes
      inputMbytes
      outputMbytes
      totalMbytes
      sessionTimeHours
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
      password
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
      password
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

// Custom hooks
export const useCustomer = () => {
  const [createCustomerMutation, { loading: isCreating }] = useMutation<
    { createCustomer: Customer },
    { customerInput: CustomerInput }
  >(CREATE_CUSTOMER);

  const [updateCustomerMutation, { loading: isUpdating }] = useMutation<
    { updateCustomer: Customer },
    { id: string; customerInput: CustomerUpdateInput }
  >(UPDATE_CUSTOMER);

  const [deleteCustomerMutation, { loading: isDeleting }] = useMutation<
    { deleteCustomer: boolean },
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

// Hook for fetching accounting data
export const useCustomerAccounting = (username: string) => {
  const { data: accountingData, loading: loadingAccounting } = useQuery<
    { customerAccounting: AccountingData },
    { username: string }
  >(GET_CUSTOMER_ACCOUNTING, {
    variables: { username },
    pollInterval: 30000, // Poll every 30 seconds
  });

  const { data: historyData, loading: loadingHistory } = useQuery<
    { customerAccountingHistory: AccountingData[] },
    { username: string }
  >(GET_CUSTOMER_ACCOUNTING_HISTORY, {
    variables: { username },
  });

  return {
    accounting: accountingData?.customerAccounting,
    accountingHistory: historyData?.customerAccountingHistory || [],
    isLoading: loadingAccounting || loadingHistory,
  };
};
