import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// Waiver policies
router.get(
  "/waiver-policies",
  authenticateToken,
  requirePermission("applications:view"),
  async (_req: AuthRequest, res) => {
    try {
      const rows = await dbAll(
        `SELECT * FROM waiver_policies ORDER BY created_at DESC`,
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Failed to load waiver policies", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to load waiver policies" });
    }
  },
);

// Waiver assignments
router.get(
  "/waiver-assignments",
  authenticateToken,
  requirePermission("applications:view"),
  async (req: AuthRequest, res) => {
    try {
      const { application_id } = req.query as any;
      const where = application_id ? `WHERE application_id = ?` : "";
      const params = application_id ? [Number(application_id)] : [];
      const rows = await dbAll(
        `SELECT * FROM waiver_assignments ${where} ORDER BY assigned_at DESC`,
        params as any[],
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Failed to load waiver assignments", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to load waiver assignments" });
    }
  },
);

router.post(
  "/waiver-assignments",
  authenticateToken,
  requirePermission("waivers:manage"),
  async (req: AuthRequest, res) => {
    try {
      const { application_id, waiver_code, percent } = req.body as any;
      if (!application_id || !waiver_code)
        return res
          .status(400)
          .json({
            success: false,
            error: "application_id and waiver_code required",
          });
      const result: any = await dbRun(
        `INSERT INTO waiver_assignments (application_id, waiver_code, percent, assigned_by_user_id) VALUES (?, ?, ?, ?)`,
        [
          Number(application_id),
          waiver_code,
          Number(percent || 0),
          req.user?.id || null,
        ],
      );
      const created = await dbGet(
        `SELECT * FROM waiver_assignments WHERE waiver_assignment_id = ?`,
        [result.lastID],
      );
      res.json({ success: true, data: created });
    } catch (e) {
      console.error("Failed to create waiver assignment", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to create waiver assignment" });
    }
  },
);

router.put(
  "/waiver-assignments/:id",
  authenticateToken,
  requirePermission("waivers:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body || {};
      const allowed = [
        "percent",
        "waiver_code",
        "locked",
        "locked_by_user_id",
        "locked_at",
        "status",
      ];
      const sets: string[] = [];
      const params: any[] = [];
      allowed.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(updates, k)) {
          sets.push(`${k} = ?`);
          params.push(updates[k]);
        }
      });
      if (!sets.length)
        return res
          .status(400)
          .json({ success: false, error: "No valid fields to update" });
      params.push(id);
      await dbRun(
        `UPDATE waiver_assignments SET ${sets.join(", ")}, assigned_at = assigned_at WHERE waiver_assignment_id = ?`,
        params as any[],
      );
      const updated = await dbGet(
        `SELECT * FROM waiver_assignments WHERE waiver_assignment_id = ?`,
        [id],
      );
      res.json({ success: true, data: updated });
    } catch (e) {
      console.error("Failed to update waiver assignment", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to update waiver assignment" });
    }
  },
);

// Fee packages
router.get(
  "/fee-packages",
  authenticateToken,
  requirePermission("applications:view"),
  async (_req: AuthRequest, res) => {
    try {
      const rows = await dbAll(
        `SELECT * FROM fee_packages ORDER BY created_at DESC`,
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Failed to load fee packages", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to load fee packages" });
    }
  },
);

