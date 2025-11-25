import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

// List employees (admins/staff)
router.get(
  "/",
  authenticateToken,
  requirePermission("users:manage"),
  async (req: AuthRequest, res) => {
    try {
      const { role } = req.query as any;
      if (role) {
        const rows = await dbAll(
          `SELECT u.id, u.name, u.email, u.department, u.designation FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.role_id = ur.role_id WHERE r.role_key = ? AND u.is_active = 1`,
          [role],
        );
        return res.json({ success: true, data: rows });
      }
      const rows = await dbAll(
        `SELECT id, name, email, department, designation, is_active FROM users WHERE type = 'admin' OR type = 'staff' ORDER BY name`,
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      console.error("List employees failed", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to list employees" });
    }
  },
);

// Assign a role to user
router.post(
  "/:id/roles",
  authenticateToken,
  requirePermission("users:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { role_key } = req.body as any;
      if (!role_key)
        return res
          .status(400)
          .json({ success: false, error: "role_key required" });
      const roleRow: any = await dbGet(
        `SELECT role_id FROM roles WHERE role_key = ?`,
        [role_key],
      );
      if (!roleRow)
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      await dbRun(
        `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [id, roleRow.role_id],
      );
      res.json({ success: true });
    } catch (e) {
      console.error("Assign role failed", e);
      res.status(500).json({ success: false, error: "Failed to assign role" });
    }
  },
);

// Remove role
router.delete(
  "/:id/roles/:role_key",
  authenticateToken,
  requirePermission("users:manage"),
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const role_key = req.params.role_key;
      const roleRow: any = await dbGet(
        `SELECT role_id FROM roles WHERE role_key = ?`,
        [role_key],
      );
      if (!roleRow)
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      await dbRun(`DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`, [
        id,
        roleRow.role_id,
      ]);
      res.json({ success: true });
    } catch (e) {
      console.error("Remove role failed", e);
      res.status(500).json({ success: false, error: "Failed to remove role" });
    }
  },
);

export default router;
