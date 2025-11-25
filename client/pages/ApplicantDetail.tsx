import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  FileText,
  CreditCard,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  MessageSquare,
  Shield,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import apiClient from "../lib/api";
import { defaultSyllabuses } from "../lib/syllabusData";
import StudentReport from "./components/StudentReport";

export default function ApplicantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any | null>(null);
  const [studentIDs, setStudentIDs] = useState<any | null>(null);
  const [isGeneratingIDs, setIsGeneratingIDs] = useState(false);
  // Manage photo src to prevent infinite reload loops
  const [photoSrc, setPhotoSrc] = useState<string>('/placeholder.svg');
  // Inline report state to render generated student report inside this page
  const [inlineReport, setInlineReport] = useState<any | null>(null);
  const [isMakingStudent, setIsMakingStudent] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentCreatedData, setStudentCreatedData] = useState<any | null>(null);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [approvalNote, setApprovalNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [mrNumber, setMrNumber] = useState<string | null>(null);
  const [mrUrl, setMrUrl] = useState<string | null>(null);

  const texts = {
    en: {
      title: "Applicant Details",
      backToList: "Back to Admission List",
      admissionStatus: "Admission Status",
      paymentStatus: "Payment Status",
      personalInfo: "Personal Information",
      contactInfo: "Contact Information",
      academicHistory: "Academic History",
      documentsUploaded: "Documents Uploaded",
      waiverInfo: "Fees & Waiver",
      invoicePreview: "Invoice Preview",
      actions: "Actions",
      approve: "Approve Application",
      hold: "Put on Hold",
      reject: "Reject Application",
      lock: "Lock Application",
      unlock: "Unlock Application",
      createId: "Create Student ID",
      sendEmail: "Send Email",
      sendSMS: "Send SMS",
      downloadInvoice: "Download Invoice",
      underReview: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
      onHold: "On Hold",
      pending: "Pending",
      verified: "Verified",
      failed: "Failed",
      name: "Name",
      email: "Email",
      phone: "Phone",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      address: "Address",
      nationality: "Nationality",
      trackingId: "Tracking ID",
      applicationDate: "Application Date",
      program: "Program",
      department: "Department",
      semester: "Semester",
      sscResults: "SSC Results",
      hscResults: "HSC Results",
      sscCertificate: "SSC Certificate",
      hscCertificate: "HSC Certificate",
      nidCopy: "NID Copy",
      photograph: "Photograph",
      otherDocs: "Other Documents",
      uploaded: "Uploaded",
      notUploaded: "Not Uploaded",
      waiverType: "Waiver Type",
      waiverPercentage: "Waiver Percentage",
      originalAmount: "Original Amount",
      waiverAmount: "Waiver Amount",
      finalAmount: "Final Amount",
      admissionFee: "Admission Fee",
      courseFee: "Course Fee",
      labFee: "Lab Fee",
      others: "Others",
      total: "Total",
      approvalNote: "Approval Note",
      rejectionReason: "Rejection Reason",
      studentId: "Student ID",
      applicantId: "Applicant ID",
      password: "Password",
      confirmApproval: "Confirm Approval",
      confirmRejection: "Confirm Rejection",
      studentIDs: "Student IDs",
      universityId: "University ID",
      ugcId: "UGC ID",
      generateIDs: "Generate Student IDs",
      sendSMSId: "Send ID via SMS",
      sendEmailId: "Send ID via Email",
      idsGenerated: "Student IDs Generated Successfully",
      smsSent: "SMS sent successfully",
      emailSent: "Email sent successfully",
      batch: "Batch",
      generatedOn: "Generated On",
      idStatus: "ID Status",
      active: "Active",
      inactive: "Inactive",
      ugcNote:
        "UGC ID is used for certificate authorization and is visible only to admin staff.",
      changeLog: "Change Log",
    },
    bn: {
      title: "আবেদনকারীর বিবর��",
      backToList: "ভর্���ি তালিকায় ফিরুন",
      personalInfo: "ব্যক্তিগত তথ্য",
      contactInfo: "যোগাযোগের তথ্য",
      academicHistory: "শিক্ষাগত ইতিহাস",
      documentsUploaded: "আপলোডক���ত কাগজপত্র",
      waiverInfo: "মওকুফ ���থ্য",
      actions: "���র্ম",
      approve: "আবেদন অনুমোদন",
      reject: "আবেদন ����্রত্যাখ্�����ন",
      generateIDs: "ছাত্র আইডি তৈরি করুন",
      changeLog: "পরিব��্তন লগ",
    },
  };

  const t: any = texts[language];

  const loadApplication = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiClient.getApplication(id);
      if (res.success && res.data) {
        setApplication(res.data.application || res.data);
        // set photo source from application documents if present
        const docPhoto = res.data.application?.documents?.photograph?.file_url || res.data.documents?.photograph?.file_url || res.data?.documents?.photograph?.file_url;
        if (docPhoto) setPhotoSrc(docPhoto);
        if (res.data.application?.id_generation) {
          setStudentIDs(res.data.application.id_generation);
        } else if (res.data.id_generation) {
          setStudentIDs(res.data.id_generation);
        }
      } else {
        // fallback: try to set application from res.data
        if (res.success && res.data) setApplication(res.data);
      }
    } catch (error) {
      console.error("Failed to load application", error);
      toast({ title: "Error", description: "Failed to load application" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStatusBadge = (status: string, type: "admission" | "payment") => {
    const statusConfigs = {
      admission: {
        pending: {
          color: "bg-yellow-100 text-yellow-800",
          label: "Pending",
          icon: Clock,
        },
        approved: {
          color: "bg-green-100 text-green-800",
          label: "Approved",
          icon: CheckCircle,
        },
        rejected: {
          color: "bg-red-100 text-red-800",
          label: "Rejected",
          icon: XCircle,
        },
        on_hold: {
          color: "bg-gray-100 text-gray-800",
          label: "On Hold",
          icon: Clock,
        },
      },
      payment: {
        pending: {
          color: "bg-yellow-100 text-yellow-800",
          label: "Pending",
          icon: Clock,
        },
        verified: {
          color: "bg-green-100 text-green-800",
          label: "Verified",
          icon: CheckCircle,
        },
        failed: {
          color: "bg-red-100 text-red-800",
          label: "Failed",
          icon: XCircle,
        },
      },
    } as const;

    const cfg = (statusConfigs as any)[type][status] as any;
    if (!cfg)
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    const Icon = cfg.icon;
    return (
      <Badge className={cfg.color}>
        <Icon className="w-3 h-3 mr-1" /> {cfg.label}
      </Badge>
    );
  };

  const handleApprove = async () => {
    if (!application) return;
    try {
      // Update status on server
      const res = await apiClient.updateApplicationStatus(
        application.id,
        "approved",
      );
      if (res.success) {
        toast({ title: "Approved", description: "Application approved" });
        // Generate IDs
        setIsGeneratingIDs(true);
        const gid = await apiClient.generateApplicationIds(application.id);
        let generatedIds: any = null;
        if (gid.success && gid.data) {
          generatedIds = {
            university_id: gid.data.university_id,
            ugc_id: gid.data.ugc_id || undefined,
            batch:
              gid.data.batch ||
              `${application.semester} ${new Date().getFullYear()}`,
          };
          setStudentIDs({
            universityId: generatedIds.university_id,
            ugcId: generatedIds.ugc_id,
            batch: generatedIds.batch,
            generatedDate: gid.data.generated_date || new Date().toISOString(),
            universityEmail: gid.data.generated_email || undefined,
          });

          if (gid.data.generated_email) {
            toast({
              title: "Welcome email (mock) sent",
              description: gid.data.generated_email,
            });
          }
        }

        // refresh application
        await loadApplication();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to approve",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to approve",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIDs(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    try {
      const res = await apiClient.updateApplicationStatus(
        application.id,
        "rejected",
      );
      if (res.success) {
        toast({ title: "Rejected", description: "Application rejected" });
        await loadApplication();
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to reject",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to reject",
        variant: "destructive",
      });
    }
  };

  const handleGenerateIDs = async () => {
    if (!application) return;
    setIsGeneratingIDs(true);
    try {
      const gid = await apiClient.generateApplicationIds(application.id);
      if (gid.success && gid.data) {
        setStudentIDs({
          universityId: gid.data.university_id,
          ugcId: gid.data.ugc_id || gid.data.ugc_id,
          batch:
            gid.data.batch ||
            `${application.semester} ${new Date().getFullYear()}`,
          generatedDate: gid.data.generated_date || new Date().toISOString(),
          universityEmail: gid.data.generated_email || undefined,
        });
        if (gid.data.generated_email) {
          toast({
            title: "Welcome email (mock) sent",
            description: gid.data.generated_email,
          });
        } else {
          toast({ title: t.idsGenerated });
        }
      } else {
        toast({
          title: "Error",
          description: gid.error || "Failed to generate IDs",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to generate IDs",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIDs(false);
    }
  };

  const handleMakeStudent = async () => {
    if (!application) return;
    setIsMakingStudent(true);
    try {
      // Prefer explicit verification flags set by admin
      const academicOk = application?.academic_verified === true || !!(academic && ((academic.sscGPA || academic.ssc_gpa || academic.hscGPA || academic.hsc_gpa) || (application.academic_history && application.academic_history.sscGPA)));
      const paymentOk = application?.payment_verified === true || application.payment_status === 'verified' || application.payment_status === 'paid';

      if (!academicOk || !paymentOk) {
        toast({ title: 'Review incomplete', description: 'Please ensure academic qualifications and payment are verified before converting to student', variant: 'destructive' });
        setIsMakingStudent(false);
        return;
      }

      const res = await apiClient.generateStudentForApplicant(application.id);
      if (res.success && res.data) {
        // Add additional automation summary to returned data for UI display
        // Build detailed summary using syllabus data when available
        const programName = (application?.program_name || application?.program || 'Program').toString();
        const programId = (application?.department_code || application?.program_code || '').toString().toLowerCase();
        const syllabus = defaultSyllabuses.find((s) => (s.programId && programId && s.programId === programId) || s.programName.toLowerCase().includes(programName.toLowerCase())) || defaultSyllabuses[0];

        const admissionFee = syllabus?.feeStructure?.admissionFee || (application?.fees || []).find((f: any) => (f.cost_head || '').toLowerCase().includes('admission'))?.cost_amount || 0;
        const perCreditFee = syllabus?.feeStructure?.perCreditFee || 0;

        const firstSemester = syllabus?.semesters?.[0] || { courses: [], totalCredits: 0 };
        const firstSemesterCredits = firstSemester.totalCredits || firstSemester.courses.reduce((s: number, c: any) => s + (c?.credits || 0), 0);
        const labCourses = (firstSemester.courses || []).filter((c: any) => c?.type === 'lab').length;
        const tuitionFirstSemester = perCreditFee * firstSemesterCredits + (syllabus?.feeStructure?.labFeePerCourse || 0) * labCourses;

        const mrNumber = `MR-${Date.now()}`;
        const mrUrl = `/mock-receipts/${mrNumber}.pdf`;
        const tuitionBillUrl = `/mock-receipts/tuition-${mrNumber}.pdf`;

        const programType = syllabus?.programName?.toLowerCase().includes("master") ? 'Masters' : 'Bachelors';

        const detailed = {
          university_id: res.data.student_id,
          ugc_id: res.data.ugc_id,
          semester: application.semester || 'Spring',
          program: syllabus?.programName || programName,
          admission_fees: [{ name: 'Admission Fee', amount: admissionFee }],
          mr: { number: mrNumber, url: mrUrl },
          program_type: programType,
          batch: application.semester || 'Batch 2024',
          university_email: res.data.generated_email || `${(res.data.student_id || '').toLowerCase()}@nu.edu.bd`,
          fee_structure: syllabus?.feeStructure || {},
          syllabus_version: syllabus?.packageCode || syllabus?.id || 'v1',
          first_semester_courses: (firstSemester.courses || []).map((c: any) => ({
            code: c.code,
            title: c.name,
            credits: c.credits,
            section: 'A',
            faculty: application.department_name || application.department_name || 'Faculty of Engineering',
            type: c.type,
          })),
          first_semester_tuition: { amount: tuitionFirstSemester, url: tuitionBillUrl },
          welcome_email_sent: true,
          automations: [
            'University ID/Roll Generated',
            'UGC Unique ID Generated',
            `Semester selected: ${application.semester || 'Spring'}`,
            'Permission request queued for limited-seat programs',
            `Program selected: ${syllabus?.programName || programName}`,
            'Admission fees selected',
            `Program Type: ${programType}`,
            `Batch: ${application.semester || 'Batch 2024'}`,
            `University email: ${res.data.generated_email || `${(res.data.student_id || '').toLowerCase()}@nu.edu.bd`}`,
            `Fee structure applied: ${syllabus?.packageCode || 'default'}`,
            `Syllabus version: ${syllabus?.packageCode || syllabus?.id || 'v1'}`,
            'Admission fee MR generated',
            'First semester courses registered',
            'First semester tuition bill generated',
          ],
          personal_info: {
            father: personalWithDefaults.father_name,
            mother: personalWithDefaults.mother_name,
            guardian: personalWithDefaults.local_guardian,
            student_mobile: personalWithDefaults.student_mobile,
            student_email: personalWithDefaults.student_email,
            required_credits: personalWithDefaults.required_credits,
            grading_system: personalWithDefaults.grading_system,
            gender: personalWithDefaults.gender,
            date_of_birth: personalWithDefaults.date_of_birth,
            quota: personalWithDefaults.quota,
            religion: personalWithDefaults.religion,
            picture: application?.documents?.photograph || null,
            disability_status: personalWithDefaults.disability_status,
            blood_group: personalWithDefaults.blood_group,
            id_numbers: personalWithDefaults.id_numbers,
            remarks: personalWithDefaults.remarks,
            present_address: personalWithDefaults.present_address,
            permanent_address: personalWithDefaults.permanent_address,
            local_guardian: personalWithDefaults.local_guardian,
          },
        };

        // store generated ids in application (mock) and navigate to dedicated report page
        try { await apiClient.updateApplicationStatus(application.id, 'converted_to_student'); } catch (e) { console.warn('Failed to update status', e); }
        try { await apiClient.createStudentRecord(application.id, { university_id: detailed.university_id, ugc_id: detailed.ugc_id }); } catch (e) { console.warn('Failed to create student', e); }
        await loadApplication();
        // Render report inline in this page to avoid server-side 404 on deep links
        setInlineReport(detailed);
        // close modal if open
        setStudentModalOpen(false);
        // scroll to top of page so the report is visible
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
        toast({ title: 'Student Created', description: detailed.university_id });
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to generate student ID', variant: 'destructive' });
      }
    } catch (e) {
      console.error('Generate student failed', e);
      toast({ title: 'Error', description: 'Failed to generate student ID', variant: 'destructive' });
    } finally {
      setIsMakingStudent(false);
    }
  };

  const handleSendSMS = async () => {
    if (!application || !studentIDs) return;
    setSendingSMS(true);
    try {
      // Mock sending SMS
      await new Promise((r) => setTimeout(r, 800));
      toast({ title: t.smsSent });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to send SMS",
        variant: "destructive",
      });
    } finally {
      setSendingSMS(false);
    }
  };

  const handleSendEmail = async () => {
    if (!application || !studentIDs) return;
    setSendingEmail(true);
    try {
      // Mock sending Email
      await new Promise((r) => setTimeout(r, 800));
      toast({ title: t.emailSent });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to send Email",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const handleDownloadReceipt = async () => {
    if (!application) return;
    setIsDownloadingReceipt(true);
    try {
      const res = await apiClient.generateMoneyReceiptPdf(application.id);
      if (res.success && res.data?.isFile && res.data.blob) {
        const url = URL.createObjectURL(res.data.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.data.filename || `money_receipt_${application.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        toast({
          title: "No receipt",
          description: res.error || "Failed to generate receipt",
        });
      }
    } catch (e) {
      console.error("Download MR failed", e);
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-deep-plum" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const personal =
    application?.personal_info || application?.personalInfo || {};
  const academic = application?.academic_history || application?.academic || [];
  const documents = application?.documents || application?.documents || {};
  const waiver = application?.waiver || application?.waiver || null;

  // Determine program level (diploma, undergrad, masters) from program_name or program_code
  function deriveProgramLevel(app: any) {
    const name = (app?.program_name || app?.program || "").toString().toLowerCase();
    const code = (app?.program_code || "").toString().toLowerCase();
    if (name.includes("master") || name.includes("m\.s") || name.includes("msc") || name.includes("ma") || code.includes("master") || name.includes("mph") || name.includes("llm")) return "masters";
    if (name.includes("bsc") || name.includes("bachelor") || name.includes("bba") || name.includes("hon") || code.includes("bsc") || code.includes("bba") || code.includes("bachelor")) return "undergrad";
    if (name.includes("diploma") || code.includes("diploma") || name.includes("polytechnic")) return "diploma";
    // fallback: if program duration indicates 4 years -> undergrad
    if ((app?.duration || "").toString().includes("4 years")) return "undergrad";
    return "undergrad";
  }

  const programLevel = deriveProgramLevel(application || {});

  // Normalize academic array to uniform objects
  const academicArray = Array.isArray(academic) ? academic : [academic];

  function matchesLevel(record: any, level: string) {
    const name = (record?.exam_name || record?.level || "").toString().toLowerCase();
    if (level === "hsc") return name.includes("hsc") || name.includes("higher") || name.includes("intermediate");
    if (level === "ssc") return name.includes("ssc") || name.includes("secondary");
    if (level === "undergrad") return name.includes("bachelor") || name.includes("bsc") || name.includes("hon") || name.includes("undergrad") || name.includes("ug");
    if (level === "university") return name.includes("degree") || name.includes("bachelor") || name.includes("master") || name.includes("university") || name.includes("graduation");
    return false;
  }

  // Select records based on program level
  let recordsToShow: any[] = [];
  if (programLevel === "diploma") {
    recordsToShow = academicArray.filter((r: any) => matchesLevel(r, "hsc") || matchesLevel(r, "university") );
  } else if (programLevel === "undergrad") {
    recordsToShow = academicArray.filter((r: any) => matchesLevel(r, "hsc") || matchesLevel(r, "ssc") || matchesLevel(r, "university") );
  } else if (programLevel === "masters") {
    recordsToShow = academicArray.filter((r: any) => matchesLevel(r, "hsc") || matchesLevel(r, "ssc") || matchesLevel(r, "undergrad") || matchesLevel(r, "university") );
  } else {
    recordsToShow = academicArray;
  }

  // If no filtered records, fallback to showing all available
  if (!recordsToShow.length) recordsToShow = academicArray;

  // Quota determination based on waiver data
  const meritWaiverNames = [
    "Golden GPA 5.00",
    "Normal GPA 5.00",
    "GPA 4.80 – 4.99",
    "GPA 4.50 – 4.79",
    "GPA 4.00 – 4.49",
    "GPA 3.50 – 3.99",
  ];
  const otherWaiverNames = [
    "Sibling (students)",
    "Spouse",
    "Freedom Fighter",
    "Female",
    "Tribal",
    "Reference (students, staff, counselor)",
    "Admission Fair",
    "Group Waiver",
    "Direct Ward of Staff",
  ];

  function determineQuota(waiverObj: any) {
    const name = (waiverObj?.name || waiverObj?.type || waiverObj?.category || waiverObj?.waiver_category || "").toString();
    if (!name) return "Merit";
    const lower = name.toLowerCase();
    for (const m of meritWaiverNames) {
      if (lower.includes(m.toLowerCase()) || lower.includes("gpa") || lower.includes("golden")) return "Merit";
    }
    for (const o of otherWaiverNames) {
      if (lower.includes(o.split(" ")[0].toLowerCase())) return o;
    }
    // If waiverObj has a direct matching name from otherWaiverNames, return it
    if (otherWaiverNames.includes(name)) return name;
    // Fallback to Merit for safety
    return "Merit";
  }

  const quotaValue = determineQuota(waiver || application?.waiver || {});

  // Provide defaults for personal information when fields are empty
  const personalWithDefaults: any = {
    name: personal.name || application?.applicant_name || "Rahim Uddin",
    date_of_birth: personal.date_of_birth || personal.dateOfBirth || "1998-05-21",
    gender: personal.gender || "Male",
    nationality: personal.nationality || "Bangladeshi",
    address: personal.address || "House 45, Road 12, Mohammadpur, Dhaka",
    father_name: personal.father_name || personal.fatherName || "Mohammad Karim",
    father_contact: personal.father_contact || personal.fatherContact || "01710001111",
    mother_name: personal.mother_name || personal.motherName || "Fatima Begum",
    mother_contact: personal.mother_contact || personal.motherContact || "01720002222",
    guardian_name: personal.guardian_name || personal.guardianName || "Harun Mollah",
    guardian_contact: personal.guardian_contact || personal.guardianContact || "01730003333",
    student_mobile: personal.phone || application?.phone || "01711223344",
    student_email: personal.email || application?.email || "rahim.uddin@example.com",
    required_credits: application?.required_credits || application?.program?.required_credits || "120",
    grading_system: application?.grading_system || "CGPA (4.00)",
    quota: quotaValue,
    religion: personal.religion || "Islam",
    disability_status: personal.disability_status || "None",
    blood_group: personal.blood_group || "O+",
    id_numbers: personal.id_numbers || personal.ids || application?.id_numbers || "N/A",
    remarks: application?.remarks || personal.remarks || "",
    present_address: personal.present_address || personal.address || "House 45, Road 12, Mohammadpur, Dhaka",
    permanent_address: personal.permanent_address || personal.address || "Village 8, Mirpur, Dhaka",
    local_guardian: personal.local_guardian || { name: "Sabbir Ahmed", contact: "01622334455", address: "Mirpur, Dhaka" },
  };

  // Fees & Waiver calculations: waiver applies only to tuition (Total Course Fee / Tuition)
  const fees = application?.fees || [];
  const totalFees = fees.reduce((s: number, it: any) => s + Number(it.cost_amount || 0), 0);
  function isTuitionFee(item: any) {
    const h = (item?.cost_head || "").toString().toLowerCase();
    if (h.includes("tuition")) return true;
    if (h.includes("total") && h.includes("course")) return true;
    if (h.includes("course fee") && !h.includes("retake")) return true;
    return false;
  }
  const tuitionTotal = fees.reduce((s: number, it: any) => s + (isTuitionFee(it) ? Number(it.cost_amount || 0) : 0), 0);
  const waiverPercent = application?.waiver?.percentage || 0;
  const waiverAmountOnTuition = (waiverPercent / 100) * tuitionTotal;
  const finalAmount = totalFees - waiverAmountOnTuition;

  return (
    <div>
      {/* Student Created Modal */}
      {/* Student Created Modal (shown only when inlineReport not present) */}
      <Dialog open={studentModalOpen && !inlineReport} onOpenChange={setStudentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Student Created Successfully</DialogTitle>
            <DialogDescription>This page summarizes all generated IDs, fees, and registrations for the student.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono">{studentCreatedData?.university_id || studentCreatedData?.student_id}</div>
              <div className="text-sm text-gray-600">This Student ID has been assigned to the student.</div>
              {studentCreatedData?.ugc_id && <div className="text-sm text-gray-700 mt-1">UGC ID: <span className="font-mono">{studentCreatedData.ugc_id}</span></div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Generated IDs & Basic Info</div>
                <div className="p-3 border rounded bg-white">
                  <div className="text-sm text-gray-700"><strong>University ID / Roll:</strong> <span className="font-mono">{studentCreatedData?.university_id}</span></div>
                  <div className="text-sm text-gray-700 mt-1"><strong>UGC Unique ID:</strong> <span className="font-mono">{studentCreatedData?.ugc_id}</span></div>
                  <div className="text-sm text-gray-700 mt-1"><strong>Semester:</strong> {studentCreatedData?.semester}</div>
                  <div className="text-sm text-gray-700 mt-1"><strong>Program:</strong> {studentCreatedData?.program}</div>
                  <div className="text-sm text-gray-700 mt-1"><strong>Program Type:</strong> {studentCreatedData?.program_type}</div>
                  <div className="text-sm text-gray-700 mt-1"><strong>Batch:</strong> {studentCreatedData?.batch}</div>
                  <div className="text-sm text-gray-700 mt-1"><strong>University Email:</strong> {studentCreatedData?.university_email}</div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Admission Fees</div>
                  <div className="grid gap-2">
                    {(studentCreatedData?.admission_fees || []).map((f: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded bg-white flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{f.name}</div>
                          <div className="text-xs text-gray-500">Amount</div>
                        </div>
                        <div className="text-sm font-mono">BDT {Number(f.amount || 0).toLocaleString()}</div>
                      </div>
                    ))}

                    {studentCreatedData?.mr && (
                      <div className="p-3 border rounded bg-white flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Money Receipt</div>
                          <div className="text-xs text-gray-500">Admission fee receipt (PDF)</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-mono">{studentCreatedData?.mr?.number}</div>
                          <a href={studentCreatedData?.mr?.url} target="_blank" rel="noreferrer" className="text-deep-plum text-sm">Download</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Fee Structure & Syllabus</div>
                <div className="p-3 border rounded bg-white">
                  <div className="text-sm text-gray-700"><strong>Fee Structure</strong></div>
                  <div className="text-sm text-gray-700 mt-1">Admission Fee: BDT {Number(studentCreatedData?.fee_structure?.admissionFee || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-700">Per Credit Fee: BDT {Number(studentCreatedData?.fee_structure?.perCreditFee || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-700">Lab Fee per Course: BDT {Number(studentCreatedData?.fee_structure?.labFeePerCourse || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-700">Other Fees: BDT {Number(studentCreatedData?.fee_structure?.otherFees || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-700 mt-2"><strong>Syllabus Version:</strong> {studentCreatedData?.syllabus_version}</div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">First Semester Courses</div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left text-sm">
                      <thead>
                        <tr className="text-xs text-gray-600 border-b">
                          <th className="px-2 py-1">Code</th>
                          <th className="px-2 py-1">Title</th>
                          <th className="px-2 py-1">Credits</th>
                          <th className="px-2 py-1">Section</th>
                          <th className="px-2 py-1">Faculty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(studentCreatedData?.first_semester_courses || []).map((c: any, i: number) => (
                          <tr key={i} className="odd:bg-white even:bg-gray-50">
                            <td className="px-2 py-1 align-top">{c.code}</td>
                            <td className="px-2 py-1 align-top">{c.title}</td>
                            <td className="px-2 py-1 align-top">{c.credits}</td>
                            <td className="px-2 py-1 align-top">{c.section}</td>
                            <td className="px-2 py-1 align-top">{c.faculty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 p-3 border rounded bg-white flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">First Semester Tuition</div>
                      <div className="text-xs text-gray-500">Calculated tuition for first semester</div>
                    </div>
                    <div className="text-sm font-mono">BDT {Number(studentCreatedData?.first_semester_tuition?.amount || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => {
                  try {
                    const id = studentCreatedData?.university_id || studentCreatedData?.student_id || '';
                    navigator.clipboard.writeText(id);
                    toast({ title: 'Copied', description: 'Student ID copied to clipboard' });
                  } catch (e) { toast({ title: 'Error', description: 'Failed to copy' }); }
                }}
                className="bg-deep-plum"
              >
                Copy Student ID
              </Button>
              <Button variant="outline" onClick={() => setStudentModalOpen(false)}>Close</Button>
            </div>

            <div className="text-xs text-gray-500 text-center">UGC ID is securely stored for official reporting.</div>
          </div>
        </DialogContent>
      </Dialog>

      {inlineReport && (
        <StudentReport inlineReport={inlineReport} personalWithDefaults={personalWithDefaults} onClose={() => setInlineReport(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ display: inlineReport ? 'none' : undefined }}>
        <div className="mb-6">
          <Link
            to="/admin/admissions"
            className="inline-flex items-center text-accent-purple hover:text-deep-plum mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {t.backToList}
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-deep-plum font-poppins">
                {t.title} - {application?.tracking_id || application?.id}
              </h1>
              <p className="text-gray-600 mt-1">
                {personal.name || application?.applicant_name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${language === "en" ? "bg-deep-plum text-white" : "text-gray-600 hover:text-deep-plum"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("bn")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${language === "bn" ? "bg-deep-plum text-white" : "text-gray-600 hover:text-deep-plum"}`}
                >
                  BN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className={`shadow-lg ${application?.status === "approved" ? "bg-green-50 border-green-200" : application?.status === "rejected" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}
          >
            <CardHeader>
              <CardTitle className="text-lg font-poppins text-deep-plum">
                {t.admissionStatus}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {getStatusBadge(application?.status || "pending", "admission")}
                <div className="flex items-center gap-2">
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isLocked ? "Locked" : "Unlocked"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`shadow-lg ${application?.payment_status === "verified" ? "bg-green-50 border-green-200" : application?.payment_status === "failed" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}
          >
            <CardHeader>
              <CardTitle className="text-lg font-poppins text-deep-plum">
                {t.paymentStatus}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(
                application?.payment_status || "pending",
                "payment",
              )}
            </CardContent>
          </Card>
        </div>


        {/* IDs and Actions */}
        {(application?.status === "approved" || studentIDs) && (
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-poppins text-blue-800 flex items-center gap-2">
                <Shield className="w-5 h-5" /> {t.studentIDs}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentIDs ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-semibold text-blue-800">
                        {t.universityId}
                      </Label>
                      <Badge className="bg-green-600 text-white">
                        {t.active}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 font-mono tracking-wider">
                      {studentIDs.universityId}
                    </div>
                    {studentIDs.universityEmail && (
                      <div className="text-sm text-gray-700 mt-1">
                        Email:{" "}
                        <span className="font-mono text-blue-700">
                          {studentIDs.universityEmail}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm text-gray-600">
                      <div>
                        <strong>{t.batch}:</strong> {studentIDs.batch}
                      </div>
                      <div>
                        <strong>{t.generatedOn}:</strong>{" "}
                        {new Date(
                          studentIDs.generatedDate,
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-semibold text-purple-800">
                        {t.ugcId} (Admin Only)
                      </Label>
                      <Badge className="bg-purple-600 text-white">
                        Confidential
                      </Badge>
                    </div>
                    <div className="text-xl font-bold text-purple-900 font-mono tracking-wider">
                      {studentIDs.ugcId}
                    </div>
                    <Alert className="mt-3 border-purple-200 bg-purple-50">
                      <AlertCircle className="w-4 h-4 text-purple-600" />
                      <AlertDescription className="text-purple-800 text-xs">
                        {t.ugcNote}
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSendSMS}
                      disabled={sendingSMS}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {sendingSMS ? "Sending..." : t.sendSMSId}
                    </Button>
                    <Button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {sendingEmail ? "Sending..." : t.sendEmailId}
                    </Button>

                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        onClick={async () => {
                          if (!application) return;
                          const res = await apiClient.setAcademicVerification(application.id, true);
                          if (res.success) {
                            toast({ title: 'Academic verified' });
                            await loadApplication();
                          } else {
                            toast({ title: 'Failed', description: res.error || 'Unable to verify' });
                          }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        Verify Academic
                      </Button>

                      <Button
                        onClick={async () => {
                          if (!application) return;
                          const res = await apiClient.setPaymentVerification(application.id, true);
                          if (res.success) {
                            toast({ title: 'Payment verified' });
                            await loadApplication();
                          } else {
                            toast({ title: 'Failed', description: res.error || 'Unable to verify' });
                          }
                        }}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                      >
                        Verify Payment
                      </Button>
                    </div>

                    {!studentCreatedData && (
                      <Button
                        onClick={handleMakeStudent}
                        disabled={isMakingStudent}
                        className="bg-deep-plum ml-auto"
                      >
                        {isMakingStudent ? (<><Clock className="w-4 h-4 mr-2 animate-spin" /> Creating...</>) : ("Make Student")}
                      </Button>
                    )}

                    {mrNumber && (
                      <Button
                        variant="outline"
                        className="ml-auto"
                        onClick={handleDownloadReceipt}
                        disabled={isDownloadingReceipt}
                      >
                        {isDownloadingReceipt ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download MR
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-600 mb-4">
                    Applicant IDs not generated yet. Generate IDs after
                    approval.
                  </div>
                  <Button
                    onClick={handleGenerateIDs}
                    disabled={isGeneratingIDs}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingIDs ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        {t.generateIDs}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t.personalInfo}
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              {t.academicHistory}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t.documentsUploaded}
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t.waiverInfo}
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Admission Test
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2">
              <HistoryIcon />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t.personalInfo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t.name}</Label>
                    <p className="text-gray-900">{personalWithDefaults.name}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t.photograph}</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-28 h-28 rounded border overflow-hidden bg-white flex items-center justify-center">
                      <img src={photoSrc} alt="photo" className="w-full h-full object-cover" onError={(e: any) => { try { e.currentTarget.onerror = null; } catch (err) {} if (photoSrc !== '/placeholder.svg') setPhotoSrc('/placeholder.svg'); }} />
                    </div>
                      <div>
                        <input
                          id="photoUpload"
                          type="file"
                          accept="image/*"
                          className="text-sm"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !application) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const fileUrl = `/uploads/${Date.now()}-${file.name}`;
                              const res = await apiClient.updateApplicationDocument(application.id, 'photograph', { file_name: file.name, file_url: fileUrl });
                              if (res.success && res.data?.document) {
                                const doc = res.data.document;
                                setApplication((prev: any) => ({ ...prev, documents: { ...(prev?.documents || {}), photograph: doc } }));
                                if (doc?.file_url) setPhotoSrc(doc.file_url);
                                toast({ title: 'Photo uploaded', description: 'Applicant photo has been updated.' });
                              } else {
                                toast({ title: 'Upload failed', description: res.error || 'Unable to upload photo' });
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-1">Admin can reupload applicant photo here.</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t.dateOfBirth}</Label>
                    <p className="text-gray-900">{personalWithDefaults.date_of_birth}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t.gender}</Label>
                    <p className="text-gray-900">{personalWithDefaults.gender}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t.nationality}</Label>
                    <p className="text-gray-900">{personalWithDefaults.nationality}</p>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600">{t.address}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-xs text-gray-500">Present Address</Label>
                        <p className="text-gray-900">{personalWithDefaults.present_address}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Permanent Address</Label>
                        <p className="text-gray-900">{personalWithDefaults.permanent_address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Guardian and Family Info */}
                  <div className="md:col-span-2 border-t pt-4">
                    <Label className="text-sm font-medium text-gray-600">Guardian / Family</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <div className="text-xs text-gray-500">Father</div>
                        <div className="text-gray-900">{personalWithDefaults.father_name}</div>
                        <div className="text-gray-600 text-sm">{personalWithDefaults.father_contact}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Mother</div>
                        <div className="text-gray-900">{personalWithDefaults.mother_name}</div>
                        <div className="text-gray-600 text-sm">{personalWithDefaults.mother_contact}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Local Guardian</div>
                        <div className="text-gray-900">{personalWithDefaults.local_guardian.name}</div>
                        <div className="text-gray-600 text-sm">{personalWithDefaults.local_guardian.contact}</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Program Info */}
                  <div className="md:col-span-2 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label className="text-xs text-gray-500">Applicant Phone</Label>
                        <div className="text-gray-900">{personalWithDefaults.student_mobile}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Applicant Email</Label>
                        <div className="text-gray-900">{personalWithDefaults.student_email}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Required Credits / Grading</Label>
                        <div className="text-gray-900">{personalWithDefaults.required_credits} / {personalWithDefaults.grading_system}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label className="text-xs text-gray-500">Quota</Label>
                        <div className="text-gray-900">{personalWithDefaults.quota}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Religion</Label>
                        <div className="text-gray-900">{personalWithDefaults.religion}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Disability / Blood</Label>
                        <div className="text-gray-900">{personalWithDefaults.disability_status} / {personalWithDefaults.blood_group}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-xs text-gray-500">ID Numbers</Label>
                      <div className="text-gray-900">{typeof personalWithDefaults.id_numbers === 'string' ? personalWithDefaults.id_numbers : JSON.stringify(personalWithDefaults.id_numbers)}</div>
                    </div>

                    <div className="mt-4">
                      <Label className="text-xs text-gray-500">Remarks</Label>
                      <div className="text-gray-900">{personalWithDefaults.remarks || '-'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="academic">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  {t.academicHistory}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* Prepare grouped records */}
                  {(() => {
                    const sscRecords = academicArray.filter((r: any) => matchesLevel(r, "ssc"));
                    const hscRecords = academicArray.filter((r: any) => matchesLevel(r, "hsc"));
                    const ugRecords = academicArray.filter((r: any) => matchesLevel(r, "undergrad"));
                    const uniRecords = academicArray.filter((r: any) => matchesLevel(r, "university"));

                    const showSSC = programLevel !== "diploma" || sscRecords.length > 0;
                    const showHSC = hscRecords.length > 0 || true; // always show HSC block
                    const showUG = programLevel === "masters" || ugRecords.length > 0;

                    function renderRecordCard(rec: any, idx: number) {
                      const hasGpa = !!(rec.grade_point || rec.gpa);
                      return (
                        <div key={idx} className="p-3 bg-white border rounded">
                          <div className="font-medium mb-2">{rec.exam_name || rec.level || '-'}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                            <div><span className="text-xs text-gray-500">Group / Subject</span><div>{rec.group_subject || rec.group || '-'}</div></div>
                            <div><span className="text-xs text-gray-500">Board / University</span><div>{rec.board_university || rec.board || '-'}</div></div>
                            <div><span className="text-xs text-gray-500">Institute</span><div>{rec.institute_name || rec.institute || '-'}</div></div>
                            <div><span className="text-xs text-gray-500">Passing Year</span><div>{rec.passing_year || '-'}</div></div>
                            <div><span className="text-xs text-gray-500">Roll Number</span><div>{rec.roll_no || rec.roll || '-'}</div></div>
                            <div><span className="text-xs text-gray-500">Registration No / UGC ID</span><div>{rec.registration_no || rec.registrationNo || rec.ugc_id || rec.ugcId || '-'}</div></div>
                            <div><span className="text-xs text-gray-500">Grade Point</span><div>{rec.grade_point || rec.gpa || '-'}</div></div>
                            {!hasGpa && (
                              <div><span className="text-xs text-gray-500">Class / Division</span><div>{rec.obtained_class || rec.class || '-'}</div></div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {showHSC && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">HSC</div>
                            {hscRecords.length ? hscRecords.map((r: any, i: number) => renderRecordCard(r, i)) : <div className="text-sm text-gray-600">No HSC record</div>}
                          </div>
                        )}

                        {showSSC && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">SSC</div>
                            {sscRecords.length ? sscRecords.map((r: any, i: number) => renderRecordCard(r, i)) : <div className="text-sm text-gray-600">No SSC record</div>}
                          </div>
                        )}

                        {showUG && (
                          <div className="md:col-span-2">
                            <div className="text-sm font-medium text-gray-700 mb-2">Undergraduate</div>
                            {ugRecords.length ? ugRecords.map((r: any, i: number) => renderRecordCard(r, i)) : <div className="text-sm text-gray-600">No undergraduate record</div>}
                          </div>
                        )}

                        {uniRecords.length > 0 && (
                          <div className="md:col-span-2">
                            <div className="text-sm font-medium text-gray-700 mb-2">University / Degree</div>
                            {uniRecords.map((r: any, i: number) => renderRecordCard(r, i))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t.documentsUploaded}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(documents).length ? (
                    Object.entries(documents).map(([k, v]: any) => (
                      <div
                        key={k}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{k}</div>
                            <div className="text-xs text-gray-500">
                              {v?.file_name || (v === true ? "Uploaded" : "-")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              v
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {v ? t.uploaded : t.notUploaded}
                          </Badge>
                          {v && typeof v === "object" && v.file_url && (
                            <>
                              <a
                                href={v.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-deep-plum mr-3"
                              >
                                Preview
                              </a>
                              <a
                                href={v.file_url}
                                download={v.file_name || ''}
                                className="text-sm text-deep-plum"
                              >
                                Download
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-600">
                      No documents uploaded
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t.waiverInfo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left">
                      <thead>
                        <tr className="text-sm text-gray-600 border-b">
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Cost Head</th>
                          <th className="px-3 py-2">Credit Taken</th>
                          <th className="px-3 py-2">Cost Amount</th>
                          <th className="px-3 py-2">Deductive Amount</th>
                          <th className="px-3 py-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(application?.fees || []).map((f: any, i: number) => (
                          <tr key={f.id || i} className="odd:bg-white even:bg-gray-50">
                            <td className="px-3 py-2 align-top">{i + 1}</td>
                            <td className="px-3 py-2 align-top">{f.cost_head}</td>
                            <td className="px-3 py-2 align-top">{f.credits_taken || '-'}</td>
                            <td className="px-3 py-2 align-top">BDT {Number(f.cost_amount || 0).toLocaleString()}</td>
                            <td className="px-3 py-2 align-top">BDT {Number(f.deductive_amount || 0).toLocaleString()}</td>
                            <td className="px-3 py-2 align-top">{f.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t.originalAmount}</Label>
                      <p className="text-gray-900">BDT {totalFees.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t.waiverAmount} (applied to tuition only)</Label>
                      <p className="text-green-600 font-semibold">-BDT {waiverAmountOnTuition.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t.finalAmount}</Label>
                      <p className="text-xl font-bold text-accent-purple">BDT {finalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Waiver Details</div>
                    {application?.waiver ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Type</Label>
                          <div className="text-gray-900">{application.waiver.type || '-'}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Waiver Percentage</Label>
                          <div className="text-gray-900">{application.waiver.percentage ? `${application.waiver.percentage}%` : '-'}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Status</Label>
                          <div className={`text-sm font-medium ${application.waiver.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>{application.waiver.status || '-'}</div>
                        </div>
                        <div className="md:col-span-3">
                          <Label className="text-xs text-gray-500">Note</Label>
                          <div className="text-gray-900">{application.waiver.note || '-'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No waiver information</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Admission Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Admission Test Fee</div>
                      <div className="font-medium">{application?.payment_status === 'paid' ? 'Paid' : application?.payment_status || 'Pending'}</div>
                    </div>
                    <div>
                      <Button variant="outline">Admit Card (PDF)</Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Result</Label>
                    <div className="mt-2">
                      {application?.admission_test_status === 'pending' ? 'Pending' : application?.admission_test_status === 'selected' ? 'Selected' : application?.admission_test_status === 'fail' ? 'Fail' : (application?.admission_test_status || 'Not Available')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                  {t.changeLog}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mock change log for now — server audit will be integrated later */}
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">Admission Officer</div>
                        <div className="text-xs text-gray-500">
                          Status changed to pending review
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        2024-01-15 10:00
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">System</div>
                        <div className="text-xs text-gray-500">
                          Application created
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        2024-01-15 09:58
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Right column actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-poppins text-deep-plum">
                  {t.actions}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application?.status !== "approved" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t.approve}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t.confirmApproval}</DialogTitle>
                        <DialogDescription>Confirm approval to generate student IDs and mark application approved.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>{t.approvalNote}</Label>
                          <Textarea
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                            placeholder="Add approval notes..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.applicantId}</Label>
                          <Input
                            value={application?.university_id || ""}
                            readOnly
                          />
                        </div>
                        <Button
                          onClick={handleApprove}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {t.confirmApproval}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {application?.status !== "rejected" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <XCircle className="w-4 h-4 mr-2" />
                        {t.reject}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t.confirmRejection}</DialogTitle>
                        <DialogDescription>Provide a reason for rejection and confirm to update application status.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>{t.rejectionReason}</Label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            required
                          />
                        </div>
                        <Button
                          onClick={handleReject}
                          variant="destructive"
                          className="w-full"
                        >
                          {t.confirmRejection}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="border-t pt-3">
                  <Button
                    onClick={() => setIsLocked(!isLocked)}
                    variant="outline"
                    className="w-full"
                  >
                    {isLocked ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        {t.unlock}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        {t.lock}
                      </>
                    )}
                  </Button>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    {t.sendEmail}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t.sendSMS}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDownloadReceipt}
                    disabled={isDownloadingReceipt}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloadingReceipt
                      ? "Downloading..."
                      : t.downloadInvoice}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small inline icon component for history (to avoid extra imports)
function HistoryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3M3 11a9 9 0 1118 0 9 9 0 01-18 0z"
      />
    </svg>
  );
}
