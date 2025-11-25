# Northern University Bangladesh — Admission Portal

A complete frontend-first university admission portal built with React, TypeScript and Tailwind CSS. The app ships with a comprehensive mock backend so frontend flows are fully functional; this README is extended to help backend engineers understand what exists, what to implement, and where to start.

---

## 🚀 Quick start (frontend dev)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Environment variables (for backend integration)

Create a `.env` in the client root with these values when you connect a real backend:

```env
VITE_API_URL=https://your-backend-api.com/api
VITE_PAYMENT_GATEWAY_URL=https://payment-gateway.example
VITE_FILE_UPLOAD_URL=https://file-storage.example
```

---

## High level overview

- Frontend: React + TypeScript + Vite + Tailwind
- Routing: React Router v6
- State: Context API and React Query (TanStack Query)
- Mock backend: `client/lib/mockApi.ts` and `client/lib/api.ts` (wrapper that falls back to mock)
- Admin and applicant apps are separate entry points under `client/apps/*` (admin, applicant, applicant-portal)

This project is currently frontend-first with mock services. The backend team should implement the documented REST endpoints and replace or integrate with `client/lib/api.ts`.

---

## Project layout (important files for backend)

client/

- apps/admin — admin entry (client/apps/admin/App.tsx)
- apps/applicant — public applicant entry
- components — shared components and UI primitives (Radix/Tailwind wrappers)
- contexts/AuthContext.tsx — auth wrapper used by admin/applicant
- lib/api.ts — client-side API wrapper (currently falls back to mock if server unavailable)
- lib/mockApi.ts — in-memory mock implementations of endpoints (useful reference and test data)
- lib/programData.ts — program, waiver and policy definitions used by frontend
- pages/\* — all route pages, see specific files below

server/ (reference)

- server/routes — existing server-side routes and examples (if your team will replace frontend mocks, mirror these route patterns)
- server/database — DB adapter files, seeders, schema examples (supabase/neon helpers exist)

Important frontend pages to review for contract and UI expectations:

- `code/client/pages/AdminAdmissionList.tsx` — admin list, filters and stats
- `code/client/pages/ApplicantDetail.tsx` — full applicant review and the existing "Make Student" flow
- `code/client/pages/CreditTransferList.tsx` — list view for credit transfer applicants
- `code/client/pages/CreditTransferReview.tsx` — detailed credit transfer review, course search & add, save transfer courses, and confirm & make student flow
- `code/client/lib/idGeneration.ts` — ID generation logic used in mocks

---

## API contract / endpoints (implement these on backend)

Below are the primary endpoints the frontend expects. Implementations should return JSON with { success: boolean, data?: any, error?: string } for compatibility with `client/lib/api.ts`.

Authentication

- POST /api/auth/login
  - Body: { email, password }
  - Response: { token, user: User }
- POST /api/auth/logout
- GET /api/auth/me
  - Response: { user: User }

Applications

- GET /api/applications
  - Query: status, page, limit, search, program_code, campus, admission_type, dateFrom, dateTo
  - Response: { applications: Application[], total: number }
- POST /api/applications
  - Body: Application payload (form data)
- GET /api/applications/:id
  - Response: { application: Application }
- PATCH /api/applications/:id/status
  - Body: { status: string }
- POST /api/applications/:id/generate-ids (alias for student id generation)
  - Body: { applicant_id }
  - Response: { student_id, ugc_id }
- GET /api/applications/stats/dashboard
  - Response: { total, pending, approved, payment_pending, credit_transfer, ... }

Credit Transfer

- GET /api/courses?code=... — search courses catalog
  - Response: [{ id, code, title, credits, department, program_id }]
- POST /api/transfer-courses
  - Body: { applicant_id, courses: [{ code, title, credits, grade, gpa }] }
  - Response: { saved: true }

Student & ID Generation

- POST /api/id/generate-student
  - Body: { applicant_id }
  - Response: { student_id, ugc_id }
- POST /api/students
  - Body: { application_id, student_id, ugc_id, profile: {...} }

Finance & Waivers

- GET /api/finance/waiver-policies
  - Response: { policies: WaiverPolicy[] }
- POST /api/finance/waiver-assignments
  - Body: { application_id, waiver_ids: string[], amounts?: number[] }
  - Response: assignment record

Files & Uploads

- POST /api/uploads
  - Multipart/form-data: file, meta
  - Response: { url }

Notifications / Messaging (optional)

- POST /api/notifications/email
- POST /api/notifications/sms

Notes about responses

- `client/lib/api.ts` expects res.ok and JSON. For compatibility, return HTTP 200 with { success: true, data: ... } or non-200 with { success: false, error: '...' }.

---

## Data models (suggested shapes)

User

```ts
interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  type: "applicant" | "admin" | "admission_officer";
  role?: string;
}
```

