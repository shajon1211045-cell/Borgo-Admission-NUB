import "../../global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import AdminAdmissionList from "../../pages/AdminAdmissionList";
import ApplicantDetail from "../../pages/ApplicantDetail";
import CreditTransferList from "../../pages/CreditTransferList";
import CreditTransferReview from "../../pages/CreditTransferReview";
import AdminRegistrationPackages from "../../pages/AdminRegistrationPackages";
import FinancePanel from "../../pages/FinancePanel";
import Reports from "../../pages/Reports";
import EmailTemplates from "../../pages/EmailTemplates";
import AdmissionConfiguration from "../../pages/AdmissionConfiguration";
import MockOutbox from "../../pages/Messaging/MockOutbox";
import SmsQueue from "../../pages/Messaging/SmsQueue";
import AdminMessaging from "../../pages/Messaging/AdminMessaging";
import AdminLogin from "../../pages/AdminLogin";
import NotFound from "../../pages/NotFound";
import StudentReport from "../../pages/StudentReport";

const queryClient = new QueryClient();

const ProtectedLayout = () => {
  const { user, userType } = useAuth();

  if (!user || userType !== "admin") {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-lavender-bg flex">
      <Sidebar userType="admin" />
      <div className="flex-1 flex flex-col">
        <Header showLogin={false} />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/admissions" replace />} />
            <Route path="/admissions" element={<AdminAdmissionList />} />
            <Route
              path="/admin/credit-transfers"
              element={<CreditTransferList />}
            />
            <Route
              path="/admin/credit-transfer/:id"
              element={<CreditTransferReview />}
            />
            <Route
              path="/admin/registration-packages"
              element={<AdminRegistrationPackages />}
            />
            <Route path="/applicant/:id" element={<ApplicantDetail />} />
            <Route path="/applicant/:id/report" element={<StudentReport />} />
            <Route path="/finance" element={<FinancePanel />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/templates" element={<EmailTemplates />} />
            <Route path="/mock-emails" element={<MockOutbox />} />
            <Route path="/sms-queue" element={<SmsQueue />} />
            <Route path="/messaging" element={<AdminMessaging />} />
            <Route path="/configuration" element={<AdmissionConfiguration />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AdminApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={window.location.pathname.startsWith('/admin') ? '/admin' : undefined}>
        <AuthProvider>
          <ProtectedLayout />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default AdminApp;
