import {
  User,
  Tutor,
  Student,
  Session,
  Verification,
} from "../models/index.js";

// Alias for better readability
const VerificationRequest = Verification;

// Get all users with pagination, filtering, and sorting
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role,
      status,
      sort = "-createdAt",
      includeStats = false,
    } = req.query;

    const query = {};

    // Add role filter if provided
    if (role && role !== "all") {
      query.role = role;
    }

    // Add status filter if provided
    if (status && status !== "all") {
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password");

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // If includeStats is true, get user statistics
    let stats = null;
    if (includeStats === "true" || includeStats === true) {
      const [total, students, tutors, admins, active, inactive, pending] =
        await Promise.all([
          User.countDocuments({}),
          User.countDocuments({ role: "student" }),
          User.countDocuments({ role: "tutor" }),
          User.countDocuments({ role: "admin" }),
          User.countDocuments({ status: "active" }),
          User.countDocuments({ status: "inactive" }),
          User.countDocuments({ status: "pending" }),
        ]);

      stats = {
        total,
        students,
        tutors,
        admins,
        active,
        inactive,
        pending,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        users,
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        stats,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

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

// Create a new user
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "student",
      status: status || "active",
    });

    await user.save();

    // If role is student or tutor, create corresponding profile
    try {
      if (role === "student") {
        const student = new Student({
          userId: user._id,
        });
        await student.save();
      } else if (role === "tutor") {
        const tutor = new Tutor({
          userId: user._id,
          subjects: [],
          hourlyRate: 0,
          teachingPreference: "both",
        });
        await tutor.save();
      }
    } catch (profileError) {
      console.error("Error creating profile:", profileError);
      // Continue even if profile creation fails
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }
    }

    // Update user fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (status) updateFields.status = status;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

// Update user status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    if (!["active", "inactive", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user's related data based on role
    try {
      if (user.role === "student") {
        await Student.findOneAndDelete({ userId });
        // Delete student's sessions
        await Session.deleteMany({ studentId: userId });
      } else if (user.role === "tutor") {
        await Tutor.findOneAndDelete({ userId });
        // Delete tutor's sessions
        await Session.deleteMany({ tutorId: userId });
        // Delete tutor's verification requests
        await Verification.deleteMany({ userId });
      }
    } catch (profileError) {
      console.error("Error deleting profile data:", profileError);
      // Continue with user deletion even if profile deletion fails
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  console.log("getDashboardStats called");
  try {
    console.log("Fetching dashboard stats...");

    // Get user statistics
    const [
      totalUsers,
      students,
      tutors,
      admins,
      activeUsers,
      inactiveUsers,
      pendingUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "tutor" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "inactive" }),
      User.countDocuments({ status: "pending" }),
    ]);

    console.log("User statistics fetched successfully");

    // Get session statistics
    console.log("Fetching session statistics...");
    const [
      totalSessions,
      pendingSessions,
      completedSessions,
      cancelledSessions,
    ] = await Promise.all([
      Session.countDocuments({}),
      Session.countDocuments({ status: "pending" }),
      Session.countDocuments({ status: "completed" }),
      Session.countDocuments({ status: "cancelled" }),
    ]);

    console.log("Session statistics fetched successfully");

    // Get verification statistics
    console.log("Fetching verification statistics...");
    const [pendingVerifications, approvedVerifications, rejectedVerifications] =
      await Promise.all([
        Verification.countDocuments({ status: "pending" }),
        Verification.countDocuments({ status: "approved" }),
        Verification.countDocuments({ status: "rejected" }),
      ]);

    console.log("Verification statistics fetched successfully");

    // Get recent users
    console.log("Fetching recent users...");
    const recentUsers = await User.find({})
      .sort("-createdAt")
      .limit(5)
      .select("-password");

    console.log("Recent users fetched successfully");

    const responseData = {
      success: true,
      data: {
        users: {
          total: totalUsers,
          students,
          tutors,
          admins,
          active: activeUsers,
          inactive: inactiveUsers,
          pending: pendingUsers,
        },
        sessions: {
          total: totalSessions,
          pending: pendingSessions,
          completed: completedSessions,
          cancelled: cancelledSessions,
        },
        verifications: {
          pending: pendingVerifications,
          approved: approvedVerifications,
          rejected: rejectedVerifications,
        },
        recentUsers,
      },
    };

    console.log("Sending dashboard stats response");
    res.status(200).json(responseData);
  } catch (error) {
    return next(error);
  }
};
