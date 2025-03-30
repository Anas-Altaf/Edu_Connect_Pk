import { MONGO_URI } from "../env.js";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI);
    console.log("___ MongoDB connected ___");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
