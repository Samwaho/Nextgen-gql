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

      if (!data?.googleAuth) {
        return false;
      }

      if (!data.googleAuth.success || !data.googleAuth.token) {
        return false;
      }

      return setAuthToken(data.googleAuth.token.accessToken);
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  return {
    googleLogin,
  };
};
