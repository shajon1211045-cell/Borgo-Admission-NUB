Backend Tasks (developer handoff)

Purpose

- This document lists backend work required to fully support frontend features implemented in the demo UI. Each section contains: API contract (endpoint, method, request/response), suggested DB schema (SQL), environment variables, and notes for testing.

1. Admit Card PDF endpoint

- Endpoint: GET /api/pdf/admit-card/:id
- Auth: authenticateToken + permission check (applications:view or public for applicant-facing with token)
- Path param: id = application_id | ref_no | tracking_id
- Response: Content-Type: application/pdf; Content-Disposition: attachment; filename="AdmitCard\_<id>.pdf"
- Behavior:
  - Fetch application by id (applications or applications_v2 table)
  - Verify payment_status/payment for admission test if program requires an admission test
  - Build HTML admit card (student details, program, test date/time/venue) and render to PDF using Puppeteer or PDF library
  - Return PDF buffer
- Errors: 404 if application not found; 403 if payment not verified; 500 on server error
- DB queries: SELECT \* FROM applications WHERE id = ? OR tracking_id = ?
- Tests: request with valid and invalid ids, unpaid vs paid statuses

2. Export job worker (background processing)

- Purpose: process large exports asynchronously and produce CSV files (tmp/exports)
- DB tables: audit_dashboard_export (export metadata), export_jobs (already present in schema)
- API hooks (already present):
  - GET /api/exports/jobs — list jobs (admin)
  - POST /api/exports/jobs/process/:jobId — process job synchronously (demo)
  - GET /api/exports/jobs/download/:jobId — download generated file
- Required worker implementation:
  - A worker process (node script or separate service) that polls export_jobs for status = 'queued' and claims (set status='processing'), runs export logic (same as POST /process/:jobId), writes file to disk, updates job record with status='done' and file_path/file_name/completed_at
  - Concurrency: use atomic DB operations or row-level locks. For SQLite demo, use simple UPDATE ... WHERE status='queued' and changes>0 check
- Env: EXPORT_WORKER_INTERVAL (seconds)
- Logging: job start/end/errors

3. Permission-request workflow (limited-seat programs)

- Use case: applicants request permission to join limited-seat programs; admission staff approve/deny
- DB:
  - permission_requests (id, application_id, program_id, requested_by_user_id, status: pending/approved/rejected, reason, created_at, processed_by_user_id, processed_at)
- API endpoints:
  - POST /api/permissions/requests — create request (application_id, program_id, reason)
  - GET /api/permissions/requests — list (admin)
  - PUT /api/permissions/requests/:id — approve/reject (status, reason)
- Business rules:
  - On approval, decrement available seat count (program_limits table) and mark related application eligible
  - If seats exhausted, reject automatically
- Notifications: trigger email/SMS to applicant on decision

4. Email & SMS provider integration

- Replace mock messaging with provider-backed sending and delivery tracking
- DB:
  - sms_queue (present) — add provider_message_id, provider_response_json, delivered_at, delivery_status
  - emails table (mock_emails exists) — add provider_message_id, provider_response_json, delivered_at, status
- API:
  - POST /api/messaging/send-email — adapter to provider (SendGrid, SES)
  - POST /api/sms/send — adapter (Twilio, Nexmo)
  - Webhook endpoints to receive delivery/failure callbacks and update DB (e.g., /webhooks/messaging/:provider)
- Env vars: PROVIDER_API_KEY, PROVIDER_SENDER, WEBHOOK_SECRET

5. Syllabus-version selection & mapping

- Goal: store multiple syllabus versions and map which version was used for an admitted student
- DB:
  - syllabuses (id, program_id, version, is_active, content_json, created_at)
  - student_syllabus_mapping (id, student_id, syllabus_id, assigned_at)
- API:
  - GET /api/syllabus?program_id=&version=
  - POST /api/syllabus — create
  - PUT /api/syllabus/:id — update
- Business rule: when admitting, server should choose latest active syllabus for that program and record mapping; provide endpoint to override

6. Program selection & semester rules

- Centralize program eligibility rules server-side for consistent validation
- DB/Config: program_rules table or JSON config with rules per program
- API:
  - POST /api/programs/calculate-cost — accepts program_code, waivers; returns fee breakdown (already exists in frontend mock)
  - POST /api/programs/validate-selection — server validates constraints (limited seats, prerequisites)
- Tests: validate against sample applicants

7. Student transfer / credit-equivalency automation

- Endpoints already present to calculate equivalency and create records; expand to fully automate acceptance and course mapping
- DB: credit_transfer_records (present)
- Tasks: implement mapping rules, approval workflow, and update student transcript on approval

8. Neon / Production DB migration notes

- Use Prisma or direct SQL migrations. Provide migration scripts to create tables: export_jobs, audit_dashboard_export, permission_requests, syllabuses, student_syllabus_mapping, messaging delivery columns
- Env: DATABASE_URL (Neon/Postgres), MIGRATION_TOOL (prisma/knex)

9. Security & ACL

- Ensure endpoints require appropriate permissions (requirePermission middleware)
- Rate-limit public endpoints (admissions) and validate inputs

10. Testing & QA

- Unit tests for PDF generation (HTML templates)
- Integration tests for export job processing & file generation
- End-to-end tests for permission-request flow and notifications

If you want, I can generate SQL migration examples and example controller code (Express) stubs for each endpoint above to hand directly to backend devs.
