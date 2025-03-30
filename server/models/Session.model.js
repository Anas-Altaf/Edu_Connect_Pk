import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Session date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      trim: true,
      validate: {
        validator: function (v) {
          // Validate time slot format (e.g., "09:00-10:00")
          return /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(v);
        },
        message: "Time slot should be in the format HH:MM-HH:MM",
      },
    },
    startTime: {
      type: Date,
      required: [true, "Session start time is required"],
      validate: {
        validator: function (v) {
          return v instanceof Date && !isNaN(v);
        },
        message: "Invalid start time format",
      },
    },
    endTime: {
      type: Date,
      required: [true, "Session end time is required"],
      validate: [
        {
          validator: function (v) {
            return v instanceof Date && !isNaN(v);
          },
          message: "Invalid end time format",
        },
        {
          validator: function (v) {
            return v > this.startTime;
          },
          message: "Session end time must be after start time",
        },
      ],
    },
    type: {
      type: String,
      enum: ["online", "in-person"],
      required: [true, "Session type is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "canceled"],
      default: "pending",
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Session amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent double booking
SessionSchema.pre("save", async function (next) {
  // Only check for conflicts if this is a new session or if the date/time is changing
  if (this.isNew || this.isModified("date") || this.isModified("startTime")) {
    const existingSession = await this.constructor.findOne({
      tutorId: this.tutorId,
      _id: { $ne: this._id }, // Skip the current document when updating
      status: { $ne: "canceled" },
      $or: [
        { startTime: this.startTime },
        {
          startTime: { $lt: this.endTime },
          endTime: { $gt: this.startTime },
        },
      ],
    });

    if (existingSession) {
      return next(new Error("This slot is already booked!"));
    }
  }
  next();
});

const Session = mongoose.model("Session", SessionSchema);

export default Session;
