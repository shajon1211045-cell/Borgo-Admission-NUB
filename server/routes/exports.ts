import express from "express";
import fs from "fs";
import path from "path";
import { dbAll, dbGet, dbRun } from "../database/config.js";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

function buildWhere(filters: any, allowed: string[]) {
  const clauses: string[] = [];
  const params: any[] = [];

  allowed.forEach((k) => {
    if (filters[k]) {
      clauses.push(`${k} = ?`);
      params.push(filters[k]);
    }
  });

  if (filters.search) {
    const s = `%${filters.search}%`;
    clauses.push("(to_address LIKE ? OR subject LIKE ? OR body LIKE ?)");
    params.push(s, s, s);
  }

  if (filters.dateFrom) {
    clauses.push("date(created_at) >= date(?)");
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    clauses.push("date(created_at) <= date(?)");
    params.push(filters.dateTo);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

// Helper to ensure export directory exists
async function ensureExportDir() {
  const dir = path.join(process.cwd(), "tmp", "exports");
  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
}

function escapeCsv(value: any) {
  if (value == null) return "";
  const s = String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

async function writeCsvToFile(filePath: string, keys: string[], rows: any[]) {
  return new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(filePath, { encoding: "utf8" });
    stream.on("error", reject);
    stream.write(keys.join(",") + "\n");
    for (const r of rows) {
      const line = keys.map((k) => escapeCsv(r[k])).join(",");
      stream.write(line + "\n");
    }
    stream.end(() => resolve());
  });
}

// GET /api/exports/mock-emails?format=csv&search=...
router.get(
  "/mock-emails",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const filters = req.query as any;
      const { where, params } = buildWhere(filters, [
        "to_address",
        "application_id",
      ]);

      const countRow = await dbGet(
        `SELECT COUNT(*) as total FROM mock_emails ${where}`,
        params,
      );
      const total = countRow ? countRow.total || 0 : 0;

      const format = (filters.format || "csv").toLowerCase();

      if (total > 5000) {
        // Queue export for async processing: create audit export and export job
        const resInsert: any = await dbRun(
          `INSERT INTO audit_dashboard_export (user_id, params_json, export_format, row_count) VALUES (?, ?, ?, ?)`,
          [
            req.user?.id || null,
            JSON.stringify(req.query || {}),
            format,
            total,
          ],
        );
        const exportId = resInsert.lastID;
        await dbRun(
          `INSERT INTO export_jobs (export_id, export_type, params_json, status) VALUES (?, ?, ?, ?)`,
          [exportId, "mock_emails", JSON.stringify(req.query || {}), "queued"],
        );
        return res.json({
          success: true,
          async: true,
          message: "Export queued. You will be notified when ready.",
        });
      }

      const rows = await dbAll(
        `SELECT id, to_address, subject, body, application_id, created_at, sent_at FROM mock_emails ${where} ORDER BY created_at DESC`,
        params,
      );

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="mock_emails_${Date.now()}.csv"`,
        );

        const keys = [
          "id",
          "to_address",
          "subject",
          "application_id",
          "created_at",
          "sent_at",
          "body",
        ];
        res.write(keys.join(",") + "\n");
        for (const r of rows) {
          const line = keys
            .map(
              (k) =>
                '"' +
                (r[k] == null ? "" : String(r[k]).replace(/"/g, '""')) +
                '"',
            )
            .join(",");
          res.write(line + "\n");
        }
        res.end();
        return;
      }

      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("Mock emails export failed:", err);
      res.status(500).json({ success: false, error: "Export failed" });
    }
  },
);

// GET /api/exports/sms-queue?format=csv&search=...
router.get(
  "/sms-queue",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const filters = req.query as any;
      // allow filtering by to_number or status
      const clauses: string[] = [];
      const params: any[] = [];

      if (filters.to_number) {
        clauses.push("to_number = ?");
        params.push(filters.to_number);
      }
      if (filters.status) {
        clauses.push("status = ?");
        params.push(filters.status);
      }
      if (filters.search) {
        const s = `%${filters.search}%`;
        clauses.push("(to_number LIKE ? OR message LIKE ?)");
        params.push(s, s);
      }
      if (filters.dateFrom) {
        clauses.push("date(created_at) >= date(?)");
        params.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        clauses.push("date(created_at) <= date(?)");
        params.push(filters.dateTo);
      }

      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

      const countRow = await dbGet(
        `SELECT COUNT(*) as total FROM sms_queue ${where}`,
        params,
      );
      const total = countRow ? countRow.total || 0 : 0;
      const format = (filters.format || "csv").toLowerCase();

      if (total > 5000) {
        const resInsert: any = await dbRun(
          `INSERT INTO audit_dashboard_export (user_id, params_json, export_format, row_count) VALUES (?, ?, ?, ?)`,
          [
            req.user?.id || null,
            JSON.stringify(req.query || {}),
            format,
            total,
          ],
        );
        const exportId = resInsert.lastID;
        await dbRun(
          `INSERT INTO export_jobs (export_id, export_type, params_json, status) VALUES (?, ?, ?, ?)`,
          [exportId, "sms_queue", JSON.stringify(req.query || {}), "queued"],
        );
        return res.json({
          success: true,
          async: true,
          message: "Export queued. You will be notified when ready.",
        });
      }

      const rows = await dbAll(
        `SELECT sms_id, to_number, message, provider, status, created_at, processed_at FROM sms_queue ${where} ORDER BY created_at DESC`,
        params,
      );

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="sms_queue_${Date.now()}.csv"`,
        );

        const keys = [
          "sms_id",
          "to_number",
          "message",
          "provider",
          "status",
          "created_at",
          "processed_at",
        ];
        res.write(keys.join(",") + "\n");
        for (const r of rows) {
          const line = keys
            .map(
              (k) =>
                '"' +
                (r[k] == null ? "" : String(r[k]).replace(/"/g, '""')) +
                '"',
            )
            .join(",");
          res.write(line + "\n");
        }
        res.end();
        return;
      }

      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("SMS queue export failed:", err);
      res.status(500).json({ success: false, error: "Export failed" });
    }
  },
);

