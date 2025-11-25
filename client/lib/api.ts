import { mockApi } from "./mockApi";
import type {
  LoginCredentials,
  ApiResponse,
  User,
  Application,
} from "./mockApi";

export type { LoginCredentials, ApiResponse, User, Application };

export interface LoginRequest {
  identifier: string;
  password: string;
  type: "applicant" | "admin";
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

class ApiClient {
  private token: string | null = null;
  private serverAvailable: boolean | null = null;

  constructor() {
    try {
      if (typeof localStorage !== "undefined" && localStorage.getItem) {
        this.token = localStorage.getItem("nu_token");
      }
    } catch (e) {
      this.token = null;
    }

    // Probe server availability asynchronously
    this.probeServer();
  }

  private async probeServer() {
    try {
      const res = await fetch("/api/ping", { cache: "no-store" });
      this.serverAvailable = res.ok;
    } catch (e) {
      this.serverAvailable = false;
    }
  }

  setToken(token: string) {
    this.token = token;
    try {
      localStorage.setItem("nu_token", token);
    } catch (e) {}
  }

  clearToken() {
    this.token = null;
    try {
      localStorage.removeItem("nu_token");
    } catch (e) {}
  }

  // Authentication — keep mock login for now
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await mockApi.login(credentials);

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      return {
        success: true,
        data: {
          success: true,
          token: response.data.token,
          user: response.data.user,
        },
      };
    }

