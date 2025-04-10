import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import authorize from "../middleware/auth.middleware.js";

const adminRouter = Router();

// Apply authorization middleware to all admin routes
adminRouter.use(authorize);

// Admin-only middleware
const adminOnly = (req, res, next) => {
  console.log("Admin-only middleware called");
  console.log("User in request:", req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Apply admin-only middleware to all routes
adminRouter.use(adminOnly);

// Test endpoint
adminRouter.get("/test", (req, res) => {
  console.log("Admin test endpoint called");
  return res.status(200).json({
    success: true,
    message: "Admin test endpoint working",
    user: req.user,
  });
});

// Dashboard statistics
adminRouter.get("/dashboard", getDashboardStats);

// User management routes
adminRouter.get("/users", getAllUsers);
adminRouter.post("/users", createUser);
adminRouter.get("/users/:id", getUserById);
adminRouter.put("/users/:id", updateUser);
adminRouter.put("/users/:id/status", updateUserStatus);
adminRouter.delete("/users/:id", deleteUser);

export default adminRouter;
