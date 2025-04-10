import express from "express";
import { PORT } from "./config/env.js";
import connectDB from "./config/database/mongodb.js";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import createError from "http-errors";
import { fileURLToPath } from "url";
import cors from "cors";
import {
  authRouter,
  tutorRouter,
  sessionRouter,
  reviewRouter,
  wishlistRouter,
  verificationRouter,
  reportRouter,
  userRouter,
  notificationRouter,
} from "./routes/index.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tutors", tutorRouter);
app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/verification", verificationRouter);
app.use("/api/v1/reports", reportRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notifications", notificationRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the EDU CONNECT API");
});

app.use((req, res, next) => {
  next(createError(404, "Not Found"));
});
app.use(errorMiddleware);

app.listen(PORT || 5500, async () => {
  console.log(`___ Server running on http://localhost:${PORT} ___`);
  await connectDB();
});
