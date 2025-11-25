import { useState, useMemo, useEffect } from "react";
import {
  Download,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  FileText,
  Shield,
  IdCard,
  Target,
  MapPin,
  CreditCard,
  BookOpen,
  Archive,
  School,
  GraduationCap,
  Building,
  DollarSign,
  UserCheck,
  CheckCircle,
  Eye,
  DownloadCloud,
  Package,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { getIDGenerationStats, sampleStudentIDs } from "../lib/idGeneration";
import React from "react";
import apiClient from "../lib/api";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { useLocation } from "react-router-dom";

// Dummy data for reports
const programWiseData = [
  {
    serial: 1,
    programName: "Bachelor in CSE",
    male: 89,
    female: 67,
    total: 156,
    semester: "spring_2024",
    department: "cse",
  },
  {
    serial: 2,
    programName: "Bachelor in EEE",
    male: 78,
    female: 45,
    total: 123,
    semester: "spring_2024",
    department: "eee",
  },
  {
    serial: 3,
    programName: "Bachelor in Civil",
    male: 92,
    female: 34,
    total: 126,
    semester: "spring_2024",
    department: "civil",
  },
  {
    serial: 4,
    programName: "Bachelor in BBA",
    male: 65,
    female: 98,
    total: 163,
    semester: "spring_2024",
    department: "bba",
  },
  {
    serial: 5,
    programName: "Bachelor in Law",
    male: 43,
    female: 57,
    total: 100,
    semester: "spring_2024",
    department: "law",
  },
  {
    serial: 6,
    programName: "Bachelor in Architecture",
    male: 34,
    female: 46,
    total: 80,
    semester: "spring_2024",
    department: "architecture",
  },
  {
    serial: 7,
    programName: "Masters in CSE",
    male: 25,
    female: 15,
    total: 40,
    semester: "fall_2024",
    department: "cse",
  },
  {
    serial: 8,
    programName: "Masters in EEE",
    male: 30,
    female: 12,
    total: 42,
    semester: "fall_2024",
    department: "eee",
  },
];

const employeeCollectionData = [
  {
    employeeId: "EMP001",
    employeeName: "Ahmed Rahman",
    department: "cse",
    collectionAmount: 125000,
    date: "2024-01-15",
    applications: 25,
  },
  {
    employeeId: "EMP002",
    employeeName: "Fatima Khan",
    department: "eee",
    collectionAmount: 98000,
    date: "2024-01-15",
    applications: 20,
  },
  {
    employeeId: "EMP003",
    employeeName: "Mohammad Ali",
    department: "civil",
    collectionAmount: 156000,
    date: "2024-01-15",
    applications: 31,
  },
  {
    employeeId: "EMP004",
    employeeName: "Rashida Begum",
    department: "bba",
    collectionAmount: 189000,
    date: "2024-01-15",
    applications: 38,
  },
  {
    employeeId: "EMP005",
    employeeName: "Karim Hassan",
    department: "law",
    collectionAmount: 78000,
    date: "2024-01-15",
    applications: 16,
  },
  {
    employeeId: "EMP006",
    employeeName: "Nasreen Ahmed",
    department: "architecture",
    collectionAmount: 134000,
    date: "2024-01-15",
    applications: 27,
  },
];

const dailyCollectionData = [
  {
    date: "2024-01-15",
    officerId: "OFF001",
    officerName: "Ahmed Rahman",
    dailyCollection: 25000,
    applications: 5,
  },
  {
    date: "2024-01-15",
    officerId: "OFF002",
    officerName: "Fatima Khan",
    dailyCollection: 18000,
    applications: 4,
  },
  {
    date: "2024-01-15",
    officerId: "OFF003",
    officerName: "Mohammad Ali",
    dailyCollection: 32000,
    applications: 6,
  },
  {
    date: "2024-01-14",
    officerId: "OFF001",
    officerName: "Ahmed Rahman",
    dailyCollection: 28000,
    applications: 6,
  },
  {
    date: "2024-01-14",
    officerId: "OFF002",
    officerName: "Fatima Khan",
    dailyCollection: 22000,
    applications: 5,
  },
  {
    date: "2024-01-13",
    officerId: "OFF003",
    officerName: "Mohammad Ali",
    dailyCollection: 35000,
    applications: 7,
  },
];

const studentListData = [
  {
    studentId: "STU001",
    studentName: "Kamal Ahmed",
    department: "cse",
    program: "bachelor",
    semester: "spring_2024",
    district: "Dhaka",
    phone: "01712345678",
    email: "kamal@example.com",
  },
  {
    studentId: "STU002",
    studentName: "Rashida Khatun",
    department: "eee",
    program: "bachelor",
    semester: "spring_2024",
    district: "Chittagong",
    phone: "01798765432",
    email: "rashida@example.com",
  },
  {
    studentId: "STU003",
    studentName: "Abdul Rahman",
    department: "civil",
    program: "bachelor",
    semester: "spring_2024",
    district: "Sylhet",
    phone: "01634567890",
    email: "abdul@example.com",
  },
  {
    studentId: "STU004",
    studentName: "Fatima Begum",
    department: "bba",
    program: "bachelor",
    semester: "fall_2024",
    district: "Dhaka",
    phone: "01856789012",
    email: "fatima@example.com",
  },
  {
    studentId: "STU005",
    studentName: "Mohammad Hassan",
    department: "law",
    program: "bachelor",
    semester: "spring_2024",
    district: "Khulna",
    phone: "01723456789",
    email: "hassan@example.com",
  },
];

const creditTransferData = [
  {
    studentId: "CT001",
    studentName: "Ahmed Ali",
    previousInstitution: "XYZ University",
    transferredCredits: 45,
    department: "cse",
    program: "bachelor",
    semester: "spring_2024",
  },
  {
    studentId: "CT002",
    studentName: "Rashida Ahmed",
    previousInstitution: "ABC College",
    transferredCredits: 38,
    department: "bba",
    program: "bachelor",
    semester: "fall_2024",
  },
  {
    studentId: "CT003",
    studentName: "Mohammad Khan",
    previousInstitution: "DEF University",
    transferredCredits: 52,
    department: "eee",
    program: "bachelor",
    semester: "spring_2024",
  },
];

const feederDistrictsData = [
  { districtName: "Dhaka", studentsCount: 234, percentage: 28.5 },
  { districtName: "Chittagong", studentsCount: 189, percentage: 23.1 },
  { districtName: "Sylhet", studentsCount: 156, percentage: 19.0 },
  { districtName: "Khulna", studentsCount: 98, percentage: 12.0 },
  { districtName: "Rajshahi", studentsCount: 78, percentage: 9.5 },
  { districtName: "Barisal", studentsCount: 45, percentage: 5.5 },
  { districtName: "Rangpur", studentsCount: 34, percentage: 4.1 },
];

const studentWaiverData = [
  {
    studentId: "SW001",
    studentName: "Kamal Ahmed",
    department: "cse",
    waiverAmount: 15000,
    waiverPercentage: 30,
    totalFee: 50000,
    semester: "spring_2024",
  },
  {
    studentId: "SW002",
    studentName: "Rashida Khatun",
    department: "eee",
    waiverAmount: 12500,
    waiverPercentage: 25,
    totalFee: 50000,
    semester: "spring_2024",
  },
  {
    studentId: "SW003",
    studentName: "Abdul Rahman",
    department: "civil",
    waiverAmount: 20000,
    waiverPercentage: 40,
    totalFee: 50000,
    semester: "fall_2024",
  },
  {
    studentId: "SW004",
    studentName: "Fatima Begum",
    department: "bba",
    waiverAmount: 10000,
    waiverPercentage: 20,
    totalFee: 50000,
    semester: "spring_2024",
  },
];

const studentCreditsData = [
  {
    studentId: "SC001",
    studentName: "Kamal Ahmed",
    department: "cse",
    creditsRequired: 144,
    creditsCompleted: 89,
    remainingCredits: 55,
    semester: "spring_2024",
  },
  {
    studentId: "SC002",
    studentName: "Rashida Khatun",
    department: "eee",
    creditsRequired: 144,
    creditsCompleted: 76,
    remainingCredits: 68,
    semester: "spring_2024",
  },
  {
    studentId: "SC003",
    studentName: "Abdul Rahman",
    department: "civil",
    creditsRequired: 144,
    creditsCompleted: 92,
    remainingCredits: 52,
    semester: "fall_2024",
  },
];

const idCardData = [
  {
    studentId: "NUB-CSE-2024-001",
    studentName: "Mohammad Rahman",
    department: "cse",
    program: "BSc in CSE",
    semester: "spring_2024",
    cardGenerated: "Generated",
    generatedDate: "2024-02-15",
    batch: "Spring 2024",
    admissionDate: "2024-01-15",
  },
  {
    studentId: "NUB-BBA-2024-002",
    studentName: "Fatima Sultana",
    department: "bba",
    program: "BBA",
    semester: "spring_2024",
    cardGenerated: "Pending",
    generatedDate: "-",
    batch: "Spring 2024",
    admissionDate: "2024-01-20",
  },
  {
    studentId: "NUB-EEE-2024-003",
    studentName: "Ahmed Hassan",
    department: "eee",
    program: "BSc in EEE",
    semester: "spring_2024",
    cardGenerated: "Pending",
    generatedDate: "-",
    batch: "Spring 2024",
    admissionDate: "2024-01-25",
  },
  {
    studentId: "NUB-CE-2024-004",
    studentName: "Rashida Begum",
    department: "civil",
    program: "BSc in Civil",
    semester: "spring_2024",
    cardGenerated: "Generated",
    generatedDate: "2024-02-20",
    batch: "Spring 2024",
    admissionDate: "2024-02-01",
  },
  {
    studentId: "NUB-CSE-2024-005",
    studentName: "Karim Uddin",
    department: "cse",
    program: "BSc in CSE",
    semester: "spring_2024",
    cardGenerated: "Pending",
    generatedDate: "-",
    batch: "Spring 2024",
    admissionDate: "2024-02-10",
  },
  {
    studentId: "NUB-BBA-2024-006",
    studentName: "Sakina Akter",
    department: "bba",
    program: "BBA",
    semester: "spring_2024",
    cardGenerated: "Generated",
    generatedDate: "2024-02-18",
    batch: "Spring 2024",
    admissionDate: "2024-02-15",
  },
  {
    studentId: "NUB-EEE-2023-067",
    studentName: "Abdul Karim",
    department: "eee",
    program: "BSc in EEE",
    semester: "fall_2023",
    cardGenerated: "Generated",
    generatedDate: "2023-09-15",
    batch: "Fall 2023",
    admissionDate: "2023-08-01",
  },
  {
    studentId: "NUB-CSE-2023-089",
    studentName: "Nusrat Jahan",
    department: "cse",
    program: "BSc in CSE",
    semester: "fall_2023",
    cardGenerated: "Generated",
    generatedDate: "2023-09-20",
    batch: "Fall 2023",
    admissionDate: "2023-08-05",
  },
];

const departmentTargetsData = [
  {
    department: "cse",
    targetSet: 200,
    achieved: 156,
    percentage: 78,
    semester: "spring_2024",
  },
  {
    department: "eee",
    targetSet: 150,
    achieved: 123,
    percentage: 82,
    semester: "spring_2024",
  },
  {
    department: "civil",
    targetSet: 180,
    achieved: 126,
    percentage: 70,
    semester: "spring_2024",
  },
  {
    department: "bba",
    targetSet: 220,
    achieved: 163,
    percentage: 74,
    semester: "spring_2024",
  },
  {
    department: "law",
    targetSet: 120,
    achieved: 100,
    percentage: 83,
    semester: "spring_2024",
  },
];

export default function Reports() {
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [activeReportCategory, setActiveReportCategory] = useState("overview");
  const [activeReport, setActiveReport] = useState<string | null>(null);

  // Referral & Visitors stats
  const [referralStats, setReferralStats] = useState<{
    total_referrers: number;
    total_commission: number;
  } | null>(null);
  const [visitorsStats, setVisitorsStats] = useState<{
    total_visits: number;
    visits_today: number;
  } | null>(null);
  const [referrersList, setReferrersList] = useState<any[]>([]);
  const [approvedReferrals, setApprovedReferrals] = useState<any[]>([]);
  const [referralSearch, setReferralSearch] = useState("");
  const [minPercent, setMinPercent] = useState<number | null>(null);
  const [maxPercent, setMaxPercent] = useState<number | null>(null);
  const [visitorsList, setVisitorsList] = useState<any[]>([]);

  // Helper: download CSV
  const downloadCSV = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) {
      alert("No data to export");
      return;
    }
    const keys = Object.keys(rows[0]);
    const csvContent = [
      keys.join(","),
      ...rows.map((r) => keys.map((k) => `"${String(r[k] ?? "")}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchAndExportReferrers = async () => {
    try {
      const res = await apiClient.getReferrers();
      if (res.success && res.data) {
        const rows = res.data.referrers || [];
        downloadCSV("referrers.csv", rows);
      } else {
        alert("Failed to export referrers");
      }
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  const fetchAndExportVisitors = async () => {
    try {
      const res = await apiClient.exportVisitors({});
      if (res.success && res.data) {
        downloadCSV("visitors.csv", res.data);
      } else {
        alert("Failed to export visitors");
      }
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  // Small sparkline component
  const Sparkline = ({ points }: { points: number[] }) => {
    if (!points || points.length === 0) return null;
    const w = 120;
    const h = 28;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const step = w / (points.length - 1 || 1);
    const path = points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${i * step} ${h - ((p - min) / range) * h}`,
      )
      .join(" ");
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path
          d={path}
          fill="none"
          stroke="#7c3aed"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const texts = {
    en: {
      title: "Reports & Analytics",
      subtitle: "Comprehensive Admission Reports and Insights",
      dateRange: "Date Range",
      program: "Program",
      department: "Department",
      semester: "Semester",
      year: "Year",
      generateReport: "Generate Report",
      exportPDF: "Export PDF",
      downloadReport: "Download PDF",
      viewReport: "View Report",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      last3Months: "Last 3 Months",
      lastYear: "Last Year",
      custom: "Custom Range",
      allPrograms: "All Programs",
      allDepartments: "All Departments",
      allSemesters: "All Semesters",
      spring2024: "Spring 2024",
      fall2024: "Fall 2024",
      summer2024: "Summer 2024",
      backToReports: "Back to Reports",

      // Report Categories
      reportCategories: "Report Categories",
      overview: "Overview",
      studentReports: "Student Reports",
      financialReports: "Financial Reports",
      waiverReports: "Waiver Reports",
      idCardReports: "ID Card Reports",
      targetReports: "Target Reports",

      // Overview Reports
      totalApplications: "Total Applications",
      admittedStudents: "Admitted Students",
      rejectedApplications: "Rejected Applications",
      pendingApplications: "Pending Applications",
      departmentWiseAdmissions: "Department-wise Admissions",
      monthlyTrends: "Monthly Application Trends",
      admissionRate: "Admission Rate",
      averageProcessingTime: "Average Processing Time",
      topPerformingDepartments: "Top Performing Departments",
      revenueGenerated: "Revenue Generated",

      // Report Types
      programWiseAdmissions: "Program-wise Admitted Students per Semester",
      employeeWiseCollection: "Employee-wise Admission Fee Collection",
      dailyCollectionReport: "Daily Collection Report of Admission Officers",
      semesterWiseAdmissions: "Semester-wise Number of Admitted Students",
      feederDistricts: "List of Feeder Districts",
      studentList: "Student List",
      detailedStudentList: "Detailed Student List",
      studentIdCards: "Student ID Cards",
      studentRequiredCredits: "Student Required Credits",
      studentWaiverReport: "Student Waiver Report (Department-wise)",
      creditTransferStudentList: "Credit Transfer Student List",
      departmentWiseTargets: "Department-wise Admission Targets",

      // Table Headers
      serial: "Serial",
      programName: "Program Name",
      male: "Male",
      female: "Female",
      total: "Total",
      employeeName: "Employee Name",
      employeeId: "Employee ID",
      collectionAmount: "Collection Amount (৳)",
      date: "Date",
      officerId: "Officer ID",
      officerName: "Officer Name",
      dailyCollection: "Daily Collection (৳)",
      targetSet: "Target Set",
      achieved: "Achieved",
      percentage: "Percentage (%)",
      districtName: "District",
      studentsCount: "Students Count",
      studentId: "Student ID",
      studentName: "Student Name",
      creditsRequired: "Credits Required",
      creditsCompleted: "Credits Completed",
      remainingCredits: "Remaining Credits",
      waiverAmount: "Waiver Amount (৳)",
      waiverPercentage: "Waiver (%)",
      totalFee: "Total Fee (৳)",
      previousInstitution: "Previous Institution",
      transferredCredits: "Transferred Credits",
      phone: "Phone",
      email: "Email",
      district: "District",
      cardGenerated: "Card Generated",
      generatedDate: "Generated Date",
      applications: "Applications",

      // Departments
      departmentColumn: "Department",
      rate: "Rate",
      cse: "Computer Science & Engineering",
      eee: "Electrical & Electronic Engineering",
      mech: "Mechanical Engineering",
      civil: "Civil Engineering",
      textile: "Textile Engineering",
      bba: "Business Administration",
      law: "Law",
      architecture: "Architecture",
      pharmacy: "Pharmacy",
      english: "English",

      days: "days",
      studentIdStats: "Student ID Statistics",
      universityIds: "University IDs Generated",
      ugcIds: "UGC IDs Generated",
      activeStudents: "Active Students",
      idGenerationRate: "ID Generation Rate",
      recentlyGenerated: "Recently Generated IDs",
      universityId: "University ID",
      ugcId: "UGC ID",
      generatedDate2: "Generated Date",
      status: "Status",
      active: "Active",
      viewDetails: "View Details",
    },
    bn: {
      title: "রিপোর্ট ও বিশ্লেষণ",
      subtitle: "সার্বিক ভর্তি রিপোর্ট এবং অন্তর্দৃষ্���ি",
      dateRange: "তারিখের পরিসীমা",
      program: "প্রোগ্রাম",
      department: "বিভ��গ",
      semester: "সেমিস্টার",
      year: "বছর",
      generateReport: "রিপোর্��� তৈর��� করুন",
      exportPDF: "পিডিএফ এক্সপোর্ট",
      downloadReport: "প��ডিএফ ডাউনলোড",
      viewReport: "রিপোর্ট দেখুন",
      last7Days: "গত ৭ দিন",
      last30Days: "গত ৩০ দিন",
      last3Months: "গত ৩ মাস",
      lastYear: "গত বছর",
      custom: "কাস্টম রেঞ্জ",
      allPrograms: "সব প্রোগ্রাম",
      allDepartments: "সব বিভা���",
      allSemesters: "সব সেমিস্টার",
      spring2024: "বসন্ত ২০২৪",
      fall2024: "শরৎ ২০২৪",
      summer2024: "গ্রীষ্�� ২০২৪",
      backToReports: "রিপোর্টে ���িরুন",

      // Report Categories
      reportCategories: "রিপোর্ট বিভাগসমূহ",
      overview: "সারসংক্ষেপ",
      studentReports: "শিক্ষার্��ী রিপোর্ট",
      financialReports: "আর্থিক রিপোর্ট",
      waiverReports: "মওকুফ রিপোর্ট",
      idCardReports: "আইডি কার��ড রিপোর্ট",
      targetReports: "লক্ষ্য র��পোর্ট",

      totalApplications: "মোট আবেদন",
      admittedStudents: "ভর্তিকৃত শিক্ষার্থী",
      rejectedApplications: "প্রত্যাখ্যাত আবেদ���",
      pendingApplications: "��পেক্ষমাণ আবেদন",
      departmentWiseAdmissions: "বিভাগ অনুযায়ী ভর্তি",
      monthlyTrends: "মাসিক আবেদনের প্রবণতা",
      admissionRate: "ভর্তি�� হার",
      averageProcessingTime: "গড় প্রক্রিয়াকরণ সময়",
      topPerformingDepartments: "সেরা পারফ��ম্যান্স বিভাগ",
      revenueGenerated: "আয় ���ৃষ্টি",

      programWiseAdmissions:
        "প্রোগ্রাম অনুযায়ী সেমিস্টার প্রতি ভর্তিকৃত শিক্ষার্��ীর সংখ্যা",
      employeeWiseCollection: "কর্মচারী অনুযায়ী ভ��্তি ফি সংগ্রহ",
      dailyCollectionReport: "ভর্তি কর্মকর���তাদের দ���নিক সংগ্র�� রিপোর্ট",

      departmentColumn: "বিভাগ",
      rate: "হ���র",
      cse: "কম্পিউটা�� সায়েন্স ও ইঞ্জিনিয়ারি���",
      eee: "ইলেকট্রিক্যাল ও ইলেকট্রনিক ইঞ্জ��নিয়ারিং",
      mech: "মেকানিক্যাল ইঞ্জিনিয়ারিং",
      civil: "সিভিল ইঞ্জিনিয়ারিং",
      textile: "টেক��সটাইল ইঞ্জ��নিয়ারিং",
      bba: "ব্যবসায় প্রশাসন",
      law: "আইন",
      architecture: "স্��াপত্য",
      pharmacy: "ফার্মেসি",
      english: "ইংরেজি",
      days: "দিন",
    },
  };

  const t: any = texts[language];

  // scope/referrer from URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const scope = params.get("scope"); // 'finance' | 'admission' | null
  const referrerFilter = params.get("referrer");
  const showFinance = !scope || scope === "finance";
  const showAdmission = !scope || scope === "admission";

  // Helper to apply referrer filter on employee data
  const getFilteredEmployeeData = () => {
    if (!referrerFilter) return employeeCollectionData;
    return employeeCollectionData.filter(
      (e) =>
        (e.employeeId || "").toLowerCase() === referrerFilter.toLowerCase(),
    );
  };

  // Ensure active report category aligns with scope on mount/update
  useEffect(() => {
    if (scope === "finance") {
      setActiveReportCategory("financial");
    } else if (scope === "admission") {
      setActiveReportCategory("overview");
    }
  }, [scope]);

  // Fetch referral and visitors stats
  useEffect(() => {
    const load = async () => {
      try {
        const refRes = await apiClient.getReferrers();
        if (refRes.success && refRes.data) {
          const total = refRes.data.referrers.length;
          // Mock commission sum from mock data if available
          const totalCommission = refRes.data.referrers.reduce(
            (sum: any, r: any) => sum + (r.commission_rate || 0) * 10000,
            0,
          );
          setReferralStats({
            total_referrers: total,
            total_commission: totalCommission,
          });
          setReferrersList(refRes.data.referrers || []);

          // Load approved referrals from localStorage (frontend mock)
          try {
            const rawApproved =
              (typeof localStorage !== "undefined" &&
                localStorage.getItem("nu_approved_referrals")) ||
              "[]";
            const approvedList = JSON.parse(rawApproved || "[]");
            setApprovedReferrals(
              Array.isArray(approvedList) ? approvedList : [],
            );
          } catch (e) {
            // ignore errors
          }
        }

        const visRes = await apiClient.getVisitors({ page: 1, limit: 1000 });
        if (visRes.success && visRes.data) {
          const totalVisits = visRes.data.total || visRes.data.visitors.length;
          const today = new Date().toISOString().slice(0, 10);
          const visitsToday = (visRes.data.visitors || []).filter(
            (v: any) => v.visit_date === today,
          ).length;
          setVisitorsStats({
            total_visits: totalVisits,
            visits_today: visitsToday,
          });
          setVisitorsList(visRes.data.visitors || []);
        }
      } catch (err) {
        console.warn(err);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter functions for each report type
  const filteredProgramWiseData = useMemo(() => {
    return programWiseData.filter((item) => {
      if (
        selectedDepartment !== "all" &&
        item.department !== selectedDepartment
      )
        return false;
      if (selectedSemester !== "all" && item.semester !== selectedSemester)
        return false;
      return true;
    });
  }, [selectedDepartment, selectedSemester]);

  const filteredEmployeeData = useMemo(() => {
    return employeeCollectionData.filter((item) => {
      if (
        selectedDepartment !== "all" &&
        item.department !== selectedDepartment
      )
        return false;
      return true;
    });
  }, [selectedDepartment]);

  const filteredApprovedReferrals = useMemo(() => {
    return (approvedReferrals || []).filter((item: any) => {
      if (referralSearch) {
        const s = referralSearch.toLowerCase();
        if (
          !(
            (item.applicant_name || "").toLowerCase().includes(s) ||
            (item.referrer_name || "").toLowerCase().includes(s) ||
            (item.referrer_employee_id || "").toLowerCase().includes(s)
          )
        )
          return false;
      }
      if (minPercent != null && Number(item.percentage) < Number(minPercent))
        return false;
      if (maxPercent != null && Number(item.percentage) > Number(maxPercent))
        return false;
      return true;
    });
  }, [approvedReferrals, referralSearch, minPercent, maxPercent]);

  const filteredStudentData = useMemo(() => {
    return studentListData.filter((item) => {
      if (
        selectedDepartment !== "all" &&
        item.department !== selectedDepartment
      )
        return false;
      if (selectedProgram !== "all" && item.program !== selectedProgram)
        return false;
      if (selectedSemester !== "all" && item.semester !== selectedSemester)
        return false;
      return true;
    });
  }, [selectedDepartment, selectedProgram, selectedSemester]);

  const filteredCreditTransferData = useMemo(() => {
    return creditTransferData.filter((item) => {
      if (
        selectedDepartment !== "all" &&
        item.department !== selectedDepartment
      )
        return false;
      if (selectedSemester !== "all" && item.semester !== selectedSemester)
        return false;
      return true;
    });
  }, [selectedDepartment, selectedSemester]);

  const filteredWaiverData = useMemo(() => {
    return studentWaiverData.filter((item) => {
      if (
        selectedDepartment !== "all" &&
        item.department !== selectedDepartment
      )
        return false;
      if (selectedSemester !== "all" && item.semester !== selectedSemester)
        return false;
      return true;
    });
  }, [selectedDepartment, selectedSemester]);

  const filteredCreditsData = useMemo(() => {
    return studentCreditsData.filter((item) => {
      if (
        selectedDepartment !== "all" &&
        item.department !== selectedDepartment
      )
        return false;
      if (selectedSemester !== "all" && item.semester !== selectedSemester)
        return false;
      return true;
    });
  }, [selectedDepartment, selectedSemester]);

  const filteredIdCardData = useMemo(() => {
    return idCardData.filter((item) => {
      if (
        selectedDepartment !== "all" &&
        item.department !== selectedDepartment
      )
        return false;
      if (selectedProgram !== "all" && item.program !== selectedProgram)
        return false;
      if (selectedSemester !== "all" && item.semester !== selectedSemester)
        return false;
      return true;
    });
  }, [selectedDepartment, selectedProgram, selectedSemester]);

  const filteredTargetsData = useMemo(() => {
    return departmentTargetsData.filter((item) => {
      if (
        selectedDepartment !== "all" &&
        item.department !== selectedDepartment
      )
        return false;
      if (selectedSemester !== "all" && item.semester !== selectedSemester)
        return false;
      return true;
    });
  }, [selectedDepartment, selectedSemester]);

  // Export to PDF function (dummy implementation)
  const exportToPDF = (reportName: string, data: any[]) => {
    // In a real implementation, you would use a library like jsPDF
    alert(`Exporting ${reportName} to PDF with ${data.length} records`);
  };

  const kpiData = [
    {
      label: t.totalApplications,
      value: 1234,
      change: "+12%",
      color: "bg-blue-100 text-blue-800",
      icon: Users,
    },
    {
      label: t.admittedStudents,
      value: 856,
      change: "+8%",
      color: "bg-green-100 text-green-800",
      icon: TrendingUp,
    },
    {
      label: t.rejectedApplications,
      value: 234,
      change: "-3%",
      color: "bg-red-100 text-red-800",
      icon: Users,
    },
    {
      label: t.pendingApplications,
      value: 144,
      change: "+15%",
      color: "bg-yellow-100 text-yellow-800",
      icon: Users,
    },
  ];

  const departmentData = [
    { department: t.cse, applications: 245, admitted: 189, rate: "77%" },
    { department: t.eee, applications: 198, admitted: 156, rate: "79%" },
    { department: t.mech, applications: 167, admitted: 123, rate: "74%" },
    { department: t.civil, applications: 189, admitted: 134, rate: "71%" },
    { department: t.textile, applications: 134, admitted: 98, rate: "73%" },
    { department: t.bba, applications: 301, admitted: 156, rate: "52%" },
  ];

  const monthlyTrends = [
    { month: "Jan", applications: 145, admitted: 89 },
    { month: "Feb", applications: 198, admitted: 134 },
    { month: "Mar", applications: 234, admitted: 167 },
    { month: "Apr", applications: 189, admitted: 145 },
    { month: "May", applications: 167, admitted: 123 },
    { month: "Jun", applications: 201, admitted: 156 },
  ];

  // If viewing a specific report, show the report table
  if (activeReport) {
    return (
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setActiveReport(null)}
              className="mb-4"
            >
              ← {t.backToReports}
            </Button>
          </div>

          {/* Report Content */}
          {activeReport === "programWiseAdmissions" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.programWiseAdmissions}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF(
                      "Program-wise Admissions",
                      filteredProgramWiseData,
                    )
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.serial}</TableHead>
                      <TableHead>{t.programName}</TableHead>
                      <TableHead>{t.male}</TableHead>
                      <TableHead>{t.female}</TableHead>
                      <TableHead>{t.total}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProgramWiseData.map((item) => (
                      <TableRow key={item.serial}>
                        <TableCell>{item.serial}</TableCell>
                        <TableCell className="font-medium">
                          {item.programName}
                        </TableCell>
                        <TableCell>{item.male}</TableCell>
                        <TableCell>{item.female}</TableCell>
                        <TableCell className="font-semibold">
                          {item.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "employeeWiseCollection" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.employeeWiseCollection}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF(
                      "Employee-wise Collection",
                      filteredEmployeeData,
                    )
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.employeeId}</TableHead>
                      <TableHead>{t.employeeName}</TableHead>
                      <TableHead>{t.departmentColumn}</TableHead>
                      <TableHead>{t.collectionAmount}</TableHead>
                      <TableHead>{t.applications}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployeeData.map((item) => (
                      <TableRow key={item.employeeId}>
                        <TableCell className="font-mono">
                          {item.employeeId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.employeeName}
                        </TableCell>
                        <TableCell>{item.department.toUpperCase()}</TableCell>
                        <TableCell className="font-semibold">
                          ৳{item.collectionAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{item.applications}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "dailyCollectionReport" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.dailyCollectionReport}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF("Daily Collection Report", dailyCollectionData)
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.date}</TableHead>
                      <TableHead>{t.officerId}</TableHead>
                      <TableHead>{t.officerName}</TableHead>
                      <TableHead>{t.dailyCollection}</TableHead>
                      <TableHead>{t.applications}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyCollectionData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="font-mono">
                          {item.officerId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.officerName}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ৳{item.dailyCollection.toLocaleString()}
                        </TableCell>
                        <TableCell>{item.applications}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "studentList" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.studentList}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF("Student List", filteredStudentData)
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.studentId}</TableHead>
                      <TableHead>{t.studentName}</TableHead>
                      <TableHead>{t.departmentColumn}</TableHead>
                      <TableHead>{t.program}</TableHead>
                      <TableHead>{t.district}</TableHead>
                      <TableHead>{t.phone}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudentData.map((item) => (
                      <TableRow key={item.studentId}>
                        <TableCell className="font-mono">
                          {item.studentId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.studentName}
                        </TableCell>
                        <TableCell>{item.department.toUpperCase()}</TableCell>
                        <TableCell>{item.program}</TableCell>
                        <TableCell>{item.district}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "creditTransferStudentList" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.creditTransferStudentList}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF(
                      "Credit Transfer Students",
                      filteredCreditTransferData,
                    )
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.studentId}</TableHead>
                      <TableHead>{t.studentName}</TableHead>
                      <TableHead>{t.previousInstitution}</TableHead>
                      <TableHead>{t.transferredCredits}</TableHead>
                      <TableHead>{t.departmentColumn}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreditTransferData.map((item) => (
                      <TableRow key={item.studentId}>
                        <TableCell className="font-mono">
                          {item.studentId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.studentName}
                        </TableCell>
                        <TableCell>{item.previousInstitution}</TableCell>
                        <TableCell className="font-semibold">
                          {item.transferredCredits}
                        </TableCell>
                        <TableCell>{item.department.toUpperCase()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "feederDistricts" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.feederDistricts}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF("Feeder Districts", feederDistrictsData)
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.districtName}</TableHead>
                      <TableHead>{t.studentsCount}</TableHead>
                      <TableHead>{t.percentage}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feederDistrictsData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.districtName}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {item.studentsCount}
                        </TableCell>
                        <TableCell>{item.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "studentWaiverReport" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.studentWaiverReport}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF("Student Waiver Report", filteredWaiverData)
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.studentId}</TableHead>
                      <TableHead>{t.studentName}</TableHead>
                      <TableHead>{t.departmentColumn}</TableHead>
                      <TableHead>{t.waiverAmount}</TableHead>
                      <TableHead>{t.waiverPercentage}</TableHead>
                      <TableHead>{t.totalFee}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWaiverData.map((item) => (
                      <TableRow key={item.studentId}>
                        <TableCell className="font-mono">
                          {item.studentId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.studentName}
                        </TableCell>
                        <TableCell>{item.department.toUpperCase()}</TableCell>
                        <TableCell className="font-semibold">
                          ৳{item.waiverAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{item.waiverPercentage}%</TableCell>
                        <TableCell>৳{item.totalFee.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "studentRequiredCredits" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.studentRequiredCredits}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF("Student Required Credits", filteredCreditsData)
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.studentId}</TableHead>
                      <TableHead>{t.studentName}</TableHead>
                      <TableHead>{t.departmentColumn}</TableHead>
                      <TableHead>{t.creditsRequired}</TableHead>
                      <TableHead>{t.creditsCompleted}</TableHead>
                      <TableHead>{t.remainingCredits}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreditsData.map((item) => (
                      <TableRow key={item.studentId}>
                        <TableCell className="font-mono">
                          {item.studentId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.studentName}
                        </TableCell>
                        <TableCell>{item.department.toUpperCase()}</TableCell>
                        <TableCell>{item.creditsRequired}</TableCell>
                        <TableCell className="font-semibold">
                          {item.creditsCompleted}
                        </TableCell>
                        <TableCell>{item.remainingCredits}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "studentIdCards" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.studentIdCards}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF("Student ID Cards", filteredIdCardData)
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.studentId}</TableHead>
                      <TableHead>{t.studentName}</TableHead>
                      <TableHead>{t.departmentColumn}</TableHead>
                      <TableHead>{t.program}</TableHead>
                      <TableHead>{t.cardGenerated}</TableHead>
                      <TableHead>{t.generatedDate}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIdCardData.map((item) => (
                      <TableRow key={item.studentId}>
                        <TableCell className="font-mono">
                          {item.studentId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.studentName}
                        </TableCell>
                        <TableCell>{item.department.toUpperCase()}</TableCell>
                        <TableCell>{item.program}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              item.cardGenerated === "Yes"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.cardGenerated}
                          </span>
                        </TableCell>
                        <TableCell>{item.generatedDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeReport === "departmentWiseTargets" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  {t.departmentWiseTargets}
                </CardTitle>
                <Button
                  onClick={() =>
                    exportToPDF("Department-wise Targets", filteredTargetsData)
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.departmentColumn}</TableHead>
                      <TableHead>{t.targetSet}</TableHead>
                      <TableHead>{t.achieved}</TableHead>
                      <TableHead>{t.percentage}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTargetsData.map((item) => (
                      <TableRow key={item.department}>
                        <TableCell className="font-medium">
                          {item.department.toUpperCase()}
                        </TableCell>
                        <TableCell>{item.targetSet}</TableCell>
                        <TableCell className="font-semibold">
                          {item.achieved}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              item.percentage >= 80
                                ? "bg-green-100 text-green-800"
                                : item.percentage >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.percentage}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Referrers Report */}
          {activeReport === "referrers" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  Referral Program - Referrers
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    className="bg-deep-plum"
                    onClick={fetchAndExportReferrers}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveReport(null)}
                  >
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(referrersList) &&
                    referrersList.length > 0 ? (
                      referrersList.map((r) => (
                        <TableRow key={r.employee_id}>
                          <TableCell className="font-mono">
                            {r.employee_id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {r.name}
                          </TableCell>
                          <TableCell>{r.department}</TableCell>
                          <TableCell>{r.designation}</TableCell>
                          <TableCell>{r.email}</TableCell>
                          <TableCell>{r.phone}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-sm text-gray-500"
                        >
                          No referrers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Visitors Report */}
          {activeReport === "visitors" && (
            <Card className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-poppins text-deep-plum">
                  Visitors Log
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    className="bg-deep-plum"
                    onClick={fetchAndExportVisitors}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveReport(null)}
                  >
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead>Campus</TableHead>
                      <TableHead>Visitor Name</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Interested In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitorsList.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono">{v.id}</TableCell>
                        <TableCell>{v.visit_date}</TableCell>
                        <TableCell>{v.campus}</TableCell>
                        <TableCell className="font-medium">
                          {v.visitor_name}
                        </TableCell>
                        <TableCell>{v.district}</TableCell>
                        <TableCell>{v.contact_number}</TableCell>
                        <TableCell>{v.interested_in}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-deep-plum font-poppins">
                {t.title}
              </h1>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center gap-4">
              <Button className="bg-deep-plum hover:bg-accent-purple">
                <Download className="w-4 h-4 mr-2" />
                {t.exportPDF}
              </Button>
              <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    language === "en"
                      ? "bg-deep-plum text-white"
                      : "text-gray-600 hover:text-deep-plum"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("bn")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    language === "bn"
                      ? "bg-deep-plum text-white"
                      : "text-gray-600 hover:text-deep-plum"
                  }`}
                >
                  BN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Categories Navigation */}
        <Card className="bg-white shadow-lg mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-deep-plum mb-4">
              {t.reportCategories}
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {(() => {
                const allCategories = [
                  { id: "overview", label: t.overview, icon: BarChart3 },
                  { id: "student", label: t.studentReports, icon: Users },
                  {
                    id: "financial",
                    label: t.financialReports,
                    icon: DollarSign,
                  },
                  { id: "waiver", label: t.waiverReports, icon: BookOpen },
                  { id: "idcards", label: t.idCardReports, icon: IdCard },
                  { id: "targets", label: t.targetReports, icon: Target },
                ];
                // Filter categories by scope if provided
                const categories =
                  scope === "finance"
                    ? allCategories.filter((c) =>
                        ["overview", "financial", "waiver"].includes(c.id),
                      )
                    : scope === "admission"
                      ? allCategories.filter((c) =>
                          [
                            "overview",
                            "student",
                            "idcards",
                            "targets",
                            "waiver",
                          ].includes(c.id),
                        )
                      : allCategories;
                // Ensure active category is valid for scope
                if (!categories.find((c) => c.id === activeReportCategory)) {
                  // default to overview or financial for finance scope
                  setActiveReportCategory(
                    scope === "finance" ? "financial" : "overview",
                  );
                }
                return categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      activeReportCategory === category.id
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveReportCategory(category.id)}
                    className={`${
                      activeReportCategory === category.id
                        ? "bg-deep-plum text-white"
                        : "text-deep-plum border-deep-plum hover:bg-deep-plum hover:text-white"
                    }`}
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </Button>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-white shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.dateRange}</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_7_days">{t.last7Days}</SelectItem>
                    <SelectItem value="last_30_days">{t.last30Days}</SelectItem>
                    <SelectItem value="last_3_months">
                      {t.last3Months}
                    </SelectItem>
                    <SelectItem value="last_year">{t.lastYear}</SelectItem>
                    <SelectItem value="custom">{t.custom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.program}</label>
                <Select
                  value={selectedProgram}
                  onValueChange={setSelectedProgram}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allPrograms}</SelectItem>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="masters">Masters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.department}</label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allDepartments}</SelectItem>
                    <SelectItem value="cse">CSE</SelectItem>
                    <SelectItem value="eee">EEE</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="bba">BBA</SelectItem>
                    <SelectItem value="law">Law</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.semester}</label>
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allSemesters}</SelectItem>
                    <SelectItem value="spring_2024">{t.spring2024}</SelectItem>
                    <SelectItem value="fall_2024">{t.fall2024}</SelectItem>
                    <SelectItem value="summer_2024">{t.summer2024}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="bg-deep-plum hover:bg-accent-purple w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  {t.generateReport}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {kpi.label}
                    </p>
                    <p className="text-3xl font-bold text-deep-plum">
                      {kpi.value}
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      {kpi.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.color}`}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dynamic Report Content Based on Selected Category */}
        {activeReportCategory === "overview" && (
          <>
            {/* Student ID Generation Statistics */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-blue-800 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t.studentIdStats}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <IdCard className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {t.universityIds}
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          {getIDGenerationStats().totalGenerated}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">{t.ugcIds}</p>
                        <p className="text-2xl font-bold text-purple-800">
                          {getIDGenerationStats().totalGenerated}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {t.activeStudents}
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          {getIDGenerationStats().activeStudents}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {t.idGenerationRate}
                        </p>
                        <p className="text-2xl font-bold text-orange-800">
                          98.5%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recently Generated IDs Table */}
                <div className="bg-white rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">
                      {t.recentlyGenerated}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.universityId}</TableHead>
                        <TableHead>UGC ID (Admin)</TableHead>
                        <TableHead>{t.studentName}</TableHead>
                        <TableHead>{t.generatedDate2}</TableHead>
                        <TableHead>{t.status}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleStudentIDs.slice(0, 5).map((student, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono font-medium text-blue-700">
                            {student.universityId}
                          </TableCell>
                          <TableCell className="font-mono text-purple-700 text-sm">
                            {student.ugcId}
                          </TableCell>
                          <TableCell>{student.studentName}</TableCell>
                          <TableCell>
                            {new Date(
                              student.generatedDate,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                student.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.isActive ? t.active : "Inactive"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Referrals & Visitors Quick Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-poppins text-deep-plum flex items-center gap-2">
                    <Users className="w-5 h-5" /> Referral Program Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Referrers</p>
                      <p className="text-2xl font-bold text-deep-plum">
                        {referralStats?.total_referrers ?? 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Total Commission: ৳
                        {(
                          referralStats?.total_commission || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Sparkline
                        points={Array(7).fill(
                          referralStats?.total_referrers || 0,
                        )}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveReport("referrers")}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-deep-plum"
                          onClick={fetchAndExportReferrers}
                        >
                          <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-poppins text-deep-plum flex items-center gap-2">
                    <Users className="w-5 h-5" /> Visitors Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Visits</p>
                      <p className="text-2xl font-bold text-deep-plum">
                        {visitorsStats?.total_visits ?? 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Visits Today: {visitorsStats?.visits_today ?? 0}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Sparkline
                        points={Array(7).fill(visitorsStats?.visits_today || 0)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveReport("visitors")}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-deep-plum"
                          onClick={fetchAndExportVisitors}
                        >
                          <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-poppins text-deep-plum">
                  Approved Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    placeholder="Search applicant or referrer"
                    value={referralSearch}
                    onChange={(e) => setReferralSearch(e.target.value)}
                    className="border rounded p-1"
                  />
                  <input
                    type="number"
                    placeholder="Min %"
                    value={minPercent ?? ""}
                    onChange={(e) =>
                      setMinPercent(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="border rounded p-1 w-24"
                  />
                  <input
                    type="number"
                    placeholder="Max %"
                    value={maxPercent ?? ""}
                    onChange={(e) =>
                      setMaxPercent(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="border rounded p-1 w-24"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReferralSearch("");
                      setMinPercent(null);
                      setMaxPercent(null);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    className="bg-deep-plum"
                    onClick={() => {
                      try {
                        const raw =
                          localStorage.getItem("nu_approved_referrals") || "[]";
                        const list = JSON.parse(raw || "[]") || [];
                        downloadCSV("approved_referrals.csv", list);
                      } catch (e) {
                        alert("No approved referrals to export");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                </div>
                <div className="max-h-64 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovedReferrals.map((ar) => (
                        <TableRow key={ar.application_id}>
                          <TableCell>{ar.applicant_name}</TableCell>
                          <TableCell>
                            {ar.referrer_name || ar.referrer_employee_id}
                          </TableCell>
                          <TableCell>{ar.percentage}%</TableCell>
                          <TableCell>
                            ৳
                            {Number(ar.commission_amount || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(ar.approved_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredApprovedReferrals.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            No approved referrals
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Department-wise Admissions */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {t.departmentWiseAdmissions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.departmentColumn}</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Admitted</TableHead>
                        <TableHead>{t.rate}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentData.map((dept, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {dept.department}
                          </TableCell>
                          <TableCell>{dept.applications}</TableCell>
                          <TableCell>{dept.admitted}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">
                              {dept.rate}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t.monthlyTrends}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyTrends.map((month, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium">{month.month}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-600">
                            Applied: {month.applications}
                          </span>
                          <span className="text-green-600">
                            Admitted: {month.admitted}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-poppins text-deep-plum">
                    {t.admissionRate}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent-purple">
                      69%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Overall admission rate
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-poppins text-deep-plum">
                    {t.averageProcessingTime}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent-purple">
                      7
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{t.days}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-poppins text-deep-plum">
                    {t.revenueGenerated}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent-purple">
                      ৳89L
                    </div>
                    <p className="text-sm text-gray-600 mt-1">This semester</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Student Reports Category */}
        {activeReportCategory === "student" && (
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Student Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      key: "programWiseAdmissions",
                      title: t.programWiseAdmissions,
                      description:
                        "Serial – Program Name – Male – Female – Total",
                      icon: GraduationCap,
                      count: filteredProgramWiseData.length,
                    },
                    {
                      key: "studentList",
                      title: t.studentList,
                      description: "Complete list of all students",
                      icon: Users,
                      count: filteredStudentData.length,
                    },
                    {
                      key: "creditTransferStudentList",
                      title: t.creditTransferStudentList,
                      description: "List of credit transfer students",
                      icon: Archive,
                      count: filteredCreditTransferData.length,
                    },
                    {
                      key: "feederDistricts",
                      title: t.feederDistricts,
                      description: "Districts with most students",
                      icon: MapPin,
                      count: feederDistrictsData.length,
                    },
                  ].map((report, index) => (
                    <Card
                      key={index}
                      className="border border-gray-200 hover:border-deep-plum transition-colors cursor-pointer"
                      onClick={() => setActiveReport(report.key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-deep-plum/10 rounded-lg">
                            <report.icon className="w-5 h-5 text-deep-plum" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-deep-plum mb-1">
                              {report.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {report.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {report.count} records
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                {t.viewReport}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Reports Category */}
        {activeReportCategory === "financial" && (
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: "employeeWiseCollection",
                      title: t.employeeWiseCollection,
                      description: "Collection performance by employee",
                      icon: UserCheck,
                      count: filteredEmployeeData.length,
                    },
                    {
                      key: "dailyCollectionReport",
                      title: t.dailyCollectionReport,
                      description:
                        "View daily collection by admission officers (ID-wise)",
                      icon: Calendar,
                      count: dailyCollectionData.length,
                    },
                  ].map((report, index) => (
                    <Card
                      key={index}
                      className="border border-gray-200 hover:border-deep-plum transition-colors cursor-pointer"
                      onClick={() => setActiveReport(report.key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <report.icon className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-deep-plum mb-1">
                              {report.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {report.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {report.count} records
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                {t.viewReport}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Waiver Reports Category */}
        {activeReportCategory === "waiver" && (
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Waiver Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: "studentWaiverReport",
                      title: t.studentWaiverReport,
                      description: "Waiver details by department",
                      icon: BookOpen,
                      count: filteredWaiverData.length,
                    },
                    {
                      key: "studentRequiredCredits",
                      title: t.studentRequiredCredits,
                      description: "Credit requirements and completion status",
                      icon: GraduationCap,
                      count: filteredCreditsData.length,
                    },
                  ].map((report, index) => (
                    <Card
                      key={index}
                      className="border border-gray-200 hover:border-deep-plum transition-colors cursor-pointer"
                      onClick={() => setActiveReport(report.key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <report.icon className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-deep-plum mb-1">
                              {report.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {report.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {report.count} records
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                {t.viewReport}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ID Card Reports Category */}
        {activeReportCategory === "idcards" && (
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <IdCard className="w-5 h-5" />
                  ID Card Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      key: "studentIdCards",
                      title: t.studentIdCards,
                      description:
                        "Historical data of student ID card generation with status tracking by department and date",
                      icon: IdCard,
                      count: filteredIdCardData.length,
                    },
                  ].map((report, index) => (
                    <Card
                      key={index}
                      className="border border-gray-200 hover:border-deep-plum transition-colors cursor-pointer"
                      onClick={() => setActiveReport(report.key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <report.icon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-deep-plum mb-1">
                              {report.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {report.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {report.count} records
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                {t.viewReport}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student ID Cards Report */}
        {activeReport === "studentIdCards" && (
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                <IdCard className="w-5 h-5" />
                Student ID Card Report - Historical Data
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setActiveReport(null)}
                  variant="outline"
                  className="text-deep-plum border-deep-plum"
                >
                  {t.backToReports}
                </Button>
                <Button
                  onClick={() =>
                    exportToPDF("Student ID Card Report", filteredIdCardData)
                  }
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.downloadReport}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Additional Filters for ID Card Report */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Status Filter
                  </Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Generated">Generated</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Date From
                  </Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Date To
                  </Label>
                  <Input type="date" />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Card Status</TableHead>
                    <TableHead>Generated Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIdCardData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono font-medium">
                        {item.studentId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.studentName}
                      </TableCell>
                      <TableCell>{item.department.toUpperCase()}</TableCell>
                      <TableCell>{item.program}</TableCell>
                      <TableCell>{item.batch}</TableCell>
                      <TableCell>
                        {new Date(item.admissionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.cardGenerated === "Generated"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {item.cardGenerated}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.generatedDate !== "-"
                          ? new Date(item.generatedDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Target Reports Category */}
        {activeReportCategory === "targets" && (
          <div className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Target & Performance Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Card
                    className="border border-gray-200 hover:border-deep-plum transition-colors cursor-pointer"
                    onClick={() => setActiveReport("departmentWiseTargets")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-deep-plum mb-1">
                            {t.departmentWiseTargets}
                          </h4>
                          <p className="text-xs text-gray-600 mb-3">
                            View admission targets by department with
                            performance tracking
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {filteredTargetsData.length} departments
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              {t.viewReport}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
