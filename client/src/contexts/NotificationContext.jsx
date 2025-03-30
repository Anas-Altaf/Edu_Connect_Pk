import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { notificationAPI } from "../services/api";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch notifications when user logs in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      setLoading(true);
      try {
        const response = await notificationAPI.getNotifications(1, 10);
        if (response.data.success) {
          // Map the backend "isRead" field to "read" for front-end consistency
          const fetchedNotifications = response.data.data.map((n) => ({
            ...n,
            read: n.isRead,
          }));
          setNotifications(fetchedNotifications);

          // Count unread notifications
          const unread = fetchedNotifications.filter(
            (notification) => !notification.read
          ).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  // Poll for new notifications every minute
  useEffect(() => {
    if (!currentUser) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await notificationAPI.getNotifications(1, 10);
        if (response.data.success) {
          const newNotifications = response.data.data;

          // Check if there are new notifications
          if (
            newNotifications.length > notifications.length ||
            newNotifications.some((newNotif) => {
              return !notifications.some(
                (oldNotif) => oldNotif._id === newNotif._id
              );
            })
          ) {
            setNotifications(newNotifications);

            // Update unread count
            const unread = newNotifications.filter(
              (notification) => !notification.read
            ).length;
            setUnreadCount(unread);
          }
        }
      } catch (err) {
        console.error("Failed to poll notifications:", err);
      }
    }, 60000); // Poll every minute

    return () => clearInterval(pollInterval);
  }, [currentUser, notifications]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);

      // Create an array of promises for marking each notification as read
      const readPromises = unreadNotifications.map((notification) =>
        notificationAPI.markAsRead(notification._id)
      );

      // Wait for all promises to resolve
      await Promise.all(readPromises);

      // Update state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);

      const deletedNotification = notifications.find((n) => n._id === id);
      const wasUnread = deletedNotification && !deletedNotification.read;

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );

      if (wasUnread) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdown
  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        dropdownOpen,
        toggleDropdown,
        closeDropdown,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
