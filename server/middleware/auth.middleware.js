import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { User } from "../models/index.js";

const authorize = async (req, res, next) => {
    try {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });
  
        const decoded = jwt.verify(token, JWT_SECRET);
  
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ message: "Unauthorized" });
  
        // Check if token version matches the user's current version
        if (decoded.version !== user.tokenVersion) {
          return res.status(401).json({ message: "Token has been revoked, please login again" });
        }
  
        req.user = user;
        next();
      } else {
        return res
          .status(401)
          .json({ message: "No authorization token provided" });
      }
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Unauthorized", error: error.message });
    }
  };
  

// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }

    next();
  };
};

export default authorize;
