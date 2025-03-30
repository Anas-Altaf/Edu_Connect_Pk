import { Router } from "express";
import {
  getAllTutors,
  getTutorDetails,
  updateTutorProfile,
  updateTutorAvailability,
  updateTutorRate,
  deleteTutorProfile,
  updateProfileImage,
  getTutorPreview,
} from "../controllers/tutor.controller.js";
import authorize, { authorizeRoles } from "../middleware/auth.middleware.js";

const tutorRouter = Router();

// Public routes
tutorRouter.get("/", getAllTutors);
tutorRouter.get("/:id", getTutorDetails);
tutorRouter.get("/:id/preview", getTutorPreview);

// Protected routes
tutorRouter.put("/:id", authorize, authorizeRoles("tutor"), updateTutorProfile);
tutorRouter.put(
  "/:id/availability",
  authorize,
  authorizeRoles("tutor"),
  updateTutorAvailability
);
tutorRouter.put(
  "/:id/rate",
  authorize,
  authorizeRoles("tutor"),
  updateTutorRate
);
tutorRouter.delete(
  "/:id",
  authorize,
  authorizeRoles("tutor"),
  deleteTutorProfile
);
tutorRouter.post(
  "/:id/profile-image",
  authorize,
  authorizeRoles("tutor"),
  updateProfileImage
);

export default tutorRouter;
