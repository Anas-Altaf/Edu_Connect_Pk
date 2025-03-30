import React, { useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";

const NotificationsPage = () => {
  const { notifications, markAsRead, deleteNotification, markAllAsRead } =
    useContext(NotificationContext);

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      <button onClick={markAllAsRead} className="btn btn-secondary mb-md">
        Mark All as Read
      </button>
      {notifications.length ? (
        <ul className="notification-list">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className={`notification-item ${notif.read ? "read" : "unread"}`}
            >
              <p>{notif.message}</p>
              <button
                onClick={() => markAsRead(notif._id)}
                className="btn btn-sm btn-outline"
              >
                Mark as Read
              </button>
              <button
                onClick={() => deleteNotification(notif._id)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications found.</p>
      )}
    </div>
  );
};

export default NotificationsPage;
