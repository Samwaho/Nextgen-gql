"use client";

import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  MARK_ALL_AS_READ,
  UPDATE_NOTIFICATION,
  NotificationsResponse,
  UnreadCountResponse,
  Notification
} from "@/graphql/notifications";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, parseISO } from "date-fns";
import { enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

// Constants
const NOTIFICATIONS_PER_PAGE = 50;

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (notification: Notification) => void;
  getNotificationIcon: (type: string) => string;
}

// Client-side only component
const NotificationsList = dynamic(() => Promise.resolve(({ 
  notifications, 
  onMarkAsRead, 
  getNotificationIcon 
}: NotificationsListProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Function to format the date with timezone consideration
  const formatNotificationDate = (dateString: string) => {
    if (!mounted) {
      return ""; // Return empty on server-side to prevent hydration mismatch
    }

    try {
      const utcDate = parseISO(dateString);
      // Convert UTC to local time
      const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
      return formatDistanceToNow(localDate, {
        addSuffix: true,
        locale: enUS,
        includeSeconds: true
      });
    } catch {
      return "Date unavailable";
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Bell className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "p-4 rounded-lg border transition-colors hover:bg-accent/5",
            notification.isRead
              ? "bg-background opacity-75"
              : "bg-accent/10 cursor-pointer shadow-sm"
          )}
          onClick={() => !notification.isRead && onMarkAsRead(notification)}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl bg-background rounded-full p-2 shadow-sm">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold truncate">
                  {notification.title}
                </h4>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-full">
                  {mounted ? formatNotificationDate(notification.createdAt) : ""}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 bg-background px-2 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {notification.userName || 'Unknown User'}
                </span>
                {!notification.isRead && (
                  <span className="text-[10px] text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}), { ssr: false });

interface NotificationsDrawerProps {
  loggedInUser?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ loggedInUser }) => {
  const [page, setPage] = React.useState(1);
  const [isOpen, setIsOpen] = React.useState(false);
  const [allNotifications, setAllNotifications] = React.useState<Notification[]>([]);

  // Get notifications
  const { data, loading, error, refetch } = useQuery<NotificationsResponse>(GET_NOTIFICATIONS, {
    variables: { 
      page, 
      filterRead: null,
      userId: loggedInUser?.id || '' 
    },
    fetchPolicy: "network-only",
    pollInterval: 30000, // Poll every 30 seconds
    skip: !loggedInUser?.id
  });

  // Get unread count
  const { data: unreadData, loading: unreadLoading, refetch: refetchUnread } = useQuery<UnreadCountResponse>(
    GET_UNREAD_COUNT,
    { 
      variables: { userId: loggedInUser?.id || '' },
      pollInterval: 30000,
      fetchPolicy: "network-only",
      skip: !loggedInUser?.id
    }
  );

  // Mutations
  const [markAllAsRead] = useMutation(MARK_ALL_AS_READ, {
    variables: { userId: loggedInUser?.id },
    onCompleted: () => {
      fetchNotifications();
    },
    onError: (error) => {
      console.error('Error marking all as read:', error);
    }
  });

  const [updateNotification] = useMutation(UPDATE_NOTIFICATION, {
    onCompleted: () => {
      fetchNotifications();
    },
    onError: (error) => {
      console.error('Error updating notification:', error);
    }
  });

  // Fetch notifications on mount and when drawer opens
  const fetchNotifications = React.useCallback(async () => {
    if (!loggedInUser?.id) return;
    
    try {
      const [notificationsResult] = await Promise.all([refetch(), refetchUnread()]);
      if (notificationsResult.data?.notifications) {
        setAllNotifications(notificationsResult.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [refetch, refetchUnread, loggedInUser?.id]);

  // Initial fetch on mount and setup interval
  React.useEffect(() => {
    if (!loggedInUser?.id || !isOpen) return;
    
    fetchNotifications();
    
    // Set up interval for frequent updates when drawer is open
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications, isOpen, loggedInUser?.id]);

  // Handle drawer open/close
  React.useEffect(() => {
    if (isOpen && loggedInUser?.id) {
      setPage(1);
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications, loggedInUser?.id]);

  // Skip rendering if no user is logged in
  if (!loggedInUser?.id) {
    return null;
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!loggedInUser?.id) return;
    
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Handle mark single notification as read
  const handleMarkAsRead = async (notification: Notification) => {
    if (!loggedInUser?.id || notification.isRead) return;
    
    try {
      await updateNotification({
        variables: {
          id: notification.id,
          input: { isRead: true },
          userId: loggedInUser.id
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loggedInUser?.id) return;
    
    setPage(prev => prev + 1);
    fetchNotifications();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "customer_created":
      case "customer_updated":
      case "customer_deleted":
        return "👤";
      case "employee_created":
      case "employee_updated":
      case "employee_deleted":
        return "👥";
      case "ticket_created":
      case "ticket_updated":
      case "ticket_deleted":
        return "🎫";
      case "mpesa_initiated":
      case "mpesa_completed":
      case "mpesa_failed":
        return "💰";
      case "station_created":
      case "station_updated":
      case "station_deleted":
        return "📡";
      case "package_created":
      case "package_updated":
      case "package_deleted":
        return "📦";
      case "inventory_created":
      case "inventory_updated":
      case "inventory_deleted":
        return "📦";
      default:
        return "📢";
    }
  };

  const unreadCount = unreadData?.unreadNotificationsCount || 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent/10"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {!unreadLoading && unreadCount > 0 && (
            <Badge
              className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground shadow-sm"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[440px] p-6">
        <SheetHeader className="space-y-4 mb-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs hover:bg-accent/10"
              >
                Mark all as read
              </Button>
            )}
          </div>
          <div className="h-[1px] bg-border" />
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {error ? (
            <div className="flex flex-col items-center justify-center h-48 text-destructive">
              <p className="text-sm">Error loading notifications</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchNotifications()}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          ) : loading && page === 1 ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin">
                <svg className="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          ) : (
            <>
              <NotificationsList 
                notifications={allNotifications} 
                onMarkAsRead={handleMarkAsRead}
                getNotificationIcon={getNotificationIcon}
              />
              {data?.notifications.length === NOTIFICATIONS_PER_PAGE && (
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-xs hover:bg-accent/10"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading more...
                    </span>
                  ) : (
                    "Load more"
                  )}
                </Button>
              )}
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsDrawer; 