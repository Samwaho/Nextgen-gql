import { useMutation } from "@apollo/client";
import {
  GOOGLE_AUTH_MUTATION,
  type AuthResponse,
  setAuthToken,
} from "@/graphql/auth";

export const useAuth = () => {
  const [googleAuthMutation] = useMutation<
    { googleAuth: AuthResponse },
    { input: { token: string } }
  >(GOOGLE_AUTH_MUTATION);

  const googleLogin = async (token: string): Promise<boolean> => {
    try {
      const { data } = await googleAuthMutation({
        variables: {
          input: {
            token,
          },
        },
      });

      if (data?.googleAuth.success && data.googleAuth.token) {
        setAuthToken(data.googleAuth.token.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  return {
    googleLogin,
  };
};
