import { Tutor, User, Wishlist, Notification } from "../models/index.js";
import { createRateChangeNotifications } from "../utils/index.js";

// Get all tutors with filtering
export const getAllTutors = async (req, res, next) => {
  try {
    const {
      subject,
      location,
      minRate,
      maxRate,
      rating,
      teachingPreference,
      day,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (subject) {
      query.subjects = { $regex: subject, $options: "i" };
    }
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }
    if (teachingPreference) {
      query.teachingPreference =
        teachingPreference === "both"
          ? { $in: ["online", "in-person", "both"] }
          : { $in: [teachingPreference, "both"] };
    }
    if (day) {
      query["availability.day"] = day;
    }

    // Sorting options
    let sortOptions = {};
    if (sortBy === "price-low") {
      sortOptions.hourlyRate = 1;
    } else if (sortBy === "price-high") {
      sortOptions.hourlyRate = -1;
    } else if (sortBy === "rating") {
      sortOptions.averageRating = -1;
    } else {
      sortOptions = { _id: -1 }; // Default
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const tutors = await Tutor.find(query)
      .populate("userId", "name email profilePicture")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Tutor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tutors.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: tutors,
    });
  } catch (error) {
    return next(error);
  }
};

// Get tutor details
export const getTutorDetails = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate("userId", "name email profilePicture location bio")
      .populate("reviews");

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tutor,
    });
  } catch (error) {
    return next(error);
  }
};

// Create/Update tutor profile
export const updateTutorProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      profilePicture,
      location,
      qualifications,
      subjects,
      hourlyRate,
      teachingPreference,
      availability,
    } = req.body;

    // Ensure the user is a tutor
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can update tutor profiles",
      });
    }

    // Find tutor profile by user id
    let tutor = await Tutor.findOne({ userId: req.user._id });
    if (tutor) {
      // Update tutor specific fields
      if (location) tutor.location = location;
      if (qualifications) tutor.qualifications = qualifications;
      if (subjects) tutor.subjects = subjects;
      if (hourlyRate !== undefined) tutor.hourlyRate = hourlyRate;
      if (teachingPreference) tutor.teachingPreference = teachingPreference;
      if (availability) tutor.availability = availability;
      await tutor.save();
    } else {
      // Create new tutor profile if not exists
      tutor = await Tutor.create({
        userId: req.user._id,
        location,
        qualifications,
        subjects,
        hourlyRate,
        teachingPreference,
        availability,
      });
    }

    // Also update the corresponding user document for common fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, bio, profilePicture } },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      data: { tutor, user: updatedUser },
    });
  } catch (error) {
    return next(error);
  }
};

// Update tutor availability
export const updateTutorAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid availability data",
      });
    }

    // Validate availability format
    for (const slot of availability) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message:
            "Each availability slot must have day, startTime, and endTime",
        });
      }
    }

    const tutor = await Tutor.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { availability } },
      { new: true, runValidators: true }
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tutor availability updated",
      data: tutor.availability,
    });
  } catch (error) {
    return next(error);
  }
};

// Update tutor hourly rate
export const updateTutorRate = async (req, res, next) => {
  try {
    const { hourlyRate } = req.body;

    if (hourlyRate === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid hourly rate",
      });
    }

    const tutor = await Tutor.findOne({ userId: req.user._id });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    const previousRate = tutor.hourlyRate;
    tutor.hourlyRate = hourlyRate;
    await tutor.save();

    // Create notifications for rate decrease
    if (hourlyRate < previousRate) {
      // Find students who have this tutor in their wishlist
      const wishlists = await Wishlist.find({ tutorIds: tutor._id });

      if (wishlists.length > 0) {
        // Use the utility function to create notifications
        await createRateChangeNotifications(
          tutor,
          req.user,
          previousRate,
          hourlyRate,
          wishlists
        );
      }
    }

    const rateDecreased = hourlyRate < previousRate;

    res.status(200).json({
      success: true,
      message: "Hourly rate updated successfully",
      data: {
        hourlyRate,
        previousRate,
        rateDecreased,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Delete tutor profile
export const deleteTutorProfile = async (req, res, next) => {
  try {
    const result = await Tutor.findOneAndDelete({ userId: req.user._id });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tutor profile deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Upload tutor profile image (metadata only, actual upload handled by frontend)
export const updateProfileImage = async (req, res, next) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: "Please provide profile picture URL",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePicture } },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

// Get tutor profile preview
export const getTutorPreview = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id)
      .populate("userId", "name email profilePicture")
      .select("-earnings");

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tutor,
    });
  } catch (error) {
    return next(error);
  }
};
