import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import { authenticateToken, requirePermission, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// List visitors with pagination and filters
router.get("/", authenticateToken, requirePermission("visitors:view"), async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, search, dateFrom, dateTo, campus } = req.query as any;
    const where: string[] = [];
    const params: any[] = [];
    if (campus) { where.push('campus = ?'); params.push(campus); }
    if (dateFrom) { where.push("date(visit_date) >= date(?)"); params.push(dateFrom); }
    if (dateTo) { where.push("date(visit_date) <= date(?)"); params.push(dateTo); }
    if (search) { const s = `%${search}%`; where.push("(visitor_name LIKE ? OR contact_number LIKE ? OR district LIKE ?)"); params.push(s, s, s); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (Number(page) - 1) * Number(limit);
    const rows = await dbAll(`SELECT * FROM visitors_log ${whereSql} ORDER BY visit_date DESC LIMIT ? OFFSET ?`, [...params, Number(limit), Number(offset)]);
    const countRow = await dbGet(`SELECT COUNT(*) as total FROM visitors_log ${whereSql}`, params);
    const total = countRow ? countRow.total || 0 : 0;
    res.json({ success: true, data: { visitors: rows, total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    console.error('Get visitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create visitor
router.post("/", authenticateToken, requirePermission("visitors:manage"), async (req: AuthRequest, res) => {
  try {
    const { visit_date, campus, visitor_name, district, no_of_visitors = 1, contact_number, interested_program_code, assigned_officer_user_id, sms_sent = 0, remarks } = req.body || {};
    if (!visit_date || !visitor_name) return res.status(400).json({ error: 'MISSING_FIELDS' });
    await dbRun(`INSERT INTO visitors_log (visit_date, campus, visitor_name, district, no_of_visitors, contact_number, interested_program_code, assigned_officer_user_id, sms_sent, remarks, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [visit_date, campus || null, visitor_name, district || null, no_of_visitors || 1, contact_number || null, interested_program_code || null, assigned_officer_user_id || null, sms_sent ? 1 : 0, remarks || null, req.user?.id || null]);
    res.json({ success: true });
  } catch (error) {
    console.error('Create visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update visitor
router.put("/:id", authenticateToken, requirePermission("visitors:manage"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const allowed = ['visit_date','campus','visitor_name','district','no_of_visitors','contact_number','interested_program_code','assigned_officer_user_id','sms_sent','remarks'];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));
    if (fields.length === 0) return res.status(400).json({ error: 'NO_VALID_FIELDS' });
    const set = fields.map(f => `${f} = ?`).join(', ');
    const params = fields.map(f => updates[f]);
    params.push(id);
    await dbRun(`UPDATE visitors_log SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE visit_log_id = ?`, params);
    const row = await dbGet(`SELECT * FROM visitors_log WHERE visit_log_id = ?`, [id]);
    res.json({ success: true, data: row });
  } catch (error) {
    console.error('Update visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete visitor
router.delete("/:id", authenticateToken, requirePermission("visitors:manage"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await dbRun(`DELETE FROM visitors_log WHERE visit_log_id = ?`, [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete visitor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export visitors CSV (simple)
router.get('/export', authenticateToken, requirePermission('reports:export'), async (req: AuthRequest, res) => {
  try {
    const { dateFrom, dateTo } = req.query as any;
    const where: string[] = [];
    const params: any[] = [];
    if (dateFrom) { where.push("date(visit_date) >= date(?)"); params.push(dateFrom); }
    if (dateTo) { where.push("date(visit_date) <= date(?)"); params.push(dateTo); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await dbAll(`SELECT visit_date, campus, visitor_name, district, no_of_visitors, contact_number, interested_program_code, remarks FROM visitors_log ${whereSql} ORDER BY visit_date DESC`, params);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="visitors_export_${Date.now()}.csv"`);
    const keys = ['visit_date','campus','visitor_name','district','no_of_visitors','contact_number','interested_program_code','remarks'];
    res.write(keys.join(',') + '\n');
    for (const r of rows) {
      const line = keys.map(k => '"' + (r[k] == null ? '' : String(r[k]).replace(/"/g, '""')) + '"').join(',');
      res.write(line + '\n');
    }
    res.end();
  } catch (error) {
    console.error('Export visitors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
