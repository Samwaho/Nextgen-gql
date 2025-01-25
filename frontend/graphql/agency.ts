import { gql, useMutation } from "@apollo/client";

// Types
export interface Agency {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  banner?: string;
  description?: string;
  mpesaShortcode?: string;
  mpesaEnv?: string;
  mpesaB2cShortcode?: string;
  mpesaB2bShortcode?: string;
  mpesaInitiatorName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AgencyInput {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  banner?: string;
  description?: string;
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaShortcode?: string;
  mpesaPasskey?: string;
  mpesaEnv?: string;
  mpesaB2cShortcode?: string;
  mpesaB2bShortcode?: string;
  mpesaInitiatorName?: string;
  mpesaInitiatorPassword?: string;
}

// Queries
export const GET_AGENCIES = gql`
  query GetAgencies {
    agencies {
      id
      name
      address
      phone
      email
      website
      logo
      banner
      description
      mpesaShortcode
      mpesaEnv
      mpesaB2cShortcode
      mpesaB2bShortcode
      mpesaInitiatorName
      createdAt
      updatedAt
    }
  }
`;

export const GET_AGENCY = gql`
  query GetAgency($id: String!) {
    agency(id: $id) {
      id
      name
      address
      phone
      email
      website
      logo
      banner
      description
      mpesaShortcode
      mpesaEnv
      mpesaB2cShortcode
      mpesaB2bShortcode
      mpesaInitiatorName
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const CREATE_AGENCY = gql`
  mutation CreateAgency($agencyInput: AgencyInput!) {
    createAgency(agencyInput: $agencyInput) {
      id
      name
      address
      phone
      email
      website
      logo
      banner
      description
      mpesaShortcode
      mpesaEnv
      mpesaB2cShortcode
      mpesaB2bShortcode
      mpesaInitiatorName
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_AGENCY = gql`
  mutation UpdateAgency($id: String!, $agencyInput: AgencyUpdateInput!) {
    updateAgency(id: $id, agencyInput: $agencyInput) {
      id
      name
      address
      phone
      email
      website
      logo
      banner
      description
      mpesaShortcode
      mpesaEnv
      mpesaB2cShortcode
      mpesaB2bShortcode
      mpesaInitiatorName
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_AGENCY = gql`
  mutation DeleteAgency($id: String!) {
    deleteAgency(id: $id)
  }
`;

// Example usage functions
export const useAgency = () => {
  const [createAgencyMutation, { loading: isCreating }] =
    useMutation(CREATE_AGENCY);
  const [updateAgencyMutation, { loading: isUpdating }] =
    useMutation(UPDATE_AGENCY);
  const [deleteAgencyMutation, { loading: isDeleting }] =
    useMutation(DELETE_AGENCY);

  const handleCreateAgency = async (input: AgencyInput) => {
    try {
      const { data } = await createAgencyMutation({
        variables: { agencyInput: input },
        refetchQueries: [{ query: GET_AGENCIES }],
      });
      return data.createAgency;
    } catch (error) {
      console.error("Error creating agency:", error);
      throw error;
    }
  };

  const handleUpdateAgency = async (
    id: string,
    input: Partial<AgencyInput>
  ) => {
    try {
      const { data } = await updateAgencyMutation({
        variables: { id, agencyInput: input },
        refetchQueries: [{ query: GET_AGENCIES }],
      });
      return data.updateAgency;
    } catch (error) {
      console.error("Error updating agency:", error);
      throw error;
    }
  };

  const handleDeleteAgency = async (id: string) => {
    try {
      const { data } = await deleteAgencyMutation({
        variables: { id },
        refetchQueries: [{ query: GET_AGENCIES }],
      });
      return data.deleteAgency;
    } catch (error) {
      console.error("Error deleting agency:", error);
      throw error;
    }
  };

  return {
    createAgency: handleCreateAgency,
    updateAgency: handleUpdateAgency,
    deleteAgency: handleDeleteAgency,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
