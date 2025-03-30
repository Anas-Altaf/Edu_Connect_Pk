import { VerificationRequest, Tutor } from "../models/index.js";

// Submit verification request
export const submitVerificationRequest = async (req, res, next) => {
  try {
    const { documents } = req.body;

    // Verify the user is a tutor
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can submit verification requests",
      });
    }

    // Find tutor record
    const tutor = await Tutor.findOne({ userId: req.user._id });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Check if already verified
    if (tutor.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Your profile is already verified",
      });
    }

    // Check if there's a pending request
    const existingRequest = await VerificationRequest.findOne({
      tutorId: tutor._id,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a verification request",
        data: existingRequest,
      });
    }

    // Create verification request
    const verificationRequest = await VerificationRequest.create({
      tutorId: tutor._id,
      documents,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Verification request submitted successfully",
      data: verificationRequest,
    });
  } catch (error) {
    return next(error);
  }
};

// Get all pending verification requests (admin only)
export const getPendingRequests = async (req, res, next) => {
  try {
    // Verify the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access verification requests",
      });
    }

    // Get requests with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const requests = await VerificationRequest.find({ status: "pending" })
      .populate({
        path: "tutorId",
        populate: {
          path: "userId",
          select: "name email profilePicture",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VerificationRequest.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: requests,
    });
  } catch (error) {
    return next(error);
  }
};

// Approve/reject verification request (admin only)
export const handleVerificationRequest = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;
    const requestId = req.params.id;

    // Verify the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve/reject verification requests",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    const request = await VerificationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    // Update the request status
    request.status = status;
    if (adminComment) request.adminComment = adminComment;

    await request.save();

    // The pre-save hook in the model will auto-update tutor's isVerified status if approved

    res.status(200).json({
      success: true,
      message: `Verification request ${status}`,
      data: request,
    });
  } catch (error) {
    return next(error);
  }
};

// Get verification statistics (admin only)
export const getVerificationStats = async (req, res, next) => {
  try {
    // Verify the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access verification statistics",
      });
    }

    const stats = await VerificationRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the stats into a more readable format
    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      totalRequests: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.totalRequests += stat.count;
    });

    // Get total verified tutors count
    const verifiedTutors = await Tutor.countDocuments({ isVerified: true });
    formattedStats.verifiedTutors = verifiedTutors;

    // Get total unverified tutors count
    const unverifiedTutors = await Tutor.countDocuments({ isVerified: false });
    formattedStats.unverifiedTutors = unverifiedTutors;

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    return next(error);
  }
};
