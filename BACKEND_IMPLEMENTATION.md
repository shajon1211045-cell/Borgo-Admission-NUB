Backend Implementation Guide — Handoff for Frontend

Overview

- Purpose: Provide concrete backend implementation instructions for the features the frontend uses. Each section includes API contract (endpoint, method, auth), expected request/response shape, SQL migration snippets (Postgres/SQLite compatible where possible), and example Express controller pseudocode the backend team can copy/paste and adapt.
- Scope: endpoints and background jobs required to fully support the frontend demo. The frontend is already wired to call these routes (some exist as demo endpoints); the backend team should implement production-ready versions and/or replace mocks with provider-backed implementations.

Conventions used in examples

- Express + TypeScript (ESM imports) style is used in examples to match the project.
- DB access: examples assume using a promisified DB client (e.g. pg for Postgres or sqlite3 for SQLite). Replace db.\* calls with team's preferred ORM (Prisma / Knex / TypeORM) as needed.

ENVIRONMENT VARIABLES (suggested)

- DATABASE_URL (Postgres/Neon)
- NODE_ENV=production|development
- PORT
- PAYMENT*WEBHOOK_SECRET*<PROVIDER> (e.g. PAYMENT_WEBHOOK_SECRET_BKASH)
- EMAIL_PROVIDER (sendgrid|ses|none)
- EMAIL_API_KEY
- SMS_PROVIDER (twilio|nexmo|none)
- SMS_API_KEY
- EXPORT_WORKER_ENABLED=1
- EXPORT_WORKER_POLL_SECONDS=30

1. Admit Card PDF endpoint (required)

- Endpoint: GET /api/pdf/admit-card/:id
- Auth: public applicant route or authenticated admin; verify token or allow public if using a secure unique tracking id that must match the requestor
- Params: :id may be application_id (numeric) OR tracking_id (string) — accept both
- Response: application/pdf with Content-Disposition header

Request example
GET /api/pdf/admit-card/123
Headers: Authorization: Bearer <token>

Success Response

- Status: 200
- Headers: Content-Type: application/pdf
- Body: binary PDF

Failure responses

- 400 Bad Request — invalid id
- 403 Forbidden — not permitted
- 404 Not Found — application not found
- 500 Internal Server Error

SQL queries required

- SELECT \* FROM applications WHERE id = ? OR tracking_id = ?
- Verify payment: check student_bills or applications.payment_status

Example Express controller (pseudo-code)

import express from 'express';
import puppeteer from 'puppeteer';
import { dbGet } from '../database/config.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/admit-card/:id', async (req, res) => {
const { id } = req.params;
// find application by id or tracking_id
const application = await dbGet(`SELECT * FROM applications WHERE id = ? OR tracking_id = ?`, [id, id]);
if (!application) return res.status(404).json({ error: 'Application not found' });

// ensure admission test payment verified (if program requires)
// logic specific to program rules

// build HTML
const html = `...`; // use application fields

// render with puppeteer
const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
await browser.close();

res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `attachment; filename="AdmitCard_${application.tracking_id || application.id}.pdf"`);
res.send(pdfBuffer);
});

export default router;

Notes

- Template HTML must include test venue/time fetched from admission settings table.
- Consider caching generated PDFs to avoid repeated render overhead.

2. Money receipt PDF endpoint (already implemented demo)

- The repo contains code/server/routes/pdf.ts money-receipt endpoint using puppeteer. For production: validate bills, secure access, add audit trail.

API contract

- GET /api/pdf/money-receipt?application_id=123
- Auth: authenticateToken & applications:view
- Response: PDF binary

Backend tasks

- Ensure student_bills table stores amount, paid_at, payer info, payment reference
- Audit: log receipt generation (user, timestamp)

3. Export job worker (background worker) — design and example worker

Purpose

- Process queued export jobs (large datasets) asynchronously and write CSV files to disk (tmp/exports) and update export_jobs row.

DB tables (SQL migration example — Postgres)

-- audit_dashboard_export (metadata)
CREATE TABLE audit_dashboard_export (
export_id SERIAL PRIMARY KEY,
user_id INTEGER,
params_json TEXT,
export_format VARCHAR(16),
row_count INTEGER,
created_at TIMESTAMP DEFAULT now()
);

