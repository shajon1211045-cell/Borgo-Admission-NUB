import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import { authenticateToken, requirePermission, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// Program-wise admitted students per semester
router.get('/admitted-per-program', authenticateToken, requirePermission('reports:view'), async (req: AuthRequest, res) => {
  try {
    const { semester_id, campus_id } = req.query as any;
    const params: any[] = [];
    let where = 'WHERE status = "ADMITTED"';
    if (semester_id) { where += ' AND semester_id = ?'; params.push(Number(semester_id)); }
    if (campus_id) { where += ' AND campus_id = ?'; params.push(Number(campus_id)); }

    const sql = `
      SELECT program_code,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female,
        SUM(CASE WHEN gender NOT IN ('Male','Female') THEN 1 ELSE 0 END) as other,
        COUNT(*) as total
      FROM applications_v2
      ${where}
      GROUP BY program_code
      ORDER BY total DESC
    `;

    const rows = await dbAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Admitted per program error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Employee-wise admission fee collection (based on paid student_bills)
router.get('/employee-collections', authenticateToken, requirePermission('reports:view'), async (req: AuthRequest, res) => {
  try {
    const { dateFrom, dateTo } = req.query as any;
    const where: string[] = ["status = 'Paid'"];
    const params: any[] = [];
    if (dateFrom) { where.push("date(paid_at) >= date(?)"); params.push(dateFrom); }
    if (dateTo) { where.push("date(paid_at) <= date(?)"); params.push(dateTo); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT sb.created_by_user_id as employee_id, u.name as employee_name, COUNT(*) as payments, SUM(sb.amount) as total_collected
      FROM student_bills sb
      LEFT JOIN users u ON u.id = sb.created_by_user_id
      ${whereSql}
      GROUP BY sb.created_by_user_id
      ORDER BY total_collected DESC
    `;

    const rows = await dbAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Employee collections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Daily collection report
router.get('/daily-collections', authenticateToken, requirePermission('reports:view'), async (req: AuthRequest, res) => {
  try {
    const { from, to } = req.query as any;
    const params: any[] = [];
    let where = "WHERE status = 'Paid'";
    if (from) { where += " AND date(paid_at) >= date(?)"; params.push(from); }
    if (to) { where += " AND date(paid_at) <= date(?)"; params.push(to); }

    const sql = `SELECT date(paid_at) as date, COUNT(*) as payments, SUM(amount) as total_collected FROM student_bills ${where} GROUP BY date(paid_at) ORDER BY date(paid_at) DESC`;
    const rows = await dbAll(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Daily collections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Feeder districts list (based on visitors_log)
router.get('/feeder-districts', authenticateToken, requirePermission('reports:view'), async (_req: AuthRequest, res) => {
  try {
    const rows = await dbAll(`SELECT district, SUM(no_of_visitors) as visitors, COUNT(*) as visits FROM visitors_log WHERE district IS NOT NULL GROUP BY district ORDER BY visitors DESC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Feeder districts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Credit transfer student list
router.get('/credit-transfers', authenticateToken, requirePermission('reports:view'), async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 100, search } = req.query as any;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [];
    let where = 'WHERE 1=1';
    if (search) { where += ' AND (a.full_name LIKE ? OR a.ref_no LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const sql = `
      SELECT ctr.*, a.full_name, a.program_code, a.semester_id
      FROM credit_transfer_records ctr
      LEFT JOIN applications_v2 a ON a.application_id = ctr.application_id
      ${where}
      ORDER BY ctr.processed_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await dbAll(sql, [...params, Number(limit), Number(offset)]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Credit transfer list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk student ID cards export (CSV)
router.get('/id-cards/export', authenticateToken, requirePermission('reports:export'), async (req: AuthRequest, res) => {
  try {
    const { semester_id, program_code, format = 'csv' } = req.query as any;
    const params: any[] = [];
    let where = '';
    if (semester_id) { where += ' WHERE s.semester_id = ?'; params.push(Number(semester_id)); }
    if (program_code) { where += where ? ' AND s.program_code = ?' : ' WHERE s.program_code = ?'; params.push(program_code); }

    const sql = `SELECT s.student_id, s.university_id, s.ugc_id, s.full_name, s.program_code, s.campus_id, s.batch, s.enrolled_at FROM students s ${where} ORDER BY s.university_id`;
    const rows = await dbAll(sql, params);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="student_id_cards_${Date.now()}.csv"`);
      const keys = ['student_id','university_id','ugc_id','full_name','program_code','campus_id','batch','enrolled_at'];
      res.write(keys.join(',') + '\n');
      for (const r of rows) {
        const line = keys.map(k => '"' + (r[k] == null ? '' : String(r[k]).replace(/"/g, '""')) + '"').join(',');
        res.write(line + '\n');
      }
      res.end();
      return;
    }

    // For other formats, return JSON for now
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('ID cards export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