router.post(
  "/fee-packages",
  authenticateToken,
  requirePermission("applications:manage"),
  async (req: AuthRequest, res) => {
    try {
      const {
        program_code,
        session_name,
        admission_fee = 0,
        tuition_fee = 0,
        lab_fee = 0,
        other_fees = 0,
      } = req.body as any;
      if (!program_code)
        return res
          .status(400)
          .json({ success: false, error: "program_code required" });
      const result: any = await dbRun(
        `INSERT INTO fee_packages (program_code, session_name, admission_fee, tuition_fee, lab_fee, other_fees, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          program_code,
          session_name || null,
          Number(admission_fee),
          Number(tuition_fee),
          Number(lab_fee),
          Number(other_fees),
          req.user?.id || null,
        ],
      );
      const created = await dbGet(
        `SELECT * FROM fee_packages WHERE fee_package_id = ?`,
        [result.lastID],
      );
      res.json({ success: true, data: created });
    } catch (e) {
      console.error("Failed to create fee package", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to create fee package" });
    }
  },
);

router.put(
  "/fee-packages/:id",
  authenticateToken,
  requirePermission("applications:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const updates = req.body || {};
      const allowed = [
        "program_code",
        "session_name",
        "admission_fee",
        "tuition_fee",
        "lab_fee",
        "other_fees",
      ];
      const sets: string[] = [];
      const params: any[] = [];
      allowed.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(updates, k)) {
          sets.push(`${k} = ?`);
          params.push(updates[k]);
        }
      });
      if (!sets.length)
        return res
          .status(400)
          .json({ success: false, error: "No valid fields to update" });
      params.push(id);
      await dbRun(
        `UPDATE fee_packages SET ${sets.join(", ")}, created_at = created_at WHERE fee_package_id = ?`,
        params as any[],
      );
      const updated = await dbGet(
        `SELECT * FROM fee_packages WHERE fee_package_id = ?`,
        [id],
      );
      res.json({ success: true, data: updated });
    } catch (e) {
      console.error("Failed to update fee package", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to update fee package" });
    }
  },
);

router.delete(
  "/fee-packages/:id",
  authenticateToken,
  requirePermission("applications:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      await dbRun(`DELETE FROM fee_packages WHERE fee_package_id = ?`, [id]);
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to delete fee package", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to delete fee package" });
    }
  },
);

// Student bills
router.get(
  "/bills",
  authenticateToken,
  requirePermission("finance:view"),
  async (req: AuthRequest, res) => {
    try {
      const { student_id, application_id } = req.query as any;
      const clauses: string[] = [];
      const params: any[] = [];
      if (student_id) {
        clauses.push("student_id = ?");
        params.push(Number(student_id));
      }
      if (application_id) {
        clauses.push("application_id = ?");
        params.push(Number(application_id));
      }
      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
      const rows = await dbAll(
        `SELECT * FROM student_bills ${where} ORDER BY created_at DESC`,
        params,
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("Failed to load bills", e);
      res.status(500).json({ success: false, error: "Failed to load bills" });
    }
  },
);

router.post(
  "/bills",
  authenticateToken,
  requirePermission("finance:billing"),
  async (req: AuthRequest, res) => {
    try {
      const { student_id, application_id, description, amount, due_date } =
        req.body as any;
      if (!student_id || !description || typeof amount === "undefined")
        return res
          .status(400)
          .json({
            success: false,
            error: "student_id, description and amount are required",
          });
      const result: any = await dbRun(
        `INSERT INTO student_bills (student_id, application_id, description, amount, due_date, status, created_by_user_id) VALUES (?, ?, ?, ?, ?, 'Unpaid', ?)`,
        [
          Number(student_id),
          application_id ? Number(application_id) : null,
          description,
          Number(amount),
          due_date || null,
          req.user?.id || null,
        ],
      );
      const created = await dbGet(
        `SELECT * FROM student_bills WHERE bill_id = ?`,
        [result.lastID],
      );
      res.json({ success: true, data: created });
    } catch (e) {
      console.error("Failed to create bill", e);
      res.status(500).json({ success: false, error: "Failed to create bill" });
    }
  },
);

router.put(
  "/bills/:id/pay",
  authenticateToken,
  requirePermission("finance:billing"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { paid_by_user_id } = req.body as any;
      await dbRun(
        `UPDATE student_bills SET status = 'Paid', paid_at = ?, updated_at = CURRENT_TIMESTAMP WHERE bill_id = ?`,
        [new Date().toISOString(), id],
      );
      const updated = await dbGet(
        `SELECT * FROM student_bills WHERE bill_id = ?`,
        [id],
      );
      res.json({ success: true, data: updated });
    } catch (e) {
      console.error("Failed to mark bill paid", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to mark bill paid" });
    }
  },
);

export default router;
