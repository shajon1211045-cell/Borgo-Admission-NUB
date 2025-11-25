import express from "express";
import { dbAll } from "../database/config.js";
import { authenticateToken, requireAdmin, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// GET /api/mock-emails - list mock emails (admin only)
router.get("/", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM mock_emails ORDER BY created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Failed to fetch mock emails:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/mock-emails/resend - resend (duplicate) a mock email by id (admin only)
router.post("/resend", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ success: false, error: "id required" });

    const rows = await dbAll(`SELECT * FROM mock_emails WHERE id = ?`, [id]);
    const row = rows && rows.length ? rows[0] : null;
    if (!row) return res.status(404).json({ success: false, error: "Email not found" });

    // Insert a new mock email as a resend with sent_at
    const { lastID } = await (await import("../database/config.js")).then(({ dbRun }) => dbRun(`INSERT INTO mock_emails (to_address, subject, body, application_id, created_at, sent_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`, [row.to_address, row.subject, row.body, row.application_id]));

    const newRow = await dbAll(`SELECT * FROM mock_emails WHERE id = ?`, [lastID]);
    res.json({ success: true, data: newRow[0] || null });
  } catch (error) {
    console.error("Failed to resend mock email:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
