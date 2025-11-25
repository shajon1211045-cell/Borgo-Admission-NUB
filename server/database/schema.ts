import { dbRun } from "./config.js";

export const initializeSchema = async (): Promise<void> => {
  try {
    // Users table (both applicants and admins)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('applicant', 'admin')),
        university_id TEXT UNIQUE,
        department TEXT,
        designation TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Applications table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        tracking_id TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        program TEXT NOT NULL,
        department TEXT NOT NULL,
        session TEXT NOT NULL,
        campus TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        phone_verified BOOLEAN DEFAULT 0,
        email_verified BOOLEAN DEFAULT 0,
        date_of_birth DATE,
        gender TEXT,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'Bangladesh',
        guardian_name TEXT,
        guardian_phone TEXT,
        guardian_relation TEXT,
        ssc_institution TEXT,
        ssc_year INTEGER,
        ssc_gpa REAL,
        hsc_institution TEXT,
        hsc_year INTEGER,
        hsc_gpa REAL,
        bachelor_institution TEXT,
        bachelor_year INTEGER,
        bachelor_cgpa REAL,
        master_institution TEXT,
        master_year INTEGER,
        master_cgpa REAL,
        other_qualifications TEXT,
        total_cost REAL DEFAULT 0,
        waiver_amount REAL DEFAULT 0,
        final_amount REAL DEFAULT 0,
        payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial')),
        payslip_uploaded BOOLEAN DEFAULT 0,
        documents_complete BOOLEAN DEFAULT 0,
        referrer_id TEXT,
        referrer_name TEXT,
        application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        approval_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Programs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        duration_years INTEGER NOT NULL,
        total_credits INTEGER NOT NULL,
        base_cost REAL NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Departments table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        faculty TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Waivers table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS waivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        percentage REAL NOT NULL,
        amount REAL NOT NULL,
        reason TEXT,
        approved_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications (id)
      )
    `);

    // Employee referrers table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS employee_referrers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        commission_rate REAL DEFAULT 0.05,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Referral requests table (finance approvals)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS referral_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        referrer_employee_id TEXT,
        admission_fee REAL DEFAULT 0,
        percentage REAL DEFAULT 0,
        amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
        processed_by TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME
      )
    `);

    // Sessions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // ID generation tracking
    await dbRun(`
      CREATE TABLE IF NOT EXISTS id_generation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        university_id TEXT NOT NULL,
        ugc_id TEXT,
        batch TEXT NOT NULL,
        generated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        generated_by TEXT NOT NULL,
        is_sent BOOLEAN DEFAULT 0,
        FOREIGN KEY (application_id) REFERENCES applications (id)
      )
    `);

    // Students table - created when applications are converted to enrolled students
    await dbRun(`
      CREATE TABLE IF NOT EXISTS students (
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
        created_by TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications_v2 (application_id)
      )
    `);

    // Student bills (initial admission fee / tuition bills)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS student_bills (
        bill_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        application_id INTEGER,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date DATE,
        status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Unpaid','Paid','Partial')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME,
        created_by_user_id INTEGER,
        FOREIGN KEY (student_id) REFERENCES students(student_id)
      )
    `);

    // Admission settings table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admission_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_deadline DATETIME NOT NULL,
        admission_fee REAL NOT NULL DEFAULT 1000,
        late_fee REAL NOT NULL DEFAULT 500,
        late_fee_deadline DATETIME,
        max_applications_per_user INTEGER DEFAULT 3,
        allow_application_editing BOOLEAN DEFAULT 1,
        require_phone_verification BOOLEAN DEFAULT 1,
        require_email_verification BOOLEAN DEFAULT 1,
        require_document_upload BOOLEAN DEFAULT 1,
        application_start_date DATETIME NOT NULL,
        session_name TEXT NOT NULL DEFAULT 'Spring 2024',
        admission_notice TEXT,
        payment_instructions TEXT,
        contact_email TEXT DEFAULT 'admission@nu.edu.bd',
        contact_phone TEXT DEFAULT '+8801700000000',
        is_admission_open BOOLEAN DEFAULT 1,
        waiver_enabled BOOLEAN DEFAULT 1,
        max_waiver_percentage REAL DEFAULT 50,
        auto_approve_applications BOOLEAN DEFAULT 0,
        send_sms_notifications BOOLEAN DEFAULT 1,
        send_email_notifications BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment methods table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('bank', 'mobile', 'online')),
        account_number TEXT NOT NULL,
        account_name TEXT NOT NULL,
        routing_number TEXT,
        instructions TEXT,
        is_active BOOLEAN DEFAULT 1,
        order_priority INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Fee packages (structured fee components per program/session)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS fee_packages (
        fee_package_id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_code TEXT NOT NULL,
        session_name TEXT,
        admission_fee REAL DEFAULT 0,
        tuition_fee REAL DEFAULT 0,
        lab_fee REAL DEFAULT 0,
        other_fees REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER
      )
    `);

    // Registration packages (admin-managed list of full registration package offerings)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS registration_packages (
        id TEXT PRIMARY KEY,
        program TEXT NOT NULL,
        term TEXT,
        mode TEXT,
        credits INTEGER,
        admission_fee REAL DEFAULT 0,
        per_credit REAL DEFAULT 0,
        fixed_fees REAL DEFAULT 0,
        total_estimated REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Waiver policies (admin-managed)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS waiver_policies (
        waiver_policy_id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        percentage REAL NOT NULL,
        active INTEGER DEFAULT 1,
        criteria_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER
      )
    `);

    // Program courses (canonical first semester mapping)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS program_courses (
        program_course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_code TEXT NOT NULL,
        course_code TEXT NOT NULL,
        course_name TEXT NOT NULL,
        semester INTEGER NOT NULL,
        credits REAL NOT NULL,
        is_mandatory INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Student course offerings (created when offering courses)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS student_course_offerings (
        offering_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        application_id INTEGER,
        program_course_id INTEGER NOT NULL,
        offered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        offered_by_user_id INTEGER,
        status TEXT DEFAULT 'Offered' CHECK (status IN ('Offered','Accepted','Declined')),
        notes TEXT,
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        FOREIGN KEY (program_course_id) REFERENCES program_courses(program_course_id)
      )
    `);

    // Admission circulars management
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admission_circulars (
        circular_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER
      )
    `);

    // Document requirements table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS document_requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        is_required BOOLEAN DEFAULT 1,
        file_types TEXT DEFAULT 'pdf,jpg,jpeg,png',
        max_file_size_mb INTEGER DEFAULT 5,
        order_priority INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admission settings if none exist
    await dbRun(`
      INSERT OR IGNORE INTO admission_settings (
        id,
        application_deadline,
        admission_fee,
        late_fee,
        late_fee_deadline,
        application_start_date,
        session_name,
        admission_notice,
        payment_instructions,
        contact_email,
        contact_phone
      ) VALUES (
        1,
        '2024-12-31 23:59:59',
        1000,
        500,
        '2025-01-15 23:59:59',
        '2024-01-01 00:00:00',
        'Spring 2024',
        'Welcome to Northern University Bangladesh Online Admission Portal. Please complete all required fields and submit your application before the deadline.',
        'Please make payment to the designated bank account and upload the payment slip. For any payment related queries, contact our finance department.',
        'admission@nu.edu.bd',
        '+8801700000000'
      )
    `);

    // Insert default payment methods if none exist
    await dbRun(`
      INSERT OR IGNORE INTO payment_methods (name, type, account_number, account_name, instructions, order_priority)
      VALUES
        ('Dutch Bangla Bank', 'bank', '1234567890', 'Northern University Bangladesh', 'Please mention your tracking ID in the deposit slip.', 1),
        ('bKash', 'mobile', '01700000000', 'Northern University', 'Send money to this number and mention your tracking ID.', 2),
        ('Nagad', 'mobile', '01800000000', 'Northern University', 'Send money to this number and mention your tracking ID.', 3)
    `);

    // Insert default document requirements if none exist
    await dbRun(`
      INSERT OR IGNORE INTO document_requirements (name, description, is_required, order_priority)
      VALUES
        ('SSC Certificate', 'Upload your SSC/equivalent certificate', 1, 1),
        ('HSC Certificate', 'Upload your HSC/equivalent certificate', 1, 2),
        ('Passport Size Photo', 'Upload a recent passport size photograph', 1, 3),
        ('National ID/Birth Certificate', 'Upload National ID card or Birth Certificate', 1, 4),
        ('Guardian National ID', 'Upload guardian National ID card', 0, 5)
    `);

    // Module 1 — Canonical Data Model (lite SQLite version)
    // Applications v2 (canonical)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS applications_v2 (
        application_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ref_no TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        full_name TEXT,
        date_of_birth DATE,
        gender TEXT,
        mobile_number TEXT,
        email TEXT,
        nid_no TEXT,
        passport_no TEXT,
        birth_certificate_no TEXT,
        permanent_address TEXT,
        present_address TEXT,
        photo_url TEXT,
        -- Parent / Guardian details
        father_name TEXT,
        father_phone TEXT,
        mother_name TEXT,
        mother_phone TEXT,
        guardian_name TEXT,
        guardian_phone TEXT,
        guardian_address TEXT,
        -- Additional personal fields
        quota TEXT,
        religion TEXT,
        disability_status TEXT,
        blood_group TEXT,
        required_credits REAL,
        grading_system TEXT,
        remarks TEXT,
        admission_type TEXT CHECK (admission_type IN ('Regular','CreditTransfer')),
        previous_university TEXT,
        credits_earned REAL,
        program_code TEXT NOT NULL,
        campus_id INTEGER,
        semester_id INTEGER,
        referral_employee_id INTEGER,
        temporary_user_id TEXT,
        status TEXT NOT NULL DEFAULT 'PROVISIONAL' CHECK (status IN ('PROVISIONAL','PAID','ADMITTED','REJECTED','FLAGGED')),
        payment_status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid','Partial','Paid')),
        admission_test_required INTEGER NOT NULL DEFAULT 0,
        admission_test_status TEXT NOT NULL DEFAULT 'Not Required' CHECK (admission_test_status IN ('Not Required','Pending','Pass','Fail')),
        converted_student_id TEXT,
        identifiers_locked INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by_user_id INTEGER,
        notes TEXT
      )
    `);

    // Unique constraints (partial uniqueness emulation via triggers is heavy; store simple indexes)
    await dbRun(
      `CREATE UNIQUE INDEX IF NOT EXISTS ix_app_v2_ref_no ON applications_v2(ref_no)`,
    );
    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_app_v2_semester_status ON applications_v2(semester_id, status)`,
    );
    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_app_v2_program_created ON applications_v2(program_code, created_at)`,
    );

    // Academic history
    await dbRun(`
      CREATE TABLE IF NOT EXISTS academic_history (
        academic_history_id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        level TEXT CHECK (level IN ('SSC','HSC','Diploma','Graduation','Masters','Other')),
        exam_name TEXT,
        group_subject TEXT,
        board_university TEXT,
        institute_name TEXT,
        passing_year INTEGER,
        roll_no TEXT,
        registration_no TEXT,
        grade_point REAL,
        obtained_class TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER,
        FOREIGN KEY (application_id) REFERENCES applications_v2(application_id)
      )
    `);
    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_academic_history_app ON academic_history(application_id)`,
    );

    // Credit equivalency rules (map external grades to local grade points)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS credit_equivalency (
        equivalency_id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_scale TEXT NOT NULL,
        source_value TEXT NOT NULL,
        mapped_grade_point REAL NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER
      )
    `);

    // Credit transfer records (log of transfer calculations and assignments)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS credit_transfer_records (
        transfer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        transferred_credits REAL NOT NULL,
        previous_credits REAL,
        previous_cgpa REAL,
        new_credits REAL,
        new_cgpa REAL,
        details_json TEXT,
        processed_by_user_id INTEGER,
        processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications_v2(application_id)
      )
    `);

    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_credit_transfer_app ON credit_transfer_records(application_id)`,
    );

    // Documents
    await dbRun(`
      CREATE TABLE IF NOT EXISTS documents (
        document_id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        doc_type TEXT CHECK (doc_type IN ('SSC','HSC','Transcript','Photo','Other')),
        file_url TEXT,
        file_name TEXT,
        mime_type TEXT,
        file_size_bytes INTEGER,
        uploaded_by_user_id INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'Uploaded' CHECK (status IN ('Uploaded','Validated','Rejected')),
        validated_by_user_id INTEGER,
        validated_at DATETIME,
        rejection_reason TEXT,
        virus_scanned INTEGER DEFAULT 0,
        hash_sha256 TEXT,
        FOREIGN KEY (application_id) REFERENCES applications_v2(application_id)
      )
    `);
    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_documents_app ON documents(application_id)`,
    );

    // Waiver assignments
    await dbRun(`
      CREATE TABLE IF NOT EXISTS waiver_assignments (
        waiver_assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        waiver_code TEXT,
        percent REAL,
        assigned_by_user_id INTEGER,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        locked INTEGER DEFAULT 0,
        locked_by_user_id INTEGER,
        locked_at DATETIME,
        reason TEXT,
        FOREIGN KEY (application_id) REFERENCES applications_v2(application_id)
      )
    `);
    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_waiver_assignments_app ON waiver_assignments(application_id)`,
    );

    // Scholarships (program-level definitions)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS scholarships (
        scholarship_id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        percentage REAL,
        amount REAL,
        active INTEGER DEFAULT 1,
        criteria_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER
      )
    `);

    // Scholarship assignments to applications
    await dbRun(`
      CREATE TABLE IF NOT EXISTS scholarship_assignments (
        scholarship_assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        scholarship_id INTEGER NOT NULL,
        percent REAL,
        amount REAL,
        assigned_by_user_id INTEGER,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        locked INTEGER DEFAULT 0,
        locked_by_user_id INTEGER,
        locked_at DATETIME,
        FOREIGN KEY (application_id) REFERENCES applications_v2(application_id),
        FOREIGN KEY (scholarship_id) REFERENCES scholarships(scholarship_id)
      )
    `);

    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_scholarship_assign_app ON scholarship_assignments(application_id)`,
    );

    // Admission tests
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admission_tests (
        admission_test_id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        test_required INTEGER NOT NULL DEFAULT 0,
        test_fee_status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (test_fee_status IN ('Unpaid','Partial','Paid')),
        admit_card_url TEXT,
        test_center TEXT,
        test_slot DATETIME,
        result TEXT NOT NULL DEFAULT 'Pending' CHECK (result IN ('Pending','Pass','Fail')),
        result_uploaded_by INTEGER,
        result_uploaded_at DATETIME,
        FOREIGN KEY (application_id) REFERENCES applications_v2(application_id)
      )
    `);
    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_admission_tests_app ON admission_tests(application_id)`,
    );

    // Audit trail (append-only)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS audit_trail (
        audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        field_name TEXT,
        old_value TEXT,
        new_value TEXT,
        changed_by_user_id INTEGER,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reason TEXT
      )
    `);
    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_audit_entity ON audit_trail(entity, entity_id, changed_at)`,
    );

    // Visitors/Leads
    await dbRun(`
      CREATE TABLE IF NOT EXISTS lead_sources (
        lead_source_id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        active INTEGER DEFAULT 1
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS visitors_log (
        visit_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_date DATE NOT NULL,
        campus_id INTEGER,
        visitor_name TEXT,
        district TEXT,
        no_of_visitors INTEGER,
        contact_number TEXT,
        interested_program_code TEXT,
        assigned_officer_user_id INTEGER,
        sms_sent INTEGER DEFAULT 0,
        lead_source TEXT,
        follow_up_date DATE,
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by_user_id INTEGER,
        deleted_at DATETIME,
        deleted_by_user_id INTEGER
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS follow_up_log (
        follow_up_id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_log_id INTEGER NOT NULL,
        follow_up_date DATE,
        action_taken TEXT,
        next_follow_up_date DATE,
        logged_by_user_id INTEGER,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (visit_log_id) REFERENCES visitors_log(visit_log_id)
      )
    `);

    // Dashboard & Metrics cache
    await dbRun(`
      CREATE TABLE IF NOT EXISTS kpi_definitions (
        kpi_key TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sql_query TEXT,
        filters_schema_json TEXT,
        owner_role TEXT,
        refresh_cron TEXT,
        active INTEGER DEFAULT 1
      )
    `);

    // Notices and user notifications
    await dbRun(`
      CREATE TABLE IF NOT EXISTS notices (
        notice_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        is_active INTEGER DEFAULT 1,
        target_roles TEXT, -- JSON array of role_key strings or null for all
        created_by_user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS notice_attachments (
        attachment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        notice_id INTEGER NOT NULL,
        file_url TEXT NOT NULL,
        file_name TEXT,
        mime_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notice_id) REFERENCES notices(notice_id)
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        notice_id INTEGER,
        title TEXT,
        message TEXT,
        type TEXT DEFAULT 'info',
        read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (notice_id) REFERENCES notices(notice_id)
      )
    `);

    // SMS queue for async delivery
    await dbRun(`
      CREATE TABLE IF NOT EXISTS sms_queue (
        sms_id INTEGER PRIMARY KEY AUTOINCREMENT,
        to_number TEXT NOT NULL,
        message TEXT NOT NULL,
        provider TEXT,
        status TEXT DEFAULT 'queued',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        error TEXT
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admission_dashboard_cache (
        cache_id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER,
        campus_id INTEGER,
        program_id INTEGER,
        metric_key TEXT NOT NULL,
        metric_value REAL,
        date_from DATE,
        date_to DATE,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        generated_by_user_id INTEGER,
        notes TEXT
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS audit_dashboard_export (
        export_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        params_json TEXT,
        export_format TEXT CHECK (export_format IN ('csv','xlsx','pdf')),
        row_count INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Export jobs table to track queued export processing and generated files
    await dbRun(`
      CREATE TABLE IF NOT EXISTS export_jobs (
        job_id INTEGER PRIMARY KEY AUTOINCREMENT,
        export_id INTEGER,
        export_type TEXT,
        params_json TEXT,
        status TEXT DEFAULT 'queued' CHECK (status IN ('queued','processing','done','failed')),
        file_path TEXT,
        file_name TEXT,
        error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (export_id) REFERENCES audit_dashboard_export(export_id)
      )
    `);

    // Mock emails table (development-only, stores generated mock outgoing emails)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS mock_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        to_address TEXT,
        subject TEXT,
        body TEXT,
        application_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sent_at DATETIME,
        FOREIGN KEY (application_id) REFERENCES applications(id)
      )
    `);

    // Payment webhook events
    await dbRun(`
      CREATE TABLE IF NOT EXISTS payment_webhook_events (
        webhook_id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        payload_json TEXT,
        signature_header TEXT,
        signature_valid INTEGER DEFAULT 0,
        idempotency_key TEXT,
        received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        status TEXT DEFAULT 'Queued' CHECK (status IN ('Queued','Processed','Failed')),
        error TEXT
      )
    `);
    await dbRun(
      `CREATE INDEX IF NOT EXISTS ix_webhook_idempotency ON payment_webhook_events(idempotency_key)`,
    );

    // RBAC core tables (roles & permissions)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_key TEXT UNIQUE NOT NULL
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS permissions (
        permission_id INTEGER PRIMARY KEY AUTOINCREMENT,
        permission_key TEXT UNIQUE NOT NULL
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(role_id),
        FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
      )
    `);

    // Seed basic roles and permissions if empty
    await dbRun(
      `INSERT OR IGNORE INTO roles (role_id, role_key) VALUES (1,'Applicant'),(2,'AdmissionOfficer'),(3,'FinanceOfficer'),(4,'Registrar'),(5,'FraudAnalyst'),(6,'Admin')`,
    );

    // Import jobs
    await dbRun(`
      CREATE TABLE IF NOT EXISTS import_jobs (
        import_job_id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_name TEXT,
        idempotency_key TEXT,
        status TEXT DEFAULT 'Queued',
        total_rows INTEGER DEFAULT 0,
        success_rows INTEGER DEFAULT 0,
        failed_rows INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_user_id INTEGER
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS import_job_errors (
        error_id INTEGER PRIMARY KEY AUTOINCREMENT,
        import_job_id INTEGER NOT NULL,
        row_number INTEGER,
        column_name TEXT,
        error_code TEXT,
        error_message TEXT,
        raw_row_json TEXT,
        FOREIGN KEY (import_job_id) REFERENCES import_jobs(import_job_id)
      )
    `);

    console.log("✅ Database schema initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database schema:", error);
    throw error;
  }
};