-- export_jobs
CREATE TABLE export_jobs (
job_id SERIAL PRIMARY KEY,
export_id INTEGER REFERENCES audit_dashboard_export(export_id),
export_type VARCHAR(64),
params_json TEXT,
export_format VARCHAR(16),
status VARCHAR(32) DEFAULT 'queued', -- queued | processing | done | failed
file_path TEXT,
file_name TEXT,
error TEXT,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now(),
completed_at TIMESTAMP
);

Worker design

- A node script that polls export_jobs WHERE status = 'queued' ORDER BY created_at LIMIT N
- For each job, run a single UPDATE to set status='processing' and ensure the affected row count is 1 (claiming the job), then process
- Write CSV to tmp/exports and update job with file path and status='done'
- On error update status='failed' and store error message

Sample worker (pseudo)

import { dbAll, dbRun, dbGet } from './database/config.js';
import fs from 'fs';
import path from 'path';

async function processNextJob() {
const job = await dbGet(`SELECT * FROM export_jobs WHERE status='queued' ORDER BY created_at LIMIT 1`);
if (!job) return;

// claim job
const r = await dbRun(`UPDATE export_jobs SET status='processing', updated_at=now() WHERE job_id=? AND status='queued'`, [job.job_id]);
if (!r.changes) return; // someone else claimed

try {
// generate rows depending on export_type (mock_emails, sms_queue)
// write CSV file
await dbRun(`UPDATE export_jobs SET status='done', file_path=?, file_name=?, completed_at=now() WHERE job_id=?`, [filePath, fileName, job.job_id]);
} catch (err) {
await dbRun(`UPDATE export_jobs SET status='failed', error=? WHERE job_id=?`, [String(err), job.job_id]);
}
}

setInterval(processNextJob, process.env.EXPORT_WORKER_POLL_SECONDS ? Number(process.env.EXPORT_WORKER_POLL_SECONDS) \* 1000 : 30000);

Notes

- For production, use a queue system (Redis/RQ/Bull) or background job worker (PM2 separate process, systemd, or Kubernetes CronJob). For small demo, polling is ok.

4. Permission-request workflow (limited-seat programs)

DB migration example

CREATE TABLE permission_requests (
request_id SERIAL PRIMARY KEY,
application_id INTEGER NOT NULL,
program_id VARCHAR(64) NOT NULL,
requested_by_user_id INTEGER,
reason TEXT,
status VARCHAR(16) DEFAULT 'pending', -- pending|approved|rejected
processed_by_user_id INTEGER,
processed_reason TEXT,
created_at TIMESTAMP DEFAULT now(),
processed_at TIMESTAMP
);

API endpoints

- POST /api/permissions/requests — create request
  { application_id, program_id, reason }
  returns { success: true, data: { request_id } }
- GET /api/permissions/requests?status=pending — admin list
- PUT /api/permissions/requests/:id — approve/reject
  body: { status: 'approved'|'rejected', processed_reason }

Business logic

- On approve: check program available seats; decrement seats; mark permission assigned for application; notify applicant
- On reject: set status and notify applicant

Sample Express stub

router.post('/permissions/requests', authenticateToken, async (req, res) => {
const { application_id, program_id, reason } = req.body;
const r = await dbRun(`INSERT INTO permission_requests (application_id, program_id, requested_by_user_id, reason) VALUES (?, ?, ?, ?)`, [application_id, program_id, req.user?.id || null, reason]);
res.json({ success: true, data: { request_id: r.lastID } });
});

5. Email & SMS provider integration (replace mocks)

Goals

- Provide reliable delivery, provider fallbacks, delivery receipt tracking

DB additions

- Add columns to sms_queue: provider_message_id, provider_response_json, delivery_status, delivered_at
- Add columns to mock_emails / emails table: provider_message_id, provider_response_json, delivery_status, delivered_at

API & Webhooks

- POST /api/messaging/send-email — sends via SendGrid/SES
- POST /api/sms/send — sends via Twilio
- POST /webhooks/messaging/:provider — provider calls this with delivery events; verify signature then update record

Example flow (SMS)

1. Frontend calls POST /api/sms with to_number, message, application_id
2. Server inserts row in sms_queue with status='queued'
3. Worker or immediate sender picks up row and sends using provider; updates provider_message_id and status='sent' on success
4. Provider callback (webhook) posts delivery status; server updates row to 'delivered' or 'failed'

Security

- Validate and verify webhook signatures. Store provider secrets in env vars.

6. Syllabus versioning & mapping

DB migration

