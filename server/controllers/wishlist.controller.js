import { Wishlist, Tutor } from "../models/index.js";

export const addToWishlist = async (req, res, next) => {
  try {
    const { tutorId } = req.body;

    // Verify the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can use the wishlist feature",
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

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ studentId: req.user._id });

    if (wishlist) {
      if (!wishlist.tutorIds.includes(tutorId)) {
        wishlist.tutorIds.push(tutorId);
        await wishlist.save();
      }
    } else {
      // Create new wishlist
      wishlist = await Wishlist.create({
        studentId: req.user._id,
        tutorIds: [tutorId],
      });
    }

    res.status(200).json({
      success: true,
      message: "Tutor added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    return next(error);
  }
};

// Get all wishlist tutors for a student
export const getWishlist = async (req, res, next) => {
  try {
    // Verify the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can use the wishlist feature",
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ studentId: req.user._id });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is empty",
        data: { tutorIds: [], tutors: [] },
      });
    }

    // Get tutor details
    const tutors = await Tutor.find({
      _id: { $in: wishlist.tutorIds },
    }).populate("userId", "name email profilePicture");

    res.status(200).json({
      success: true,
      count: tutors.length,
      data: {
        tutorIds: wishlist.tutorIds,
        tutors,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Remove tutor from wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const tutorId = req.params.tutorId;

    // Verify the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can use the wishlist feature",
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ studentId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Remove tutor from wishlist
    wishlist.tutorIds = wishlist.tutorIds.filter(
      (id) => id.toString() !== tutorId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Tutor removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    return next(error);
  }
};

// Get filtered wishlist tutors
export const getFilteredWishlist = async (req, res, next) => {
  try {
    const { subject, minRate, maxRate, rating, sortBy } = req.query;

    // Verify the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can use the wishlist feature",
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ studentId: req.user._id });

    if (!wishlist || wishlist.tutorIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is empty",
        data: { tutors: [] },
      });
    }

    // Build query
    let query = { _id: { $in: wishlist.tutorIds } };

    if (subject) {
      query.subjects = { $regex: subject, $options: "i" };
    }

    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Build sort options
    let sortOptions = {};

    if (sortBy === "price-low") {
      sortOptions.hourlyRate = 1;
    } else if (sortBy === "price-high") {
      sortOptions.hourlyRate = -1;
    } else if (sortBy === "rating") {
      sortOptions.averageRating = -1;
    } else {
      // Default sorting by most recently added
      sortOptions = { _id: -1 };
    }

    // Get tutors
    const tutors = await Tutor.find(query)
      .populate("userId", "name email profilePicture")
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: tutors.length,
      data: { tutors },
    });
  } catch (error) {
    return next(error);
  }
};

// Get count of tutors in wishlist
export const getWishlistCount = async (req, res, next) => {
  try {
    // Verify the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can use the wishlist feature",
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ studentId: req.user._id });

    const count = wishlist ? wishlist.tutorIds.length : 0;

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    return next(error);
  }
};
