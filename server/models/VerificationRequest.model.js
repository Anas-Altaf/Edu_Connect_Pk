import mongoose from "mongoose";

const VerificationRequestSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: [true, "Tutor ID is required"],
      unique: true,
    },
    documents: [
      {
        type: String,
        required: [true, "Must attach verification documents"],
        trim: true,
        validate: {
          validator: function (v) {
            // Check for common file extensions for documents
            return /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(v);
          },
          message: "Document URL must point to a valid file type",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      trim: true,
    },
    adminComment: {
      type: String,
      trim: true,
      maxlength: [500, "Admin comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// Auto-verify tutor when request is approved
VerificationRequestSchema.pre("save", async function (next) {
  if (this.isModified("status") && this.status === "approved") {
    const Tutor = mongoose.model("Tutor");
    await Tutor.findByIdAndUpdate(this.tutorId, { isVerified: true });
  }
  next();
});

const VerificationRequest = mongoose.model(
  "VerificationRequest",
  VerificationRequestSchema
);

export default VerificationRequest;
