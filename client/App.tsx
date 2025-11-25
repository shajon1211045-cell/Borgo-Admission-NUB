import "./global.css";

import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { setupFormNoCache, preventFormCaching } from "./lib/formUtils";

// Application Pages
import Index from "./pages/Index";
import ProgramSelection from "./pages/ProgramSelection";
import PersonalInformation from "./pages/PersonalInformation";
import AcademicHistory from "./pages/AcademicHistory";
import ApplicationReview from "./pages/ApplicationReview";
import ApplicationSuccess from "./pages/ApplicationSuccess";
import NotFound from "./pages/NotFound";

// Portal Pages
import ApplicantLogin from "./pages/ApplicantLogin";
import PaymentPortal from "./pages/PaymentPortal";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import ReviewPayment from "./pages/ReviewPayment";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdmissionOfficerLogin from "./pages/AdmissionOfficerLogin";
import FinanceOfficerLogin from "./pages/FinanceOfficerLogin";
import OfflineAdmission from "./pages/OfflineAdmission";
import OfflineOfficerLogin from "./pages/OfflineOfficerLogin";
import AdminAdmissionList from "./pages/AdminAdmissionList";
import ApplicantDetail from "./pages/ApplicantDetail";
import AdmissionConfiguration from "./pages/AdmissionConfiguration";
import FinancePanel from "./pages/FinancePanel";
import Reports from "./pages/Reports";
import EmailTemplates from "./pages/EmailTemplates";
import MessagingTemplates from "./pages/Messaging/Templates";
import AdminPortal from "./pages/AdminPortal";
import AdminImportJobs from "./pages/AdminImportJobs";
import AdminKpiCache from "./pages/AdminKpiCache";
import AdminUsers from "./pages/AdminUsers";
import PermissionConfig from "./pages/PermissionConfig";
import SyllabusManagement from "./pages/SyllabusManagement";
import WaiverManagement from "./pages/WaiverManagement";
import OfferCourses from "./pages/OfferCourses";
import CreditTransferList from "./pages/CreditTransferList";
import CreditTransferReview from "./pages/CreditTransferReview";
import StudentManagement from "./pages/StudentManagement";
import StudentProfile from "./pages/StudentProfile";
import AdminAcademic from "./pages/AdminAcademic";
import AdminScholarships from "./pages/AdminScholarships";
import AdminEmployees from "./pages/AdminEmployees";
import AccountManagement from "./pages/AccountManagement";
import AdmissionCircular from "./pages/AdmissionCircular";
import ChangeHistory from "./pages/ChangeHistory";
import IdCardGeneration from "./pages/IdCardGeneration";
import VisitorsLog from "./pages/VisitorsLog";
import Referrals from "./pages/Referrals";
import MockEmails from "./pages/MockEmails";

// New admin feature pages
import NewStudentProfile from "./pages/admin/NewStudentProfile";
import CreditTransferManagement from "./pages/admin/CreditTransferManagement";
import FeeStructurePackageManagement from "./pages/admin/FeeStructurePackageManagement";
import AdmissionDepartmentalReports from "./pages/admin/AdmissionDepartmentalReports";
import StudentSearch from "./pages/admin/StudentSearch";
import StudentDashboardSummary from "./pages/admin/StudentDashboardSummary";
import ScholarshipWaiverManagement from "./pages/admin/ScholarshipWaiverManagement";
import ReportCentre from "./pages/admin/ReportCentre";
import AdmissionTarget from "./pages/admin/AdmissionTarget";
import ProgramChange from "./pages/admin/ProgramChange";

const queryClient = new QueryClient();

