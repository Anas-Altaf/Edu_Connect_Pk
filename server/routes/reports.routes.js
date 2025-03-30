import { Router } from "express";
import {
  getAllReports,
  generateReport,
  getSubjectsReport,
  getSessionsReport,
  getLocationsReport,
  getGrowthReport,
  exportReportData,
} from "../controllers/report.controller.js";
import authorize, { authorizeRoles } from "../middleware/auth.middleware.js";

const reportRouter = Router();

// All report routes require admin role
reportRouter.use(authorize);
reportRouter.use(authorizeRoles("admin"));

reportRouter.get("/", getAllReports);
reportRouter.post("/generate", generateReport);
reportRouter.get("/subjects", getSubjectsReport);
reportRouter.get("/sessions", getSessionsReport);
reportRouter.get("/locations", getLocationsReport);
reportRouter.get("/growth", getGrowthReport);
reportRouter.get("/export/:type", exportReportData);

export default reportRouter;
