import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// List referral requests (applications with referrer info)
router.get(
  "/requests",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const rows = await dbAll(
        `SELECT a.id as application_id, a.uuid, a.tracking_id, a.first_name, a.last_name, a.email, a.phone, a.total_cost, a.final_amount, a.payment_status, a.referrer_id as referrer_employee_id, a.referrer_name, a.created_at
       FROM applications a
       WHERE a.referrer_id IS NOT NULL
       ORDER BY a.created_at DESC`,
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Error listing referral requests", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to list referral requests" });
    }
  },
);

// Approve a referral request for an application
router.post(
  "/requests/:applicationId/approve",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const applicationId = Number(req.params.applicationId);
      const { percentage } = req.body as { percentage: number };
      if (Number.isNaN(applicationId))
        return res
          .status(400)
          .json({ success: false, error: "Invalid application id" });
      if (typeof percentage !== "number" || percentage < 0 || percentage > 100)
        return res
          .status(400)
          .json({ success: false, error: "Invalid percentage" });

      const app = await dbGet(
        "SELECT id, final_amount, total_cost, referrer_id FROM applications WHERE id = ?",
        [applicationId],
      );
      if (!app)
        return res
          .status(404)
          .json({ success: false, error: "Application not found" });

      const baseAmount = app.final_amount || app.total_cost || 0;
      const amount = Math.round(baseAmount * (percentage / 100) * 100) / 100;

      // Insert or update referral_requests
      const existing = await dbGet(
        "SELECT * FROM referral_requests WHERE application_id = ?",
        [applicationId],
      );
      if (existing) {
        await dbRun(
          "UPDATE referral_requests SET percentage = ?, amount = ?, status = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP WHERE application_id = ?",
          [
            percentage,
            amount,
            "approved",
            req.user?.university_id || req.user?.uuid || String(req.user?.id),
            applicationId,
          ],
        );
      } else {
        await dbRun(
          "INSERT INTO referral_requests (application_id, referrer_employee_id, admission_fee, percentage, amount, status, processed_by, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
          [
            applicationId,
            app.referrer_id || null,
            baseAmount,
            percentage,
            amount,
            "approved",
            req.user?.university_id || req.user?.uuid || String(req.user?.id),
          ],
        );
      }

      res.json({
        success: true,
        data: { application_id: applicationId, percentage, amount },
      });
    } catch (e) {
      console.error("Error approving referral", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to approve referral" });
    }
  },
);

// Reject referral
router.post(
  "/requests/:applicationId/reject",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const applicationId = Number(req.params.applicationId);
      const { notes } = req.body as { notes?: string };
      if (Number.isNaN(applicationId))
        return res
          .status(400)
          .json({ success: false, error: "Invalid application id" });

      const app = await dbGet(
        "SELECT id, referrer_id FROM applications WHERE id = ?",
        [applicationId],
      );
      if (!app)
        return res
          .status(404)
          .json({ success: false, error: "Application not found" });

      const existing = await dbGet(
        "SELECT * FROM referral_requests WHERE application_id = ?",
        [applicationId],
      );
      if (existing) {
        await dbRun(
          "UPDATE referral_requests SET status = ?, notes = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP WHERE application_id = ?",
          [
            "rejected",
            notes || null,
            req.user?.university_id || req.user?.uuid || String(req.user?.id),
            applicationId,
          ],
        );
      } else {
        await dbRun(
          "INSERT INTO referral_requests (application_id, referrer_employee_id, admission_fee, percentage, amount, status, processed_by, notes, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
          [
            applicationId,
            app.referrer_id || null,
            0,
            0,
            0,
            "rejected",
            req.user?.university_id || req.user?.uuid || String(req.user?.id),
            notes || null,
          ],
        );
      }

      res.json({ success: true, message: "Referral rejected" });
    } catch (e) {
      console.error("Error rejecting referral", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to reject referral" });
    }
  },
);

export default router;
