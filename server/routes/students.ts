import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// List students with filters
router.get(
  "/",
  authenticateToken,
  requirePermission("students:view"),
  async (req: AuthRequest, res) => {
    try {
      const {
        search,
        program_code,
        semester_id,
        page = 1,
        limit = 20,
      } = req.query as any;
      const where: string[] = [];
      const params: any[] = [];

      if (program_code) {
        where.push("s.program_code = ?");
        params.push(program_code);
      }
      if (semester_id) {
        where.push("s.semester_id = ?");
        params.push(Number(semester_id));
      }

      let whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

      if (search) {
        const s = `%${search}%`;
        whereSql = whereSql
          ? `${whereSql} AND (s.university_id LIKE ? OR s.ugc_id LIKE ? OR s.full_name LIKE ? OR s.email LIKE ? OR s.mobile_number LIKE ?)`
          : `WHERE (s.university_id LIKE ? OR s.ugc_id LIKE ? OR s.full_name LIKE ? OR s.email LIKE ? OR s.mobile_number LIKE ?)`;
        params.push(s, s, s, s, s);
      }

      const offset = (Number(page) - 1) * Number(limit);
      const sql = `SELECT s.*, a.program_code as application_program_code, a.semester_id as application_semester_id FROM students s LEFT JOIN applications_v2 a ON a.application_id = s.application_id ${whereSql} ORDER BY s.enrolled_at DESC LIMIT ? OFFSET ?`;
      const rows = await dbAll(sql, [...params, Number(limit), Number(offset)]);

      const countSql = `SELECT COUNT(*) as total FROM students s LEFT JOIN applications_v2 a ON a.application_id = s.application_id ${whereSql}`;
      const countRow = await dbGet(countSql, params);
      const total = countRow ? countRow.total || 0 : 0;

      res.json({
        success: true,
        data: {
          students: rows,
          page: Number(page),
          limit: Number(limit),
          total,
        },
      });
    } catch (error) {
      console.error("List students error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get student detail
router.get(
  "/:id",
  authenticateToken,
  requirePermission("students:view"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const row = await dbGet(
        `SELECT s.*, a.* FROM students s LEFT JOIN applications_v2 a ON a.application_id = s.application_id WHERE s.student_id = ?`,
        [id],
      );
      if (!row) return res.status(404).json({ error: "Student not found" });
      res.json({ success: true, data: row });
    } catch (error) {
      console.error("Get student error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Update student profile (admin)
router.put(
  "/:id",
  authenticateToken,
  requirePermission("students:edit"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body || {};

      const allowed = [
        "full_name",
        "email",
        "mobile_number",
        "batch",
        "program_code",
        "semester_id",
        "father_name",
        "father_phone",
        "mother_name",
        "mother_phone",
        "guardian_name",
        "guardian_phone",
        "guardian_address",
        "quota",
        "religion",
        "disability_status",
        "blood_group",
        "passport_no",
        "nid_no",
        "birth_certificate_no",
        "required_credits",
        "grading_system",
        "remarks",
        "present_address",
        "permanent_address",
        "photo_url",
      ];

      const setClauses: string[] = [];
      const params: any[] = [];
      allowed.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(updates, k)) {
          setClauses.push(`${k} = ?`);
          params.push(updates[k]);
        }
      });

      if (setClauses.length === 0)
        return res
          .status(400)
          .json({ success: false, error: "No valid fields to update" });

      params.push(id);
      const sql = `UPDATE students SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE student_id = ?`;
      await dbRun(sql, params as any[]);

      const updated = await dbGet(
        `SELECT * FROM students WHERE student_id = ?`,
        [id],
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("Update student error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
