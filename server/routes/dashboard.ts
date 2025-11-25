import express from "express";
import { dbAll, dbGet } from "../database/config.js";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// GET /api/dashboard/summary
router.get(
  "/summary",
  authenticateToken,
  requirePermission("applications:view"),
  async (req: AuthRequest, res) => {
    try {
      const totalApplicationsRow: any = await dbGet(
        `SELECT COUNT(*) as total FROM applications`,
      );
      const totalApplications = totalApplicationsRow
        ? totalApplicationsRow.total || 0
        : 0;

      const admittedRow: any = await dbGet(
        `SELECT COUNT(*) as total FROM applications WHERE status = 'approved'`,
      );
      const admitted = admittedRow ? admittedRow.total || 0 : 0;

      const studentsRow: any = await dbGet(
        `SELECT COUNT(*) as total FROM students`,
      );
      const totalStudents = studentsRow ? studentsRow.total || 0 : 0;

      const activeStudentsRow: any = await dbGet(
        `SELECT COUNT(*) as total FROM students WHERE 1=1`,
      );
      const activeStudents = activeStudentsRow
        ? activeStudentsRow.total || 0
        : 0;

      const waiversRow: any = await dbGet(
        `SELECT SUM(percent) as total_percent, COUNT(*) as total FROM waiver_assignments`,
      );
      const totalWaiverAssignments = waiversRow ? waiversRow.total || 0 : 0;
      const totalWaiverPercent = waiversRow ? waiversRow.total_percent || 0 : 0;

      const paymentsRow: any = await dbGet(
        `SELECT SUM(amount) as total_collected FROM student_bills WHERE status = 'Paid'`,
      );
      const totalCollected = paymentsRow ? paymentsRow.total_collected || 0 : 0;

      const visitorsRow: any = await dbGet(
        `SELECT COUNT(*) as total FROM visitors_log WHERE date(visit_date) >= date('now','-30 days')`,
      );
      const recentVisitors = visitorsRow ? visitorsRow.total || 0 : 0;

      res.json({
        success: true,
        data: {
          totalApplications,
          admitted,
          totalStudents,
          activeStudents,
          totalWaiverAssignments,
          totalWaiverPercent,
          totalCollected,
          recentVisitors,
        },
      });
    } catch (e) {
      console.error("Failed to fetch dashboard summary", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch dashboard summary" });
    }
  },
);

export default router;