    return { success: false, error: response.error || "Login failed" };
  }

  async logout(): Promise<ApiResponse> {
    const response = await mockApi.logout();
    if (response.success) this.clearToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    if (!this.token) return { success: false, error: "No token available" };
    return await mockApi.getCurrentUser(this.token);
  }

  // Applications — keep list on mock to avoid auth mismatch; use server for public create
  async getApplications(params?: any): Promise<ApiResponse> {
    return await mockApi.getApplications(params);
  }

  async getApplication(id: string): Promise<ApiResponse> {
    return await mockApi.getApplication(id);
  }

  async updateApplicationDocument(
    id: string,
    key: string,
    fileMeta: any,
  ): Promise<ApiResponse> {
    return await mockApi.updateApplicationDocument(id, key, fileMeta as any);
  }

  async createApplication(data: any): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/public/admissions/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json };
        // Non-ok -> fallback to mock to avoid blocking applicants
        console.warn(
          "createApplication server returned non-ok",
          res.status,
          json,
        );
        this.serverAvailable = false;
        return await mockApi.createApplication(data);
      } catch (e) {
        console.warn(
          "createApplication server failed, falling back to mock",
          e,
        );
        this.serverAvailable = false;
        return await mockApi.createApplication(data);
      }
    }
    return await mockApi.createApplication(data);
  }

  async updateApplicationStatus(
    id: string,
    status: string,
  ): Promise<ApiResponse> {
    return await mockApi.updateApplicationStatus(id, status);
  }

  async generateApplicationIds(id: string): Promise<ApiResponse> {
    return await mockApi.generateApplicationIds(id);
  }

  async setAcademicVerification(
    id: string,
    verified: boolean,
  ): Promise<ApiResponse> {
    // @ts-ignore
    return await mockApi.setAcademicVerification(id, verified);
  }

  async setPaymentVerification(
    id: string,
    verified: boolean,
  ): Promise<ApiResponse> {
    // @ts-ignore
    return await mockApi.setPaymentVerification(id, verified);
  }

  async getApplicationStats(): Promise<ApiResponse> {
    return await mockApi.getApplicationStats();
  }

  // Mock emails (admin)
  async getMockEmails(): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/mock-emails", {
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json };
        return {
          success: false,
          error: json.error || "Failed to load mock emails",
        };
      } catch (e) {
        console.warn(
          "getMockEmails server failed, falling back to mock (none)",
          e,
        );
      }
    }
    // No mock fallback available �� return empty list
    return { success: true, data: [] };
  }

  // SMS queue management (admin)
  async getSmsQueue(): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/sms", {
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json };
        return {
          success: false,
          error: json.error || "Failed to load sms queue",
        };
      } catch (e) {
        console.warn("getSmsQueue server failed", e);
      }
    }
    return { success: true, data: [] };
  }

  async processSms(all = false): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/sms/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ all }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to process sms" };
    } catch (e) {
      console.warn("processSms failed", e);
      return { success: false, error: String(e) };
    }
  }

  async sendSmsById(sms_id: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ sms_id }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to send sms" };
    } catch (e) {
      console.warn("sendSmsById failed", e);
      return { success: false, error: String(e) };
    }
  }

  async resendMockEmail(emailId: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/mock-emails/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ id: emailId }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to resend email" };
    } catch (e) {
      console.warn("resendMockEmail failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Programs and departments — prefer server when available
  async getPrograms(): Promise<ApiResponse> {
    // If running inside Builder/preview environment, prefer mock to avoid network errors
    try {
      if (
        typeof window !== "undefined" &&
        window.location &&
        window.location.host &&
        window.location.host.includes("builder")
      ) {
        return await mockApi.getPrograms();
      }
    } catch (e) {
      // ignore
    }

    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/programs");
        const json = await res.json().catch(() => ({}));
        if (res.ok)
          return { success: true, data: { programs: json.data || json } };
        return {
          success: false,
          error: json.error || "Failed to load programs",
        };
      } catch (e) {
        console.warn("getPrograms server failed, falling back to mock", e);
      }
    }
    return await mockApi.getPrograms();
  }

  async getRegistrationPackages(): Promise<ApiResponse> {
    // If running inside Builder/preview environment, prefer mock to avoid network errors
    try {
      if (
        typeof window !== "undefined" &&
        window.location &&
        window.location.host &&
        window.location.host.includes("builder")
      ) {
        return await mockApi.getRegistrationPackages();
      }
    } catch (e) {
      // ignore
    }

    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/registration-packages");
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json } as any;
        console.warn(
          "getRegistrationPackages server returned non-ok",
          res.status,
        );
        this.serverAvailable = false;
        return await mockApi.getRegistrationPackages();
      } catch (e) {
        console.warn("getRegistrationPackages server failed", e);
        this.serverAvailable = false;
        return await mockApi.getRegistrationPackages();
      }
    }
    return await mockApi.getRegistrationPackages();
  }

  async createRegistrationPackage(payload: any): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/registration-packages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json } as any;
        console.warn(
          "createRegistrationPackage server returned non-ok",
          res.status,
        );
        this.serverAvailable = false;
        return await mockApi.createRegistrationPackage(payload);
      } catch (e) {
        console.warn("createRegistrationPackage server failed", e);
        this.serverAvailable = false;
        return await mockApi.createRegistrationPackage(payload);
      }
    }
    return await mockApi.createRegistrationPackage(payload);
  }

  async updateRegistrationPackage(
    id: string,
    updates: any,
  ): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(
          `/api/registration-packages/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
            },
            body: JSON.stringify(updates),
          },
        );
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json } as any;
        console.warn(
          "updateRegistrationPackage server returned non-ok",
          res.status,
        );
        this.serverAvailable = false;
        return await mockApi.updateRegistrationPackage(id, updates);
      } catch (e) {
        console.warn("updateRegistrationPackage server failed", e);
        this.serverAvailable = false;
        return await mockApi.updateRegistrationPackage(id, updates);
      }
    }
    return await mockApi.updateRegistrationPackage(id, updates);
  }

  async deleteRegistrationPackage(id: string): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(
          `/api/registration-packages/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            headers: {
              ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
            },
          },
        );
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json } as any;
        console.warn(
          "deleteRegistrationPackage server returned non-ok",
          res.status,
        );
        this.serverAvailable = false;
        return await mockApi.deleteRegistrationPackage(id);
      } catch (e) {
        console.warn("deleteRegistrationPackage server failed", e);
        this.serverAvailable = false;
        return await mockApi.deleteRegistrationPackage(id);
      }
    }
    return await mockApi.deleteRegistrationPackage(id);
  }

  async getDepartments(): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/programs/departments");
        const json = await res.json().catch(() => ({}));
        if (res.ok)
          return { success: true, data: { departments: json.data || json } };
      } catch (e) {
        console.warn("getDepartments server failed, falling back to mock", e);
      }
    }
    return await mockApi.getDepartments();
  }

  async calculateCost(data: {
    program_code: string;
    department_code: string;
    waivers?: Array<{ type: string; value: number }>;
  }): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/programs/calculate-cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json };
      } catch (e) {
        console.warn("calculateCost server failed, falling back to mock", e);
      }
    }
    return await mockApi.calculateCost(data);
  }

  // Referrers and visitors remain mock-backed
  async getReferrers(): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/referrers", {
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          return {
            success: true,
            data: { referrers: json.data || json },
          } as any;
        }
        // Non-ok response -> mark server unavailable and fall back
        console.warn("getReferrers server returned non-ok", res.status);
        this.serverAvailable = false;
        return await mockApi.getReferrers();
      } catch (e) {
        // Network or other fetch error
        console.warn("getReferrers server failed", e);
        this.serverAvailable = false;
        return await mockApi.getReferrers();
      }
    }
    return await mockApi.getReferrers();
  }
  async validateReferrer(employee_id: string): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/referrers/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: JSON.stringify({ employee_id }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json } as any;
        return {
          success: false,
          error: json.error || "Failed to validate referrer",
        };
      } catch (e) {
        console.warn("validateReferrer server failed", e);
      }
    }
    return await mockApi.validateReferrer(employee_id);
  }
  async getReferrerStats(employee_id: string): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(
          `/api/referrers/${encodeURIComponent(employee_id)}/stats`,
          {
            headers: this.token
              ? { Authorization: `Bearer ${this.token}` }
              : {},
          },
        );
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json } as any;
      } catch (e) {
        console.warn("getReferrerStats server failed", e);
      }
    }
    return await mockApi.getReferrerStats(employee_id);
  }
  async getVisitors(params?: any): Promise<ApiResponse> {
    return await mockApi.getVisitors(params);
  }

  // Referral requests (finance)
  async getReferralRequests(): Promise<ApiResponse> {
    if (!this.serverAvailable) return { success: true, data: [] };
    try {
      const res = await fetch("/api/referrals/requests", {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json } as any;
      return {
        success: false,
        error: json.error || "Failed to load referral requests",
      };
    } catch (e) {
      console.warn("getReferralRequests failed", e);
      return { success: false, error: String(e) };
    }
  }

  async approveReferralRequest(
    applicationId: number,
    percentage: number,
  ): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(
        `/api/referrals/requests/${applicationId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: JSON.stringify({ percentage }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json } as any;
      return {
        success: false,
        error: json.error || "Failed to approve referral",
      };
    } catch (e) {
      console.warn("approveReferralRequest failed", e);
      return { success: false, error: String(e) };
    }
  }
  async createVisitor(record: any): Promise<ApiResponse> {
    return await mockApi.createVisitor(record);
  }
  async updateVisitor(id: string, updates: any): Promise<ApiResponse> {
    return await mockApi.updateVisitor(id, updates);
  }
  async deleteVisitor(id: string): Promise<ApiResponse> {
    return await mockApi.deleteVisitor(id);
  }
  async exportVisitors(params?: any): Promise<ApiResponse<any[]>> {
    return await mockApi.exportVisitors(params);
  }

  // Configuration methods ��� prefer server
  async getAdmissionSettings(): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/admission-settings");
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "getAdmissionSettings server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.getAdmissionSettings();
  }

  async updateAdmissionSettings(settings: any): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/admission-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "updateAdmissionSettings server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.updateAdmissionSettings(settings);
  }

  async getPaymentMethods(): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/payment-methods");
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "getPaymentMethods server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.getPaymentMethods();
  }

  async createPaymentMethod(method: any): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(method),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "createPaymentMethod server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.createPaymentMethod(method);
  }

  async updatePaymentMethod(id: string, method: any): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/payment-methods/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(method),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "updatePaymentMethod server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.updatePaymentMethod(id, method);
  }

  async deletePaymentMethod(id: string): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/payment-methods/${id}`, {
          method: "DELETE",
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "deletePaymentMethod server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.deletePaymentMethod(id);
  }

  async getDocumentRequirements(): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/document-requirements");
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "getDocumentRequirements server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.getDocumentRequirements();
  }

  // Server-side export for mock emails. Returns { success, async } or a Blob download
  async serverExportMockEmails(filters: any = {}): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/exports/mock-emails?${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("text/csv")) {
        const blob = await res.blob();
        const disposition = res.headers.get("content-disposition") || "";
        const filename =
          disposition.match(/filename="?(.*)"?/)?.[1] ||
          `mock_emails_${Date.now()}.csv`;
        return { success: true, data: { blob, filename, isFile: true } } as any;
      }
      const json = await res.json().catch(() => ({}));
      return { success: res.ok, data: json } as any;
    } catch (e) {
      console.warn("serverExportMockEmails failed", e);
      return { success: false, error: String(e) };
    }
  }

  async serverExportSms(filters: any = {}): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/exports/sms-queue?${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("text/csv")) {
        const blob = await res.blob();
        const disposition = res.headers.get("content-disposition") || "";
        const filename =
          disposition.match(/filename="?(.*)"?/)?.[1] ||
          `sms_queue_${Date.now()}.csv`;
        return { success: true, data: { blob, filename, isFile: true } } as any;
      }
      const json = await res.json().catch(() => ({}));
      return { success: res.ok, data: json } as any;
    } catch (e) {
      console.warn("serverExportSms failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Admin: list export jobs
  async listExportJobs(): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/exports/jobs", {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to list export jobs",
      };
    } catch (e) {
      console.warn("listExportJobs failed", e);
      return { success: false, error: String(e) };
    }
  }

  async processExportJob(jobId: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/exports/jobs/process/${jobId}`, {
        method: "POST",
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to process job" };
    } catch (e) {
      console.warn("processExportJob failed", e);
      return { success: false, error: String(e) };
    }
  }

  async downloadExportJob(jobId: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/exports/jobs/download/${jobId}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("text/csv")) {
        const blob = await res.blob();
        const disposition = res.headers.get("content-disposition") || "";
        const filename =
          disposition.match(/filename="?(.*)"?/)?.[1] ||
          `export_${jobId}_${Date.now()}.csv`;
        return { success: true, data: { blob, filename, isFile: true } } as any;
      }
      const json = await res.json().catch(() => ({}));
      return { success: res.ok, data: json } as any;
    } catch (e) {
      console.warn("downloadExportJob failed", e);
      return { success: false, error: String(e) };
    }
  }

  async createDocumentRequirement(requirement: any): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/document-requirements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requirement),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "createDocumentRequirement server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.createDocumentRequirement(requirement);
  }

  async updateDocumentRequirement(
    id: string,
    requirement: any,
  ): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/document-requirements/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requirement),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "updateDocumentRequirement server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.updateDocumentRequirement(id, requirement);
  }

  async deleteDocumentRequirement(id: string): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/document-requirements/${id}`, {
          method: "DELETE",
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data };
      } catch (e) {
        console.warn(
          "deleteDocumentRequirement server failed, falling back to mock",
          e,
        );
      }
    }
    return await mockApi.deleteDocumentRequirement(id);
  }

  // Messaging templates
  async getTemplates(): Promise<ApiResponse<any[]>> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/messaging/templates", {
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json };
      } catch (e) {
        console.warn("getTemplates server failed, falling back to local", e);
      }
    }
    try {
      const raw =
        (typeof localStorage !== "undefined" &&
          localStorage.getItem("nu_templates")) ||
        "[]";
      const list = JSON.parse(raw || "[]");
      return { success: true, data: list };
    } catch {
      return { success: true, data: [] };
    }
  }

  async createTemplate(template: any): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch("/api/messaging/templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: JSON.stringify(template),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json };
      } catch (e) {
        console.warn("createTemplate server failed, falling back to local", e);
      }
    }
    try {
      const raw =
        (typeof localStorage !== "undefined" &&
          localStorage.getItem("nu_templates")) ||
        "[]";
      const list = JSON.parse(raw || "[]");
      const item = {
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        ...template,
      };
      list.unshift(item);
      if (typeof localStorage !== "undefined")
        localStorage.setItem("nu_templates", JSON.stringify(list));
      return { success: true, data: item };
    } catch (e) {
      return { success: false, error: "Failed to save template locally" };
    }
  }

  async updateTemplate(id: string, updates: any): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/messaging/templates/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: JSON.stringify(updates),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json };
      } catch (e) {
        console.warn("updateTemplate server failed, falling back to local", e);
      }
    }
    try {
      const list = JSON.parse(localStorage.getItem("nu_templates") || "[]");
      const idx = list.findIndex((t: any) => String(t.id) === String(id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem("nu_templates", JSON.stringify(list));
        return { success: true, data: list[idx] };
      }
      return { success: false, error: "Template not found" };
    } catch (e) {
      return { success: false, error: "Failed to update template locally" };
    }
  }

  async deleteTemplate(id: string): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/messaging/templates/${id}`, {
          method: "DELETE",
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json };
      } catch (e) {
        console.warn("deleteTemplate server failed, falling back to local", e);
      }
    }
    try {
      const list = JSON.parse(localStorage.getItem("nu_templates") || "[]");
      const idx = list.findIndex((t: any) => String(t.id) === String(id));
      if (idx !== -1) {
        list.splice(idx, 1);
        localStorage.setItem("nu_templates", JSON.stringify(list));
        return { success: true };
      }
      return { success: false, error: "Template not found" };
    } catch (e) {
      return { success: false, error: "Failed to delete template locally" };
    }
  }

  // Students & finance remain mocked
  async createStudentRecord(
    applicationId: string,
    ids: { university_id: string; ugc_id?: string; batch?: string },
  ): Promise<ApiResponse> {
    return await mockApi.createStudentRecord(applicationId, ids);
  }

  async generateStudentForApplicant(
    applicantId: string,
  ): Promise<ApiResponse<{ student_id: string; ugc_id: string }>> {
    // In preview/development prefer the mock implementation to avoid calling nonexistent server endpoints
    try {
      return await mockApi.generateStudentForApplicant(applicantId);
    } catch (e) {
      console.warn(
        "mock generateStudentForApplicant failed, attempting server call",
        e,
      );
    }

    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/id/generate-student`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: JSON.stringify({ applicant_id: applicantId }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json } as any;
        console.warn(
          "generateStudentForApplicant server returned non-ok",
          res.status,
        );
        this.serverAvailable = false;
        return await mockApi.generateStudentForApplicant(applicantId);
      } catch (e) {
        console.warn("generateStudentForApplicant server failed", e);
        this.serverAvailable = false;
        return await mockApi.generateStudentForApplicant(applicantId);
      }
    }
    return await mockApi.generateStudentForApplicant(applicantId);
  }

  async getCourses(code?: string): Promise<ApiResponse<any[]>> {
    if (this.serverAvailable) {
      try {
        const qs = code ? `?code=${encodeURIComponent(code)}` : "";
        const res = await fetch(`/api/courses${qs}`, {
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          const data = json.data || json;
          // If server returns an empty array, fallback to mockApi so local mock courses show up in dev
          if (Array.isArray(data) && data.length === 0) {
            this.serverAvailable = false;
            return await mockApi.getCourses(code);
          }
          return { success: true, data } as any;
        }
        console.warn("getCourses server returned non-ok", res.status);
        this.serverAvailable = false;
        return await mockApi.getCourses(code);
      } catch (e) {
        console.warn("getCourses server failed", e);
        this.serverAvailable = false;
        return await mockApi.getCourses(code);
      }
    }
    return await mockApi.getCourses(code);
  }

  async saveTransferCourses(payload: {
    applicant_id: string;
    courses: any[];
  }): Promise<ApiResponse> {
    if (this.serverAvailable) {
      try {
        const res = await fetch(`/api/transfer-courses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) return { success: true, data: json.data || json } as any;
        console.warn("saveTransferCourses server returned non-ok", res.status);
        this.serverAvailable = false;
        return await mockApi.saveTransferCourses(payload);
      } catch (e) {
        console.warn("saveTransferCourses server failed", e);
        this.serverAvailable = false;
        return await mockApi.saveTransferCourses(payload);
      }
    }
    return await mockApi.saveTransferCourses(payload);
  }
  async generateMoneyReceipt(
    applicationId: string,
    amount: number,
  ): Promise<ApiResponse> {
    return await mockApi.generateMoneyReceipt(applicationId, amount);
  }

  // Server-side PDF generation for money receipt
  async generateMoneyReceiptPdf(applicationId: string): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = new URLSearchParams({
        application_id: String(applicationId),
      }).toString();
      const res = await fetch(`/api/pdf/money-receipt?${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/pdf")) {
        const blob = await res.blob();
        const disposition = res.headers.get("content-disposition") || "";
        const filename =
          disposition.match(/filename="?(.*)"?/)?.[1] ||
          `money_receipt_${Date.now()}.pdf`;
        return { success: true, data: { blob, filename, isFile: true } } as any;
      }
      const json = await res.json().catch(() => ({}));
      return { success: res.ok, data: json } as any;
    } catch (e) {
      console.warn("generateMoneyReceiptPdf failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Students
  async getStudent(id: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/students/${id}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to load student" };
    } catch (e) {
      console.warn("getStudent failed", e);
      return { success: false, error: String(e) };
    }
  }

  async updateStudent(id: number, updates: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to update student",
      };
    } catch (e) {
      console.warn("updateStudent failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Academic history
  async getAcademicHistory(applicationId: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = new URLSearchParams({
        application_id: String(applicationId),
      }).toString();
      const res = await fetch(`/api/academic/history?${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load academic history",
      };
    } catch (e) {
      console.warn("getAcademicHistory failed", e);
      return { success: false, error: String(e) };
    }
  }

  async addAcademicHistory(entry: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/academic/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(entry),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to add academic history",
      };
    } catch (e) {
      console.warn("addAcademicHistory failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Credit transfers
  async getCreditTransfers(applicationId: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = new URLSearchParams({
        application_id: String(applicationId),
      }).toString();
      const res = await fetch(`/api/academic/credit-transfers?${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load credit transfers",
      };
    } catch (e) {
      console.warn("getCreditTransfers failed", e);
      return { success: false, error: String(e) };
    }
  }

  async addCreditTransfer(payload: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/academic/credit-transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to create credit transfer",
      };
    } catch (e) {
      console.warn("addCreditTransfer failed", e);
      return { success: false, error: String(e) };
    }
  }

  async calculateCreditEquivalency(items: any[]): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/academic/credit-transfers/calc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ items }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to calculate equivalency",
      };
    } catch (e) {
      console.warn("calculateCreditEquivalency failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Finance / Waivers / Bills
  async getWaiverPolicies(): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/finance/waiver-policies", {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load waiver policies",
      };
    } catch (e) {
      console.warn("getWaiverPolicies failed", e);
      return { success: false, error: String(e) };
    }
  }

  async listWaiverAssignments(applicationId?: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = applicationId
        ? `?application_id=${encodeURIComponent(String(applicationId))}`
        : "";
      const res = await fetch(`/api/finance/waiver-assignments${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load waiver assignments",
      };
    } catch (e) {
      console.warn("listWaiverAssignments failed", e);
      return { success: false, error: String(e) };
    }
  }

  async assignWaiver(payload: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/finance/waiver-assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to assign waiver" };
    } catch (e) {
      console.warn("assignWaiver failed", e);
      return { success: false, error: String(e) };
    }
  }

  async updateWaiverAssignment(id: number, updates: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/finance/waiver-assignments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to update waiver assignment",
      };
    } catch (e) {
      console.warn("updateWaiverAssignment failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Fee packages
  async getFeePackages(): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/finance/fee-packages", {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load fee packages",
      };
    } catch (e) {
      console.warn("getFeePackages failed", e);
      return { success: false, error: String(e) };
    }
  }

  async createFeePackage(payload: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/finance/fee-packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to create fee package",
      };
    } catch (e) {
      console.warn("createFeePackage failed", e);
      return { success: false, error: String(e) };
    }
  }

  async updateFeePackage(id: number, updates: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/finance/fee-packages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to update fee package",
      };
    } catch (e) {
      console.warn("updateFeePackage failed", e);
      return { success: false, error: String(e) };
    }
  }

  async deleteFeePackage(id: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/finance/fee-packages/${id}`, {
        method: "DELETE",
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true };
      return {
        success: false,
        error: json.error || "Failed to delete fee package",
      };
    } catch (e) {
      console.warn("deleteFeePackage failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Bills
  async getStudentBills(
    query: { student_id?: number; application_id?: number } = {},
  ): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = new URLSearchParams(query as any).toString();
      const res = await fetch(`/api/finance/bills?${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to load bills" };
    } catch (e) {
      console.warn("getStudentBills failed", e);
      return { success: false, error: String(e) };
    }
  }

  async createStudentBill(payload: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/finance/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to create bill" };
    } catch (e) {
      console.warn("createStudentBill failed", e);
      return { success: false, error: String(e) };
    }
  }

  async markBillPaid(billId: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/finance/bills/${billId}/pay`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to mark bill paid",
      };
    } catch (e) {
      console.warn("markBillPaid failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Scholarships
  async getScholarships(): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/scholarships", {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load scholarships",
      };
    } catch (e) {
      console.warn("getScholarships failed", e);
      return { success: false, error: String(e) };
    }
  }

  async createScholarship(payload: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/scholarships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to create scholarship",
      };
    } catch (e) {
      console.warn("createScholarship failed", e);
      return { success: false, error: String(e) };
    }
  }

  async listScholarshipAssignments(
    applicationId?: number,
  ): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = applicationId
        ? `?application_id=${encodeURIComponent(String(applicationId))}`
        : "";
      const res = await fetch(`/api/scholarships/assignments${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load scholarship assignments",
      };
    } catch (e) {
      console.warn("listScholarshipAssignments failed", e);
      return { success: false, error: String(e) };
    }
  }

  async assignScholarship(payload: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/scholarships/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to assign scholarship",
      };
    } catch (e) {
      console.warn("assignScholarship failed", e);
      return { success: false, error: String(e) };
    }
  }

  async lockScholarshipAssignment(id: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/scholarships/assignments/${id}/lock`, {
        method: "PUT",
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to lock assignment",
      };
    } catch (e) {
      console.warn("lockScholarshipAssignment failed", e);
      return { success: false, error: String(e) };
    }
  }

  async unlockScholarshipAssignment(id: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/scholarships/assignments/${id}/unlock`, {
        method: "PUT",
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to unlock assignment",
      };
    } catch (e) {
      console.warn("unlockScholarshipAssignment failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Students listing (wraps server /api/students)
  async getStudents(
    params: {
      search?: string;
      program_code?: string;
      semester_id?: number;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<ApiResponse> {
    // If server is not available yet, use mock
    if (this.serverAvailable === false)
      return await mockApi.getStudents(params as any);

    try {
      if (this.serverAvailable) {
        const qs = new URLSearchParams(params as any).toString();
        try {
          const res = await fetch(`/api/students?${qs}`, {
            headers: this.token
              ? { Authorization: `Bearer ${this.token}` }
              : {},
          });
          const json = await res.json().catch(() => ({}));
          if (res.ok) {
            const data = json.data || json;
            // If server returned no students, fallback to mock data for demo
            if (Array.isArray(data.students) && data.students.length === 0) {
              console.warn(
                "Server returned 0 students, falling back to mock students for UI demo",
              );
              return await mockApi.getStudents(params as any);
            }
            return { success: true, data };
          }
          // Non-ok -> fallback to mock
          console.warn("getStudents server returned non-ok", res.status, json);
          this.serverAvailable = false;
          return await mockApi.getStudents(params as any);
        } catch (e) {
          console.warn(
            "getStudents server fetch failed, falling back to mock",
            e,
          );
          this.serverAvailable = false;
          return await mockApi.getStudents(params as any);
        }
      }

      // Default: use mock
      return await mockApi.getStudents(params as any);
    } catch (e) {
      console.warn("getStudents failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Dashboard
  async getDashboardSummary(): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/dashboard/summary", {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load dashboard",
      };
    } catch (e) {
      console.warn("getDashboardSummary failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Notifications / Notices
  async createNotice(payload: any): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch("/api/notifications/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to create notice" };
    } catch (e) {
      console.warn("createNotice failed", e);
      return { success: false, error: String(e) };
    }
  }

  async listNotices(onlyActive = true): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(
        `/api/notifications/notices?onlyActive=${onlyActive ? "1" : "0"}`,
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to load notices" };
    } catch (e) {
      console.warn("listNotices failed", e);
      return { success: false, error: String(e) };
    }
  }

  async getNoticeAttachments(noticeId: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(
        `/api/notifications/notices/${noticeId}/attachments`,
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load attachments",
      };
    } catch (e) {
      console.warn("getNoticeAttachments failed", e);
      return { success: false, error: String(e) };
    }
  }

  async getUserNotifications(
    page = 1,
    limit = 50,
    unreadOnly = false,
  ): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        unreadOnly: unreadOnly ? "1" : "0",
      }).toString();
      const res = await fetch(`/api/notifications/me?${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load notifications",
      };
    } catch (e) {
      console.warn("getUserNotifications failed", e);
      return { success: false, error: String(e) };
    }
  }

  async markNotificationRead(notificationId: number): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true };
      return { success: false, error: json.error || "Failed to mark read" };
    } catch (e) {
      console.warn("markNotificationRead failed", e);
      return { success: false, error: String(e) };
    }
  }

  // Employees (roles)
  async listEmployees(role?: string): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const qs = role ? `?role=${encodeURIComponent(role)}` : "";
      const res = await fetch(`/api/employees${qs}`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return {
        success: false,
        error: json.error || "Failed to load employees",
      };
    } catch (e) {
      console.warn("listEmployees failed", e);
      return { success: false, error: String(e) };
    }
  }

  async assignUserRole(userId: number, roleKey: string): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(`/api/employees/${userId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: JSON.stringify({ role_key: roleKey }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, data: json.data || json };
      return { success: false, error: json.error || "Failed to assign role" };
    } catch (e) {
      console.warn("assignUserRole failed", e);
      return { success: false, error: String(e) };
    }
  }

  async removeUserRole(userId: number, roleKey: string): Promise<ApiResponse> {
    if (!this.serverAvailable)
      return { success: false, error: "Server unavailable" };
    try {
      const res = await fetch(
        `/api/employees/${userId}/roles/${encodeURIComponent(roleKey)}`,
        {
          method: "DELETE",
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        },
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok) return { success: true };
      return { success: false, error: json.error || "Failed to remove role" };
    } catch (e) {
      console.warn("removeUserRole failed", e);
      return { success: false, error: String(e) };
    }
  }
}

const apiClient = new ApiClient();

export default apiClient;

export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const res = await fetch("/api/ping");
    return res.ok;
  } catch (e) {
    return false;
  }
};

export const getDemoCredentials = () => ({
  applicant: {
    identifier: "APP123456",
    password: "temp123456",
    type: "applicant" as const,
  },
  admin: {
    identifier: "admin@nu.edu.bd",
    password: "admin123",
    type: "admin" as const,
  },
});
