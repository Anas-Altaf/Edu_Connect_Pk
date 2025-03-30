import { Router } from "express";
import {
  bookSession,
  getStudentSessions,
  getTutorSessions,
  updateSession,
  cancelSession,
  handleSessionApproval,
  completeSession,
  getEarningsSummary,
  checkAvailability,
  getCalendarSessions,
  getSessionStats,
  getSessionDetails,
} from "../controllers/session.controller.js";
import authorize, { authorizeRoles } from "../middleware/auth.middleware.js";

const sessionRouter = Router();

sessionRouter.post("/", authorize, authorizeRoles("student"), bookSession);

sessionRouter.get("/student", authorize, getStudentSessions);
sessionRouter.get("/tutor", authorize, getTutorSessions);

sessionRouter.get("/stats", authorize, getSessionStats);
sessionRouter.put("/:id", authorize, updateSession);
sessionRouter.delete("/:id", authorize, cancelSession);
sessionRouter.put(
  "/:id/approval",
  authorize,
  authorizeRoles("tutor"),
  handleSessionApproval
);
sessionRouter.put(
  "/:id/complete",
  authorize,
  authorizeRoles("tutor"),
  completeSession
);
sessionRouter.get(
  "/tutor/earnings",
  authorize,
  authorizeRoles("tutor"),
  getEarningsSummary
);
sessionRouter.get("/availability", authorize, checkAvailability);
sessionRouter.get("/calendar", authorize, getCalendarSessions);
sessionRouter.get("/:id", authorize, getSessionDetails);

export default sessionRouter;