// Admin: List export jobs
router.get(
  "/jobs",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const jobs = await dbAll(
        `SELECT j.*, a.created_at as requested_at FROM export_jobs j LEFT JOIN audit_dashboard_export a ON a.export_id = j.export_id ORDER BY j.created_at DESC`,
      );
      res.json({ success: true, data: jobs });
    } catch (e) {
      console.error("Failed to fetch export jobs", e);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch export jobs" });
    }
  },
);

// Admin: Process specific job (demo worker) - generates file synchronously when called
router.post(
  "/jobs/process/:jobId",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const jobId = Number(req.params.jobId);
    try {
      const job = await dbGet(`SELECT * FROM export_jobs WHERE job_id = ?`, [
        jobId,
      ]);
      if (!job)
        return res.status(404).json({ success: false, error: "Job not found" });
      if (job.status === "processing")
        return res.json({ success: false, error: "Job already processing" });

      // Mark processing
      await dbRun(`UPDATE export_jobs SET status = ? WHERE job_id = ?`, [
        "processing",
        jobId,
      ]);

      const params = job.params_json ? JSON.parse(job.params_json) : {};
      const exportType = job.export_type || "unknown";
      const format = job.export_format || "csv" || "csv";

      const exportDir = await ensureExportDir();
      const fileName = `${exportType}_${jobId}_${Date.now()}.csv`;
      const filePath = path.join(exportDir, fileName);

      try {
        if (exportType === "mock_emails" || exportType === "mock_emails") {
          // build where clause similar to buildWhere
          const { where, params: qparams } = buildWhere(params, [
            "to_address",
            "application_id",
          ]);
          const rows = await dbAll(
            `SELECT id, to_address, subject, body, application_id, created_at, sent_at FROM mock_emails ${where} ORDER BY created_at DESC`,
            qparams,
          );
          const keys = [
            "id",
            "to_address",
            "subject",
            "application_id",
            "created_at",
            "sent_at",
            "body",
          ];
          await writeCsvToFile(filePath, keys, rows);
        } else if (exportType === "sms_queue") {
          // sms filtering
          const clauses: string[] = [];
          const qparams: any[] = [];
          if (params.to_number) {
            clauses.push("to_number = ?");
            qparams.push(params.to_number);
          }
          if (params.status) {
            clauses.push("status = ?");
            qparams.push(params.status);
          }
          if (params.search) {
            const s = `%${params.search}%`;
            clauses.push("(to_number LIKE ? OR message LIKE ?)");
            qparams.push(s, s);
          }
          if (params.dateFrom) {
            clauses.push("date(created_at) >= date(?)");
            qparams.push(params.dateFrom);
          }
          if (params.dateTo) {
            clauses.push("date(created_at) <= date(?)");
            qparams.push(params.dateTo);
          }
          const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
          const rows = await dbAll(
            `SELECT sms_id, to_number, message, provider, status, created_at, processed_at FROM sms_queue ${where} ORDER BY created_at DESC`,
            qparams,
          );
          const keys = [
            "sms_id",
            "to_number",
            "message",
            "provider",
            "status",
            "created_at",
            "processed_at",
          ];
          await writeCsvToFile(filePath, keys, rows);
        } else {
          throw new Error("Unknown export type: " + String(exportType));
        }

        await dbRun(
          `UPDATE export_jobs SET status = ?, file_path = ?, file_name = ?, completed_at = ? WHERE job_id = ?`,
          ["done", filePath, fileName, new Date().toISOString(), jobId],
        );
        return res.json({
          success: true,
          data: { file: fileName, path: filePath },
        });
      } catch (err) {
        console.error("Export processing failed:", err);
        await dbRun(
          `UPDATE export_jobs SET status = ?, error = ? WHERE job_id = ?`,
          ["failed", String(err), jobId],
        );
        return res
          .status(500)
          .json({ success: false, error: "Export processing failed" });
      }
    } catch (e) {
      console.error("Process job failed", e);
      res.status(500).json({ success: false, error: "Internal error" });
    }
  },
);

// Admin: Download generated file for a job
router.get(
  "/jobs/download/:jobId",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const jobId = Number(req.params.jobId);
    try {
      const job = await dbGet(`SELECT * FROM export_jobs WHERE job_id = ?`, [
        jobId,
      ]);
      if (!job)
        return res.status(404).json({ success: false, error: "Job not found" });
      if (!job.file_path)
        return res
          .status(404)
          .json({ success: false, error: "File not available yet" });
      if (!fs.existsSync(job.file_path))
        return res
          .status(404)
          .json({ success: false, error: "File missing on server" });
      return res.download(
        job.file_path,
        job.file_name || path.basename(job.file_path),
      );
    } catch (e) {
      console.error("Download failed", e);
      res.status(500).json({ success: false, error: "Download failed" });
    }
  },
);

export default router;
