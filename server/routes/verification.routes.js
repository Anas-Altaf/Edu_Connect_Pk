import { Router } from "express";
import {
  submitVerificationRequest,
  getPendingRequests,
  handleVerificationRequest,
  getVerificationStats,
} from "../controllers/verification.controller.js";
import authorize, { authorizeRoles } from "../middleware/auth.middleware.js";

const verificationRouter = Router();

verificationRouter.post(
  "/",
  authorize,
  authorizeRoles("tutor"),
  submitVerificationRequest
);
verificationRouter.get(
  "/pending",
  authorize,
  authorizeRoles("admin"),
  getPendingRequests
);
verificationRouter.put(
  "/:id",
  authorize,
  authorizeRoles("admin"),
  handleVerificationRequest
);
verificationRouter.get(
  "/stats",
  authorize,
  authorizeRoles("admin"),
  getVerificationStats
);

export default verificationRouter;
