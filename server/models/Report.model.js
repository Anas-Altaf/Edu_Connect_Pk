import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Report type is required"],
      enum: [
        "subject_popularity",
        "session_completion",
        "user_growth",
        "platform_usage_by_city",
        "earnings_summary",
      ],
      trim: true,
    },
    data: {
      type: Object,
      required: [true, "Report data is required"],
      validate: {
        validator: function (value) {
          return value && Object.keys(value).length > 0;
        },
        message: "Report data cannot be empty",
      },
    },
    timeRange: {
      start: { type: Date, required: [true, "Report start date is required"] },
      end: { type: Date, required: [true, "Report end date is required"] },
    },
  },
  { timestamps: true }
);

ReportSchema.pre("validate", function (next) {
  if (this.timeRange && this.timeRange.start && this.timeRange.end) {
    if (this.timeRange.end <= this.timeRange.start) {
      this.invalidate(
        "timeRange",
        "Time Range is not valid, end date should be after the start date"
      );
    }
  }
  next();
});

const Report = mongoose.model("Report", ReportSchema);

export default Report;
