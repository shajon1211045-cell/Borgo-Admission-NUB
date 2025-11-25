import { connectDB, dbRun, dbGet, closeDB } from "./config.js";
import { initializeSchema } from "./schema.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await connectDB();

    // Initialize schema
    await initializeSchema();

    // Check if data already exists
    const existingUsers = await dbGet("SELECT COUNT(*) as count FROM users");
    if (existingUsers.count > 0) {
      console.log("📊 Database already contains data. Skipping seed.");
      return;
    }

    console.log("👤 Creating admin users...");

    // Create admin users
    const adminPassword = await bcrypt.hash("admin123", 10);

    await dbRun(
      `
      INSERT INTO users (uuid, name, email, password_hash, type, department, designation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        uuidv4(),
        "Dr. Mohammad Rahman",
        "admin@nu.edu.bd",
        adminPassword,
        "admin",
        "Administration",
        "Admission Officer",
      ],
    );

    await dbRun(
      `
      INSERT INTO users (uuid, name, email, password_hash, type, department, designation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        uuidv4(),
        "Prof. Fatima Ahmed",
        "fatima@nu.edu.bd",
        adminPassword,
        "admin",
        "Computer Science",
        "Department Head",
      ],
    );

    console.log("📚 Creating programs...");

    // Seed RBAC permissions and assign to Admin role
    console.log("🔐 Seeding RBAC permissions and role assignments...");

    const permissionsList = [
      "all",
      "applications:view",
      "applications:edit",
      "applications:edit.pii_override",
      "applications:approve",
      "applications:delete",
      "waivers:assign",
      "waivers:lock",
      "applications:lock_identifiers",
      "finance:payment.create",
      "finance:refund",
      "fraud:review.clear",
      "fraud:review.mark_fraud",
      "settings:manage",
      "registration_packages:manage",
      "reports:export",
      "documents:validate",
    ];

    for (const pk of permissionsList) {
      await dbRun(
        `INSERT OR IGNORE INTO permissions (permission_key) VALUES (?)`,
        [pk],
      );
    }

    // Ensure Admin role exists and get its id
    const adminRole = await dbGet(
      `SELECT role_id FROM roles WHERE role_key = 'Admin'`,
    );
    const adminRoleId = adminRole ? adminRole.role_id : 6;

    // Map all permissions to Admin role
    for (const pk of permissionsList) {
      const permRow = await dbGet(
        `SELECT permission_id FROM permissions WHERE permission_key = ?`,
        [pk],
      );
      if (permRow) {
        await dbRun(
          `INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
          [adminRoleId, permRow.permission_id],
        );
      }
    }

    // Assign Admin role to existing admin users (by email)
    const admin1 = await dbGet(`SELECT id FROM users WHERE email = ?`, [
      "admin@nu.edu.bd",
    ]);
    const admin2 = await dbGet(`SELECT id FROM users WHERE email = ?`, [
      "fatima@nu.edu.bd",
    ]);
    if (admin1)
      await dbRun(
        `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [admin1.id, adminRoleId],
      );
    if (admin2)
      await dbRun(
        `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [admin2.id, adminRoleId],
      );

    console.log("🔐 RBAC seeding completed.");

    // Create programs
    const programs = [
      {
        code: "BSC_CS",
        name: "BSc Computer Science",
        type: "undergraduate",
        duration_years: 4,
        total_credits: 120,
        base_cost: 180000,
      },
      {
        code: "BSC_EEE",
        name: "BSc Electrical & Electronic Engineering",
        type: "undergraduate",
        duration_years: 4,
        total_credits: 120,
        base_cost: 200000,
      },
      {
        code: "MBA",
        name: "Master of Business Administration",
        type: "postgraduate",
        duration_years: 2,
        total_credits: 60,
        base_cost: 150000,
      },
      {
        code: "MSC_CS",
        name: "MSc Computer Science",
        type: "postgraduate",
        duration_years: 2,
        total_credits: 60,
        base_cost: 120000,
      },
    ];

    for (const program of programs) {
      await dbRun(
        `
        INSERT INTO programs (code, name, type, duration_years, total_credits, base_cost)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          program.code,
          program.name,
          program.type,
          program.duration_years,
          program.total_credits,
          program.base_cost,
        ],
      );
    }

    console.log("🏫 Creating departments...");

    // Create departments
    const departments = [
      {
        code: "CSE",
        name: "Computer Science & Engineering",
        faculty: "Faculty of Engineering",
      },
      {
        code: "EEE",
        name: "Electrical & Electronic Engineering",
        faculty: "Faculty of Engineering",
      },
      {
        code: "BBA",
        name: "Business Administration",
        faculty: "Faculty of Business",
      },
      {
        code: "ENG",
        name: "English",
        faculty: "Faculty of Arts",
      },
    ];

    for (const dept of departments) {
      await dbRun(
        `
        INSERT INTO departments (code, name, faculty)
        VALUES (?, ?, ?)
      `,
        [dept.code, dept.name, dept.faculty],
      );
    }

    console.log("👥 Creating employee referrers...");

    // Create employee referrers
    const referrers = [
      {
        employee_id: "NU-FAC-001",
        name: "Dr. Mohammad Rahman",
        department: "Computer Science",
        designation: "Professor",
        commission_rate: 0.05,
      },
      {
        employee_id: "NU-FAC-002",
        name: "Prof. Fatima Ahmed",
        department: "Business Administration",
        designation: "Associate Professor",
        commission_rate: 0.04,
      },
      {
        employee_id: "NU-ADM-001",
        name: "Abdul Karim",
        department: "Administration",
        designation: "Admin Officer",
        commission_rate: 0.03,
      },
    ];

    for (const referrer of referrers) {
      await dbRun(
        `
        INSERT INTO employee_referrers (employee_id, name, department, designation, commission_rate)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          referrer.employee_id,
          referrer.name,
          referrer.department,
          referrer.designation,
          referrer.commission_rate,
        ],
      );
    }

    console.log("📝 Creating sample applications...");

    // Create sample applications
    const sampleApplications = [
      {
        tracking_id: "NU24001001",
        program: "BSC_CS",
        department: "CSE",
        first_name: "Mohammad",
        last_name: "Rahman",
        phone: "+8801234567890",
        email: "rahman@email.com",
        date_of_birth: "2000-01-15",
        gender: "male",
        address: "Dhaka, Bangladesh",
        city: "Dhaka",
        postal_code: "1000",
        country: "Bangladesh",
        guardian_name: "Abdul Rahman",
        guardian_phone: "+8801234567891",
        guardian_relation: "Father",
        ssc_institution: "Dhaka College",
        ssc_year: 2017,
        ssc_gpa: 5.0,
        hsc_institution: "Notre Dame College",
        hsc_year: 2019,
        hsc_gpa: 5.0,
        total_cost: 180000,
        final_amount: 153000,
        status: "pending",
        payment_status: "pending",
        referrer_id: "NU-FAC-001",
        referrer_name: "Dr. Mohammad Rahman",
      },
      {
        tracking_id: "NU24001002",
        program: "MBA",
        department: "BBA",
        first_name: "Fatima",
        last_name: "Ahmed",
        phone: "+8801234567892",
        email: "fatima@email.com",
        date_of_birth: "1998-05-20",
        gender: "female",
        address: "Chittagong, Bangladesh",
        city: "Chittagong",
        postal_code: "4000",
        country: "Bangladesh",
        guardian_name: "Ahmed Ali",
        guardian_phone: "+8801234567893",
        guardian_relation: "Father",
        ssc_institution: "Chittagong College",
        ssc_year: 2015,
        ssc_gpa: 4.8,
        hsc_institution: "Chittagong College",
        hsc_year: 2017,
        hsc_gpa: 4.9,
        bachelor_institution: "University of Dhaka",
        bachelor_year: 2021,
        bachelor_cgpa: 3.75,
        total_cost: 150000,
        final_amount: 150000,
        status: "approved",
        payment_status: "paid",
        referrer_id: "NU-FAC-002",
        referrer_name: "Prof. Fatima Ahmed",
      },
    ];

    for (const app of sampleApplications) {
      await dbRun(
        `
        INSERT INTO applications (
          uuid, tracking_id, status, program, department, session,
          first_name, last_name, phone, date_of_birth, gender,
          address, city, postal_code, country, guardian_name,
          guardian_phone, guardian_relation, ssc_institution, ssc_year,
          ssc_gpa, hsc_institution, hsc_year, hsc_gpa, bachelor_institution,
          bachelor_year, bachelor_cgpa, total_cost, final_amount, 
          payment_status, referrer_id, referrer_name, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          uuidv4(),
          app.tracking_id,
          app.status,
          app.program,
          app.department,
          "Spring 2024",
          app.first_name,
          app.last_name,
          app.phone,
          app.date_of_birth,
          app.gender,
          app.address,
          app.city,
          app.postal_code,
          app.country,
          app.guardian_name,
          app.guardian_phone,
          app.guardian_relation,
          app.ssc_institution,
          app.ssc_year,
          app.ssc_gpa,
          app.hsc_institution,
          app.hsc_year,
          app.hsc_gpa,
          app.bachelor_institution || null,
          app.bachelor_year || null,
          app.bachelor_cgpa || null,
          app.total_cost,
          app.final_amount,
          app.payment_status,
          app.referrer_id,
          app.referrer_name,
          1, // Assuming first admin user as creator
        ],
      );
    }

    console.log("🎓 Creating sample applicant user...");

    // Create a sample applicant user (for approved application)
    const applicantPassword = await bcrypt.hash("temp123456", 10);

    await dbRun(
      `
      INSERT INTO users (uuid, name, email, password_hash, type, university_id, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        uuidv4(),
        "Fatima Ahmed",
        "fatima@email.com",
        applicantPassword,
        "applicant",
        "NU24MBA002",
        "Business Administration",
      ],
    );

    // Seed sample students for search/testing if none exist
    const existingStudents = await dbGet(
      `SELECT COUNT(*) as count FROM students`,
    );
    if (!existingStudents || existingStudents.count === 0) {
      console.log("🎒 Seeding sample students for testing...");
      const sampleStudents = [
        {
          university_id: "NU24CS001",
          ugc_id: "UGC2024001",
          program_code: "BSC_CS",
          campus: "Main Campus",
          semester: "Spring 2024",
          full_name: "Md Shariful Islam",
          email: "sharif@example.com",
          mobile_number: "+8801712340001",
          batch: "2024",
        },
        {
          university_id: "NU24BA002",
          ugc_id: "UGC2024002",
          program_code: "BBA",
          campus: "Main Campus",
          semester: "Spring 2024",
          full_name: "Rahat Ahmed",
          email: "rahat@example.com",
          mobile_number: "+8801712340002",
          batch: "2024",
        },
        {
          university_id: "NU24EE003",
          ugc_id: "UGC2024003",
          program_code: "BSC_EEE",
          campus: "Khulna Campus",
          semester: "Fall 2023",
          full_name: "Ayesha Siddique",
          email: "ayesha@example.com",
          mobile_number: "+8801712340003",
          batch: "2023",
        },
      ];

      for (const s of sampleStudents) {
        await dbRun(
          `
          INSERT INTO students (application_id, university_id, ugc_id, program_code, campus_id, semester_id, full_name, email, mobile_number, batch, enrolled_at, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        `,
          [
            null,
            s.university_id,
            s.ugc_id,
            s.program_code,
            null,
            null,
            s.full_name,
            s.email,
            s.mobile_number,
            s.batch,
            1,
          ],
        );
      }
    }

    // Seed registration packages (if not present)
    console.log("📦 Seeding registration packages...");
    const existingPkgs = await dbGet(
      `SELECT COUNT(*) as count FROM registration_packages`,
    );
    if (existingPkgs && existingPkgs.count === 0) {
      const packages = [
        {
          id: "pkg-001",
          program: "LLB (Hon's) Program Fall 2025 (Tri-Semester)",
          term: "Fall 2025",
          mode: "Trimester",
          credits: 137,
          admission_fee: 13000,
          per_credit: 3800,
          fixed_fees: 30000,
          total_estimated: 610000,
        },
        {
          id: "pkg-002",
          program: "MAE Fall 2025",
          term: "Fall 2025",
          mode: "Masters / Evening",
          credits: 36,
          admission_fee: 11200,
          per_credit: 4000,
          fixed_fees: 15000,
          total_estimated: 170000,
        },
        {
          id: "pkg-003",
          program: "Textile Engineering Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 164,
          admission_fee: 13000,
          per_credit: 2600,
          fixed_fees: 35000,
          total_estimated: 500000,
        },
        {
          id: "pkg-004",
          program: "ELL Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 132,
          admission_fee: 13000,
          per_credit: 1500,
          fixed_fees: 20000,
          total_estimated: 220000,
        },
        {
          id: "pkg-005",
          program: "Bangla (Hon's) Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 120,
          admission_fee: 13000,
          per_credit: 1000,
          fixed_fees: 15000,
          total_estimated: 160000,
        },
        {
          id: "pkg-006",
          program: "CSE Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 152,
          admission_fee: 13000,
          per_credit: 3500,
          fixed_fees: 35000,
          total_estimated: 565000,
        },
        {
          id: "pkg-007",
          program: "EEE Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 160,
          admission_fee: 13000,
          per_credit: 2800,
          fixed_fees: 40000,
          total_estimated: 530000,
        },
        {
          id: "pkg-008",
          program: "BBA Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 129,
          admission_fee: 13000,
          per_credit: 3400,
          fixed_fees: 25000,
          total_estimated: 510000,
        },
        {
          id: "pkg-009",
          program: "MPH Fall 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 11200,
          per_credit: 4000,
          fixed_fees: 10000,
          total_estimated: 160000,
        },
        {
          id: "pkg-010",
          program: "LLM Fall 2025",
          term: "Fall 2025",
          mode: "Masters",
          credits: 36,
          admission_fee: 11200,
          per_credit: 4200,
          fixed_fees: 10000,
          total_estimated: 162000,
        },
        {
          id: "pkg-011",
          program: "BSc Mathematics Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 128,
          admission_fee: 13000,
          per_credit: 1200,
          fixed_fees: 15000,
          total_estimated: 170000,
        },
        {
          id: "pkg-012",
          program: "BSc Physics Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 130,
          admission_fee: 13000,
          per_credit: 1400,
          fixed_fees: 15000,
          total_estimated: 185000,
        },
        {
          id: "pkg-013",
          program: "BSc Chemistry Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 130,
          admission_fee: 13000,
          per_credit: 1400,
          fixed_fees: 15000,
          total_estimated: 185000,
        },
        {
          id: "pkg-014",
          program: "BEd Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 120,
          admission_fee: 13000,
          per_credit: 1100,
          fixed_fees: 12000,
          total_estimated: 160000,
        },
        {
          id: "pkg-015",
          program: "BA English Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 120,
          admission_fee: 13000,
          per_credit: 900,
          fixed_fees: 10000,
          total_estimated: 140000,
        },
        {
          id: "pkg-016",
          program: "BSc Economics Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 124,
          admission_fee: 13000,
          per_credit: 1300,
          fixed_fees: 14000,
          total_estimated: 180000,
        },
        {
          id: "pkg-017",
          program: "BBA Evening Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Evening",
          credits: 130,
          admission_fee: 13000,
          per_credit: 2000,
          fixed_fees: 20000,
          total_estimated: 300000,
        },
        {
          id: "pkg-018",
          program: "MBA Executive Fall 2025",
          term: "Fall 2025",
          mode: "Masters / Evening",
          credits: 48,
          admission_fee: 15000,
          per_credit: 5000,
          fixed_fees: 20000,
          total_estimated: 300000,
        },
        {
          id: "pkg-019",
          program: "MSc Physics Fall 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 11200,
          per_credit: 3800,
          fixed_fees: 15000,
          total_estimated: 160000,
        },
        {
          id: "pkg-020",
          program: "MSc Chemistry Fall 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 11200,
          per_credit: 3800,
          fixed_fees: 15000,
          total_estimated: 160000,
        },
        {
          id: "pkg-021",
          program: "MSc Mathematics Fall 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 11200,
          per_credit: 3800,
          fixed_fees: 15000,
          total_estimated: 160000,
        },
        {
          id: "pkg-022",
          program: "BArch Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 160,
          admission_fee: 14000,
          per_credit: 2500,
          fixed_fees: 30000,
          total_estimated: 420000,
        },
        {
          id: "pkg-023",
          program: "MEng Fall 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 48,
          admission_fee: 15000,
          per_credit: 4200,
          fixed_fees: 20000,
          total_estimated: 270000,
        },
        {
          id: "pkg-024",
          program: "PhD Computer Science 2025",
          term: "Fall 2025",
          mode: "PhD",
          credits: 60,
          admission_fee: 20000,
          per_credit: 6000,
          fixed_fees: 30000,
          total_estimated: 420000,
        },
        {
          id: "pkg-025",
          program: "MPhil Economics 2025",
          term: "Fall 2025",
          mode: "Research",
          credits: 48,
          admission_fee: 15000,
          per_credit: 4200,
          fixed_fees: 20000,
          total_estimated: 260000,
        },
        {
          id: "pkg-026",
          program: "BPharm Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 140,
          admission_fee: 14000,
          per_credit: 2200,
          fixed_fees: 25000,
          total_estimated: 350000,
        },
        {
          id: "pkg-027",
          program: "DVM Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 180,
          admission_fee: 15000,
          per_credit: 2000,
          fixed_fees: 30000,
          total_estimated: 380000,
        },
        {
          id: "pkg-028",
          program: "LLB Evening Fall 2025",
          term: "Fall 2025",
          mode: "Bachelor / Evening",
          credits: 140,
          admission_fee: 12000,
          per_credit: 2500,
          fixed_fees: 20000,
          total_estimated: 280000,
        },
        {
          id: "pkg-029",
          program: "BSc Environmental Science 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 128,
          admission_fee: 13000,
          per_credit: 1100,
          fixed_fees: 15000,
          total_estimated: 170000,
        },
        {
          id: "pkg-030",
          program: "MSc Environmental Science 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 11200,
          per_credit: 3500,
          fixed_fees: 12000,
          total_estimated: 150000,
        },
        {
          id: "pkg-031",
          program: "BS Architecture Evening 2025",
          term: "Fall 2025",
          mode: "Bachelor / Evening",
          credits: 160,
          admission_fee: 14000,
          per_credit: 2200,
          fixed_fees: 25000,
          total_estimated: 380000,
        },
        {
          id: "pkg-032",
          program: "BSc Biotechnology 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 132,
          admission_fee: 14000,
          per_credit: 2600,
          fixed_fees: 22000,
          total_estimated: 350000,
        },
        {
          id: "pkg-033",
          program: "MSc Biotechnology 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 12000,
          per_credit: 4000,
          fixed_fees: 15000,
          total_estimated: 180000,
        },
        {
          id: "pkg-034",
          program: "BSc Food Technology 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 128,
          admission_fee: 13000,
          per_credit: 1500,
          fixed_fees: 15000,
          total_estimated: 190000,
        },
        {
          id: "pkg-035",
          program: "MSc Food Technology 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 11200,
          per_credit: 3800,
          fixed_fees: 12000,
          total_estimated: 160000,
        },
        {
          id: "pkg-036",
          program: "BSc Accounting 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 128,
          admission_fee: 13000,
          per_credit: 2000,
          fixed_fees: 15000,
          total_estimated: 230000,
        },
        {
          id: "pkg-037",
          program: "BSc Finance 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 128,
          admission_fee: 13000,
          per_credit: 2000,
          fixed_fees: 15000,
          total_estimated: 230000,
        },
        {
          id: "pkg-038",
          program: "Diploma in Nursing 2025",
          term: "Fall 2025",
          mode: "Diploma",
          credits: 80,
          admission_fee: 8000,
          per_credit: 1200,
          fixed_fees: 10000,
          total_estimated: 110000,
        },
        {
          id: "pkg-039",
          program: "BSc Nursing 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 140,
          admission_fee: 14000,
          per_credit: 1800,
          fixed_fees: 20000,
          total_estimated: 270000,
        },
        {
          id: "pkg-040",
          program: "BFA Fine Arts 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 120,
          admission_fee: 11000,
          per_credit: 900,
          fixed_fees: 10000,
          total_estimated: 140000,
        },
        {
          id: "pkg-041",
          program: "MFA Fine Arts 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 12000,
          per_credit: 3000,
          fixed_fees: 10000,
          total_estimated: 140000,
        },
        {
          id: "pkg-042",
          program: "BSc Statistics 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 128,
          admission_fee: 13000,
          per_credit: 1200,
          fixed_fees: 15000,
          total_estimated: 170000,
        },
        {
          id: "pkg-043",
          program: "MSc Statistics 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 11200,
          per_credit: 3600,
          fixed_fees: 12000,
          total_estimated: 150000,
        },
        {
          id: "pkg-044",
          program: "BSc Geography 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 124,
          admission_fee: 13000,
          per_credit: 1100,
          fixed_fees: 12000,
          total_estimated: 160000,
        },
        {
          id: "pkg-045",
          program: "BA History 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 120,
          admission_fee: 11000,
          per_credit: 900,
          fixed_fees: 10000,
          total_estimated: 135000,
        },
        {
          id: "pkg-046",
          program: "BSc Microbiology 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 132,
          admission_fee: 14000,
          per_credit: 2200,
          fixed_fees: 18000,
          total_estimated: 300000,
        },
        {
          id: "pkg-047",
          program: "MSc Microbiology 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 12000,
          per_credit: 3800,
          fixed_fees: 12000,
          total_estimated: 160000,
        },
        {
          id: "pkg-048",
          program: "BSc Psychology 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 124,
          admission_fee: 12000,
          per_credit: 1100,
          fixed_fees: 12000,
          total_estimated: 150000,
        },
        {
          id: "pkg-049",
          program: "MSc Psychology 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 11200,
          per_credit: 3500,
          fixed_fees: 12000,
          total_estimated: 150000,
        },
        {
          id: "pkg-050",
          program: "BSc Sociology 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 120,
          admission_fee: 11000,
          per_credit: 900,
          fixed_fees: 10000,
          total_estimated: 130000,
        },
        {
          id: "pkg-051",
          program: "BCom 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 128,
          admission_fee: 13000,
          per_credit: 1800,
          fixed_fees: 15000,
          total_estimated: 210000,
        },
        {
          id: "pkg-052",
          program: "BSc Statistics Evening 2025",
          term: "Fall 2025",
          mode: "Bachelor / Evening",
          credits: 128,
          admission_fee: 12000,
          per_credit: 1500,
          fixed_fees: 12000,
          total_estimated: 200000,
        },
        {
          id: "pkg-053",
          program: "BSc Applied Physics 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 128,
          admission_fee: 13000,
          per_credit: 1400,
          fixed_fees: 15000,
          total_estimated: 180000,
        },
        {
          id: "pkg-054",
          program: "MEd 2025",
          term: "Fall 2025",
          mode: "Masters / Evening",
          credits: 36,
          admission_fee: 10000,
          per_credit: 3000,
          fixed_fees: 10000,
          total_estimated: 120000,
        },
        {
          id: "pkg-055",
          program: "PG Diploma in IT 2025",
          term: "Fall 2025",
          mode: "Diploma",
          credits: 30,
          admission_fee: 8000,
          per_credit: 2500,
          fixed_fees: 8000,
          total_estimated: 90000,
        },
        {
          id: "pkg-056",
          program: "Certificate in Web Dev 2025",
          term: "Fall 2025",
          mode: "Short Course",
          credits: 12,
          admission_fee: 5000,
          per_credit: 1500,
          fixed_fees: 2000,
          total_estimated: 26000,
        },
        {
          id: "pkg-057",
          program: "MPhil Computer Science 2025",
          term: "Fall 2025",
          mode: "Research",
          credits: 48,
          admission_fee: 15000,
          per_credit: 4500,
          fixed_fees: 20000,
          total_estimated: 280000,
        },
        {
          id: "pkg-058",
          program: "BSc Statistics Weekend 2025",
          term: "Fall 2025",
          mode: "Bachelor / Weekend",
          credits: 128,
          admission_fee: 12000,
          per_credit: 1300,
          fixed_fees: 12000,
          total_estimated: 190000,
        },
        {
          id: "pkg-059",
          program: "MSc Data Science 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 48,
          admission_fee: 16000,
          per_credit: 5200,
          fixed_fees: 22000,
          total_estimated: 320000,
        },
        {
          id: "pkg-060",
          program: "BSc Data Science 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 140,
          admission_fee: 14000,
          per_credit: 3000,
          fixed_fees: 25000,
          total_estimated: 340000,
        },
        {
          id: "pkg-061",
          program: "BSc Information Systems 2025",
          term: "Fall 2025",
          mode: "Bachelor / Day",
          credits: 132,
          admission_fee: 13000,
          per_credit: 2400,
          fixed_fees: 20000,
          total_estimated: 300000,
        },
        {
          id: "pkg-062",
          program: "MSc Information Systems 2025",
          term: "Fall 2025",
          mode: "Masters / Day",
          credits: 36,
          admission_fee: 12000,
          per_credit: 4200,
          fixed_fees: 15000,
          total_estimated: 170000,
        },
        {
          id: "pkg-063",
          program: "Professional Accounting Cert 2025",
          term: "Fall 2025",
          mode: "Certificate",
          credits: 20,
          admission_fee: 6000,
          per_credit: 1800,
          fixed_fees: 5000,
          total_estimated: 50000,
        },
        {
          id: "pkg-064",
          program: "Executive Diploma in HR 2025",
          term: "Fall 2025",
          mode: "Diploma",
          credits: 24,
          admission_fee: 9000,
          per_credit: 2000,
          fixed_fees: 7000,
          total_estimated: 70000,
        },
      ];

      for (const p of packages) {
        await dbRun(
          `INSERT OR IGNORE INTO registration_packages (id, program, term, mode, credits, admission_fee, per_credit, fixed_fees, total_estimated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.program,
            p.term,
            p.mode,
            p.credits,
            p.admission_fee,
            p.per_credit,
            p.fixed_fees,
            p.total_estimated,
          ],
        );
      }
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📋 Sample Credentials:");
    console.log("🔐 Admin Login:");
    console.log("   Email: admin@nu.edu.bd");
    console.log("   Password: admin123");
    console.log("");
    console.log("🎓 Applicant Login:");
    console.log("   University ID: NU24MBA002");
    console.log("   Password: temp123456");
    console.log("");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await closeDB();
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };
