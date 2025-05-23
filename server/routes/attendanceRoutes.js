import express from "express";
import {
  markAttendance,
  getDepartmentCounts,
  getStudentReport,
  getStudentAttendanceReport,
  getFilteredAttendance,
  filterAttendance,
  addAttendance,
  getDepartmentReport,
  testEmailReports
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark-attendance", markAttendance);
router.get("/department-counts", getDepartmentCounts);
router.get("/report", getStudentReport);
router.get("/report/details", getStudentAttendanceReport);
router.get("/filter", getFilteredAttendance); // ✅ Added missing route
router.get("/filter-by-department", filterAttendance);
router.post("/add", addAttendance);
router.get("/department-report", getDepartmentReport);
// Add this line to support both GET and POST
router.get('/test-email', testEmailReports);

export default router;