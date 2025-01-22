import { gql, useMutation } from "@apollo/client";

export interface Package {
  id: string;
  name: string;
  price: number;
  // Network settings
  downloadSpeed: number;
  uploadSpeed: number;
  // Burst configuration
  burstDownload: number | null;
  burstUpload: number | null;
  thresholdDownload: number | null;
  thresholdUpload: number | null;
  burstTime: number | null;
  // MikroTik service configuration
  serviceType: string | null;
  addressPool: string | null;
  // Session management
  sessionTimeout: number | null;
  idleTimeout: number | null;
  // QoS and VLAN
  priority: number | null;
  vlanId: number | null;
  // Administrative
  agency: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PackageInput {
  name: string;
  price: number;
  // Network settings
  downloadSpeed: number;
  uploadSpeed: number;
  // Burst configuration
  burstDownload?: number | null;
  burstUpload?: number | null;
  thresholdDownload?: number | null;
  thresholdUpload?: number | null;
  burstTime?: number | null;
  // MikroTik service configuration
  serviceType?: string | null;
  addressPool?: string | null;
  // Session management
  sessionTimeout?: number | null;
  idleTimeout?: number | null;
  // QoS and VLAN
  priority?: number | null;
  vlanId?: number | null;
}

export type PackageUpdateInput = Partial<PackageInput>;

export const GET_PACKAGES = gql`
  query GetPackages {
    packages {
      id
      name
      price
      # Network settings
      downloadSpeed
      uploadSpeed
      # Burst configuration
      burstDownload
      burstUpload
      thresholdDownload
      thresholdUpload
      burstTime
      # MikroTik service configuration
      serviceType
      addressPool
      # Session management
      sessionTimeout
      idleTimeout
      # QoS and VLAN
      priority
      vlanId
      # Administrative
      agency
      createdAt
      updatedAt
    }
  }
`;

export const GET_PACKAGE = gql`
  query GetPackage($id: String!) {
    package(id: $id) {
      id
      name
      price
      # Network settings
      downloadSpeed
      uploadSpeed
      # Burst configuration
      burstDownload
      burstUpload
      thresholdDownload
      thresholdUpload
      burstTime
      # MikroTik service configuration
      serviceType
      addressPool
      # Session management
      sessionTimeout
      idleTimeout
      # QoS and VLAN
      priority
      vlanId
      # Administrative
      agency
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PACKAGE = gql`
  mutation CreatePackage($packageInput: PackageInput!) {
    createPackage(packageInput: $packageInput) {
      id
      name
      price
      # Network settings
      downloadSpeed
      uploadSpeed
      # Burst configuration
      burstDownload
      burstUpload
      thresholdDownload
      thresholdUpload
      burstTime
      # MikroTik service configuration
      serviceType
      addressPool
      # Session management
      sessionTimeout
      idleTimeout
      # QoS and VLAN
      priority
      vlanId
      # Administrative
      agency
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PACKAGE = gql`
  mutation UpdatePackage($id: String!, $packageInput: PackageUpdateInput!) {
    updatePackage(id: $id, packageInput: $packageInput) {
      id
      name
      price
      # Network settings
      downloadSpeed
      uploadSpeed
      # Burst configuration
      burstDownload
      burstUpload
      thresholdDownload
      thresholdUpload
      burstTime
      # MikroTik service configuration
      serviceType
      addressPool
      # Session management
      sessionTimeout
      idleTimeout
      # QoS and VLAN
      priority
      vlanId
      # Administrative
      agency
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PACKAGE = gql`
  mutation DeletePackage($id: String!) {
    deletePackage(id: $id)
  }
`;

export const usePackage = () => {
  const [createPackageMutation, { loading: isCreating }] = useMutation<
    { createPackage: Package },
    { packageInput: PackageInput }
  >(CREATE_PACKAGE);

  const [updatePackageMutation, { loading: isUpdating }] = useMutation<
    { updatePackage: Package },
    { id: string; packageInput: PackageUpdateInput }
  >(UPDATE_PACKAGE);

  const [deletePackageMutation, { loading: isDeleting }] = useMutation<
    { deletePackage: boolean },
    { id: string }
  >(DELETE_PACKAGE);

  const createPackage = async (input: PackageInput) => {
    const { data } = await createPackageMutation({
      variables: { packageInput: input },
      refetchQueries: [{ query: GET_PACKAGES }],
    });
    return data?.createPackage;
  };

  const updatePackage = async (id: string, input: PackageUpdateInput) => {
    const { data } = await updatePackageMutation({
      variables: { id, packageInput: input },
      refetchQueries: [{ query: GET_PACKAGES }],
    });
    return data?.updatePackage;
  };

  const deletePackage = async (id: string) => {
    const { data } = await deletePackageMutation({
      variables: { id },
      refetchQueries: [{ query: GET_PACKAGES }],
    });
    return data?.deletePackage;
  };

  return {
    createPackage,
    updatePackage,
    deletePackage,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
