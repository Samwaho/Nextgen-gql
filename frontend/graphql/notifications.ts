import { gql } from '@apollo/client';

// Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  agency: string;
  userId: string;  // ID of the user who performed the action
  userName?: string;  // Name of the user who performed the action
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface NotificationResponse {
  notification: Notification;
}

export interface UnreadCountResponse {
  unreadNotificationsCount: number;
}

export interface NotificationInput {
  type: string;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  userId: string;  // ID of the user who performed the action
  isRead?: boolean;
}

export interface NotificationUpdateInput {
  isRead?: boolean;
}

// Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($page: Int!, $filterRead: Boolean, $userId: String!) {
    notifications(page: $page, filterRead: $filterRead, userId: $userId) {
      id
      type
      title
      message
      entityId
      entityType
      agency
      userId
      userName
      isRead
      createdAt
      updatedAt
    }
  }
`;

export const GET_NOTIFICATION = gql`
  query GetNotification($id: String!, $userId: String!) {
    notification(id: $id, userId: $userId) {
      id
      type
      title
      message
      entityId
      entityType
      agency
      userId
      userName
      isRead
      createdAt
      updatedAt
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadNotificationsCount($userId: String!) {
    unreadNotificationsCount(userId: $userId)
  }
`;

// Mutations
export const CREATE_TEST_NOTIFICATION = gql`
  mutation CreateTestNotification($userId: String!) {
    createTestNotification(userId: $userId) {
      id
      type
      title
      message
      entityId
      entityType
      agency
      userId
      userName
      isRead
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: NotificationInput!) {
    createNotification(notificationInput: $input) {
      id
      type
      title
      message
      entityId
      entityType
      agency
      userId
      userName
      isRead
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTIFICATION = gql`
  mutation UpdateNotification($id: String!, $input: NotificationUpdateInput!, $userId: String!) {
    updateNotification(id: $id, notificationInput: $input, userId: $userId) {
      id
      type
      title
      message
      entityId
      entityType
      agency
      userId
      userName
      isRead
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: String!, $userId: String!) {
    deleteNotification(id: $id, userId: $userId)
  }
`;

export const MARK_ALL_AS_READ = gql`
  mutation MarkAllNotificationsAsRead($userId: String!) {
    markAllNotificationsAsRead(userId: $userId)
  }
`;

// Hook types
export interface UseNotificationsOptions {
  page?: number;
  filterRead?: boolean;
}

export interface UseNotificationOptions {
  id: string;
}

export interface CreateNotificationOptions {
  input: NotificationInput;
}

export interface UpdateNotificationOptions {
  id: string;
  input: NotificationUpdateInput;
}

export interface DeleteNotificationOptions {
  id: string;
}

// Example usage of mutations with TypeScript:
/*
import { useMutation, useQuery } from '@apollo/client';

// Get notifications with pagination
const { data, loading, error } = useQuery<NotificationsResponse>(GET_NOTIFICATIONS, {
  variables: { page: 1, filterRead: false }
});

// Get unread count
const { data: unreadData } = useQuery<UnreadCountResponse>(GET_UNREAD_COUNT);

// Create notification
const [createNotification] = useMutation<NotificationResponse>(CREATE_NOTIFICATION);
await createNotification({
  variables: {
    input: {
      type: "info",
      title: "New Message",
      message: "Hello world"
    }
  }
});

// Mark notification as read
const [updateNotification] = useMutation<NotificationResponse>(UPDATE_NOTIFICATION);
await updateNotification({
  variables: {
    id: "notification_id",
    input: { isRead: true }
  }
});

// Mark all as read
const [markAllAsRead] = useMutation<boolean>(MARK_ALL_AS_READ);
await markAllAsRead();

// Delete notification
const [deleteNotification] = useMutation<boolean>(DELETE_NOTIFICATION);
await deleteNotification({
  variables: { id: "notification_id" }
});
*/
