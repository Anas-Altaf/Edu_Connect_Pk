import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      required: [true, "Role is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    profilePicture: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
