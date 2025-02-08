import { gql, useMutation } from "@apollo/client";

export interface Tier {
  name: string;
  price: number;
  features: string[];
}

export interface Service {
  id: string;
  name: string;
  tiers: Tier[];
  createdAt: string;
  updatedAt: string | null;
}

export interface TierInput {
  name: string;
  price: number;
  features: string[];
}

export interface ServiceInput {
  name: string;
  tiers: TierInput[];
}

export type ServiceUpdateInput = Partial<ServiceInput>;

export const GET_SERVICES = gql`
  query GetServices {
    services {
      id
      name
      tiers {
        name
        price
        features
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SERVICE = gql`
  query GetService($id: String!) {
    service(id: $id) {
      id
      name
      tiers {
        name
        price
        features
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SERVICE = gql`
  mutation CreateService($serviceInput: ServiceInput!) {
    createService(serviceInput: $serviceInput) {
      id
      name
      tiers {
        name
        price
        features
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SERVICE = gql`
  mutation UpdateService($id: String!, $serviceInput: ServiceUpdateInput!) {
    updateService(id: $id, serviceInput: $serviceInput) {
      id
      name
      tiers {
        name
        price
        features
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SERVICE = gql`
  mutation DeleteService($id: String!) {
    deleteService(id: $id)
  }
`;

export const useService = () => {
  const [createServiceMutation, { loading: isCreating }] = useMutation<
    { createService: Service },
    { serviceInput: ServiceInput }
  >(CREATE_SERVICE);

  const [updateServiceMutation, { loading: isUpdating }] = useMutation<
    { updateService: Service },
    { id: string; serviceInput: ServiceUpdateInput }
  >(UPDATE_SERVICE);

  const [deleteServiceMutation, { loading: isDeleting }] = useMutation<
    { deleteService: boolean },
    { id: string }
  >(DELETE_SERVICE);

  const createService = async (input: ServiceInput) => {
    const { data } = await createServiceMutation({
      variables: { serviceInput: input },
      refetchQueries: [{ query: GET_SERVICES }],
    });
    return data?.createService;
  };

  const updateService = async (id: string, input: ServiceUpdateInput) => {
    const { data } = await updateServiceMutation({
      variables: { id, serviceInput: input },
      refetchQueries: [{ query: GET_SERVICES }],
    });
    return data?.updateService;
  };

  const deleteService = async (id: string) => {
    const { data } = await deleteServiceMutation({
      variables: { id },
      refetchQueries: [{ query: GET_SERVICES }],
    });
    return data?.deleteService;
  };

  return {
    createService,
    updateService,
    deleteService,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
