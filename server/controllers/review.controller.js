import { Review, Session, Tutor } from "../models/index.js";

export const addReview = async (req, res, next) => {
  try {
    const { tutorId, rating, comment } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit reviews",
      });
    }

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const hasCompletedSession = await Session.exists({
      studentId: req.user._id,
      tutorId,
      status: "completed",
    });

    if (!hasCompletedSession) {
      return res.status(403).json({
        success: false,
        message:
          "You can only review tutors after completing a session with them",
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Review comment must be at least 10 characters long",
      });
    }

    const existingReview = await Review.findOne({
      studentId: req.user._id,
      tutorId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this tutor",
        review: existingReview,
      });
    }

    const review = await Review.create({
      studentId: req.user._id,
      tutorId,
      rating,
      comment,
    });

    tutor.reviews.push(review._id);
    await tutor.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
      newAverageRating: tutor.averageRating,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTutorReviews = async (req, res, next) => {
  try {
    const tutorId = req.params.id;

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    const reviews = await Review.find({ tutorId })
      .populate("studentId", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const isAuthor = req.user._id.toString() === review.studentId.toString();

    if (!isAuthor && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }

    await Tutor.findByIdAndUpdate(review.tutorId, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
