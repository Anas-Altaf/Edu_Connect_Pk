import React, { createContext, useState, useEffect, useContext } from "react";
import { notificationAPI } from "../services/api";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications whenever the user changes
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await notificationAPI.getNotifications(1, 10);
        if (response.data.success) {
          setNotifications(response.data.data || []);

          // Count unread notifications
          const unreadNotifications = response.data.data.filter(
            (n) => !n.isRead
          ).length;
          setUnreadCount(unreadNotifications);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up polling for notifications
    const interval = setInterval(fetchNotifications, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentUser]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      // Reset unread count
      setUnreadCount(0);

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);

      // Check if the notification was unread before removing
      const wasUnread = notifications.find(
        (n) => n._id === notificationId && !n.isRead
      );

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );

      // Update unread count if needed
      if (wasUnread) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }

      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using notifications
export const useNotifications = () => useContext(NotificationContext);
