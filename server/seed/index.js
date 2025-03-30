import mongoose from "mongoose";
import { config } from "dotenv";
import connectDB from "../config/database/mongodb.js";
import { seedUsers } from "./users.seed.js";
import { seedTutors } from "./tutors.seed.js";
import { seedSessions } from "./sessions.seed.js";
import { seedReviews } from "./reviews.seed.js";
import { seedWishlists } from "./wishlists.seed.js";
import { seedNotifications } from "./notifications.seed.js";
import {
  User,
  Tutor,
  Session,
  Review,
  Wishlist,
  Notification,
} from "../models/index.js";

// Load environment variables
config();

// Function to clear database collections
const clearDatabase = async () => {
  console.log("Clearing existing data...");

  // Use deleteMany on the MongoDB collections directly to bypass Mongoose hooks
  await mongoose.connection.collection("users").deleteMany({});
  await mongoose.connection.collection("tutors").deleteMany({});
  await mongoose.connection.collection("sessions").deleteMany({});
  await mongoose.connection.collection("reviews").deleteMany({});
  await mongoose.connection.collection("wishlists").deleteMany({});
  await mongoose.connection.collection("notifications").deleteMany({});

  console.log("Database cleared");
};

// Main seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing data
    await clearDatabase();

    // Seed data in sequence to maintain references
    console.log("Seeding users...");
    const users = await seedUsers();

    console.log("Seeding tutors...");
    const tutors = await seedTutors(users);

    console.log("Seeding sessions...");
    await seedSessions(users, tutors);

    console.log("Seeding reviews...");
    await seedReviews(users, tutors);

    console.log("Seeding wishlists...");
    await seedWishlists(users, tutors);

    console.log("Seeding notifications...");
    await seedNotifications(users, tutors);

    console.log("✅ Database seeded successfully!");

    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Execute the seed function
seedDatabase();
