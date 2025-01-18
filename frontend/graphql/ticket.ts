import { gql, useMutation } from "@apollo/client";

// Types
export interface Ticket {
  id: string;
  customer: string;
  assignedEmployee: string | null;
  status: "open" | "in-progress" | "closed";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  agency: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TicketInput {
  customer: string;
  assignedEmployee?: string | null;
  status?: "open" | "in-progress" | "closed";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
}

export type TicketUpdateInput = Partial<TicketInput>;

// Queries
export const GET_TICKETS = gql`
  query GetTickets {
    tickets {
      id
      customer
      assignedEmployee
      status
      title
      description
      priority
      agency
      createdAt
      updatedAt
    }
  }
`;

export const GET_TICKET = gql`
  query GetTicket($id: String!) {
    ticket(id: $id) {
      id
      customer
      assignedEmployee
      status
      title
      description
      priority
      agency
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const CREATE_TICKET = gql`
  mutation CreateTicket($ticketInput: TicketInput!) {
    createTicket(ticketInput: $ticketInput) {
      id
      customer
      assignedEmployee
      status
      title
      description
      priority
      agency
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TICKET = gql`
  mutation UpdateTicket($id: String!, $ticketInput: TicketUpdateInput!) {
    updateTicket(id: $id, ticketInput: $ticketInput) {
      id
      customer
      assignedEmployee
      status
      title
      description
      priority
      agency
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TICKET = gql`
  mutation DeleteTicket($id: String!) {
    deleteTicket(id: $id)
  }
`;

export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus($id: String!, $status: String!, $assignedEmployee: String) {
    updateTicket(
      id: $id, 
      ticketInput: { 
        status: $status,
        assignedEmployee: $assignedEmployee
      }
    ) {
      id
      customer
      assignedEmployee
      status
      title
      description
      priority
      agency
      createdAt
      updatedAt
    }
  }
`;

interface CreateTicketResponse {
  createTicket: Ticket;
}

interface UpdateTicketResponse {
  updateTicket: Ticket;
}

interface DeleteTicketResponse {
  deleteTicket: boolean;
}

// Hook for ticket operations
export const useTicket = () => {
  const [createTicketMutation, { loading: isCreating }] = useMutation<
    CreateTicketResponse,
    { ticketInput: TicketInput }
  >(CREATE_TICKET);

  const [updateTicketMutation, { loading: isUpdating }] = useMutation<
    UpdateTicketResponse,
    { id: string; ticketInput: TicketUpdateInput }
  >(UPDATE_TICKET);

  const [deleteTicketMutation, { loading: isDeleting }] = useMutation<
    DeleteTicketResponse,
    { id: string }
  >(DELETE_TICKET);

  const handleCreateTicket = async (input: TicketInput) => {
    try {
      const { data } = await createTicketMutation({
        variables: { ticketInput: input },
        refetchQueries: [{ query: GET_TICKETS }],
      });
      return data?.createTicket;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  };

  const handleUpdateTicket = async (id: string, input: TicketUpdateInput) => {
    try {
      const { data } = await updateTicketMutation({
        variables: { id, ticketInput: input },
        refetchQueries: [{ query: GET_TICKETS }],
      });
      return data?.updateTicket;
    } catch (error) {
      console.error("Error updating ticket:", error);
      throw error;
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      const { data } = await deleteTicketMutation({
        variables: { id },
        refetchQueries: [{ query: GET_TICKETS }],
      });
      return data?.deleteTicket;
    } catch (error) {
      console.error("Error deleting ticket:", error);
      throw error;
    }
  };

  return {
    createTicket: handleCreateTicket,
    updateTicket: handleUpdateTicket,
    deleteTicket: handleDeleteTicket,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
