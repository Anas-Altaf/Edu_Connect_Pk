import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    educationLevel: {
      type: String,
      enum: ["primary", "secondary", "higher_secondary", "undergraduate", "graduate", "other"],
      default: "other",
    },
    interests: {
      type: [String],
      default: [],
    },
    preferredSubjects: {
      type: [String],
      default: [],
    },
    learningGoals: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
