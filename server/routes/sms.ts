import express from "express";
import { dbAll, dbRun, dbGet } from "../database/config.js";
import { authenticateToken, requireAdmin, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// List SMS queue (admin only)
router.get("/", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM sms_queue ORDER BY created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Failed to list sms_queue:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Process one or all queued SMS (admin only). POST /process { all: boolean }
router.post("/process", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { all = false } = req.body || {};

    if (all) {
      const queued = await dbAll(`SELECT * FROM sms_queue WHERE status = 'queued'`);
      const results: any[] = [];
      for (const s of queued) {
        // Mark as sent (mock)
        await dbRun(`UPDATE sms_queue SET status = 'sent', processed_at = datetime('now') WHERE sms_id = ?`, [s.sms_id]);
        results.push({ sms_id: s.sms_id, status: 'sent' });
      }
      return res.json({ success: true, data: results });
    }

    // Process one
    const next = await dbGet(`SELECT * FROM sms_queue WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1`);
    if (!next) return res.json({ success: true, message: 'No queued SMS' });

    await dbRun(`UPDATE sms_queue SET status = 'sent', processed_at = datetime('now') WHERE sms_id = ?`, [next.sms_id]);
    res.json({ success: true, data: { sms_id: next.sms_id, status: 'sent' } });
  } catch (err) {
    console.error("Failed to process sms queue:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/sms/send - send a specific queued SMS by sms_id (admin only)
router.post("/send", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { sms_id } = req.body || {};
    if (!sms_id) return res.status(400).json({ success: false, error: 'sms_id required' });

    const row = await dbGet(`SELECT * FROM sms_queue WHERE sms_id = ?`, [sms_id]);
    if (!row) return res.status(404).json({ success: false, error: 'SMS not found' });

    if (row.status === 'sent') return res.json({ success: true, message: 'Already sent' });

    await dbRun(`UPDATE sms_queue SET status = 'sent', processed_at = datetime('now') WHERE sms_id = ?`, [sms_id]);
    res.json({ success: true, data: { sms_id, status: 'sent' } });
  } catch (err) {
    console.error('Failed to send sms:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
