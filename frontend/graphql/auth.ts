import { gql } from "@apollo/client";

// Types
export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  agency?: string;
}

export interface GoogleAuthInput {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: {
    accessToken: string;
  };
}

// Queries and Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      token {
        accessToken
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      success
      message
      token {
        accessToken
      }
    }
  }
`;

export const GOOGLE_AUTH_MUTATION = gql`
  mutation GoogleAuth($input: GoogleAuthInput!) {
    googleAuth(input: $input) {
      success
      message
      token {
        accessToken
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      success
      message
      token {
        accessToken
      }
    }
  }
`;

// Add a type for the mutation response
export interface GoogleAuthResponse {
  googleAuth: {
    success: boolean;
    message?: string;
    token?: {
      accessToken: string;
    };
  };
}

export interface RefreshTokenResponse {
  refreshToken: {
    success: boolean;
    message?: string;
    token?: {
      accessToken: string;
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  agency?: string;
  roles: string[];
}

export interface GetCurrentUserResponse {
  currentUser: User;
}

export const GET_CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      name
      email
      agency
      roles
    }
  }
`;

// Token Management
export const isValidToken = (token: string): boolean => {
  try {
    if (!token || typeof token !== "string") return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    return true;
  } catch {
    return false;
  }
};

export const setAuthToken = (token: string): boolean => {
  try {
    if (!isValidToken(token)) return false;
    if (typeof window === "undefined") return false;

    // Set cookie with SameSite and Secure attributes for HTTPS
    document.cookie = `token=${token}; path=/; max-age=${
      7 * 24 * 60 * 60
    }; SameSite=Strict; Secure`;
    return true;
  } catch (error) {
    console.error("Error saving token:", error);
    return false;
  }
};

export const getAuthToken = (): string | null => {
  try {
    if (typeof window === "undefined") return null;

    const cookies = document.cookie.split(";").map((c) => c.trim());
    const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
    if (!tokenCookie) return null;

    const token = tokenCookie.split("=")[1];
    return token || null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const removeAuthToken = (): void => {
  try {
    if (typeof window !== "undefined") {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure";
    }
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return isValidToken(token || "");
};

export const formatAuthHeader = (token: string): string => `Bearer ${token}`;
