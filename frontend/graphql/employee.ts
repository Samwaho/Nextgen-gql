import { gql, useMutation } from "@apollo/client";

// Types
export interface Employee {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: "admin" | "employee";
  agency: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface EmployeeInput {
  name: string;
  email: string;
  password: string;
  username: string;
  phone: string;
  role: "admin" | "employee";
}

export type EmployeeUpdateInput = Partial<Omit<EmployeeInput, "password">>;

// Queries
export const GET_EMPLOYEES = gql`
  query GetEmployees {
    staffMembers {
      id
      name
      email
      username
      phone
      role
      agency
      createdAt
      updatedAt
    }
  }
`;

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: String!) {
    staffMember(id: $id) {
      id
      name
      email
      username
      phone
      role
      agency
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($employeeInput: EmployeeInput!) {
    createStaffMember(employeeInput: $employeeInput) {
      id
      name
      email
      username
      phone
      role
      agency
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: String!, $employeeInput: EmployeeUpdateInput!) {
    updateStaffMember(id: $id, employeeInput: $employeeInput) {
      id
      name
      email
      username
      phone
      role
      agency
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: String!) {
    deleteStaffMember(id: $id)
  }
`;

interface CreateEmployeeResponse {
  createStaffMember: Employee;
}

interface UpdateEmployeeResponse {
  updateStaffMember: Employee;
}

interface DeleteEmployeeResponse {
  deleteStaffMember: boolean;
}

// Example usage functions
export const useEmployee = () => {
  const [createEmployeeMutation, { loading: isCreating }] = useMutation<
    CreateEmployeeResponse,
    { employeeInput: EmployeeInput }
  >(CREATE_EMPLOYEE);

  const [updateEmployeeMutation, { loading: isUpdating }] = useMutation<
    UpdateEmployeeResponse,
    { id: string; employeeInput: EmployeeUpdateInput }
  >(UPDATE_EMPLOYEE);

  const [deleteEmployeeMutation, { loading: isDeleting }] = useMutation<
    DeleteEmployeeResponse,
    { id: string }
  >(DELETE_EMPLOYEE);

  const handleCreateEmployee = async (input: EmployeeInput) => {
    try {
      const { data } = await createEmployeeMutation({
        variables: { employeeInput: input },
        refetchQueries: [{ query: GET_EMPLOYEES }],
      });
      return data?.createStaffMember;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  };

  const handleUpdateEmployee = async (
    id: string,
    input: EmployeeUpdateInput
  ) => {
    try {
      const { data } = await updateEmployeeMutation({
        variables: { id, employeeInput: input },
        refetchQueries: [{ query: GET_EMPLOYEES }],
      });
      return data?.updateStaffMember;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { data } = await deleteEmployeeMutation({
        variables: { id },
        refetchQueries: [{ query: GET_EMPLOYEES }],
      });
      return data?.deleteStaffMember;
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  };

  return {
    createEmployee: handleCreateEmployee,
    updateEmployee: handleUpdateEmployee,
    deleteEmployee: handleDeleteEmployee,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
