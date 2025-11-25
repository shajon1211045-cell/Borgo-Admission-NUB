import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// Input validation helper for registration package payloads
const validatePackageInput = (payload: any, partial = false) => {
  const errors: string[] = [];
  const sanitized: any = {};

  if (!partial || payload.id !== undefined) {
    if (typeof payload.id !== "string" || !payload.id.trim()) {
      errors.push("id is required and must be a non-empty string");
    } else if (payload.id.length > 100) {
      errors.push("id must be at most 100 characters");
    } else {
      sanitized.id = payload.id.trim();
    }
  }

  if (!partial || payload.program !== undefined) {
    if (typeof payload.program !== "string" || !payload.program.trim()) {
      errors.push("program is required and must be a non-empty string");
    } else if (payload.program.length > 500) {
      errors.push("program must be at most 500 characters");
    } else {
      sanitized.program = payload.program.trim();
    }
  }

  if (payload.term !== undefined) {
    sanitized.term = payload.term === null ? null : String(payload.term).trim();
    if (sanitized.term && sanitized.term.length > 200)
      errors.push("term must be at most 200 characters");
  }

  if (payload.mode !== undefined) {
    sanitized.mode = payload.mode === null ? null : String(payload.mode).trim();
    if (sanitized.mode && sanitized.mode.length > 200)
      errors.push("mode must be at most 200 characters");
  }

  const numericFields = [
    "credits",
    "admission_fee",
    "per_credit",
    "fixed_fees",
    "total_estimated",
  ];
  for (const field of numericFields) {
    if (payload[field] !== undefined) {
      const v = payload[field];
      const num = Number(v);
      if (Number.isNaN(num) || !Number.isFinite(num) || num < 0) {
        errors.push(`${field} must be a non-negative number`);
      } else {
        // credits should be integer
        sanitized[field] = field === "credits" ? Math.trunc(num) : num;
      }
    }
  }

  return { valid: errors.length === 0, errors, sanitized };
};

// Public: list registration packages
router.get("/", async (req, res) => {
  try {
    const pkgs = await dbAll(
      "SELECT * FROM registration_packages ORDER BY term, program",
    );
    res.json({ success: true, data: pkgs });
  } catch (err) {
    console.error("Get registration packages error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Admin CRUD — require authenticated user; specific permissions enforced per-route
router.use(authenticateToken);

router.post(
  "/",
  requirePermission("registration_packages:manage"),
  async (req: AuthRequest, res) => {
    try {
      const payload = req.body || {};
      const { valid, errors, sanitized } = validatePackageInput(payload, false);
      if (!valid)
        return res
          .status(400)
          .json({
            success: false,
            error: "Validation failed",
            details: errors,
          });

      await dbRun(
        `INSERT OR REPLACE INTO registration_packages (id, program, term, mode, credits, admission_fee, per_credit, fixed_fees, total_estimated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sanitized.id,
          sanitized.program,
          sanitized.term ?? null,
          sanitized.mode ?? null,
          sanitized.credits ?? 0,
          sanitized.admission_fee ?? 0,
          sanitized.per_credit ?? 0,
          sanitized.fixed_fees ?? 0,
          sanitized.total_estimated ?? 0,
        ],
      );
      const row = await dbGet(
        "SELECT * FROM registration_packages WHERE id = ?",
        [sanitized.id],
      );
      res.json({ success: true, data: row });
    } catch (err) {
      console.error("Create registration package error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
);

router.put(
  "/:id",
  requirePermission("registration_packages:manage"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body || {};
      const existing = await dbGet(
        "SELECT * FROM registration_packages WHERE id = ?",
        [id],
      );
      if (!existing)
        return res
          .status(404)
          .json({ success: false, error: "Package not found" });

      const { valid, errors, sanitized } = validatePackageInput(updates, true);
      if (!valid)
        return res
          .status(400)
          .json({
            success: false,
            error: "Validation failed",
            details: errors,
          });

      const program = sanitized.program ?? existing.program;
      const term = sanitized.term ?? existing.term;
      const mode = sanitized.mode ?? existing.mode;
      const credits = sanitized.credits ?? existing.credits;
      const admission_fee = sanitized.admission_fee ?? existing.admission_fee;
      const per_credit = sanitized.per_credit ?? existing.per_credit;
      const fixed_fees = sanitized.fixed_fees ?? existing.fixed_fees;
      const total_estimated =
        sanitized.total_estimated ?? existing.total_estimated;

      await dbRun(
        `UPDATE registration_packages SET program = ?, term = ?, mode = ?, credits = ?, admission_fee = ?, per_credit = ?, fixed_fees = ?, total_estimated = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [
          program,
          term,
          mode,
          credits,
          admission_fee,
          per_credit,
          fixed_fees,
          total_estimated,
          id,
        ],
      );

      const row = await dbGet(
        "SELECT * FROM registration_packages WHERE id = ?",
        [id],
      );
      res.json({ success: true, data: row });
    } catch (err) {
      console.error("Update registration package error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
);

router.delete(
  "/:id",
  requirePermission("registration_packages:manage"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await dbRun("DELETE FROM registration_packages WHERE id = ?", [id]);
      res.json({ success: true, data: { deleted: true } });
    } catch (err) {
      console.error("Delete registration package error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
);

export default router;
