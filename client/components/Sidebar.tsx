import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  User,
  GraduationCap,
  FileText,
  CreditCard,
  LayoutDashboard,
  Bell,
  Shield,
  Users,
  PieChart,
  Mail,
  ChevronLeft,
  ChevronRight,
  LogIn,
  UserCheck,
  BookOpen,
  Award,
  Settings,
  History,
  Lock,
  UserCog,
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

interface SidebarProps {
  userType: "public" | "applicant" | "admin" | null;
}

export default function Sidebar({ userType }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { role } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const publicPages = [
    { name: "Home", path: "/", icon: Home },
    {
      name: "Program Selection",
      path: "/program-selection",
      icon: GraduationCap,
    },
    { name: "Personal Info", path: "/personal-information", icon: User },
    { name: "Review & Submit", path: "/application-review", icon: FileText },
  ];

  const applicantPages = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Payment Portal", path: "/payment-portal", icon: CreditCard },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  const adminPages = [
    { name: "Admissions", path: "/admin/admissions", icon: Users },
    {
      name: "Credit Transfer",
      path: "/admin/credit-transfers",
      icon: BookOpen,
    },
    {
      name: "Fee Structure & Packages",
      path: "/admin/fee-structure",
      icon: CreditCard,
    },
    { name: "Offer Courses", path: "/admin/offer-courses", icon: BookOpen },
    {
      name: "ID Card Generation",
      path: "/admin/id-card-generation",
      icon: Shield,
    },
    { name: "Finance", path: "/admin/finance", icon: CreditCard },
    {
      name: "Student Management",
      path: "/admin/student-management",
      icon: UserCog,
    },
    { name: "Student Search", path: "/admin/student-search", icon: Users },
    {
      name: "Account Management",
      path: "/admin/account-management",
      icon: Lock,
    },
    {
      name: "Admission Circular",
      path: "/admin/admission-circular",
      icon: Mail,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: PieChart,
      children: [
        {
          name: "Admission Departmental Reports",
          path: "/admin/department-reports",
          icon: PieChart,
        },
      ],
    },
    { name: "Report Centre", path: "/admin/report-centre", icon: PieChart },
    { name: "Messaging", path: "/admin/messaging", icon: Mail },
    { name: "Templates", path: "/admin/templates", icon: Mail },
    { name: "Mock Emails", path: "/admin/mock-emails", icon: Mail },
    { name: "Syllabus", path: "/admin/syllabus", icon: BookOpen },
    { name: "Visitors Log", path: "/admin/visitors-log", icon: Users },
    { name: "Referrals", path: "/admin/referrals", icon: Users },
    { name: "Change History", path: "/admin/change-history", icon: History },
    { name: "Configuration", path: "/admin/configuration", icon: Settings },
    {
      name: "Permission Configuration",
      path: "/admin/permissions",
      icon: Shield,
    },
  ];

  const loginPages = [
    { name: "Applicant Login", path: "/applicant-login", icon: UserCheck },
    { name: "Admin Login", path: "/admin-login", icon: LogIn },
  ];

  const getPages = () => {
    // Role overrides userType when present
    if (role === "admission_officer")
      return [
        { name: "Admissions", path: "/admin/admissions", icon: Users },
        { name: "Offer Courses", path: "/admin/offer-courses", icon: BookOpen },
        {
          name: "ID Card Generation",
          path: "/admin/id-card-generation",
          icon: Shield,
        },
        {
          name: "Student Management",
          path: "/admin/student-management",
          icon: UserCog,
        },
        { name: "Visitors Log", path: "/admin/visitors-log", icon: Users },
        { name: "Referrals", path: "/admin/referrals", icon: Users },
        {
          name: "Credit Transfer List",
          path: "/admin/credit-transfers",
          icon: BookOpen,
        },
        {
          name: "Registration Packages",
          path: "/admin/registration-packages",
          icon: BookOpen,
        },
        {
          name: "Reports",
          path: "/admin/reports?scope=admission",
          icon: PieChart,
        },
      ];

    // Offline admission staff should see only public application pages (form entry) — not admin menus
    if (role === "offline_officer") return publicPages;

    if (role === "finance_officer")
      return [
        { name: "Finance", path: "/admin/finance", icon: CreditCard },
        // Finance officers shouldn't see ID Card Generation
        {
          name: "Reports",
          path: "/admin/reports?scope=finance",
          icon: PieChart,
        },
        { name: "Referrals", path: "/admin/referrals", icon: Users },
      ];

    switch (userType) {
      case "applicant":
        return applicantPages;
      case "admin":
        return adminPages;
      default:
        return publicPages;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 bg-white border-r border-gray-200 min-h-screen flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-deep-plum rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NU</span>
              </div>
              <span className="font-semibold text-deep-plum">Navigation</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-deep-plum"
            aria-label={
              isCollapsed ? "Expand navigation" : "Collapse navigation"
            }
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* User Type Badge */}
      {!isCollapsed && (
        <div className="p-4">
          <Badge
            className={`w-full justify-center ${
              userType === "admin"
                ? "bg-purple-100 text-purple-800"
                : userType === "applicant"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {userType === "admin"
              ? "Admin Panel"
              : userType === "applicant"
                ? "Applicant Portal"
                : "Public Access"}
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-2">
        <div className="space-y-1">
          {getPages().map((page) => {
            // If the page has children, render a collapsible group
            if ((page as any).children && (page as any).children.length) {
              const children = (page as any).children as any[];
              const open = openMenus[page.name];
              return (
                <div key={page.path}>
                  <button
                    onClick={() =>
                      setOpenMenus((s) => ({
                        ...s,
                        [page.name]: !s[page.name],
                      }))
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(page.path) ||
                      children.some((c) => isActive(c.path))
                        ? "bg-deep-plum text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    aria-expanded={!!open}
                  >
                    <page.icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{page.name}</span>
                    )}
                  </button>

                  {open && (
                    <div className="mt-1 ml-6 space-y-1">
                      {children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          aria-current={
                            isActive(child.path) ? "page" : undefined
                          }
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive(child.path)
                              ? "bg-deep-plum text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <child.icon className="w-3 h-3 opacity-80" />
                          {!isCollapsed && (
                            <span className="text-sm">{child.name}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={page.path}
                to={page.path}
                aria-current={isActive(page.path) ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(page.path)
                    ? "bg-deep-plum text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <page.icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{page.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Northern University Bangladesh
          </div>
        </div>
      )}
    </nav>
  );
}
