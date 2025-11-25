import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// List scholarships
router.get(
  "/",
  authenticateToken,
  requirePermission("applications:view"),
  async (_req: AuthRequest, res) => {
    try {
      const rows = await dbAll(
        `SELECT * FROM scholarships ORDER BY created_at DESC`,
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Failed to load scholarships", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to load scholarships" });
    }
  },
);

// Create scholarship policy
router.post(
  "/",
  authenticateToken,
  requirePermission("scholarships:manage"),
  async (req: AuthRequest, res) => {
    try {
      const {
        code,
        name,
        description,
        percentage,
        amount,
        active = 1,
        criteria_json,
      } = req.body as any;
      if (!code || !name)
        return res
          .status(400)
          .json({ success: false, error: "code and name required" });
      const result: any = await dbRun(
        `INSERT INTO scholarships (code, name, description, percentage, amount, active, criteria_json, created_at, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          name,
          description || null,
          Number(percentage || 0),
          amount || null,
          Number(active),
          criteria_json ? JSON.stringify(criteria_json) : null,
          new Date().toISOString(),
          req.user?.id || null,
        ],
      );
      const created = await dbGet(
        `SELECT * FROM scholarships WHERE scholarship_id = ?`,
        [result.lastID],
      );
      res.json({ success: true, data: created });
    } catch (e) {
      console.error("Failed to create scholarship", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to create scholarship" });
    }
  },
);

// Update scholarship
router.put(
  "/:id",
  authenticateToken,
  requirePermission("scholarships:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body || {};
      const allowed = [
        "code",
        "name",
        "description",
        "percentage",
        "amount",
        "active",
        "criteria_json",
      ];
      const sets: string[] = [];
      const params: any[] = [];
      allowed.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(updates, k)) {
          sets.push(`${k} = ?`);
          params.push(
            k === "criteria_json" ? JSON.stringify(updates[k]) : updates[k],
          );
        }
      });
      if (!sets.length)
        return res
          .status(400)
          .json({ success: false, error: "No valid fields to update" });
      params.push(id);
      await dbRun(
        `UPDATE scholarships SET ${sets.join(", ")}, created_at = created_at WHERE scholarship_id = ?`,
        params as any[],
      );
      const updated = await dbGet(
        `SELECT * FROM scholarships WHERE scholarship_id = ?`,
        [id],
      );
      res.json({ success: true, data: updated });
    } catch (e) {
      console.error("Failed to update scholarship", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to update scholarship" });
    }
  },
);

// Delete scholarship
router.delete(
  "/:id",
  authenticateToken,
  requirePermission("scholarships:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      await dbRun(`DELETE FROM scholarships WHERE scholarship_id = ?`, [id]);
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to delete scholarship", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to delete scholarship" });
    }
  },
);

// Scholarship assignments
router.get(
  "/assignments",
  authenticateToken,
  requirePermission("applications:view"),
  async (req: AuthRequest, res) => {
    try {
      const { application_id } = req.query as any;
      const where = application_id ? `WHERE application_id = ?` : "";
      const params = application_id ? [Number(application_id)] : [];
      const rows = await dbAll(
        `SELECT * FROM scholarship_assignments ${where} ORDER BY assigned_at DESC`,
        params as any[],
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Failed to load scholarship assignments", e);
      res
        .status(500)
        .json({
          success: false,
          error: "Failed to load scholarship assignments",
        });
    }
  },
);

router.post(
  "/assignments",
  authenticateToken,
  requirePermission("scholarships:manage"),
  async (req: AuthRequest, res) => {
    try {
      const { application_id, scholarship_id, percent, amount } =
        req.body as any;
      if (!application_id || !scholarship_id)
        return res
          .status(400)
          .json({
            success: false,
            error: "application_id and scholarship_id required",
          });
      const result: any = await dbRun(
        `INSERT INTO scholarship_assignments (application_id, scholarship_id, percent, amount, processed_by_user_id) VALUES (?, ?, ?, ?, ?)`,
        [
          Number(application_id),
          Number(scholarship_id),
          Number(percent || 0),
          amount || null,
          req.user?.id || null,
        ],
      );
      const created = await dbGet(
        `SELECT * FROM scholarship_assignments WHERE scholarship_assignment_id = ?`,
        [result.lastID],
      );
      res.json({ success: true, data: created });
    } catch (e) {
      console.error("Failed to create scholarship assignment", e);
      res
        .status(500)
        .json({
          success: false,
          error: "Failed to create scholarship assignment",
        });
    }
  },
);

router.put(
  "/assignments/:id/lock",
  authenticateToken,
  requirePermission("scholarships:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      await dbRun(
        `UPDATE scholarship_assignments SET locked = 1, locked_by_user_id = ?, locked_at = ? WHERE scholarship_assignment_id = ?`,
        [req.user?.id || null, new Date().toISOString(), id],
      );
      const updated = await dbGet(
        `SELECT * FROM scholarship_assignments WHERE scholarship_assignment_id = ?`,
        [id],
      );
      res.json({ success: true, data: updated });
    } catch (e) {
      console.error("Failed to lock scholarship assignment", e);
      res
        .status(500)
        .json({
          success: false,
          error: "Failed to lock scholarship assignment",
        });
    }
  },
);

router.put(
  "/assignments/:id/unlock",
  authenticateToken,
  requirePermission("scholarships:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      await dbRun(
        `UPDATE scholarship_assignments SET locked = 0, locked_by_user_id = NULL, locked_at = NULL WHERE scholarship_assignment_id = ?`,
        [id],
      );
      const updated = await dbGet(
        `SELECT * FROM scholarship_assignments WHERE scholarship_assignment_id = ?`,
        [id],
      );
      res.json({ success: true, data: updated });
    } catch (e) {
      console.error("Failed to unlock scholarship assignment", e);
      res
        .status(500)
        .json({
          success: false,
          error: "Failed to unlock scholarship assignment",
        });
    }
  },
);

export default router;