Application

```ts
interface Application {
  id: string; // tracking id
  uuid?: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "payment_pending"
    | "converted_to_student";
  applicant_name: string;
  email: string;
  phone?: string;
  admission_type: "regular" | "credit_transfer";
  program_code: string;
  program_name?: string;
  department_code?: string;
  campus?: string;
  semester?: string;
  documents?: { transcript?: string; [key: string]: any };
  transfer_courses?: TransferCourse[];
  student_id?: string;
  id_generation?: { student_id: string; ugc_id: string };
  created_at: string;
}
```

TransferCourse

```ts
interface TransferCourse {
  code: string;
  title: string;
  credits: number;
  grade?: string; // A, A-, B+
  gpa?: number; // numeric GPA
}
```

Student (after conversion)

```ts
interface Student {
  id: string;
  student_id: string;
  ugc_id?: string;
  name: string;
  email?: string;
  program_code?: string;
  created_at: string;
}
```

WaiverPolicy

```ts
interface WaiverPolicy {
  id: string;
  name: string;
  type: "result" | "special" | "additional";
  percentage: number; // numeric percent
  criteria?: string;
}
```

---

## Important frontend behaviors backend must match

- The frontend falls back to `mockApi` when the server is unreachable. That means partial integration can be tested by returning the same shapes.
- `generateStudentForApplicant` (POST /api/id/generate-student) is expected to return an object with `{ student_id, ugc_id }`. The mock includes a deterministic generation logic (`client/lib/mockApi.ts` and `client/lib/idGeneration.ts`) — you can reuse that algorithm to ensure consistency when transitioning.
- Credit transfer workflow: frontend calls `POST /api/transfer-courses` to save courses, then calls `POST /api/id/generate-student` to convert applicant to student. Ensure atomic or compensating logic if you separate into two operations.
- Waiver policies are defined in `client/lib/programData.ts`. Backend should expose `/api/finance/waiver-policies` returning the same structured policies and percentages (Spring 2024 proposed values are present in the frontend codebase).

---

## Storage & file uploads

Recommendations:

- Use Supabase Storage or S3-compatible storage for uploaded documents (transcripts, photos). Store URL in application.documents.
- Keep uploads behind authentication; return signed URLs when necessary.

---

## Authentication & security

- JWT-based auth is recommended. Frontend stores a token and `client/lib/api.ts` will attach Authorization header when present.
- Use role-based checks on backend endpoints to enforce admission_officer/admin restrictions (e.g., credit transfer endpoints, waiver assignment, ID generation).

---

## Testing & migrating from mock to real backend

1. Implement endpoints above returning the same JSON shapes.
2. Configure `VITE_API_URL` and ensure `client/lib/api.ts` uses that base URL (it already attempts server fetch and falls back to mock API if serverUnavailable is detected).
3. Start with read-only endpoints (GET programs, GET waiver policies, GET courses) to validate UI behavior quickly.
4. Implement file uploads and authentication next.

---

## Recommended integrations & tooling (MCP suggestions)

These integrations are useful for this project:

- Supabase (preferred) — database, auth, storage. Good for rapid backend and file storage. Consider using Supabase to store applications and files.
- Neon — Postgres hosting alternative.
- Netlify / Vercel — static hosting for frontend (already documented), use Netlify for CI/CD if desired.
- Zapier — automation between services (notifications, CRM integration).
- Figma plugin — for design-to-code conversion if UI/UX needs iteration.
- Builder CMS — content and assets management.
- Linear — issue tracking and roadmap.
- Notion — documentation and onboarding.
- Sentry — error monitoring in production.
- Context7 — docs reference for libraries.
- Semgrep — static security scanning.
- Prisma Postgres — if you prefer an ORM and schema-first DB approach.

(You can connect MCP integrations via Builder UI when ready.)

---

## Notes for backend team — priorities

1. Implement authentication and `/api/auth/me` so the admin entry and role checks work.
2. Waiver policies endpoint (GET /api/finance/waiver-policies) — important to calculate fees on the frontend and backend.
3. Applications CRUD + attach uploaded files (transcripts) and transfer courses.
4. Student ID generation endpoint (POST /api/id/generate-student) — ensure consistent format and persist IDs in application/student records.
5. Payment and receipt endpoints.

If you want, I can also generate an OpenAPI (Swagger) specification for these endpoints to accelerate backend work.

---

## Contributing & support

Follow conventional git workflow and open PRs for features. For integration questions, contact the project owner or open an issue with the exact endpoint and expected payload.

---

This README augments the existing project README with backend-focused instructions. If you want, I can also:

- generate an OpenAPI spec
- add Postman/Insomnia collection
- add SQL schema examples or Prisma schema

Tell me which one you'd like next.
