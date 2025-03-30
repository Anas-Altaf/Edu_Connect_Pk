import { VerificationRequest, Tutor } from "../models/index.js";

export const submitVerificationRequest = async (req, res, next) => {
  try {
    const { documents } = req.body;

    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can submit verification requests",
      });
    }

    const tutor = await Tutor.findOne({ userId: req.user._id });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    if (tutor.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Your profile is already verified",
      });
    }

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

export const getPendingRequests = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access verification requests",
      });
    }

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

export const handleVerificationRequest = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;
    const requestId = req.params.id;

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

    request.status = status;
    if (adminComment) request.adminComment = adminComment;

    await request.save();

    res.status(200).json({
      success: true,
      message: `Verification request ${status}`,
      data: request,
    });
  } catch (error) {
    return next(error);
  }
};

export const getVerificationStats = async (req, res, next) => {
  try {
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

    const verifiedTutors = await Tutor.countDocuments({ isVerified: true });
    formattedStats.verifiedTutors = verifiedTutors;

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
