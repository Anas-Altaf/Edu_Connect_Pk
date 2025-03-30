import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: [true, "Tutor ID is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10, "Review comment must be at least 10 characters long"],
      maxlength: [500, "Review comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ studentId: 1, tutorId: 1 }, { unique: true });

ReviewSchema.post("save", async function () {
  const Tutor = mongoose.model("Tutor");
  const Review = mongoose.model("Review");

  const tutor = await Tutor.findById(this.tutorId);
  if (!tutor) return;

  const reviews = await Review.find({ tutorId: this.tutorId });
  tutor.averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await tutor.save();
});

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
