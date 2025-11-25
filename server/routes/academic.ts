import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// GET /api/academic/history?application_id=123
router.get(
  "/history",
  authenticateToken,
  requirePermission("applications:view"),
  async (req: AuthRequest, res) => {
    try {
      const { application_id } = req.query as any;
      if (!application_id)
        return res
          .status(400)
          .json({ success: false, error: "application_id required" });
      const rows = await dbAll(
        `SELECT * FROM academic_history WHERE application_id = ? ORDER BY passing_year DESC`,
        [Number(application_id)],
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Fetch academic history failed", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch academic history" });
    }
  },
);

// POST /api/academic/history
router.post(
  "/history",
  authenticateToken,
  requirePermission("applications:edit"),
  async (req: AuthRequest, res) => {
    try {
      const {
        application_id,
        level,
        exam_name,
        group_subject,
        board_university,
        institute_name,
        passing_year,
        roll_no,
        registration_no,
        grade_point,
        obtained_class,
      } = req.body;
      if (!application_id || !level)
        return res
          .status(400)
          .json({ success: false, error: "application_id and level required" });
      const result: any = await dbRun(
        `INSERT INTO academic_history (application_id, level, exam_name, group_subject, board_university, institute_name, passing_year, roll_no, registration_no, grade_point, obtained_class, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          application_id,
          level,
          exam_name || null,
          group_subject || null,
          board_university || null,
          institute_name || null,
          passing_year || null,
          roll_no || null,
          registration_no || null,
          grade_point || null,
          obtained_class || null,
          req.user?.id || null,
        ],
      );
      const created = await dbGet(
        `SELECT * FROM academic_history WHERE academic_history_id = ?`,
        [result.lastID],
      );
      res.json({ success: true, data: created });
    } catch (e) {
      console.error("Insert academic history failed", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to save academic history" });
    }
  },
);

// GET /api/academic/credit-transfers?application_id=...
router.get(
  "/credit-transfers",
  authenticateToken,
  requirePermission("students:view"),
  async (req: AuthRequest, res) => {
    try {
      const { application_id } = req.query as any;
      if (!application_id)
        return res
          .status(400)
          .json({ success: false, error: "application_id required" });
      const rows = await dbAll(
        `SELECT * FROM credit_transfer_records WHERE application_id = ? ORDER BY processed_at DESC`,
        [Number(application_id)],
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Fetch credit transfers failed", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch credit transfers" });
    }
  },
);

// POST /api/academic/credit-transfers — create record
router.post(
  "/credit-transfers",
  authenticateToken,
  requirePermission("students:edit"),
  async (req: AuthRequest, res) => {
    try {
      const {
        application_id,
        transferred_credits,
        previous_credits,
        previous_cgpa,
        new_credits,
        new_cgpa,
        details_json,
      } = req.body;
      if (!application_id)
        return res
          .status(400)
          .json({ success: false, error: "application_id required" });
      const result: any = await dbRun(
        `INSERT INTO credit_transfer_records (application_id, transferred_credits, previous_credits, previous_cgpa, new_credits, new_cgpa, details_json, processed_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          application_id,
          transferred_credits || 0,
          previous_credits || null,
          previous_cgpa || null,
          new_credits || null,
          new_cgpa || null,
          details_json ? JSON.stringify(details_json) : null,
          req.user?.id || null,
        ],
      );
      const created = await dbGet(
        `SELECT * FROM credit_transfer_records WHERE transfer_id = ?`,
        [result.lastID],
      );
      res.json({ success: true, data: created });
    } catch (e) {
      console.error("Create credit transfer failed", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to create credit transfer" });
    }
  },
);

// POST /api/academic/credit-transfers/calc — demo equivalency calculation
router.post(
  "/credit-transfers/calc",
  authenticateToken,
  requirePermission("students:view"),
  async (req: AuthRequest, res) => {
    try {
      // Accept array of source grades: [{ source_scale: 'GPA-4', source_value: 'A', credits: 3 }, ...]
      const items = Array.isArray(req.body.items) ? req.body.items : [];

      // For each item look up credit_equivalency mapping
      const mapped = [] as any[];
      for (const it of items) {
        const source_scale = it.source_scale || "default";
        const source_value = String(it.source_value || "");
        // Find mapping in table
        const row = await dbGet(
          `SELECT mapped_grade_point FROM credit_equivalency WHERE source_scale = ? AND source_value = ? LIMIT 1`,
          [source_scale, source_value],
        );
        const mapped_grade_point = row ? row.mapped_grade_point : null;
        mapped.push({ ...it, mapped_grade_point });
      }

      // Simple aggregate: compute weighted average of mapped_grade_point by credits
      let totalCredits = 0;
      let weightedSum = 0;
      for (const m of mapped) {
        const c = Number(m.credits || 0);
        const gp = Number(m.mapped_grade_point || 0);
        totalCredits += c;
        weightedSum += c * gp;
      }
      const average = totalCredits > 0 ? weightedSum / totalCredits : null;

      res.json({ success: true, data: { mapped, totalCredits, average } });
    } catch (e) {
      console.error("Credit equivalency calc failed", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to calculate equivalency" });
    }
  },
);

export default router;
