import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { NotificationContext } from "../../contexts/NotificationContext";
import { notificationAPI } from "../../services/api";
import { toast } from "react-toastify";

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { notifications, unreadCount, markAsRead } =
    useContext(NotificationContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (id) => {
    try {
      await markAsRead(id);

      const notification = notifications.find((n) => n._id === id);
      if (notification?.link) {
        navigate(notification.link);
      }

      setNotificationsOpen(false);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("Failed to delete notification");
    }
  };

  const getNavLinks = () => {
    const commonLinks = [{ path: "/", label: "Home" }];

    if (!currentUser || currentUser.role === "student") {
      commonLinks.push({ path: "/tutors", label: "Find Tutors" });
    }

    if (!currentUser) {
      return commonLinks;
    }

    const roleSpecificLinks = {
      student: [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/sessions", label: "Sessions" },
        { path: "/wishlist", label: "Wishlist" },
      ],
      tutor: [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/sessions", label: "Sessions" },
      ],
      admin: [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/admin/users", label: "Users" },
        { path: "/admin/verifications", label: "Verifications" },
        { path: "/admin/reports", label: "Reports" },
      ],
    };

    return [...commonLinks, ...(roleSpecificLinks[currentUser.role] || [])];
  };

  const navLinks = getNavLinks();

  const getUserInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-wrapper">
          <Link to="/" className="header-logo">
            <span className="logo-text">
              Edu<span className="logo-accent">Connect</span>
            </span>
          </Link>

          <div
            className={`header-nav-container ${
              mobileMenuOpen ? "mobile-open" : ""
            }`}
          >
            <nav className="header-nav">
              {navLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.path}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="header-actions">
              {/* Theme toggle button */}
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                title="Toggle theme"
              >
                {theme === "light" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                )}
              </button>

              {currentUser ? (
                <>
                  {/* Notifications */}
                  <div className="notification-badge" ref={notificationRef}>
                    <button
                      className="btn btn-icon"
                      onClick={toggleNotifications}
                      aria-label="Notifications"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      {unreadCount > 0 && (
                        <span className="notification-count">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="notification-dropdown">
                        <div className="notification-header">
                          <h3>Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="unread-count">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="notification-list">
                          {loading ? (
                            <div className="notification-loading">
                              Loading...
                            </div>
                          ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification._id}
                                className={`notification-item ${
                                  !notification.isRead ? "unread" : ""
                                }`}
                                onClick={() =>
                                  handleNotificationClick(notification._id)
                                }
                              >
                                <div
                                  className={`notification-icon-container notification-icon-${
                                    notification.type?.toLowerCase() ||
                                    "default"
                                  }`}
                                >
                                  <span className="notification-icon"></span>
                                </div>
                                <div className="notification-content">
                                  <div className="notification-message">
                                    {notification.message}
                                  </div>
                                  <div className="notification-time">
                                    {new Date(
                                      notification.createdAt
                                    ).toLocaleDateString()}{" "}
                                    •{" "}
                                    {new Date(
                                      notification.createdAt
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                                <button
                                  className="notification-delete"
                                  onClick={(e) =>
                                    handleDeleteNotification(
                                      e,
                                      notification._id
                                    )
                                  }
                                  aria-label="Delete notification"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="notification-empty">
                              No notifications to display
                            </div>
                          )}
                        </div>
                        <div className="notification-footer">
                          <Link
                            to="/notifications"
                            className="view-all"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            View all notifications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="user-info">
                    <Link to="/profile" className="profile-link">
                      <div className="avatar avatar-sm">
                        {currentUser.profilePicture ? (
                          <img
                            src={currentUser.profilePicture}
                            alt={currentUser.name}
                            className="user-avatar"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {getUserInitials(currentUser.name)}
                          </div>
                        )}
                      </div>
                      <span className="user-name">{currentUser.name}</span>
                    </Link>
                  </div>

                  <button
                    className="btn btn-outline btn-sm logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="auth-buttons">
                  <Link to="/auth/login" className="btn btn-outline">
                    Sign In
                  </Link>
                  <Link to="/auth/register" className="btn btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
