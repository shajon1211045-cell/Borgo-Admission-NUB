export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  type: "applicant" | "admin";
  university_id?: string;
  department?: string;
  designation?: string;
}

import { registrationPackages } from "./registrationPackages";

export interface Application {
  id: string;
  uuid: string;
  status: "pending" | "approved" | "rejected" | "payment_pending";
  applicant_name: string;
  university_id?: string;
  student_id?: string;
  email: string;
  phone: string;
  admission_type: "regular" | "credit_transfer";
  program_code: string;
  program_name: string;
  department_code: string;
  department_name: string;
  campus: string;
  semester: string;
  semester_type: string;
  created_at: string;
  personal_info?: any;
  academic_history?: any;
  documents?: any;
  payment_info?: any;
  admission_test_status?: "required" | "not_required" | "completed" | "pending";
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  type: "applicant" | "admin";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class MockApiService {
  private users: User[] = [
    {
      id: 1,
      uuid: "admin-uuid-123",
      name: "Admin User",
      email: "admin@nu.edu.bd",
      type: "admin",
      department: "IT",
      designation: "System Administrator",
    },
    {
      id: 2,
      uuid: "applicant-uuid-123",
      name: "John Doe",
      email: "john@example.com",
      type: "applicant",
      university_id: "APP123456",
    },
  ];

  private applications: Application[] = [
    {
      id: "app-001",
      uuid: "app-uuid-001",
      status: "pending",
      applicant_name: "John Doe",
      university_id: "APP123456",
      email: "john@example.com",
      phone: "+8801234567890",
      admission_type: "regular",
      program_code: "CSE101",
      program_name: "Computer Science & Engineering",
      department_code: "CSE",
      department_name: "Computer Science & Engineering",
      campus: "Main Campus",
      semester: "Spring 2024",
      semester_type: "Regular",
      created_at: "2024-01-15T10:00:00Z",
      admission_test_status: "pending",
      // Academic history for undergrad program: SSC and HSC
      academic_history: [
        {
          academic_history_id: 1,
          application_id: "app-001",
          level: "SSC",
          exam_name: "SSC",
          group_subject: "Science",
          board_university: "Dhaka",
          institute_name: "Govt. High School, Dhaka",
          passing_year: "2016",
          roll_no: "123456",
          registration_no: "654321",
          grade_point: "5.00",
          obtained_class: "First Division",
        },
        {
          academic_history_id: 2,
          application_id: "app-001",
          level: "HSC",
          exam_name: "HSC",
          group_subject: "Science",
          board_university: "Dhaka",
          institute_name: "Govt. College, Dhaka",
          passing_year: "2018",
          roll_no: "234567",
          registration_no: "765432",
          grade_point: "5.00",
          obtained_class: "First Division",
        },
      ],
      documents: {
        photograph: {
          file_name: "rahim_uddin.jpg",
          file_url: "/placeholder.svg",
        },
        ssc_transcript: {
          file_name: "ssc_transcript.pdf",
          file_url: "/placeholder.svg",
        },
        hsc_transcript: {
          file_name: "hsc_transcript.pdf",
          file_url: "/placeholder.svg",
        },
        nid_card: { file_name: "nid_card.jpg", file_url: "/placeholder.svg" },
      },
      fees: [
        {
          id: 1,
          cost_head: "Total Course Fee",
          credits_taken: 12.0,
          cost_amount: 15600.0,
          deductive_amount: 0.0,
          remarks: "Auto created payable during registration entry from ERP",
        },
        {
          id: 2,
          cost_head: "Retake Course Fee",
          credits_taken: 0.0,
          cost_amount: 12000.0,
          deductive_amount: 0.0,
          remarks: "",
        },
        {
          id: 3,
          cost_head: "Semester Fee",
          credits_taken: 0.0,
          cost_amount: 5000.0,
          deductive_amount: 0.0,
          remarks: "",
        },
        {
          id: 4,
          cost_head: "F/Asst.",
          credits_taken: 0.0,
          cost_amount: 1000.0,
          deductive_amount: 0.0,
          remarks: "",
        },
      ],
      waiver: {
        type: "Merit",
        percentage: 30,
        status: "active",
        note: "Applied based on HSC GPA",
      },
      payment_status: "paid",
      admission_test_status: "selected",
    },
    {
      id: "app-002",
      uuid: "app-uuid-002",
      status: "approved",
      applicant_name: "Jane Smith",
      university_id: "APP123457",
      student_id: "NU24CSE001",
      email: "jane@example.com",
      phone: "+8801234567891",
      admission_type: "credit_transfer",
      program_code: "EEE101",
      program_name: "Electrical & Electronic Engineering",
      department_code: "EEE",
      department_name: "Electrical & Electronic Engineering",
      campus: "Main Campus",
      semester: "Spring 2024",
      semester_type: "Regular",
      created_at: "2024-01-14T09:00:00Z",
      admission_test_status: "completed",
    },
  ];

  private programs = [
    {
      code: "CSE101",
      name: "Computer Science & Engineering",
      department_code: "CSE",
      department_name: "Computer Science & Engineering",
      duration: "4 years",
      credit_hours: 144,
      tuition_fee: 125000,
      campus: ["Main Campus", "Uttara Campus"],
    },
    {
      code: "EEE101",
      name: "Electrical & Electronic Engineering",
      department_code: "EEE",
      department_name: "Electrical & Electronic Engineering",
      duration: "4 years",
      credit_hours: 144,
      tuition_fee: 120000,
      campus: ["Main Campus"],
    },
    {
      code: "BBA101",
      name: "Bachelor of Business Administration",
      department_code: "BBA",
      department_name: "Business Administration",
      duration: "4 years",
      credit_hours: 120,
      tuition_fee: 95000,
      campus: ["Main Campus", "Uttara Campus"],
    },
  ];

  private registrationPackages = registrationPackages;

  private departments = [
    { code: "CSE", name: "Computer Science & Engineering" },
    { code: "EEE", name: "Electrical & Electronic Engineering" },
    { code: "BBA", name: "Business Administration" },
    { code: "ENG", name: "English" },
    { code: "LAW", name: "Law" },
  ];

  // Additional sample courses injected directly into the mock API to ensure predictable
  // search results for demos and testing (avoids relying on external syllabusData imports during runtime)
  private sampleCourses: any[] = [
    {
      id: "cse-201",
      name: "Data Structures",
      code: "CSE 201",
      credits: 3,
      type: "theory",
      description:
        "Linear and non-linear data structures, trees, graphs, hashing",
    },
    {
      id: "math-102",
      name: "Calculus II",
      code: "MATH 102",
      credits: 3,
      type: "theory",
      description:
        "Sequences and series, multivariable calculus, partial derivatives",
    },
    {
      id: "eng-102",
      name: "Academic Writing II",
      code: "ENG 102",
      credits: 3,
      type: "theory",
      description: "Advanced academic writing and research skills",
    },
    {
      id: "hist-101",
      name: "World History",
      code: "HIST 101",
      credits: 3,
      type: "theory",
      description:
        "Global historical developments from ancient to modern times",
    },
  ];

  private documentRequirements: any[] = [
    {
      id: 1,
      name: "SSC Certificate",
      type: "academic",
      is_required: true,
      allowed_formats: ["PDF", "JPG", "PNG"],
      max_file_size: "5MB",
      description: "Original SSC certificate or equivalent",
      order_priority: 1,
    },
    {
      id: 2,
      name: "HSC Certificate",
      type: "academic",
      is_required: true,
      allowed_formats: ["PDF", "JPG", "PNG"],
      max_file_size: "5MB",
      description: "Original HSC certificate or equivalent",
      order_priority: 2,
    },
  ];

  private referrers = [
    {
      employee_id: "EMP001",
      name: "Dr. Smith",
      department: "CSE",
      designation: "Professor",
      email: "smith@nu.edu.bd",
      phone: "+8801234567890",
    },
  ];

  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Authentication
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    await this.delay();

    // Demo credentials
    const demoCredentials = [
      {
        identifier: "admin@nu.edu.bd",
        password: "admin123",
        type: "admin" as const,
      },
      {
        identifier: "APP123456",
        password: "temp123456",
        type: "applicant" as const,
      },
    ];

    const matchedDemo = demoCredentials.find(
      (cred) =>
        cred.identifier === credentials.identifier &&
        cred.password === credentials.password &&
        cred.type === credentials.type,
    );

    if (matchedDemo) {
      const user = this.users.find(
        (u) =>
          (u.email === credentials.identifier ||
            u.university_id === credentials.identifier) &&
          u.type === credentials.type,
      );

      if (user) {
        return {
          success: true,
          data: {
            user,
            token: `mock_token_${user.type}_${Date.now()}`,
          },
        };
      }
    }

    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  async getCurrentUser(token: string): Promise<ApiResponse<{ user: User }>> {
    await this.delay(200);

    // Extract user type from token
    if (token.includes("admin")) {
      const user = this.users.find((u) => u.type === "admin");
      return user
        ? { success: true, data: { user } }
        : { success: false, error: "User not found" };
    } else if (token.includes("applicant")) {
      const user = this.users.find((u) => u.type === "applicant");
      return user
        ? { success: true, data: { user } }
        : { success: false, error: "User not found" };
    }

    return { success: false, error: "Invalid token" };
  }

  async logout(): Promise<ApiResponse> {
    await this.delay(200);
    return { success: true, message: "Logged out successfully" };
  }

  // Applications
  async getApplications(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    program_code?: string;
    campus?: string;
    semester?: string;
    admission_type?: string;
    admission_test_status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{ applications: Application[]; total: number }>> {
    await this.delay();

    let filteredApps = [...this.applications];

    if (params?.status && params.status !== "all") {
      filteredApps = filteredApps.filter((app) => app.status === params.status);
    }

    if (params?.program_code) {
      filteredApps = filteredApps.filter(
        (app) => app.program_code === params.program_code,
      );
    }

    if (params?.campus) {
      filteredApps = filteredApps.filter((app) => app.campus === params.campus);
    }

    if (params?.semester) {
      filteredApps = filteredApps.filter(
        (app) => app.semester === params.semester,
      );
    }

    if (params?.admission_type) {
      filteredApps = filteredApps.filter(
        (app) => app.admission_type === params.admission_type,
      );
    }

    if (params?.admission_test_status) {
      filteredApps = filteredApps.filter(
        (app) => app.admission_test_status === params.admission_test_status,
      );
    }

    if (params?.dateFrom) {
      const from = new Date(params.dateFrom);
      filteredApps = filteredApps.filter(
        (app) => new Date(app.created_at) >= from,
      );
    }

    if (params?.dateTo) {
      const to = new Date(params.dateTo);
      filteredApps = filteredApps.filter(
        (app) => new Date(app.created_at) <= to,
      );
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredApps = filteredApps.filter(
        (app) =>
          app.applicant_name.toLowerCase().includes(search) ||
          app.email.toLowerCase().includes(search) ||
          (app.university_id || "").toString().toLowerCase().includes(search) ||
          (app.student_id || "").toString().toLowerCase().includes(search),
      );
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || filteredApps.length;
    const start = (page - 1) * limit;
    const paged = filteredApps.slice(start, start + limit);

    return {
      success: true,
      data: {
        applications: paged,
        total: filteredApps.length,
      },
    };
  }

  async getApplication(
    id: string,
  ): Promise<ApiResponse<{ application: Application }>> {
    await this.delay();

    const application = this.applications.find(
      (app) => app.id === id || app.uuid === id,
    );

    if (application) {
      return { success: true, data: { application } };
    }

    return { success: false, error: "Application not found" };
  }

  async createApplication(data: any): Promise<
    ApiResponse<{
      application: Application;
      university_id: string;
      password: string;
    }>
  > {
    await this.delay();

    // Check program limits before creating application
    const programKey = `${data.program_code}_${data.department_code}`;

    // Get current settings (in real app, this would be from database)
    const settings = await this.getAdmissionSettings();
    const programLimits = settings.data?.program_limits || {};

    // Check if program limit enforcement is enabled for this program
    const programLimit = programLimits[programKey];
    if (programLimit && programLimit.enabled) {
      // Count current applications for this program-department combination
      const currentCount = this.applications.filter(
        (app) =>
          app.program_code === data.program_code &&
          app.department_code === data.department_code &&
          app.status !== "rejected", // Don't count rejected applications
      ).length;

      // Check if limit is reached
      if (currentCount >= programLimit.max_applicants) {
        return {
          success: false,
          error: `Application limit reached for ${data.program_name} in ${data.department_name}. Maximum ${programLimit.max_applicants} applications allowed. Please try a different program or contact admissions office.`,
        };
      }
    }

    const newId = `app-${String(this.applications.length + 1).padStart(3, "0")}`;
    const universityId = `APP${String(Date.now()).slice(-6)}`;
    const password = `temp${Math.random().toString().slice(-6)}`;

    const newApplication: Application = {
      id: newId,
      uuid: `app-uuid-${newId}`,
      status: "pending",
      applicant_name: `${data.first_name} ${data.last_name}`,
      university_id: universityId,
      email: data.email,
      phone: data.phone,
      admission_type: data.admission_type || "regular",
      program_code: data.program_code,
      program_name: data.program_name,
      department_code: data.department_code,
      department_name: data.department_name,
      campus: data.campus,
      semester: data.semester,
      semester_type: data.semester_type,
      created_at: new Date().toISOString(),
      personal_info: data,
      academic_history: data.academic_history,
      documents: data.documents,
      admission_test_status: data.admission_test_status || "pending",
    };

    this.applications.push(newApplication);

    return {
      success: true,
      data: {
        application: newApplication,
        university_id: universityId,
        password: password,
      },
    };
  }

  async updateApplicationStatus(
    id: string,
    status: string,
  ): Promise<ApiResponse> {
    await this.delay();

    const appIndex = this.applications.findIndex(
      (app) => app.id === id || app.uuid === id,
    );

    if (appIndex === -1) {
      return { success: false, error: "Application not found" };
    }

    this.applications[appIndex].status = status as any;

    // Generate student ID if approved
    if (status === "approved" && !this.applications[appIndex].student_id) {
      const year = new Date().getFullYear().toString().slice(-2);
      const deptCode = this.applications[appIndex].department_code;
      const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(
        3,
        "0",
      );
      this.applications[appIndex].student_id =
        `NU${year}${deptCode}${sequence}`;
    }

    return {
      success: true,
      message: "Application status updated successfully",
    };
  }

  async setAcademicVerification(
    id: string,
    verified: boolean,
  ): Promise<ApiResponse> {
    await this.delay();
    const appIndex = this.applications.findIndex(
      (app) => app.id === id || app.uuid === id,
    );
    if (appIndex === -1)
      return { success: false, error: "Application not found" };
    this.applications[appIndex].academic_verified = !!verified;
    return { success: true, data: { academic_verified: !!verified } };
  }

  async setPaymentVerification(
    id: string,
    verified: boolean,
  ): Promise<ApiResponse> {
    await this.delay();
    const appIndex = this.applications.findIndex(
      (app) => app.id === id || app.uuid === id,
    );
    if (appIndex === -1)
      return { success: false, error: "Application not found" };
    this.applications[appIndex].payment_verified = !!verified;
    // keep payment_status field in sync
    this.applications[appIndex].payment_status = !!verified
      ? "verified"
      : this.applications[appIndex].payment_status || "pending";
    return { success: true, data: { payment_verified: !!verified } };
  }

  // Update application document (mock file upload)
  async updateApplicationDocument(
    id: string,
    key: string,
    fileMeta: any,
  ): Promise<ApiResponse> {
    await this.delay();
    const appIndex = this.applications.findIndex(
      (app) => app.id === id || app.uuid === id,
    );
    if (appIndex === -1)
      return { success: false, error: "Application not found" };

    const application = this.applications[appIndex];
    application.documents = application.documents || {};
    application.documents[key] = {
      file_name: fileMeta.file_name || fileMeta.name || "uploaded_file",
      file_url:
        fileMeta.file_url ||
        fileMeta.url ||
        `https://example.com/files/${Date.now()}`,
      uploaded_on: new Date().toISOString(),
    };

    return { success: true, data: { document: application.documents[key] } };
  }

  async generateApplicationIds(id: string): Promise<
    ApiResponse<{
      university_id: string;
      password: string;
      ugc_id?: string;
      batch?: string;
    }>
  > {
    await this.delay();

    const universityId = `APP${String(Date.now()).slice(-6)}`;
    const password = `temp${Math.random().toString().slice(-6)}`;
    const ugcId = `UGC${String(Date.now()).slice(-5)}`;
    const batch = `Spring ${new Date().getFullYear()}`;
    const generatedEmail = `${universityId.toLowerCase()}@nu.edu.bd`;

    return {
      success: true,
      data: {
        university_id: universityId,
        password: password,
        ugc_id: ugcId,
        batch,
        generated_email: generatedEmail,
      },
    };
  }

  async getApplicationStats(): Promise<ApiResponse> {
    await this.delay();

    const stats = {
      total: this.applications.length,
      pending: this.applications.filter((app) => app.status === "pending")
        .length,
      approved: this.applications.filter((app) => app.status === "approved")
        .length,
      rejected: this.applications.filter((app) => app.status === "rejected")
        .length,
      payment_pending: this.applications.filter(
        (app) => app.status === "payment_pending",
      ).length,
      credit_transfer: this.applications.filter(
        (app) => app.admission_type === "credit_transfer",
      ).length,
      admission_test_required: this.applications.filter(
        (app) => app.admission_test_status === "required",
      ).length,
      academic_verified: this.applications.filter(
        (app) => app.academic_verified,
      ).length,
      payment_verified: this.applications.filter((app) => app.payment_verified)
        .length,
      admission_test_completed: this.applications.filter(
        (app) => app.admission_test_status === "completed",
      ).length,
    };

    return { success: true, data: stats };
  }

  // Programs
  async getPrograms(): Promise<ApiResponse> {
    await this.delay();
    return { success: true, data: { programs: this.programs } };
  }

  async getRegistrationPackages(): Promise<ApiResponse> {
    await this.delay();
    return { success: true, data: this.registrationPackages };
  }

  async createRegistrationPackage(payload: any): Promise<ApiResponse> {
    await this.delay(150);
    const id = `pkg-${String(this.registrationPackages.length + 1).padStart(3, "0")}`;
    const pkg = { id, ...payload };
    this.registrationPackages.push(pkg);
    return { success: true, data: pkg };
  }

  async updateRegistrationPackage(
    id: string,
    updates: any,
  ): Promise<ApiResponse> {
    await this.delay(150);
    const idx = this.registrationPackages.findIndex((p: any) => p.id === id);
    if (idx === -1) return { success: false, error: "Package not found" };
    this.registrationPackages[idx] = {
      ...this.registrationPackages[idx],
      ...updates,
    };
    return { success: true, data: this.registrationPackages[idx] };
  }

  async deleteRegistrationPackage(id: string): Promise<ApiResponse> {
    await this.delay(150);
    const idx = this.registrationPackages.findIndex((p: any) => p.id === id);
    if (idx === -1) return { success: false, error: "Package not found" };
    this.registrationPackages.splice(idx, 1);
    return { success: true, data: { deleted: true } };
  }

  async getDepartments(): Promise<ApiResponse> {
    await this.delay();
    return { success: true, data: { departments: this.departments } };
  }

  async calculateCost(data: {
    program_code: string;
    department_code: string;
    waivers?: Array<{ type: string; value: number }>;
  }): Promise<ApiResponse> {
    await this.delay();

    const program = this.programs.find((p) => p.code === data.program_code);
    if (!program) {
      return { success: false, error: "Program not found" };
    }

    let totalCost = program.tuition_fee;
    const additionalFees = {
      admission_fee: 5000,
      registration_fee: 2000,
      library_fee: 1000,
      lab_fee: 3000,
    };

    let waiverAmount = 0;
    if (data.waivers) {
      waiverAmount = data.waivers.reduce(
        (sum, waiver) => sum + waiver.value,
        0,
      );
    }

    const breakdown = {
      tuition_fee: program.tuition_fee,
      additional_fees: additionalFees,
      total_additional: Object.values(additionalFees).reduce(
        (sum, fee) => sum + fee,
        0,
      ),
      waiver_amount: waiverAmount,
      grand_total:
        totalCost +
        Object.values(additionalFees).reduce((sum, fee) => sum + fee, 0) -
        waiverAmount,
    };

    return { success: true, data: breakdown };
  }

  // Referrers
  async getReferrers(): Promise<ApiResponse> {
    await this.delay();
    return { success: true, data: { referrers: this.referrers } };
  }

  async validateReferrer(employee_id: string): Promise<ApiResponse> {
    await this.delay();

    const referrer = this.referrers.find((r) => r.employee_id === employee_id);

    if (referrer) {
      return { success: true, data: { referrer, valid: true } };
    }

    return {
      success: false,
      data: { valid: false },
      error: "Referrer not found",
    };
  }

  async getReferrerStats(employee_id: string): Promise<ApiResponse> {
    await this.delay();

    // Mock stats
    const stats = {
      total_referrals: Math.floor(Math.random() * 20) + 1,
      successful_admissions: Math.floor(Math.random() * 15) + 1,
      pending_applications: Math.floor(Math.random() * 5),
      commission_earned: Math.floor(Math.random() * 50000) + 10000,
    };

    return { success: true, data: stats };
  }

  // Configuration Methods
  async getAdmissionSettings(): Promise<ApiResponse> {
    await this.delay();

    // Calculate current applicant counts for each program
    const programLimits = {
      // Bachelor's programs
      bachelor_cse: {
        max_applicants: 100,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "bachelor" &&
            app.department_code === "cse" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      bachelor_eee: {
        max_applicants: 80,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "bachelor" &&
            app.department_code === "eee" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      bachelor_ce: {
        max_applicants: 60,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "bachelor" &&
            app.department_code === "ce" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      bachelor_architecture: {
        max_applicants: 40,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "bachelor" &&
            app.department_code === "architecture" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      bachelor_bba: {
        max_applicants: 120,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "bachelor" &&
            app.department_code === "bba" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      bachelor_law: {
        max_applicants: 50,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "bachelor" &&
            app.department_code === "law" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      bachelor_pharmacy: {
        max_applicants: 60,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "bachelor" &&
            app.department_code === "pharmacy" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      bachelor_english: {
        max_applicants: 40,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "bachelor" &&
            app.department_code === "english" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      // Master's programs
      masters_cse: {
        max_applicants: 30,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "masters" &&
            app.department_code === "cse" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      masters_eee: {
        max_applicants: 25,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "masters" &&
            app.department_code === "eee" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
      masters_bba: {
        max_applicants: 40,
        current_applicants: this.applications.filter(
          (app) =>
            app.program_code === "masters" &&
            app.department_code === "bba" &&
            app.status !== "rejected",
        ).length,
        enabled: true,
      },
    };

    const settings = {
      application_start_date: "2024-09-01",
      application_deadline: "2024-12-31",
      late_fee_deadline: "2024-12-15",
      session_name: "Spring 2024",
      admission_fee: 2000,
      late_fee: 500,
      max_waiver_percentage: 25,
      is_admission_open: true,
      allow_application_editing: true,
      waiver_enabled: true,
      auto_approve_applications: false,
      require_payment_for_review: false,
      enable_sms_notifications: true,
      enable_email_notifications: true,
      contact_email: "admissions@nu.edu.bd",
      contact_phone: "+8801234567890",
      help_desk_hours: "9:00 AM - 5:00 PM (Monday to Friday)",
      // Eligibility Configuration
      eligibility_check_enabled: true,
      strict_eligibility_enforcement: true,
      allow_eligibility_override: false,
      minimum_ssc_gpa: 2.5,
      minimum_hsc_gpa: 2.5,
      minimum_bachelor_gpa: 2.5,
      minimum_master_gpa: 3.0,
      allow_alternative_qualifications: true,
      show_suggested_programs: true,
      eligibility_warning_threshold: 0.2,
      // Waiver Configuration
      max_combined_waiver: 100,
      require_document_verification_for_waiver: true,
      auto_calculate_result_waiver: true,
      allow_manual_waiver_override: true,
      // Admission Test Configuration
      law_admission_test_date: "2024-12-15",
      architecture_admission_test_date: "2024-12-16",
      admission_test_fee: 1500,
      law_test_time: "10:00 AM - 12:00 PM",
      architecture_test_time: "2:00 PM - 4:00 PM",
      law_test_venue_main:
        "Northern University Bangladesh, Main Campus, Dhaka - Room 101",
      law_test_venue_khulna:
        "Northern University Bangladesh, Khulna Campus - Room 201",
      architecture_test_venue_main:
        "Northern University Bangladesh, Main Campus, Dhaka - Drawing Hall",
      architecture_test_venue_khulna:
        "Northern University Bangladesh, Khulna Campus - Art Studio",
      // Program Limits Configuration
      program_limits: programLimits,
    };

    return { success: true, data: settings };
  }

  async updateAdmissionSettings(settings: any): Promise<ApiResponse> {
    await this.delay();
    return { success: true, message: "Settings updated successfully" };
  }

  async getPaymentMethods(): Promise<ApiResponse> {
    await this.delay();

    const paymentMethods = [
      {
        id: 1,
        name: "bKash",
        type: "mobile_banking",
        enabled: true,
        account_number: "01700000000",
        instructions: "Send money to this number and upload receipt",
        processing_fee: 0,
        minimum_amount: 100,
        maximum_amount: 500000,
        is_active: true,
        order_priority: 1,
      },
      {
        id: 2,
        name: "Rocket",
        type: "mobile_banking",
        enabled: true,
        account_number: "017000000000",
        instructions: "Send money to this number and upload receipt",
        processing_fee: 0,
        minimum_amount: 100,
        maximum_amount: 500000,
        is_active: true,
        order_priority: 2,
      },
      {
        id: 3,
        name: "Bank Transfer",
        type: "bank",
        enabled: true,
        account_number: "1234567890",
        bank_name: "Example Bank Ltd",
        routing_number: "123456789",
        instructions: "Transfer to this bank account and upload receipt",
        processing_fee: 50,
        minimum_amount: 1000,
        maximum_amount: 1000000,
        is_active: true,
        order_priority: 3,
      },
    ];

    return { success: true, data: paymentMethods };
  }

  async createPaymentMethod(method: any): Promise<ApiResponse> {
    await this.delay();
    return { success: true, message: "Payment method created successfully" };
  }

  async updatePaymentMethod(id: string, method: any): Promise<ApiResponse> {
    await this.delay();
    return { success: true, message: "Payment method updated successfully" };
  }

  async deletePaymentMethod(id: string): Promise<ApiResponse> {
    await this.delay();
    return { success: true, message: "Payment method deleted successfully" };
  }

  async getDocumentRequirements(): Promise<ApiResponse> {
    await this.delay();

    const requirements = [
      {
        id: 1,
        name: "SSC Certificate",
        type: "academic",
        is_required: true,
        allowed_formats: ["PDF", "JPG", "PNG"],
        max_file_size: "5MB",
        description: "Original SSC certificate or equivalent",
        order_priority: 1,
      },
      {
        id: 2,
        name: "HSC Certificate",
        type: "academic",
        is_required: true,
        allowed_formats: ["PDF", "JPG", "PNG"],
        max_file_size: "5MB",
        description: "Original HSC certificate or equivalent",
        order_priority: 2,
      },
    ];

    return { success: true, data: requirements };
  }

  async createDocumentRequirement(
    requirement: any,
  ): Promise<ApiResponse<{ requirement: any }>> {
    await this.delay();
    const id =
      Math.max(0, ...this.documentRequirements.map((d: any) => d.id)) + 1 || 1;
    const rec = { id, ...requirement };
    // ensure array exists
    (this as any).documentRequirements =
      (this as any).documentRequirements || [];
    (this as any).documentRequirements.push(rec);
    return { success: true, data: { requirement: rec } };
  }

  async updateDocumentRequirement(
    id: string,
    requirement: any,
  ): Promise<ApiResponse<{ requirement: any }>> {
    await this.delay();
    const idx = ((this as any).documentRequirements || []).findIndex(
      (d: any) => String(d.id) === String(id),
    );
    if (idx === -1)
      return { success: false, error: "Document requirement not found" };
    (this as any).documentRequirements[idx] = {
      ...((this as any).documentRequirements[idx] || {}),
      ...requirement,
    };
    return {
      success: true,
      data: { requirement: (this as any).documentRequirements[idx] },
    };
  }

  async deleteDocumentRequirement(id: string): Promise<ApiResponse> {
    await this.delay();
    const arr = (this as any).documentRequirements || [];
    const idx = arr.findIndex((d: any) => String(d.id) === String(id));
    if (idx === -1)
      return { success: false, error: "Document requirement not found" };
    arr.splice(idx, 1);
    return { success: true, message: "Deleted" };
  }
  // Visitors log (offline entries by admission officers)
  private visitors: any[] = [
    {
      id: "vis-001",
      visit_date: "2024-02-01",
      campus: "Main Campus",
      visitor_name: "Mr. Rahim",
      district: "Dhaka",
      no_of_visitors: 1,
      contact_number: "+8801712345678",
      interested_in: "CSE101",
      sms_sent: false,
      remarks: "Walk-in enquiry",
      created_at: "2024-02-01T10:00:00Z",
    },
  ];

  async getVisitors(params?: {
    page?: number;
    limit?: number;
    campus?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<ApiResponse<{ visitors: any[]; total: number }>> {
    await this.delay();
    let list = [...this.visitors];
    if (params?.campus) list = list.filter((v) => v.campus === params.campus);
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (v) =>
          v.visitor_name.toLowerCase().includes(s) ||
          (v.contact_number || "").includes(s) ||
          (v.district || "").toLowerCase().includes(s),
      );
    }
    if (params?.dateFrom) {
      const from = new Date(params.dateFrom);
      list = list.filter((v) => new Date(v.visit_date) >= from);
    }
    if (params?.dateTo) {
      const to = new Date(params.dateTo);
      list = list.filter((v) => new Date(v.visit_date) <= to);
    }
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);
    return { success: true, data: { visitors: paged, total: list.length } };
  }

  async createVisitor(record: any): Promise<ApiResponse<{ visitor: any }>> {
    await this.delay();
    const id = `vis-${String(this.visitors.length + 1).padStart(3, "0")}`;
    const rec = { id, created_at: new Date().toISOString(), ...record };
    this.visitors.push(rec);
    return { success: true, data: { visitor: rec } };
  }

  async updateVisitor(id: string, updates: any): Promise<ApiResponse> {
    await this.delay();
    const idx = this.visitors.findIndex((v) => v.id === id);
    if (idx === -1) return { success: false, error: "Visitor not found" };
    this.visitors[idx] = {
      ...this.visitors[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return { success: true, data: { visitor: this.visitors[idx] } };
  }

  async deleteVisitor(id: string): Promise<ApiResponse> {
    await this.delay();
    const idx = this.visitors.findIndex((v) => v.id === id);
    if (idx === -1) return { success: false, error: "Visitor not found" };
    this.visitors.splice(idx, 1);
    return { success: true, message: "Deleted" };
  }

  async exportVisitors(params?: any): Promise<ApiResponse<any[]>> {
    await this.delay();
    // For simplicity, return all matching visitors without pagination
    const res = await this.getVisitors({ page: 1, limit: 10000, ...params });
    if (res.success && res.data)
      return { success: true, data: res.data.visitors };
    return { success: false, error: "Failed to export" };
  }

  // Students (created after approval) - seeded for demo/search
  private students: any[] = [
    {
      id: "stu-1",
      student_id: 1001,
      ugc_id: "UGC2024001",
      full_name: "Md Shariful Islam",
      name: "Md Shariful Islam",
      program_code: "CSE101",
      program_name: "Computer Science & Engineering",
      campus: "Main Campus",
      batch: "Spring 2024",
      mobile_number: "+8801712340001",
      email: "sharif@example.com",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "stu-2",
      student_id: 1002,
      ugc_id: "UGC2024002",
      full_name: "Rahat Ahmed",
      name: "Rahat Ahmed",
      program_code: "BBA101",
      program_name: "Bachelor of Business Administration",
      campus: "Main Campus",
      batch: "Spring 2024",
      mobile_number: "+8801712340002",
      email: "rahat@example.com",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "stu-3",
      student_id: 1003,
      ugc_id: "UGC2024003",
      full_name: "Ayesha Siddique",
      name: "Ayesha Siddique",
      program_code: "EEE101",
      program_name: "Electrical & Electronic Engineering",
      campus: "Khulna Campus",
      batch: "Fall 2023",
      mobile_number: "+8801712340003",
      email: "ayesha@example.com",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "stu-4",
      student_id: 1004,
      ugc_id: "UGC2024004",
      full_name: "Rahim Uddin",
      name: "Rahim Uddin",
      program_code: "CSE101",
      program_name: "Computer Science & Engineering",
      campus: "Uttara Campus",
      batch: "Spring 2023",
      mobile_number: "+8801712340004",
      email: "rahim@example.com",
      is_active: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "stu-5",
      student_id: 1005,
      ugc_id: "UGC2024005",
      full_name: "Samina Akter",
      name: "Samina Akter",
      program_code: "BBA101",
      program_name: "Bachelor of Business Administration",
      campus: "Main Campus",
      batch: "Fall 2022",
      mobile_number: "+8801712340005",
      email: "samina@example.com",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "stu-6",
      student_id: 1006,
      ugc_id: "UGC2024006",
      full_name: "Tanvir Hossain",
      name: "Tanvir Hossain",
      program_code: "BSC_EEE",
      program_name: "BSc Electrical & Electronic Engineering",
      campus: "Main Campus",
      batch: "Spring 2024",
      mobile_number: "+8801712340006",
      email: "tanvir@example.com",
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  async createStudentRecord(
    applicationId: string,
    ids: { university_id: string; ugc_id?: string; batch?: string },
  ): Promise<ApiResponse<{ student: any }>> {
    await this.delay();
    const app = this.applications.find(
      (a) => a.id === applicationId || a.uuid === applicationId,
    );
    if (!app) return { success: false, error: "Application not found" };

    const student = {
      id: `stu-${this.students.length + 1}`,
      student_id: ids.university_id || `NU${String(Date.now()).slice(-6)}`,
      ugc_id: ids.ugc_id || null,
      name: app.applicant_name,
      email: app.email,
      phone: app.phone,
      program_code: app.program_code,
      program_name: app.program_name,
      department_code: app.department_code,
      batch: ids.batch || app.semester,
      created_at: new Date().toISOString(),
    };

    this.students.push(student);

    // Link student_id back to application
    const appIndex = this.applications.findIndex(
      (a) => a.id === applicationId || a.uuid === applicationId,
    );
    if (appIndex !== -1) {
      this.applications[appIndex].student_id = student.student_id;
    }

    return { success: true, data: { student } };
  }

  // Generate Student ID (backend-like mock)
  async generateStudentForApplicant(
    applicantId: string,
  ): Promise<ApiResponse<{ student_id: string; ugc_id: string }>> {
    await this.delay(200);
    const appIndex = this.applications.findIndex(
      (a) => a.id === applicantId || a.uuid === applicantId,
    );
    if (appIndex === -1)
      return { success: false, error: "Application not found" };

    const app = this.applications[appIndex];

    // Program abbreviation
    const programAbbr =
      (app.program_code || app.program_name || "GEN")
        .toString()
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 5) || "GEN";

    // Campus code (ensure two digits)
    const campusRaw = (app.campus || "01").toString();
    const campusCode = (campusRaw + "00").slice(0, 2);

    // Year (last two digits)
    const year = new Date().getFullYear().toString().slice(-2);

    // Department code: try to derive from department_code or department_name
    const deptRaw = (app.department_code || app.department_name || "")
      .toString()
      .toLowerCase();
    const deptMap: Record<string, string> = {
      bba: "01",
      business: "01",
      cse: "02",
      computer: "02",
      eee: "03",
      civil: "04",
      architecture: "05",
      law: "06",
    };
    let deptCode = "00";
    for (const k of Object.keys(deptMap)) {
      if (deptRaw.includes(k)) {
        deptCode = deptMap[k];
        break;
      }
    }
    if (deptCode === "00") {
      // fallback: hash first two letters
      const chars = deptRaw.slice(0, 2).padEnd(2, "x");
      deptCode = ((chars.charCodeAt(0) + chars.charCodeAt(1)) % 99)
        .toString()
        .padStart(2, "0");
    }

    // Serial: count existing students with same campus+year+dept and increment
    const serialBase =
      this.students.filter((s) =>
        (s.student_id || "")
          .toString()
          .includes(`${campusCode}${year}${deptCode}`),
      ).length + 1;
    const serial = String(serialBase).padStart(5, "0");

    const student_id = `${programAbbr}-${campusCode}${year}${deptCode}${serial}`;

    // UGC ID: UNIV(029) FAC(04) DISC(08) PROGRAM_LEVEL(01) YEAR SERIAL
    const univ = "029";
    const faculty = "04";
    const discipline = "08";
    const programLevel = "01";
    const ugcSerial = String(this.students.length + 1).padStart(5, "0");
    const ugc_id = `${univ}${faculty}${discipline}${programLevel}${year}${ugcSerial}`;

    // Save student record
    const student = {
      id: `stu-${this.students.length + 1}`,
      student_id,
      ugc_id,
      name: app.applicant_name,
      email: app.email,
      phone: app.phone,
      program_code: app.program_code,
      program_name: app.program_name,
      department_code: app.department_code,
      batch: app.semester,
      created_at: new Date().toISOString(),
    };
    this.students.push(student);

    // Link back to application
    this.applications[appIndex].student_id = student_id;
    this.applications[appIndex].id_generation = { student_id, ugc_id };

    return { success: true, data: { student_id, ugc_id } };
  }

  // Courses search
  async getCourses(code?: string): Promise<ApiResponse<any[]>> {
    await this.delay(150);
    try {
      const { getAllCourses } = await import("./syllabusData");
      let courses = getAllCourses();

      // Merge in sampleCourses (ensure uniqueness by id) so demo courses always available
      const mergedById: Record<string, any> = {};
      // prefer syllabus data, then sampleCourses - but include both sets
      (this.sampleCourses || []).forEach((c: any) => {
        mergedById[c.id] = c;
      });
      (courses || []).forEach((c: any) => {
        mergedById[c.id] = { ...(mergedById[c.id] || {}), ...c };
      });
      courses = Object.values(mergedById);

      if (code) {
        const q = code.toLowerCase();
        courses = courses.filter(
          (c: any) =>
            (c.id || "").toLowerCase().includes(q) ||
            (c.code || "").toLowerCase().includes(q) ||
            (c.title || "").toLowerCase().includes(q) ||
            (c.name || "").toLowerCase().includes(q),
        );
      }

      // Normalize course objects to include both 'title' and 'name' for UI compatibility
      const normalized = (courses || []).map((c: any) => ({
        ...c,
        title: c.title || c.name || c.code || c.id,
        name: c.name || c.title || c.code || c.id,
      }));
      // Debug log to help trace search behavior in the browser console
      try {
        console.debug(
          "[mockApi.getCourses] query=",
          code,
          "matches=",
          normalized.length,
          normalized.slice(0, 10),
        );
      } catch (err) {}
      return { success: true, data: normalized };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  async saveTransferCourses(payload: {
    applicant_id: string;
    courses: any[];
  }): Promise<ApiResponse> {
    await this.delay(150);
    const appIndex = this.applications.findIndex(
      (a) => a.id === payload.applicant_id || a.uuid === payload.applicant_id,
    );
    if (appIndex === -1)
      return { success: false, error: "Application not found" };
    // Attach transfer courses to application record
    this.applications[appIndex].transfer_courses = payload.courses;
    return { success: true, data: { saved: true } };
  }

  async generateMoneyReceipt(
    applicationId: string,
    amount: number,
  ): Promise<ApiResponse<{ mr_number: string; receipt_url: string }>> {
    await this.delay(300);

    const app = this.applications.find(
      (a) => a.id === applicationId || a.uuid === applicationId,
    );
    if (!app) return { success: false, error: "Application not found" };

    const mr_number = `MR-${Date.now()}`;
    const receipt = `Receipt for ${app.applicant_name}\nApplication: ${app.id}\nAmount: BDT ${amount}\nMR No: ${mr_number}`;
    const blob = new Blob([receipt], { type: "text/plain" });
    const receipt_url = URL.createObjectURL(blob);

    return { success: true, data: { mr_number, receipt_url } };
  }
}

// Export singleton
export const mockApi = new MockApiService();
