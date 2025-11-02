# Northern University Bangladesh - Complete Admission Management System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Features & Modules](#features--modules)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Installation & Setup](#installation--setup)
9. [Configuration](#configuration)
10. [Deployment](#deployment)
11. [File Structure](#file-structure)
12. [Security](#security)
13. [Payment Integration](#payment-integration)
14. [Messaging System](#messaging-system)
15. [Testing](#testing)

---

## System Overview

The Northern University Bangladesh Admission Management System is a comprehensive full-stack web application designed to manage the entire student admission lifecycle from application submission to student enrollment and academic record management.

### Purpose

- Streamline the admission process for applicants
- Provide robust tools for admission officers to manage applications
- Enable finance officers to track payments and bills
- Automate ID generation, credit transfers, and course offerings
- Generate comprehensive reports and analytics

### Key Capabilities

- Online application submission with document uploads
- Multi-step application form with validation
- Payment processing integration (bKash, Bank Transfer)
- Admin dashboard with real-time statistics
- Student ID and UGC ID generation
- Credit transfer evaluation and management
- Fee structure and waiver management
- SMS and email notifications
- PDF generation (admit cards, receipts, reports)
- Export functionality (CSV, Excel, PDF)
- Visitor and lead tracking
- Role-based access control (RBAC)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  React 18 + React Router 6 + TailwindCSS + Radix UI        │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS/REST API
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express Server (Node.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth/JWT    │  │  API Routes  │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────┬───��───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              SQLite Database (Development)                   │
│              PostgreSQL/Neon (Production Ready)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 50+ Tables: Users, Applications, Programs,           │  │
│  │ Students, Bills, Documents, Academic History, etc.   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External Integrations:
├── Payment Gateways (bKash, Bank)
├── SMS Providers (Twilio, Nexmo)
├── Email Services (SendGrid, SES)
├── File Storage (Local/S3)
└── PDF Generation (Puppeteer/PDFKit)
```

### Application Flow

**Applicant Flow:**

1. Visit home page → Program selection
2. Fill personal information
3. Enter academic history
4. Review and submit application
5. Login to portal → Make payment
6. Track application status
7. Download admit card (if applicable)
8. Receive admission decision

**Admin Flow:**

1. Login to admin portal
2. View all applications with filters
3. Review individual applications
4. Approve/reject applications
5. Generate student IDs
6. Create bills
7. Offer courses
8. Generate reports
9. Manage settings

---

## Technology Stack

### Frontend

- **Framework**: React 18.3.1
- **Routing**: React Router 6 (SPA mode)
- **Build Tool**: Vite 6.2.2
- **Language**: TypeScript 5.5.3
- **Styling**: TailwindCSS 3.4.11
- **UI Components**: Radix UI (40+ components)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context API + TanStack Query
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Animations**: Framer Motion

### Backend

- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **Language**: TypeScript (ESM)
- **Database**: SQLite 5.1.7 (dev) / PostgreSQL (prod)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Validation**: Zod 3.23.8
- **UUID Generation**: uuid 9.0.1
- **PDF Generation**: PDFKit 0.13.0
- **Environment**: dotenv 17.2.0

### Development Tools

- **Testing**: Vitest 3.1.4
- **Formatter**: Prettier 3.5.3
- **Bundler**: Vite with SWC
- **Type Checking**: TypeScript compiler

### Deployment

- **Frontend**: Netlify, Vercel, or any static hosting
- **Backend**: Node.js server, Docker, or serverless
- **Database**: Neon (Postgres), Supabase, or self-hosted

---

## Database Schema

### Core Tables (50+ tables)

#### 1. **users**

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  type TEXT CHECK (type IN ('applicant', 'admin')),
  university_id TEXT UNIQUE,
  department TEXT,
  designation TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Store both applicant and admin user credentials
**Key Fields**:

- `type`: 'applicant' or 'admin'
- `university_id`: Auto-generated for students

#### 2. **applications / applications_v2**

```sql
CREATE TABLE applications_v2 (
  application_id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref_no TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  mobile_number TEXT,
  email TEXT,
  nid_no TEXT,
  permanent_address TEXT,
  present_address TEXT,
  photo_url TEXT,
  father_name TEXT,
  mother_name TEXT,
  guardian_name TEXT,
  program_code TEXT NOT NULL,
  campus_id INTEGER,
  semester_id INTEGER,
  status TEXT DEFAULT 'PROVISIONAL',
  payment_status TEXT DEFAULT 'Unpaid',
  admission_test_required INTEGER DEFAULT 0,
  admission_test_status TEXT DEFAULT 'Not Required',
  converted_student_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

**Purpose**: Store all admission applications
**Statuses**: PROVISIONAL, PAID, ADMITTED, REJECTED, FLAGGED
**Payment Statuses**: Unpaid, Partial, Paid

#### 3. **students**

```sql
CREATE TABLE students (
  student_id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER,
  university_id TEXT UNIQUE NOT NULL,
  ugc_id TEXT UNIQUE,
  program_code TEXT,
  campus_id INTEGER,
  semester_id INTEGER,
  full_name TEXT,
  email TEXT,
  mobile_number TEXT,
  batch TEXT,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

**Purpose**: Converted applications to enrolled students
**Key Fields**:

- `university_id`: Format like NU24CSE001
- `ugc_id`: UGC standard ID

#### 4. **programs**

```sql
CREATE TABLE programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  duration_years INTEGER NOT NULL,
  total_credits INTEGER NOT NULL,
  base_cost REAL NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Academic programs offered
**Examples**: BCS, MBA, LLB, etc.

#### 5. **departments**

```sql
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  faculty TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. **student_bills**

```sql
CREATE TABLE student_bills (
  bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  application_id INTEGER,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'Unpaid',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  ...
);
```

**Purpose**: Track all student financial obligations

#### 7. **waivers / waiver_policies**

```sql
CREATE TABLE waiver_policies (
  waiver_policy_id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  percentage REAL NOT NULL,
  active INTEGER DEFAULT 1,
  criteria_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE waiver_assignments (
  waiver_assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  waiver_code TEXT,
  percent REAL,
  assigned_by_user_id INTEGER,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

**Purpose**: Fee waiver definitions and assignments

#### 8. **scholarships**

```sql
CREATE TABLE scholarships (
  scholarship_id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  percentage REAL,
  amount REAL,
  active INTEGER DEFAULT 1,
  criteria_json TEXT,
  ...
);
```

#### 9. **academic_history**

```sql
CREATE TABLE academic_history (
  academic_history_id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  level TEXT CHECK (level IN ('SSC','HSC','Diploma','Graduation','Masters','Other')),
  exam_name TEXT,
  board_university TEXT,
  institute_name TEXT,
  passing_year INTEGER,
  grade_point REAL,
  ...
);
```

**Purpose**: Store applicant educational background

#### 10. **credit_transfer_records**

```sql
CREATE TABLE credit_transfer_records (
  transfer_id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  transferred_credits REAL NOT NULL,
  previous_credits REAL,
  previous_cgpa REAL,
  new_credits REAL,
  new_cgpa REAL,
  details_json TEXT,
  processed_by_user_id INTEGER,
  ...
);
```

#### 11. **documents**

```sql
CREATE TABLE documents (
  document_id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  doc_type TEXT,
  file_url TEXT,
  file_name TEXT,
  mime_type TEXT,
  file_size_bytes INTEGER,
  status TEXT DEFAULT 'Uploaded',
  hash_sha256 TEXT,
  ...
);
```

#### 12. **admission_settings**

```sql
CREATE TABLE admission_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_deadline DATETIME NOT NULL,
  admission_fee REAL DEFAULT 1000,
  late_fee REAL DEFAULT 500,
  session_name TEXT DEFAULT 'Spring 2024',
  is_admission_open BOOLEAN DEFAULT 1,
  max_waiver_percentage REAL DEFAULT 50,
  contact_email TEXT,
  contact_phone TEXT,
  ...
);
```

#### 13. **payment_methods**

```sql
CREATE TABLE payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('bank', 'mobile', 'online')),
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  instructions TEXT,
  is_active BOOLEAN DEFAULT 1,
  ...
);
```

#### 14. **employee_referrers**

```sql
CREATE TABLE employee_referrers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  commission_rate REAL DEFAULT 0.05,
  is_active BOOLEAN DEFAULT 1,
  ...
);
```

#### 15. **program_courses**

```sql
CREATE TABLE program_courses (
  program_course_id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_code TEXT NOT NULL,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  credits REAL NOT NULL,
  is_mandatory INTEGER DEFAULT 1,
  ...
);
```

#### 16. **student_course_offerings**

```sql
CREATE TABLE student_course_offerings (
  offering_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  program_course_id INTEGER NOT NULL,
  offered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'Offered',
  ...
);
```

#### 17. **sms_queue**

```sql
CREATE TABLE sms_queue (
  sms_id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_number TEXT NOT NULL,
  message TEXT NOT NULL,
  provider TEXT,
  status TEXT DEFAULT 'queued',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  error TEXT
);
```

#### 18. **mock_emails**

```sql
CREATE TABLE mock_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_address TEXT,
  subject TEXT,
  body TEXT,
  application_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME
);
```

#### 19. **export_jobs**

```sql
CREATE TABLE export_jobs (
  job_id INTEGER PRIMARY KEY AUTOINCREMENT,
  export_type TEXT,
  params_json TEXT,
  status TEXT DEFAULT 'queued',
  file_path TEXT,
  file_name TEXT,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);
```

#### 20. **audit_trail**

```sql
CREATE TABLE audit_trail (
  audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by_user_id INTEGER,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);
```

#### 21. **visitors_log**

```sql
CREATE TABLE visitors_log (
  visit_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_date DATE NOT NULL,
  campus_id INTEGER,
  visitor_name TEXT,
  contact_number TEXT,
  interested_program_code TEXT,
  assigned_officer_user_id INTEGER,
  lead_source TEXT,
  follow_up_date DATE,
  remarks TEXT,
  ...
);
```

#### 22. **roles & permissions (RBAC)**

```sql
CREATE TABLE roles (
  role_id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_key TEXT UNIQUE NOT NULL
);

CREATE TABLE permissions (
  permission_id INTEGER PRIMARY KEY AUTOINCREMENT,
  permission_key TEXT UNIQUE NOT NULL
);

CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, role_id)
);
```

**Default Roles**: Applicant, AdmissionOfficer, FinanceOfficer, Registrar, FraudAnalyst, Admin

### Additional Tables

- `sessions` - JWT token tracking
- `id_generation` - University/UGC ID tracking
- `fee_packages` - Fee structure per program
- `registration_packages` - Full registration offerings
- `admission_circulars` - Notice management
- `document_requirements` - Required document definitions
- `credit_equivalency` - Grade conversion rules
- `admission_tests` - Test management
- `scholarship_assignments` - Scholarship grants
- `import_jobs` - Bulk import tracking
- `import_job_errors` - Import error logs
- `payment_webhook_events` - Payment gateway webhooks
- `notices` - System-wide notices
- `notice_attachments` - Notice files
- `user_notifications` - User-specific notifications
- `admission_dashboard_cache` - Cached metrics
- `audit_dashboard_export` - Export audit
- `kpi_definitions` - Dashboard KPI definitions
- `lead_sources` - Marketing channels
- `follow_up_log` - Visitor follow-up tracking
- `referral_requests` - Finance approval queue

---

## API Endpoints

### Base URL

- Development: `http://localhost:8080/api`
- Production: `https://yourdomain.com/api`

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint                       | Description                  | Auth Required |
| ------ | ------------------------------ | ---------------------------- | ------------- |
| POST   | `/api/auth/login`              | User login (applicant/admin) | No            |
| POST   | `/api/auth/logout`             | User logout                  | Yes           |
| GET    | `/api/auth/me`                 | Get current user info        | Yes           |
| POST   | `/api/auth/register-applicant` | Register new applicant       | No            |
| POST   | `/api/auth/change-password`    | Change password              | Yes           |

**Request/Response Examples:**

```typescript
// POST /api/auth/login
Request: {
  email: "admin@nu.edu.bd",
  password: "admin123"
}

Response: {
  success: true,
  data: {
    user: {
      id: 1,
      email: "admin@nu.edu.bd",
      name: "Admin User",
      type: "admin"
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Application Endpoints (`/api/applications`)

| Method | Endpoint                             | Description                      | Auth Required |
| ------ | ------------------------------------ | -------------------------------- | ------------- |
| GET    | `/api/applications`                  | Get all applications (paginated) | Admin         |
| GET    | `/api/applications/:id`              | Get single application           | Admin/Owner   |
| POST   | `/api/applications`                  | Create new application           | No            |
| PATCH  | `/api/applications/:id/status`       | Update status                    | Admin         |
| POST   | `/api/applications/:id/generate-ids` | Generate IDs                     | Admin         |
| GET    | `/api/applications/stats/dashboard`  | Dashboard stats                  | Admin         |

**Query Parameters for GET /api/applications:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name/email/tracking ID
- `status`: Filter by status
- `program`: Filter by program code
- `semester`: Filter by semester
- `dateFrom`: Date range start
- `dateTo`: Date range end

### Program Endpoints (`/api/programs`)

| Method | Endpoint                       | Description                 | Auth Required |
| ------ | ------------------------------ | --------------------------- | ------------- |
| GET    | `/api/programs`                | Get all programs            | No            |
| GET    | `/api/programs/:code`          | Get program details         | No            |
| GET    | `/api/programs/departments`    | Get all departments         | No            |
| POST   | `/api/programs/calculate-cost` | Calculate fees with waivers | No            |
| POST   | `/api/programs`                | Create program              | Admin         |
| PUT    | `/api/programs/:code`          | Update program              | Admin         |
| DELETE | `/api/programs/:code`          | Delete program              | Admin         |

### Student Endpoints (`/api/students`)

| Method | Endpoint                        | Description           | Auth Required |
| ------ | ------------------------------- | --------------------- | ------------- |
| GET    | `/api/students`                 | Get all students      | Admin         |
| GET    | `/api/students/:id`             | Get student details   | Admin         |
| POST   | `/api/students`                 | Create student record | Admin         |
| PUT    | `/api/students/:id`             | Update student        | Admin         |
| POST   | `/api/students/:id/generate-id` | Generate student ID   | Admin         |

### Finance Endpoints (`/api/finance`)

| Method | Endpoint                 | Description        | Auth Required |
| ------ | ------------------------ | ------------------ | ------------- |
| GET    | `/api/finance/bills`     | Get student bills  | Admin         |
| POST   | `/api/finance/bills`     | Create bill        | Admin         |
| PATCH  | `/api/finance/bills/:id` | Update bill status | Admin         |
| GET    | `/api/finance/bills/:id` | Get bill details   | Admin/Owner   |

### Academic Endpoints (`/api/academic`)

| Method | Endpoint                        | Description               | Auth Required |
| ------ | ------------------------------- | ------------------------- | ------------- |
| GET    | `/api/academic/courses`         | Get all courses           | Admin         |
| POST   | `/api/academic/credit-transfer` | Calculate credit transfer | Admin         |
| POST   | `/api/academic/offer-courses`   | Offer courses to student  | Admin         |
| GET    | `/api/academic/syllabus`        | Get program syllabus      | No            |

### Report Endpoints (`/api/reports`)

| Method | Endpoint                     | Description        | Auth Required |
| ------ | ---------------------------- | ------------------ | ------------- |
| GET    | `/api/reports/admissions`    | Admission report   | Admin         |
| GET    | `/api/reports/financial`     | Financial report   | Admin         |
| GET    | `/api/reports/departmental`  | Departmental stats | Admin         |
| POST   | `/api/reports/export`        | Queue export job   | Admin         |
| GET    | `/api/reports/export/:jobId` | Get export status  | Admin         |

### PDF Endpoints (`/api/pdf`)

| Method | Endpoint                      | Description            | Auth Required |
| ------ | ----------------------------- | ---------------------- | ------------- |
| GET    | `/api/pdf/admit-card/:id`     | Generate admit card    | Public/Admin  |
| GET    | `/api/pdf/money-receipt`      | Generate money receipt | Admin         |
| GET    | `/api/pdf/id-card/:studentId` | Generate ID card       | Admin         |

### Messaging Endpoints (`/api/messaging`, `/api/sms`)

| Method | Endpoint                    | Description         | Auth Required |
| ------ | --------------------------- | ------------------- | ------------- |
| POST   | `/api/messaging/send-email` | Send email          | Admin         |
| GET    | `/api/messaging/templates`  | Get email templates | Admin         |
| POST   | `/api/sms/send`             | Send SMS            | Admin         |
| GET    | `/api/sms/queue`            | Get SMS queue       | Admin         |

### Dashboard Endpoints (`/api/dashboard`)

| Method | Endpoint                       | Description            | Auth Required |
| ------ | ------------------------------ | ---------------------- | ------------- |
| GET    | `/api/dashboard/stats`         | Overall statistics     | Admin         |
| GET    | `/api/dashboard/kpi`           | KPI metrics            | Admin         |
| POST   | `/api/dashboard/refresh-cache` | Refresh cached metrics | Admin         |

### Visitor/Lead Endpoints (`/api/visitors`)

| Method | Endpoint                      | Description        | Auth Required |
| ------ | ----------------------------- | ------------------ | ------------- |
| GET    | `/api/visitors`               | Get visitor logs   | Admin         |
| POST   | `/api/visitors`               | Create visitor log | Admin         |
| PUT    | `/api/visitors/:id`           | Update visitor     | Admin         |
| POST   | `/api/visitors/:id/follow-up` | Add follow-up      | Admin         |

### Referrer Endpoints (`/api/referrers`)

| Method | Endpoint                   | Description               | Auth Required |
| ------ | -------------------------- | ------------------------- | ------------- |
| GET    | `/api/referrers`           | Get all referrers         | Admin         |
| POST   | `/api/referrers/validate`  | Validate referrer ID      | No            |
| GET    | `/api/referrers/:id/stats` | Get referrer stats        | Admin         |
| POST   | `/api/referrals/requests`  | Request referral approval | Admin         |

### Admin Settings Endpoints (`/api/admission-settings`)

| Method | Endpoint                  | Description          | Auth Required |
| ------ | ------------------------- | -------------------- | ------------- |
| GET    | `/api/admission-settings` | Get current settings | No            |
| PUT    | `/api/admission-settings` | Update settings      | Admin         |

### Import/Export Endpoints (`/api/imports`, `/api/exports`)

| Method | Endpoint                       | Description           | Auth Required |
| ------ | ------------------------------ | --------------------- | ------------- |
| POST   | `/api/imports/upload`          | Upload CSV for import | Admin         |
| GET    | `/api/imports/jobs`            | Get import job status | Admin         |
| POST   | `/api/exports/queue`           | Queue export job      | Admin         |
| GET    | `/api/exports/download/:jobId` | Download export file  | Admin         |

### Webhook Endpoints (`/api/webhooks`)

| Method | Endpoint                       | Description           | Auth Required |
| ------ | ------------------------------ | --------------------- | ------------- |
| POST   | `/api/webhooks/payments/bkash` | bKash payment webhook | No (verified) |
| POST   | `/api/webhooks/sms/:provider`  | SMS delivery webhook  | No (verified) |

---

## Features & Modules

### 1. **Application Management**

- Multi-step application form
- Real-time form validation
- Auto-save and resume
- Document upload (SSC, HSC, Photo, NID)
- Referrer ID validation
- Program selection with eligibility check
- Fee calculation with waivers
- Application tracking

### 2. **Admin Dashboard**

- Real-time statistics (total applications, admissions, revenue)
- Application list with advanced filters
- Individual application review
- Status management (approve/reject/flag)
- Bulk operations
- Search by name, email, tracking ID, university ID

### 3. **Student ID Generation**

- University ID: Format `{PROGRAM}-{CAMPUS}{YEAR}{DEPT}{SERIAL}`
  - Example: `BCS-012401001`
- UGC ID: Format `{UNIV}{FAC}{DISC}{LEVEL}{YEAR}{SERIAL}`
  - Example: `029040801240001`
- Auto-increment with collision detection
- Lock mechanism to prevent duplicates

### 4. **Finance Management**

- Bill creation and tracking
- Payment verification
- Money receipt generation (PDF)
- Fee structure management
- Waiver and scholarship application
- Commission calculation for referrers
- Financial reports

### 5. **Credit Transfer System**

- Automated credit equivalency calculation
- Grade conversion from multiple scales (4.0, 5.0, 10.0, 100.0)
- CGPA recalculation
- Course mapping and approval
- Credit transfer report generation

### 6. **Course Offering**

- Program-wise course lists
- Semester-based course offerings
- Bulk course assignment to students
- Prerequisite checking
- Course load management

### 7. **Academic Management**

- Program and department CRUD
- Syllabus management (versioning)
- Credit hour tracking
- Grade point management

### 8. **Reporting & Analytics**

- Admission reports (by program, campus, semester)
- Financial reports (revenue, outstanding)
- Departmental reports
- Student lists with filters
- Export to CSV, Excel, PDF
- Scheduled report generation

### 9. **Messaging System**

- Email templates management
- SMS queue with retry logic
- Bulk messaging
- Notification system
- Template variables ({{NAME}}, {{TRACKING_ID}}, etc.)
- Mock email outbox (development)

### 10. **Document Management**

- Secure file upload
- Document verification workflow
- Virus scanning (planned)
- Hash-based duplicate detection
- Document status tracking

### 11. **Visitor & Lead Management**

- Visitor log entry
- Lead source tracking
- Follow-up scheduling
- SMS integration for leads
- Assignment to officers

### 12. **Permission & Access Control**

- Role-based access (6 default roles)
- Permission matrix
- Dynamic permission assignment
- User management
- Session tracking

### 13. **Audit & Compliance**

- Complete audit trail
- Field-level change tracking
- User action logging
- Export audit logs
- Change history viewer

### 14. **Settings & Configuration**

- Admission settings (deadlines, fees)
- Payment method configuration
- Document requirements
- Email/SMS templates
- Waiver policies
- Scholarship definitions

### 15. **Import/Export**

- Bulk application import (CSV)
- Error reporting for imports
- Queued export jobs
- Large dataset handling
- Background workers

---

## User Roles & Permissions

### Role Hierarchy

1. **Applicant**

   - Submit applications
   - View own application status
   - Upload documents
   - Make payments
   - Download admit card

2. **Admission Officer**

   - View all applications
   - Approve/reject applications
   - Generate student IDs
   - Verify documents
   - Send notifications

3. **Finance Officer**

   - View financial data
   - Create bills
   - Verify payments
   - Generate receipts
   - Approve referral commissions

4. **Registrar**

   - All admission officer permissions
   - Create students from applications
   - Offer courses
   - Manage academic records
   - Generate official documents

5. **Fraud Analyst**

   - Flag suspicious applications
   - View audit trails
   - Document verification
   - Duplicate detection

6. **Admin (Super User)**
   - All system permissions
   - User management
   - Settings configuration
   - Role assignment
   - System-wide operations

### Permission Keys (Examples)

- `applications:view`
- `applications:create`
- `applications:update`
- `applications:delete`
- `applications:approve`
- `students:view`
- `students:create`
- `finance:view`
- `finance:create`
- `reports:view`
- `reports:export`
- `settings:update`
- `users:manage`

---

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd admission-system
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=8080

# Database
DATABASE_PATH=./database.sqlite

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# Payment Gateways
BKASH_BASE_URL=https://checkout.sandbox.bka.sh
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password

# Email (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@youruni.edu.bd
SENDGRID_FROM_NAME=Northern University

# SMS (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@nu.edu.bd
ADMIN_PASSWORD=admin123
```

### Step 4: Initialize Database

```bash
npm run db:init
```

This will:

- Create SQLite database
- Run all migrations
- Seed sample data

### Step 5: Start Development Server

```bash
npm run dev
```

Application will be available at:

- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api

### Alternative: Run Separately

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

---

## Configuration

### Database Configuration (`server/database/config.ts`)

```typescript
export const dbConfig = {
  path: process.env.DATABASE_PATH || "./database.sqlite",
  verbose: process.env.NODE_ENV === "development",
};
```

### JWT Configuration

```typescript
export const jwtConfig = {
  secret: process.env.JWT_SECRET || "default-secret",
  expiresIn: process.env.JWT_EXPIRY || "7d",
};
```

### File Upload Configuration

```typescript
export const uploadConfig = {
  directory: process.env.UPLOAD_DIR || "./uploads",
  maxSize: (process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
};
```

### CORS Configuration

```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
};
```

---

## Deployment

### Frontend Deployment (Static Hosting)

#### Option 1: Netlify

```bash
# Build
npm run build

# Deploy via Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Netlify Configuration (`netlify.toml`):**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 2: Vercel

```bash
# Build
npm run build

# Deploy
npm install -g vercel
vercel --prod
```

#### Option 3: Static Server (Nginx)

```bash
npm run build
# Copy dist/ folder to web server
```

**Nginx Configuration:**

```nginx
server {
  listen 80;
  server_name youruni.edu.bd;
  root /var/www/admission/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### Backend Deployment

#### Option 1: Node.js Server (PM2)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start npm --name "admission-api" -- start
pm2 save
pm2 startup
```

#### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t admission-api .
docker run -p 3001:3001 --env-file .env admission-api
```

#### Option 3: Serverless (AWS Lambda)

Use `serverless-http` wrapper (already included):

```typescript
import serverless from "serverless-http";
import { app } from "./index";

export const handler = serverless(app);
```

### Database Migration (SQLite → PostgreSQL/Neon)

1. **Export SQLite data:**

```bash
sqlite3 database.sqlite .dump > dump.sql
```

2. **Convert to PostgreSQL syntax:**

```bash
# Replace AUTOINCREMENT with SERIAL
# Replace DATETIME with TIMESTAMP
# Replace BOOLEAN with BOOLEAN (no change)
```

3. **Import to PostgreSQL:**

```bash
psql -h your-neon-host -U user -d database -f dump.sql
```

4. **Update connection in code:**

```typescript
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

---

## File Structure

```
admission-system/
├── code/
│   ├── client/                    # Frontend React application
│   │   ├── apps/                  # Multi-app setup
│   │   │   ├── admin/             # Admin app entry
│   │   │   ├── applicant/         # Applicant app entry
│   │   │   └── applicant-portal/  # Portal app entry
│   │   ├── components/            # React components
│   │   │   ├── ui/                # 40+ Radix UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AdmitCard.tsx
│   │   │   ├── BkashPayment.tsx
│   │   │   └── ...
│   │   ├── contexts/              # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ApplicationContext.tsx
│   │   ├── hooks/                 # Custom hooks
│   │   ├── lib/                   # Utilities and API client
│   │   │   ├── api.ts             # Main API client
│   │   │   ├── mockApi.ts         # Mock implementation
│   │   │   ├── eligibilityRules.ts
│   │   │   ├── formUtils.ts
│   │   │   └── ...
│   │   ├── pages/                 # Route components (60+)
│   │   │   ├── admin/             # Admin-specific pages
│   │   │   ├── Messaging/         # Messaging module
│   │   │   ├── Index.tsx          # Home page
│   │   │   ├── ProgramSelection.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   └── ...
│   │   ├── App.tsx                # Main app with routing
│   │   ├── global.css             # TailwindCSS styles
│   │   └── main.tsx               # React entry point
│   │
│   ├── server/                    # Backend Express application
│   │   ├── database/              # Database layer
│   │   │   ├── config.ts          # DB connection
│   │   │   ├── schema.ts          # Schema definitions
│   │   │   ├── migration.ts       # Migration runner
│   │   │   ├── seeder.ts          # Data seeding
│   │   │   └── adapter.ts         # DB adapter
│   │   ├── middleware/            # Express middleware
│   │   │   └── auth.ts            # JWT authentication
│   │   ├── routes/                # API route handlers (25+ files)
│   │   │   ├── auth.ts
│   │   │   ├── applications.ts
│   │   │   ├── programs.ts
│   │   │   ├── students.ts
│   │   │   ├── finance.ts
│   │   │   ├── academic.ts
│   │   │   ├── reports.ts
│   │   │   ├── pdf.ts
│   │   │   ├── messaging.ts
│   │   │   ├── sms.ts
│   │   │   ├── imports.ts
│   │   │   ├── exports.ts
│   │   │   └── webhooks/
│   │   │       └── payments.ts
│   │   ├── index.ts               # Express app setup
│   │   └── start.ts               # Server startup
│   │
│   ├── shared/                    # Shared types
│   │   └── api.ts                 # API interfaces
│   │
│   ├── public/                    # Static assets
│   │   ├── index.html
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   │
│   ├── AGENTS.md                  # Development guide
│   ├── API_README.md              # API documentation
│   ├── BACKEND_IMPLEMENTATION.md  # Backend guide
│   ├── FRONTEND_DEPLOYMENT.md     # Deployment guide
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── vite.config.ts             # Vite config
│   ├── tailwind.config.ts         # Tailwind config
│   └── .env.example               # Environment template
│
├── dist/                          # Production build output
├── uploads/                       # File uploads directory
├── database.sqlite                # SQLite database file
└── README.md                      # Project overview
```

---

## Security

### Authentication

- JWT-based token authentication
- 7-day token expiry
- Secure password hashing (bcrypt with 10 rounds)
- Session tracking in database

### Authorization

- Role-based access control (RBAC)
- Permission checks on all protected routes
- User-resource ownership validation

### Data Protection

- SQL injection prevention (parameterized queries)
- XSS protection (React auto-escaping)
- CSRF protection (same-origin policy)
- File upload validation (type, size, hash)

### API Security

- Rate limiting (planned)
- CORS configuration
- Webhook signature verification
- Input validation with Zod

### Best Practices

- Environment variable management
- Secrets not committed to repo
- HTTPS in production
- Security headers
- Regular dependency updates

---

## Payment Integration

### Supported Gateways

1. **bKash** (Mobile Banking)
2. **Bank Transfer** (Manual verification)
3. SSL Commerz (Ready for integration)

### Payment Flow

#### bKash Integration

1. User selects bKash payment
2. Frontend calls `/api/payments/bkash/create`
3. Backend creates payment with bKash API
4. User redirected to bKash checkout
5. After payment, bKash calls webhook `/api/webhooks/payments/bkash`
6. Backend verifies signature and updates application status
7. User redirected back with success/failure

#### Bank Transfer

1. Admin configures bank accounts
2. User views bank details
3. User makes manual transfer
4. User uploads payment slip
5. Finance officer verifies slip
6. Officer updates payment status

### Webhook Security

```typescript
const verifyBkashSignature = (payload: string, signature: string): boolean => {
  const hash = crypto
    .createHmac("sha256", process.env.BKASH_APP_SECRET!)
    .update(payload)
    .digest("hex");
  return hash === signature;
};
```

---

## Messaging System

### Email System

- **Provider**: SendGrid / AWS SES
- **Templates**: Stored in database
- **Variables**: {{NAME}}, {{TRACKING_ID}}, {{PROGRAM}}, etc.
- **Mock Mode**: Development emails stored in `mock_emails` table

### SMS System

- **Provider**: Twilio / Nexmo
- **Queue**: `sms_queue` table with retry logic
- **Delivery Tracking**: Webhook updates from provider
- **Bulk SMS**: Queue processing with rate limits

### Notification Types

1. Application submitted
2. Payment received
3. Application approved
4. ID generated
5. Admission test scheduled
6. Document verification required
7. Custom admin messages

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test
```

**Test Files:**

- `client/lib/mockApi.spec.ts`
- `client/lib/api.spec.ts`

### Manual Testing Checklist

**Application Flow:**

- [ ] Create application
- [ ] Upload documents
- [ ] Calculate fees
- [ ] Submit application
- [ ] Login to portal
- [ ] Make payment
- [ ] View status

**Admin Flow:**

- [ ] Login as admin
- [ ] View applications
- [ ] Approve application
- [ ] Generate student ID
- [ ] Create bill
- [ ] Offer courses
- [ ] Generate reports

**Edge Cases:**

- [ ] Duplicate email registration
- [ ] Invalid referrer ID
- [ ] File upload limits
- [ ] Concurrent ID generation
- [ ] Payment webhook replay

---

## Demo Credentials

### Applicant Portal

- **University ID**: `NU24BCS001`
- **Password**: `temp123456`

### Admin Portal

- **Email**: `admin@nu.edu.bd`
- **Password**: `admin123`

### Sample Referrer IDs

- `EMP001` - John Doe (CSE Department)
- `EMP002` - Jane Smith (BBA Department)

---

## Support & Documentation

### Additional Resources

- **API Documentation**: See `API_README.md`
- **Backend Guide**: See `BACKEND_IMPLEMENTATION.md`
- **Frontend Deployment**: See `FRONTEND_DEPLOYMENT.md`
- **Development Guide**: See `AGENTS.md`

### Common Issues

**Database locked error:**

```bash
# Close all connections to database
rm database.sqlite
npm run db:init
```

**Port already in use:**

```bash
# Change PORT in .env
PORT=3002
```

**Build errors:**

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Production Checklist

### Before Deployment

- [ ] Update JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Configure real payment gateway credentials
- [ ] Set up email/SMS providers
- [ ] Configure CORS with specific origin
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure file storage (S3/similar)
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Update all placeholder URLs
- [ ] Test all critical flows
- [ ] Perform security audit
- [ ] Set up CI/CD pipeline

### Post-Deployment

- [ ] Monitor error logs
- [ ] Test payment webhooks
- [ ] Verify email delivery
- [ ] Check SMS delivery
- [ ] Monitor database performance
- [ ] Set up uptime monitoring
- [ ] Configure backups
- [ ] Document runbook
- [ ] Train admin users

---

## License & Credits

**Developed for**: Northern University Bangladesh
**Tech Stack**: React, TypeScript, Express, SQLite/PostgreSQL
**UI Components**: Radix UI, TailwindCSS
**Icons**: Lucide React

---

## Appendix: Complete Technology Inventory

### Frontend Dependencies (60+)

- React 18.3.1, React Router 6, TypeScript 5.5.3
- Vite 6.2.2, TailwindCSS 3.4.11
- Radix UI (40+ components)
- React Hook Form, Zod, TanStack Query
- Lucide React, Recharts, Framer Motion
- date-fns, clsx, class-variance-authority

### Backend Dependencies (20+)

- Express 4.18.2, TypeScript
- SQLite 5.1.7, bcryptjs 2.4.3
- JWT 9.0.2, uuid 9.0.1
- Zod 3.23.8, dotenv 17.2.0
- PDFKit 0.13.0, cors 2.8.5

### Database Tables (50+)

See [Database Schema](#database-schema) section

### API Endpoints (100+)

See [API Endpoints](#api-endpoints) section

### Pages/Routes (60+)

See [File Structure](#file-structure) section

---

**End of Documentation**

For questions or support, refer to individual documentation files or contact the development team.
