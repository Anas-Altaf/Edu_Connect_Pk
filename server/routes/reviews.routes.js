import { Router } from "express";
import {
  addReview,
  getTutorReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import authorize, { authorizeRoles } from "../middleware/auth.middleware.js";

const reviewRouter = Router();

reviewRouter.post("/", authorize, authorizeRoles("student"), addReview);
reviewRouter.get("/tutor/:id", getTutorReviews);
reviewRouter.delete("/:id", authorize, deleteReview);

export default reviewRouter;
