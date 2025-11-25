import express from "express";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import { authenticateToken, requirePermission, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// Create a new notice (admin)
router.post('/notices', authenticateToken, requirePermission('settings:manage'), async (req: AuthRequest, res) => {
  try {
    const { title, body, start_date, end_date, is_active = 1, attachments = [], target_roles } = req.body || {};
    if (!title || !body) return res.status(400).json({ error: 'MISSING_FIELDS' });
    const tr = target_roles ? JSON.stringify(target_roles) : null;
    const result = await dbRun(`INSERT INTO notices (title, body, start_date, end_date, is_active, target_roles, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`, [title, body, start_date || null, end_date || null, is_active ? 1 : 0, tr, req.user?.id || null]);
    const notice = await dbGet(`SELECT * FROM notices WHERE notice_id = last_insert_rowid()`);

    // Attachments
    for (const a of attachments || []) {
      await dbRun(`INSERT INTO notice_attachments (notice_id, file_url, file_name, mime_type) VALUES (?, ?, ?, ?)`, [notice.notice_id, a.file_url, a.file_name || null, a.mime_type || null]);
    }

    // Notify users: if target_roles provided, send to those users, else broadcast to all users
    let users: any[] = [];
    if (target_roles && Array.isArray(target_roles) && target_roles.length) {
      // find users with those roles
      const placeholders = target_roles.map(() => '?').join(',');
      const rows = await dbAll(`SELECT u.id, u.email, u.name, u.mobile_number FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.role_id = ur.role_id WHERE r.role_key IN (${placeholders})`, target_roles);
      users = rows || [];
    } else {
      users = await dbAll(`SELECT id, email, name, mobile_number FROM users WHERE is_active = 1`);
    }

    // Create user_notifications and optionally enqueue emails/sms
    const settings = await dbGet(`SELECT * FROM admission_settings WHERE id = 1`);
    const sendEmails = settings ? !!settings.send_email_notifications : false;
    const sendSms = settings ? !!settings.send_sms_notifications : false;

    for (const u of users) {
      await dbRun(`INSERT INTO user_notifications (user_id, notice_id, title, message, type) VALUES (?, ?, ?, ?, ?)`, [u.id, notice.notice_id, title, body, 'info']);
      if (sendEmails && u.email) {
        await dbRun(`INSERT INTO mock_emails (to_address, subject, body, application_id, created_at) VALUES (?, ?, ?, ?, datetime('now'))`, [u.email, title, body, null]);
      }
      if (sendSms && u.mobile_number) {
        const smsMsg = `${title} - ${String(body).slice(0,200)}`;
        await dbRun(`INSERT INTO sms_queue (to_number, message, provider, status) VALUES (?, ?, ?, 'queued')`, [u.mobile_number, smsMsg, 'internal']);
      }
    }

    res.json({ success: true, data: { notice, recipients: users.length } });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List active notices (public)
router.get('/notices', async (req, res) => {
  try {
    const { onlyActive = '1' } = req.query as any;
    const rows = onlyActive === '1' ? await dbAll(`SELECT * FROM notices WHERE is_active = 1 ORDER BY created_at DESC`) : await dbAll(`SELECT * FROM notices ORDER BY created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch notices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attachments for a notice
router.get('/notices/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await dbAll(`SELECT * FROM notice_attachments WHERE notice_id = ? ORDER BY created_at DESC`, [id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch attachments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch notifications for logged-in user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 50, unreadOnly } = req.query as any;
    const offset = (Number(page) - 1) * Number(limit);
    const where: string[] = ['user_id = ?'];
    const params: any[] = [req.user?.id];
    if (unreadOnly === '1') { where.push('read = 0'); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await dbAll(`SELECT * FROM user_notifications ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, Number(limit), Number(offset)]);
    const countRow = await dbGet(`SELECT COUNT(*) as total FROM user_notifications ${whereSql}`, params);
    const total = countRow ? countRow.total || 0 : 0;
    res.json({ success: true, data: { notifications: rows, total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    console.error('Fetch user notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.post('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await dbRun(`UPDATE user_notifications SET read = 1, read_at = CURRENT_TIMESTAMP WHERE notification_id = ? AND user_id = ?`, [id, req.user?.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