CREATE TABLE syllabuses (
syllabus_id SERIAL PRIMARY KEY,
program_id VARCHAR(64) NOT NULL,
version VARCHAR(64) NOT NULL,
content_json JSONB NOT NULL,
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP
);

CREATE TABLE student_syllabus_mapping (
mapping_id SERIAL PRIMARY KEY,
student_id INTEGER NOT NULL,
syllabus_id INTEGER REFERENCES syllabuses(syllabus_id),
assigned_at TIMESTAMP DEFAULT now()
);

API endpoints

- GET /api/syllabus?program_id=&version=
- POST /api/syllabus
- PUT /api/syllabus/:id
- When admitting a student, server should: select latest active syllabus for program and write mapping to student_syllabus_mapping

7. Program selection rules (server validation)

- Move complex eligibility and seat rules server-side
- Endpoints
  - POST /api/programs/validate-selection — body: { application_id, program_code, semester_id } => returns { valid: boolean, errors: [] }
  - POST /api/programs/calculate-cost — already exists client-side, implement on server for consistent fee calc

Example validation steps

- Check program is accepting applications for that semester
- Check program seat availability
- Validate prerequisites and waiver applicability

8. Credit transfer / equivalency automation

- Existing endpoints for calculation exist. Extend with approval/assignment flow:
  - POST /api/academic/credit-transfers — create calculation and optionally assign
  - POST /api/academic/credit-transfers/:id/approve — admin approves and system maps courses/credits
- DB: credit_transfer_records table exists — ensure it contains processed_by_user_id and processed_at

9. Security, ACL & Rate Limiting

- Use existing middleware requirePermission(auth) for admin endpoints
- Rate-limit public endpoints (admissions creation) using express-rate-limit or cloud provider
- Validate inputs and use prepared statements to avoid SQL injection

10. Testing & QA guidance

- Provide Postman collection that mirrors frontend calls
- Unit tests: PDF generation (html snapshots), export job processing (file generation), permission-request flows
- Integration tests for webhooks (mock provider callbacks)

11. Practical handoff checklist for backend team (minimal)

- [ ] Implement GET /api/pdf/admit-card/:id (PDF generation) — required by frontend
- [ ] Harden money-receipt endpoint (verify bills, audit logs)
- [ ] Implement export worker (polling or queue) and ensure export_jobs table updates and file download works
- [ ] Implement permission_requests endpoints and DB table
- [ ] Integrate real email/SMS providers and implement delivery webhooks
- [ ] Implement syllabus version DB and endpoints, and mapping from student to syllabus upon admission
- [ ] Implement program validation APIs and centralize eligibility rules
- [ ] Complete credit transfer approval automation
- [ ] Add environment variable documentation and example .env.example

12. Example SQL migration file (Postgres / Neon)

-- 0001_create_permission_requests_and_export_jobs.sql
BEGIN;

CREATE TABLE IF NOT EXISTS audit_dashboard_export (
export_id SERIAL PRIMARY KEY,
user_id INTEGER,
params_json TEXT,
export_format VARCHAR(16),
row_count INTEGER,
created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS export_jobs (
job_id SERIAL PRIMARY KEY,
export_id INTEGER REFERENCES audit_dashboard_export(export_id),
export_type VARCHAR(64),
params_json TEXT,
export_format VARCHAR(16),
status VARCHAR(32) DEFAULT 'queued',
file_path TEXT,
file_name TEXT,
error TEXT,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now(),
completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permission_requests (
request_id SERIAL PRIMARY KEY,
application_id INTEGER NOT NULL,
program_id VARCHAR(64) NOT NULL,
requested_by_user_id INTEGER,
reason TEXT,
status VARCHAR(16) DEFAULT 'pending',
processed_by_user_id INTEGER,
processed_reason TEXT,
created_at TIMESTAMP DEFAULT now(),
processed_at TIMESTAMP
);

COMMIT;

13. Deliverables to hand off

- Implement the endpoints + migrations above
- Provide Postman collection & example responses
- Add a README in backend repo that documents env vars and how to run the worker

If you want, I can also:

- Generate a Postman collection JSON (export) that covers all required endpoints used by frontend
- Generate sample Express controller files and SQL migration files per task (I can produce them one by one)

Please confirm: would you like me to generate example Express controller stubs and SQL files for each missing backend item (admit-card, export worker, permission requests, messaging webhooks) so you can hand them directly to your backend team?
