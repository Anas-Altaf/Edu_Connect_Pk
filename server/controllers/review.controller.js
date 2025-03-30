import { Review, Session, Tutor } from "../models/index.js";

export const addReview = async (req, res, next) => {
  try {
    const { tutorId, rating, comment } = req.body;

    // Verify the student is submitting
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit reviews",
      });
    }

    // Check if tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Check if the student has had a completed session with this tutor
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

    // Validate comment length server-side
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Review comment must be at least 10 characters long",
      });
    }

    // Check if the student has already reviewed this tutor
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

    // Create the review
    const review = await Review.create({
      studentId: req.user._id,
      tutorId,
      rating,
      comment,
    });

    // Update tutor's reviews
    tutor.reviews.push(review._id);
    await tutor.save();

    // The post-save hook in the Review model recalculates tutor.averageRating.
    // Respond with the new review and updated average rating.
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

// Get all reviews for a tutor
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

// Delete a review
export const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check authorization
    const isAuthor = req.user._id.toString() === review.studentId.toString();

    if (!isAuthor && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }

    // Remove review from tutor's reviews array
    await Tutor.findByIdAndUpdate(review.tutorId, {
      $pull: { reviews: reviewId },
    });

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
