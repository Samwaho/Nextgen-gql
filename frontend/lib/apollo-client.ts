import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  FetchPolicy,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getAuthToken, formatAuthHeader } from "@/graphql/auth";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "/graphql",
  credentials: "include",
});

const createApolloClient = (serverSide = false, serverSideToken?: string) => {
  const authLink = setContext(async (_, { headers }) => {
    // For server-side rendering, use the passed token if available
    if (serverSide && serverSideToken) {
      return {
        headers: {
          ...headers,
          authorization: formatAuthHeader(serverSideToken),
        },
        credentials: "include",
      };
    }

    // For client-side, get token from cookie
    const token = await getAuthToken();
    if (!token) {
      return {
        headers,
        credentials: "include",
      };
    }

    return {
      headers: {
        ...headers,
        authorization: formatAuthHeader(token),
      },
      credentials: "include",
    };
  });

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only" as FetchPolicy,
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "network-only" as FetchPolicy,
        errorPolicy: "all",
      },
    },
    ssrMode: serverSide,
  });
};

// Export the default client instance for client-side
export const client = createApolloClient();

// Export a function to get a new client instance for server-side
export function getClient(serverSideToken?: string) {
  return createApolloClient(true, serverSideToken);
}
