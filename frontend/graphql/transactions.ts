import { gql, useMutation } from "@apollo/client";

// Types
export interface MpesaTransaction {
  id: string;
  agencyId: string;
  customerId?: string;
  customerUsername?: string;
  type: "c2b" | "b2c" | "b2b" | "balance";
  amount: number;
  phone?: string;
  reference: string;
  remarks?: string;
  status: "pending" | "completed" | "failed" | "cancelled" | "timeout" | "validated" | "invalidated";
  mpesaReceipt?: string;
  receiverShortcode?: string;
  responseData?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
  packageId?: string;
  months?: number;
  commandId?: string;
  conversationId?: string;
  originatorConversationId?: string;
}

export interface TransactionFilter {
  agencyId?: string;
  customerId?: string;
  type?: string;
  status?: string;
  reference?: string;
  startDate?: string;
  endDate?: string;
  phone?: string;
  mpesaReceipt?: string;
}

export interface CustomerPaymentInput {
  customerId: string;
  packageId: string;
  amount: number;
  phone: string;
  months?: number;
  remarks?: string;
}

export interface B2CPaymentInput {
  phone: string;
  amount: number;
  reference: string;
  remarks: string;
}

export interface B2BPaymentInput {
  receiverShortcode: string;
  amount: number;
  reference: string;
  remarks: string;
}

// Queries
export const GET_TRANSACTIONS = gql`
  query GetTransactions($filter: TransactionFilter) {
    mpesaTransactions(filter: $filter) {
      id
      agencyId
      customerId
      customerUsername
      type
      amount
      phone
      reference
      remarks
      status
      mpesaReceipt
      receiverShortcode
      responseData
      createdAt
      completedAt
      updatedAt
      packageId
      months
      commandId
      conversationId
      originatorConversationId
    }
  }
`;

// Mutations
export const INITIATE_CUSTOMER_PAYMENT = gql`
  mutation InitiateCustomerPayment($input: CustomerPaymentInput!) {
    initiateCustomerPayment(input: $input) {
      success
      message
      transactionId
      reference
    }
  }
`;

export const INITIATE_B2C_PAYMENT = gql`
  mutation InitiateB2CPayment($input: B2CPaymentInput!) {
    initiateB2cPayment(input: $input) {
      success
      message
      transactionId
      reference
    }
  }
`;

export const INITIATE_B2B_PAYMENT = gql`
  mutation InitiateB2BPayment($input: B2BPaymentInput!) {
    initiateB2bPayment(input: $input) {
      success
      message
      transactionId
      reference
    }
  }
`;

interface InitiatePaymentResponse {
  initiateCustomerPayment: {
    success: boolean;
    message: string;
    transactionId?: string;
    reference?: string;
  };
  initiateB2cPayment?: {
    success: boolean;
    message: string;
    transactionId?: string;
    reference?: string;
  };
  initiateB2bPayment?: {
    success: boolean;
    message: string;
    transactionId?: string;
    reference?: string;
  };
}

// Hook for managing transactions
export const useTransactions = () => {
  const [initiatePaymentMutation, { loading: isInitiating }] = useMutation<
    InitiatePaymentResponse,
    { input: CustomerPaymentInput }
  >(INITIATE_CUSTOMER_PAYMENT);

  const [initiateB2CPaymentMutation, { loading: isInitiatingB2C }] = useMutation<
    InitiatePaymentResponse,
    { input: B2CPaymentInput }
  >(INITIATE_B2C_PAYMENT);

  const [initiateB2BPaymentMutation, { loading: isInitiatingB2B }] = useMutation<
    InitiatePaymentResponse,
    { input: B2BPaymentInput }
  >(INITIATE_B2B_PAYMENT);

  const handleInitiatePayment = async (input: CustomerPaymentInput) => {
    try {
      const { data } = await initiatePaymentMutation({
        variables: { input },
        refetchQueries: [{ query: GET_TRANSACTIONS }],
      });
      return data?.initiateCustomerPayment;
    } catch (error) {
      console.error("Error initiating payment:", error);
      throw error;
    }
  };

  const handleInitiateB2CPayment = async (input: B2CPaymentInput) => {
    try {
      const { data } = await initiateB2CPaymentMutation({
        variables: { input },
        refetchQueries: [{ query: GET_TRANSACTIONS }],
      });
      return data?.initiateB2cPayment;
    } catch (error) {
      console.error("Error initiating B2C payment:", error);
      throw error;
    }
  };

  const handleInitiateB2BPayment = async (input: B2BPaymentInput) => {
    try {
      const { data } = await initiateB2BPaymentMutation({
        variables: { input },
        refetchQueries: [{ query: GET_TRANSACTIONS }],
      });
      return data?.initiateB2bPayment;
    } catch (error) {
      console.error("Error initiating B2B payment:", error);
      throw error;
    }
  };

  return {
    initiatePayment: handleInitiatePayment,
    initiateB2CPayment: handleInitiateB2CPayment,
    initiateB2BPayment: handleInitiateB2BPayment,
    isInitiating,
    isInitiatingB2C,
    isInitiatingB2B,
  };
};
