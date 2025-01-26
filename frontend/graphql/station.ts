import { gql, useMutation } from "@apollo/client";

// Types
export interface Station {
  id: string;
  name: string;
  location: string;
  address: string;
  coordinates?: string;
  buildingType: string;
  totalCustomers: number;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string | null;
  agency?: string;
}

export interface StationInput {
  name: string;
  location: string;
  address: string;
  coordinates?: string;
  buildingType: string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  status?: string;
}

export type StationUpdateInput = Partial<StationInput>;

// Queries
export const GET_STATIONS = gql`
  query GetStations {
    stations {
      id
      name
      location
      address
      coordinates
      buildingType
      totalCustomers
      contactPerson
      contactPhone
      notes
      agency
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_STATION = gql`
  query GetStation($id: String!) {
    station(id: $id) {
      id
      name
      location
      address
      coordinates
      buildingType
      totalCustomers
      contactPerson
      contactPhone
      notes
      agency
      status
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const CREATE_STATION = gql`
  mutation CreateStation($stationInput: StationInput!) {
    createStation(stationInput: $stationInput) {
      id
      name
      location
      address
      coordinates
      buildingType
      totalCustomers
      contactPerson
      contactPhone
      notes
      agency
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_STATION = gql`
  mutation UpdateStation($id: String!, $stationInput: StationUpdateInput!) {
    updateStation(id: $id, stationInput: $stationInput) {
      id
      name
      location
      address
      coordinates
      buildingType
      totalCustomers
      contactPerson
      contactPhone
      notes
      agency
      status
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_STATION = gql`
  mutation DeleteStation($id: String!) {
    deleteStation(id: $id)
  }
`;

// Custom hooks
export const useStation = () => {
  const [createStationMutation, { loading: isCreating }] = useMutation<
    { createStation: Station },
    { stationInput: StationInput }
  >(CREATE_STATION);

  const [updateStationMutation, { loading: isUpdating }] = useMutation<
    { updateStation: Station },
    { id: string; stationInput: StationUpdateInput }
  >(UPDATE_STATION);

  const [deleteStationMutation, { loading: isDeleting }] = useMutation<
    { deleteStation: boolean },
    { id: string }
  >(DELETE_STATION);

  const handleCreateStation = async (input: StationInput) => {
    try {
      const { data } = await createStationMutation({
        variables: { stationInput: input },
        refetchQueries: [{ query: GET_STATIONS }],
      });
      return data?.createStation;
    } catch (error) {
      console.error("Error creating station:", error);
      throw error;
    }
  };

  const handleUpdateStation = async (
    id: string,
    input: StationUpdateInput
  ) => {
    try {
      const { data } = await updateStationMutation({
        variables: { id, stationInput: input },
        refetchQueries: [{ query: GET_STATIONS }],
      });
      return data?.updateStation;
    } catch (error) {
      console.error("Error updating station:", error);
      throw error;
    }
  };

  const handleDeleteStation = async (id: string) => {
    try {
      const { data } = await deleteStationMutation({
        variables: { id },
        refetchQueries: [{ query: GET_STATIONS }],
      });
      return data?.deleteStation;
    } catch (error) {
      console.error("Error deleting station:", error);
      throw error;
    }
  };

  return {
    createStation: handleCreateStation,
    updateStation: handleUpdateStation,
    deleteStation: handleDeleteStation,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
