import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
      unique: true,
      validate: {
        validator: async function (value) {
          const user = await mongoose.model("User").findById(value);
          return user && user.role === "student";
        },
        message: "Invalid student ID or user is not a student",
      },
    },
    tutorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tutor",
        validate: {
          validator: async function (value) {
            return await mongoose.model("Tutor").exists({ _id: value });
          },
          message: "One or more tutor IDs are invalid",
        },
      },
    ],
  },
  { timestamps: true }
);

WishlistSchema.pre("save", function (next) {
  const uniqueTutorIds = [...new Set(this.tutorIds.map((id) => id.toString()))];

  this.tutorIds = uniqueTutorIds.map((id) => new mongoose.Types.ObjectId(id));

  next();
});

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;