function AppContent() {
  // Access auth context - wrap in try/catch in case provider isn't mounted yet
  let userType: "public" | "applicant" | "admin" = "public";
  let isAuthenticated = false;
  let isLoading = false;
  let roleLocal: string | null = null;
  try {
    const auth = useAuth();
    userType = auth.userType;
    isAuthenticated = auth.isAuthenticated;
    isLoading = auth.isLoading;
    roleLocal = auth.role ?? null;
  } catch (e) {
    // If auth provider is not available, fall back to defaults and continue rendering
    // This avoids the app crashing while dev server mounts providers
    userType = "public";
    isAuthenticated = false;
    isLoading = false;
    roleLocal = null;
  }

  const location = useLocation();

  // Set up form cache prevention on app load
  useEffect(() => {
    setupFormNoCache();
    preventFormCaching();
  }, []);

  // Show loading spinner while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-lavender-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-deep-plum mx-auto mb-4"></div>
          <p className="text-deep-plum">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine if sidebar should be shown based on route and user type
  const shouldShowSidebar = () => {
    const path = location.pathname;

    // Don't show sidebar on login pages
    if (path === "/admin" || path === "/admin/login") return false;
    if (path === "/applicant-portal" || path === "/portal") return false;

    // For admin routes, show sidebar only if user is admin
    if (path.startsWith("/admin") && userType !== "admin") return false;

    // For applicant dashboard/portal routes, show sidebar only if authenticated as applicant
    if (
      (path === "/dashboard" ||
        path === "/payment-portal" ||
        path === "/notifications") &&
      !isAuthenticated
    )
      return false;

    // Show sidebar for public application flow and authenticated users
    return true;
  };

  return (
    <div className="min-h-screen bg-lavender-bg">
      <Header showLogin={true} />
      <div className="flex">
        {shouldShowSidebar() && <Sidebar userType={userType} />}
        <main className={`flex-1 ${shouldShowSidebar() ? "p-6" : ""}`}>
          <Routes>
            {/* Main Application Flow */}
            <Route path="/" element={<Index />} />
            <Route path="/program-selection" element={<ProgramSelection />} />
            <Route
              path="/personal-information"
              element={<PersonalInformation />}
            />
            <Route path="/academic-history" element={<AcademicHistory />} />
            <Route path="/application-review" element={<ApplicationReview />} />
            <Route
              path="/application-success"
              element={<ApplicationSuccess />}
            />

            {/* Applicant Portal */}
            <Route path="/applicant-portal" element={<ApplicantLogin />} />
            <Route path="/portal" element={<ApplicantLogin />} />
            <Route
              path="/dashboard"
              element={
                isAuthenticated && userType === "applicant" ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/applicant-portal" replace />
                )
              }
            />
            <Route
              path="/payment-portal"
              element={
                isAuthenticated && userType === "applicant" ? (
                  <PaymentPortal />
                ) : (
                  <Navigate to="/applicant-portal" replace />
                )
              }
            />
            <Route path="/payment" element={<PaymentPortal />} />
            <Route
              path="/notifications"
              element={
                isAuthenticated && userType === "applicant" ? (
                  <Notifications />
                ) : (
                  <Navigate to="/applicant-portal" replace />
                )
              }
            />

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/admission-login"
              element={<AdmissionOfficerLogin />}
            />
            <Route
              path="/admin/offline-login"
              element={<OfflineOfficerLogin />}
            />
            <Route
              path="/admin/finance-login"
              element={<FinanceOfficerLogin />}
            />
            <Route
              path="/admin/offline-admission"
              element={<OfflineAdmission />}
            />
            <Route
              path="/admin/admissions"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdminAdmissionList />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/applicant/:id"
              element={
                isAuthenticated && userType === "admin" ? (
                  <ApplicantDetail />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/settings"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdmissionConfiguration />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/configuration"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdmissionConfiguration />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/finance"
              element={
                isAuthenticated && userType === "admin" ? (
                  <FinancePanel />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/reports"
              element={
                isAuthenticated && userType === "admin" ? (
                  <Reports />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            {/* New admin feature routes */}
            <Route
              path="/admin/new-student-profile"
              element={
                isAuthenticated && userType === "admin" ? (
                  <NewStudentProfile />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/credit-transfer-management"
              element={
                isAuthenticated && userType === "admin" ? (
                  <CreditTransferManagement />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/fee-structure"
              element={
                isAuthenticated && userType === "admin" ? (
                  <FeeStructurePackageManagement />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/department-reports"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdmissionDepartmentalReports />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/student-search"
              element={
                isAuthenticated && userType === "admin" ? (
                  <StudentSearch />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/student-dashboard-summary"
              element={
                isAuthenticated && userType === "admin" ? (
                  <StudentDashboardSummary />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/scholarships"
              element={
                isAuthenticated && userType === "admin" ? (
                  <ScholarshipWaiverManagement />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/report-centre"
              element={
                isAuthenticated && userType === "admin" ? (
                  <ReportCentre />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/templates"
              element={
                isAuthenticated && userType === "admin" ? (
                  <EmailTemplates />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/messaging"
              element={
                isAuthenticated && userType === "admin" ? (
                  <MessagingTemplates />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/portal"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdminPortal />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/imports"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdminImportJobs />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/kpi-cache"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdminKpiCache />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/users"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdminUsers />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/permissions"
              element={
                isAuthenticated && userType === "admin" ? (
                  <PermissionConfig />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/syllabus"
              element={
                isAuthenticated && userType === "admin" ? (
                  <SyllabusManagement />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/waivers"
              element={
                isAuthenticated && userType === "admin" ? (
                  <WaiverManagement />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/offer-courses"
              element={
                isAuthenticated && userType === "admin" ? (
                  <OfferCourses />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/credit-transfers"
              element={
                isAuthenticated && userType === "admin" ? (
                  <CreditTransferList />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/credit-transfer/:id"
              element={
                isAuthenticated && userType === "admin" ? (
                  <CreditTransferReview />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/student-management"
              element={
                isAuthenticated && userType === "admin" ? (
                  <StudentManagement />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/academic-management"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdminAcademic />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/scholarships"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdminScholarships />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/admission-target"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdmissionTarget />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/program-change"
              element={
                isAuthenticated && userType === "admin" ? (
                  <ProgramChange />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/employees"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdminEmployees />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/student-profile"
              element={
                isAuthenticated && userType === "admin" ? (
                  <StudentProfile />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/account-management"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AccountManagement />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/admission-circular"
              element={
                isAuthenticated && userType === "admin" ? (
                  <AdmissionCircular />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/change-history"
              element={
                isAuthenticated && userType === "admin" ? (
                  <ChangeHistory />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/admin/id-card-generation"
              element={
                isAuthenticated && userType === "admin" ? (
                  <IdCardGeneration />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/mock-emails"
              element={
                isAuthenticated && userType === "admin" ? (
                  <MockEmails />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/visitors-log"
              element={
                isAuthenticated && userType === "admin" ? (
                  <VisitorsLog />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            <Route
              path="/admin/referrals"
              element={
                isAuthenticated &&
                (userType === "admin" ||
                  roleLocal === "admission_officer" ||
                  roleLocal === "finance_officer") ? (
                  <Referrals />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ApplicationProvider>
              <BrowserRouter>
                <ErrorBoundary>
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </ErrorBoundary>
              </BrowserRouter>
            </ApplicationProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
