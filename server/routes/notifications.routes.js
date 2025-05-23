import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import authorize from "../middleware/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.use(authorize);

notificationRouter.get("/", getNotifications);
notificationRouter.get("/unread-count", getUnreadCount);
notificationRouter.put("/all/read", markAllAsRead);
notificationRouter.put("/:id/read", markAsRead);
notificationRouter.delete("/:id", deleteNotification);

export default notificationRouter;
