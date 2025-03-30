import mongoose from "mongoose";

const TutorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    qualifications: {
      type: String,
      required: [true, "Qualifications are required"],
      trim: true,
      minlength: [10, "Qualifications description must be detailed"],
    },
    subjects: [
      {
        type: String,
        required: [true, "At least one subject is required"],
        trim: true,
        minlength: [2, "Subject name must be at least 2 characters"],
      },
    ],
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
      min: [5, "Hourly rate must be at least 5 units"],
      max: [10000, "Hourly rate cannot exceed 10,000 units"],
    },
    teachingPreference: {
      type: String,
      enum: ["online", "in-person", "both"],
      required: [true, "Teaching preference is required"],
      default: "both",
    },
    location: {
      type: String,
      required: function () {
        return this.teachingPreference !== "online";
      },
      trim: true,
    },
    availability: [
      {
        day: {
          type: String,
          required: [true, "Day is required"],
          trim: true,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startTime: {
          type: String,
          required: [true, "Start time is required"],
          trim: true,
          validate: {
            validator: function (v) {
              return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: "Start time must be in HH:MM format",
          },
        },
        endTime: {
          type: String,
          required: [true, "End time is required"],
          trim: true,
          validate: {
            validator: function (v) {
              return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: "End time must be in HH:MM format",
          },
        },
      },
    ],
    isVerified: { type: Boolean, default: false },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    averageRating: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TutorSchema.pre("save", function (next) {
  if (!this.isModified("hourlyRate")) return next();
  this.markModified("hourlyRate");
  next();
});

const Tutor = mongoose.model("Tutor", TutorSchema);

export default Tutor;
