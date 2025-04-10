import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, role, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUsers = await User.create(
      [{ name, email, role, password: hashedPassword }],
      { session }
    );
    const token = jwt.sign(
      { userId: newUsers[0]._id, version: newUsers[0].tokenVersion },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};
export const signIn = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      return next(error);
    }

    const token = jwt.sign(
      { userId: user._id, version: user.tokenVersion },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};
export const signOut = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    await User.findByIdAndUpdate(user._id, { $inc: { tokenVersion: 1 } });

    return res.status(200).json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error) {
    console.error("Sign Out error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during Sign Out",
      error: error.message,
    });
  }
};

export const verifyRole = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, please login",
      });
    }

    res.status(200).json({
      success: true,
      role: req.user.role,
      permissions: getRolePermissions(req.user.role),
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, please login",
      });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const getRolePermissions = (role) => {
  switch (role) {
    case "admin":
      return [
        "manage_users",
        "verify_tutors",
        "view_reports",
        "manage_platform",
      ];
    case "tutor":
      return ["manage_profile", "manage_sessions", "track_earnings"];
    case "student":
      return [
        "search_tutors",
        "book_sessions",
        "manage_wishlist",
        "write_reviews",
      ];
    default:
      return [];
  }
};
