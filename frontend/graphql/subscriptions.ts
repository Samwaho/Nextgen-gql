import { gql, useMutation } from "@apollo/client";
import { Service } from "./services";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  address?: string;
  phone?: string;
  agency?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  service_id: string;
  tier_name: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string | null;
  service?: Service;
  user?: User;
}

export interface SubscriptionInput {
  service_id: string;
  tier_name: string;
}

export interface SubscriptionUpdateInput {
  status?: string;
  end_date?: string;
}

export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions {
    subscriptions {
      id
      user_id
      service_id
      tier_name
      status
      start_date
      end_date
      created_at
      updated_at
      service {
        id
        name
        tiers {
          name
          price
          features
        }
      }
      user {
        id
        name
        email
        roles
        address
        phone
        agency
        is_verified
        is_active
      }
    }
  }
`;

export const GET_SUBSCRIPTION = gql`
  query GetSubscription($id: String!) {
    subscription(id: $id) {
      id
      user_id
      service_id
      tier_name
      status
      start_date
      end_date
      created_at
      updated_at
      service {
        id
        name
        tiers {
          name
          price
          features
        }
      }
      user {
        id
        name
        email
        roles
        address
        phone
        agency
        is_verified
        is_active
      }
    }
  }
`;

export const GET_USER_SUBSCRIPTIONS = gql`
  query GetUserSubscriptions {
    userSubscriptions {
      id
      user_id
      service_id
      tier_name
      status
      start_date
      end_date
      created_at
      updated_at
      service {
        id
        name
        tiers {
          name
          price
          features
        }
      }
      user {
        id
        name
        email
        roles
        address
        phone
        agency
        is_verified
        is_active
      }
    }
  }
`;

export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($subscription_input: SubscriptionInput!) {
    createSubscription(subscription_input: $subscription_input) {
      id
      user_id
      service_id
      tier_name
      status
      start_date
      end_date
      created_at
      updated_at
      service {
        id
        name
        tiers {
          name
          price
          features
        }
      }
    }
  }
`;

export const UPDATE_SUBSCRIPTION = gql`
  mutation UpdateSubscription($id: String!, $subscription_update: SubscriptionUpdateInput!) {
    updateSubscription(id: $id, subscription_update: $subscription_update) {
      id
      user_id
      service_id
      tier_name
      status
      start_date
      end_date
      created_at
      updated_at
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($id: String!) {
    cancelSubscription(id: $id) {
      id
      user_id
      service_id
      tier_name
      status
      start_date
      end_date
      created_at
      updated_at
      service {
        id
        name
        tiers {
          name
          price
          features
        }
      }
      user {
        id
        name
        email
        roles
        address
        phone
        agency
        is_verified
        is_active
      }
    }
  }
`;

export function useSubscription() {
  const [createSubscriptionMutation, { loading: isCreating }] = useMutation(
    CREATE_SUBSCRIPTION
  );

  const [updateSubscriptionMutation, { loading: isUpdating }] = useMutation(
    UPDATE_SUBSCRIPTION
  );

  const [cancelSubscriptionMutation, { loading: isCancelling }] = useMutation(
    CANCEL_SUBSCRIPTION
  );

  const createSubscription = async (input: SubscriptionInput) => {
    const { data } = await createSubscriptionMutation({
      variables: { subscription_input: input },
      refetchQueries: ["GetUserSubscriptions"],
    });
    return data.createSubscription;
  };

  const updateSubscription = async (id: string, input: SubscriptionUpdateInput) => {
    const { data } = await updateSubscriptionMutation({
      variables: { id, subscription_update: input },
      refetchQueries: ["GetUserSubscriptions"],
    });
    return data.updateSubscription;
  };

  const cancelSubscription = async (id: string) => {
    const { data } = await cancelSubscriptionMutation({
      variables: { id },
      refetchQueries: ["GetUserSubscriptions"],
    });
    return data.cancelSubscription;
  };

  return {
    createSubscription,
    updateSubscription,
    cancelSubscription,
    isCreating,
    isUpdating,
    isCancelling,
  };
}
