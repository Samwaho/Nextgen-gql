import { gql, useMutation } from "@apollo/client";

export enum ServiceType {
    pppoe = "pppoe",
    hotspot = "hotspot",
    static = "static",
    dhcp = "dhcp"
}

export interface RateLimit {
    rxRate: string;
    txRate: string;
    burstRxRate?: string | null;
    burstTxRate?: string | null;
    burstThresholdRx?: string | null;
    burstThresholdTx?: string | null;
    burstTime?: string | null;
}

export interface Package {
    id: string;
    name: string;
    price: number;
    type: ServiceType;
    rateLimit: RateLimit;
    radiusProfile: string;
    agency: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface RateLimitInput {
    rxRate: string;
    txRate: string;
    burstRxRate?: string | null;
    burstTxRate?: string | null;
    burstThresholdRx?: string | null;
    burstThresholdTx?: string | null;
    burstTime?: string | null;
}

export interface PackageInput {
    name: string;
    price: number;
    type: ServiceType;
    rateLimit: RateLimitInput;
    radiusProfile?: string | null;
}

export type PackageUpdateInput = Partial<PackageInput>;

export const GET_PACKAGES = gql`
    query GetPackages {
        packages {
            id
            name
            price
            type
            rateLimit {
                rxRate
                txRate
                burstRxRate
                burstTxRate
                burstThresholdRx
                burstThresholdTx
                burstTime
            }
            radiusProfile
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
            type
            rateLimit {
                rxRate
                txRate
                burstRxRate
                burstTxRate
                burstThresholdRx
                burstThresholdTx
                burstTime
            }
            radiusProfile
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
            type
            rateLimit {
                rxRate
                txRate
                burstRxRate
                burstTxRate
                burstThresholdRx
                burstThresholdTx
                burstTime
            }
            radiusProfile
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
            type
            rateLimit {
                rxRate
                txRate
                burstRxRate
                burstTxRate
                burstThresholdRx
                burstThresholdTx
                burstTime
            }
            radiusProfile
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

// Helper function to convert speed values to MikroTik format
export const toMikrotikFormat = (speed: number): string => {
    return speed.toString();
};

// Helper function to parse MikroTik format to number
export const fromMikrotikFormat = (speed: string): number => {
    const match = speed.match(/^(\d+)([KMGT])?$/i);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = (match[2] || "M").toUpperCase();
    
    // Convert to Mbps based on unit
    switch (unit) {
        case "K": return value / 1000;
        case "G": return value * 1000;
        case "T": return value * 1000000;
        default: return value;
    }
};

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
