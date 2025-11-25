import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Award,
  Info,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Upload,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { useApplication } from "../contexts/ApplicationContext";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../lib/api";
import {
  programs,
  departments,
  waiverPolicies,
  getProgramById,
  getDepartmentsByProgram,
  getDepartmentById,
  getWaiverById,
  calculateWaiverAmount,
  getResultBasedWaiverByGPA,
  getResultBasedWaivers,
  type Program,
  type Department,
  type WaiverPolicy,
} from "../lib/programData";
import { registrationPackages } from "../lib/registrationPackages";
import {
  checkProgramEligibility,
  PROGRAM_ELIGIBILITY_RULES,
  type AcademicBackgroundType,
  type AcademicRecord,
  type EligibilityCheckResult,
  type OLevelSubject,
  type ALevelSubject,
} from "../lib/eligibilityRules";

export default function ProgramSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { applicationData, updateApplicationData, saveCurrentStep } =
    useApplication();

  // Get admission type from URL parameter
  const searchParams = new URLSearchParams(window.location.search);
  const admissionType =
    (searchParams.get("type") as "regular" | "credit-transfer") || "regular";

  const [language, setLanguage] = useState<"en" | "bn">("en");
  // Filter selections
  const [selectedCampus, setSelectedCampus] = useState<string>(
    applicationData.campus || "",
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(
    applicationData.semester || "",
  );
  const [selectedSemesterType, setSelectedSemesterType] = useState<string>(
    applicationData.semesterType || "",
  );
  const [selectedProgram, setSelectedProgram] = useState<string>(
    applicationData.program || "",
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    applicationData.department || "",
  );
  const [availableDepartments, setAvailableDepartments] = useState<
    Department[]
  >([]);

  // Academic Background Information
  const [academicBackgroundType, setAcademicBackgroundType] =
    useState<AcademicBackgroundType>(
      (applicationData.academicBackgroundType as AcademicBackgroundType) ||
        "bangla_medium",
    );

  // Bangla Medium (SSC + HSC)
  const [sscGPA, setSscGPA] = useState<string>(
    applicationData.sscGPA?.toString() || "",
  );
  const [hscGPA, setHscGPA] = useState<string>(
    applicationData.hscGPA?.toString() || "",
  );
  const [sscYear, setSscYear] = useState<string>(
    applicationData.sscYear?.toString() || "",
  );
  const [hscYear, setHscYear] = useState<string>(
    applicationData.hscYear?.toString() || "",
  );
  const [hasFourthSubject, setHasFourthSubject] = useState<boolean>(false);

  // English Medium (O/A Level)
  const [oLevelSubjects, setOLevelSubjects] = useState<OLevelSubject[]>([]);
  const [aLevelSubjects, setALevelSubjects] = useState<ALevelSubject[]>([]);

  // Diploma
  const [diplomaCGPA, setDiplomaCGPA] = useState<string>("");
  const [diplomaProgram, setDiplomaProgram] = useState<string>("");

  // Postgraduate
  const [bachelorCGPA, setBachelorCGPA] = useState<string>("");
  const [bachelorDegree, setBachelorDegree] = useState<string>("");
  const [bachelorInstitution, setBachelorInstitution] = useState<string>("");
  const [workExperience, setWorkExperience] = useState<string>("");
  const [hasThirdDivision, setHasThirdDivision] = useState<boolean>(false);
  const [hasScienceBackground, setHasScienceBackground] =
    useState<boolean>(false);

  // Selected Waivers
  const [selectedWaivers, setSelectedWaivers] = useState<string[]>(
    applicationData.selectedWaivers || [],
  );
  const [autoSelectedResultWaiver, setAutoSelectedResultWaiver] =
    useState<string>("");

  // Cost Calculation
  const [costCalculation, setCostCalculation] = useState({
    originalAmount: applicationData.totalCost || 0,
    waiverPercentage: 0,
    waiverAmount: applicationData.waiverAmount || 0,
    finalAmount: applicationData.finalAmount || 0,
  });

  // Package UI filters
  const [pkgSearch, setPkgSearch] = useState("");
  const [pkgTerm, setPkgTerm] = useState<string | null>(null);
  const [pkgMode, setPkgMode] = useState<string | null>(null);
  const [showAllPackages, setShowAllPackages] = useState(false);

  // Currently applied registration package (by id)
  const [appliedPackageId, setAppliedPackageId] = useState<string | null>(
    applicationData.registrationPackageId || null,
  );

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  // Eligibility checking state
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityCheckResult | null>(null);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  // Program limits checking state
  const [programLimits, setProgramLimits] = useState<any>({});
  const [currentProgramStatus, setCurrentProgramStatus] = useState<{
    available: boolean;
    current: number;
    max: number;
    message: string;
  } | null>(null);

  // Existing application check (applicants can apply to only one program)
  let userContext: any = { user: null, userType: "public" };
  try {
    userContext = useAuth();
  } catch (e) {
    // ignore if hook not available
  }
  const { user, userType } = userContext;
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any | null>(
    null,
  );

  useEffect(() => {
    const checkExisting = async () => {
      try {
        if (userType === "applicant" && user?.university_id) {
          const res = await apiClient.getApplications({
            search: user.university_id,
          });
          if (
            res.success &&
            res.data &&
            Array.isArray(res.data.applications) &&
            res.data.applications.length > 0
          ) {
            setHasExistingApplication(true);
            setExistingApplication(res.data.applications[0]);
          }
        }
      } catch (e) {
        // ignore errors
      }
    };
    checkExisting();
  }, [user, userType]);

  // Credit Transfer specific state
  const [previousInstitution, setPreviousInstitution] = useState<string>(
    applicationData.previousInstitution || "",
  );
  const [previousProgram, setPreviousProgram] = useState<string>(
    applicationData.previousProgram || "",
  );
  const [totalCreditsInProgram, setTotalCreditsInProgram] = useState<string>(
    applicationData.totalCreditsInProgram?.toString() || "",
  );
  const [completedCredits, setCompletedCredits] = useState<string>(
    applicationData.completedCredits?.toString() || "",
  );
  const [previousCGPA, setPreviousCGPA] = useState<string>(
    applicationData.previousCGPA?.toString() || "",
  );
  const [reasonForTransfer, setReasonForTransfer] = useState<string>(
    applicationData.reasonForTransfer || "",
  );
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const transcriptFileInputRef = useRef<HTMLInputElement>(null);

  // Filter options
  const campusOptions = [
    { id: "main", name: "Main Campus", namebn: "প্রধান ক্যাম্পাস" },
    { id: "khulna", name: "Khulna Campus", namebn: "খ���লনা ক্যাম��পাস" },
  ];

  const semesterOptionsAll = {
    "bi-semester": [
      { id: "fall", name: "Fall", namebn: "শরত" },
      { id: "winter", name: "Winter", namebn: "শীত" },
    ],
    "tri-semester": [
      { id: "fall", name: "Fall", namebn: "শরত" },
      { id: "summer", name: "Summer", namebn: "গ্রীষ্ম" },
      { id: "winter", name: "Winter", namebn: "শীত" },
    ],
  } as Record<string, { id: string; name: string; namebn: string }[]>;

  const semesterTypeOptions = [
    { id: "bi-semester", name: "Bi-Semester", namebn: "দ্বি-সেমিস্টার" },
    { id: "tri-semester", name: "Tri-Semester", namebn: "ত্রি-সেমিস্টার" },
  ];

  const getSemesterOptionsForType = (type: string) => {
    return semesterOptionsAll[type] || semesterOptionsAll["tri-semester"];
  };

  const texts = {
    en: {
      title: "Program & Department Selection",
      subtitle: "Step 1 of 4 - Choose Your Academic Path & Calculate Costs",
      backToHome: "Back to Home",
      continue: "Save & Continue",
      campusSelection: "Select Campus",
      semesterSelection: "Select Semester",
      semesterTypeSelection: "Select Semester Type",
      programSelection: "Select Program",
      departmentSelection: "Select Department",
      selectCampus: "Choose your campus",
      selectSemester: "Choose semester",
      selectSemesterType: "Choose semester type",
      selectProgram: "Choose your program",
      selectDepartment: "Choose your department",
      programInfo: "Program Information",
      costBreakdown: "Cost Breakdown",
      waiverCalculator: "Waiver Calculator",
      academicInfo: "Academic Information",
      sscGPA: "SSC GPA",
      hscGPA: "HSC GPA",
      fourthSubject: "Had 4th Subject in both SSC & HSC",
      calculateWaiver: "Calculate Eligible Waiver",
      availableWaivers: "Available Waivers",
      resultBasedWaivers: "Result-Based Waivers",
      specialWaivers: "Special Waivers",
      additionalWaivers: "Additional Waivers",
      estimatedCost: "Estimated Cost",
      originalAmount: "Original Amount",
      waiverAmount: "Waiver Amount",
      finalAmount: "Final Amount",
      admissionFee: "Admission Fee",
      courseFee: "Course Fee",
      labFee: "Lab Fee",
      others: "Others",
      total: "Total",
      duration: "Duration",
      faculty: "Faculty",
      description: "Description",
      waiverApplied: "Waiver Applied",
      noWaiverEligible: "No waiver eligible based on GPA",
      selectProgramFirst: "Please select a program first",
      selectDepartmentFirst: "Please select a department first",
      enterGPAValues: "Enter your SSC and HSC GPA to see eligible waivers",
      waiverPolicyNote: "Waiver policies are subject to university approval",
      costNote:
        "Final costs may vary based on additional fees and university policies",
      saving: "Saving...",
      saved: "Data saved successfully!",
      saveError: "Failed to save data. Please try again.",

      // Credit Transfer specific
      creditTransferInfo: "Credit Transfer Information",
      previousInstitution: "Previous Institution",
      previousProgram: "Previous Program",
      totalCredits: "Total Credits in Program",
      completedCredits: "Completed Credits",
      previousCGPA: "Previous CGPA",
      reasonForTransfer: "Reason for Transfer",
      uploadTranscript: "Upload Transcript",
      creditTransferTitle: "Credit Transfer Application",
      creditTransferSubtitle:
        "Step 1 of 4 - Program Selection & Previous Academic Information",
    },
    bn: {
      title: "প্রোগ্রাম ও ব���ভ����গ নির্বা��ন",
      subtitle:
        "৪টি ধাপের ১ম ধাপ - আপনার একাডে���িক পথ বেছে নিন ও খরচ গণ��া করুন",
      backToHome: "হোমে ফিরুন",
      continue: "সেভ ����রে এগিয়ে যা��",
      campusSelection: "ক্যাম্পাস নির্বাচন করু��",
      semesterSelection: "সেমিস���টার ন���র্বাচন করুন",
      semesterTypeSelection: "স��মিস্টার ধরন নির্বাচন করুন",
      programSelection: "প্রোগ্রাম নির্বাচন করুন",
      departmentSelection: "বিভাগ নির্বাচন করুন",
      selectCampus: "আপনার ক্যাম্পাস বেছে নিন",
      selectSemester: "সেমিস��টার ��েছে নিন",
      selectSemesterType: "সেমিস্টার ���রন বেছ�� ন��ন",
      selectProgram: "আপনার প্র���গ্রাম বেছে নি���",
      selectDepartment: "আপনার বিভাগ বেছে নিন",
      programInfo: "প্রোগ���রামের ��থ্য",
      costBreakdown: "খরচ���র বিভাজন",
      waiverCalculator: "���ওক��ফ ক���যালকুলেটর",
      academicInfo: "একাডেমিক তথ্���",
      sscGPA: "এসএসসি জিপিএ",
      hscGPA: "����ই���এসসি জিপিএ",
      fourthSubject: "এসএস����ি ও এই��এসসি উভয়েই ���র্থ ব��ষয় ছিল",
      calculateWaiver: "য���গ্য মওকুফ গণনা কর��ন",
      availableWaivers: "���পল��্ধ মওকুফ",
      resultBasedWaivers: "ফলাফল ভিত্তিক মওকুফ",
      specialWaivers: "��িশেষ মওকু��",
      additionalWaivers: "অতি���িক্ত ম�����ুফ",
      estimatedCost: "আনুমানিক খরচ",
      originalAmount: "মূল পরিমাণ",
      waiverAmount: "���ওকুফ পর��মাণ",
      finalAmount: "চূড়��ন্ত পরিম��ণ",
      admissionFee: "ভ��্তি ফি",
      courseFee: "কোর্স ফি",
      labFee: "ল্যাব ফি",
      others: "অন্যান���য",
      total: "ম��ট",
      duration: "স���য়কাল",
      faculty: "অনুষদ",
      description: "বিবরণ",
      waiverApplied: "মওকুফ প্রয়োগ করা হয়েছে",
      noWaiverEligible: "������পিএর ভিত্তি���ে কোনো মওকু��� যোগ্য ���য়",
      selectProgramFirst: "প্রথমে একটি প্রো�����রাম নির্ব��চ�� করুন",
      selectDepartmentFirst: "প্রথ���ে একটি ��িভাগ নির্বাচন করুন",
      enterGPAValues:
        "যোগ্য মওকুফ ���েখতে আপনা��� এসএসসি এবং এইচএসসি জিপিএ লিখুন",
      waiverPolicyNote: "মওক��ফ নীতি বিশ্ববিদ্যালয়ের অনুমোদন সাপে��্ষে",
      costNote:
        "অতিরি����্��� ফি ���বং বিশ্ববি���্যালয়ের ���ীতির ভিত্তিত�� চূড়ান্ত খরচ পরিবর্তিত �����ে প���রে",
      saving: "সেভ করা হচ্ছে...",
      saved: "ড�����া সফল��াবে সেভ হয়েছে!",
      saveError: "ডে���া সেভ করতে ব্যর্থ। আবার চেষ��টা করুন।",

      // Credit Transfer specific
      creditTransferInfo: "ক্রেডিট ট্রান্সফার তথ্য",
      previousInstitution: "পূর্ববর্তী প্রতিষ্ঠান",
      previousProgram: "পূর্ববর্তী প্রোগ্রাম",
      totalCredits: "প্রোগ্রামের মোট ক্রেডিট",
      completedCredits: "সম্পন্ন ক্রেডিট",
      previousCGPA: "পূর্ববর্তী জিপিএ",
      reasonForTransfer: "ক্রেডিট ট্রান্সফারের কারণ",
      uploadTranscript: "ট্রান্সক্রিপ্ট আপলোড করুন",
      creditTransferTitle: "ক্রেডিট ট্রান্সফার আবেদন",
      creditTransferSubtitle:
        "৪টি ��াপের ১ম ধাপ - প্রোগ্রাম নির্বাচন ও পূর্ববর্তী একাডেমিক তথ্য",
    },
  };

  const t = texts[language];

  // Update available departments when program changes
  useEffect(() => {
    if (selectedProgram) {
      const depts = getDepartmentsByProgram(selectedProgram);
      setAvailableDepartments(depts);
      if (!depts.find((d) => d.id === selectedDepartment)) {
        setSelectedDepartment(""); // Reset department selection if current is not available
      }
    } else {
      setAvailableDepartments([]);
      setSelectedDepartment("");
    }
  }, [selectedProgram, selectedDepartment]);

  // Update cost calculation when program or package or selected waivers change
  useEffect(() => {
    // Determine base amount: prefer applied package total if available
    const baseAmount = (() => {
      if (appliedPackageId) {
        const pkg = registrationPackages.find((p) => p.id === appliedPackageId);
        if (pkg) return pkg.totalEstimated;
      }
      if (selectedProgram) {
        const program = getProgramById(selectedProgram);
        if (program) return program.costStructure.total;
      }
      return 0;
    })();

    // Only consider result-based (merit) waivers for applicant-facing cost calculation
    const visibleSelected = selectedWaivers.filter(
      (id) => getWaiverById(id)?.type === "result",
    );
    const calculation = calculateWaiverAmount(baseAmount, visibleSelected);
    setCostCalculation({ originalAmount: baseAmount, ...calculation });
  }, [selectedProgram, selectedWaivers, appliedPackageId]);

  // Auto-select and apply a registration package when user chooses campus/semester/program/department
  useEffect(() => {
    const findBestPackage = () => {
      // Require all five fields: campus, semester type, semester, program and department
      if (
        !selectedCampus ||
        !selectedSemesterType ||
        !selectedSemester ||
        !selectedProgram ||
        !selectedDepartment
      )
        return null;

      const dept = getDepartmentById(selectedDepartment);
      const programLevel = selectedProgram; // e.g., 'bachelor' or 'masters'
      const semesterToken = selectedSemester.toLowerCase();
      const semesterType = selectedSemesterType;

      // Narrow by term first (must include semester token)
      const candidates = registrationPackages.filter((pkg) => {
        return pkg.term && pkg.term.toLowerCase().includes(semesterToken);
      });

      if (candidates.length === 0) return null;

      // Scoring function to pick best match
      const scoreCandidate = (pkg: any) => {
        let score = 0;
        const pkgText = `${pkg.program} ${pkg.mode}`.toLowerCase();

        // Exact term (including year) is valuable
        if (
          pkg.term &&
          pkg.term.toLowerCase().includes(selectedSemester.toLowerCase())
        )
          score += 50;

        // Department strong match
        const deptIdToken = selectedDepartment.toLowerCase();
        const deptNameToken = dept ? dept.name.toLowerCase() : "";
        if (pkgText.includes(deptIdToken)) score += 100;
        if (deptNameToken && pkgText.includes(deptNameToken)) score += 90;

        // First word of department
        const firstWord = deptNameToken.split(" ")[0];
        if (firstWord && pkgText.includes(firstWord)) score += 40;

        // Program level (bachelor/master)
        const levelToken =
          programLevel === "bachelor"
            ? "bachelor"
            : programLevel === "masters"
              ? "master"
              : programLevel;
        if (
          levelToken &&
          (pkg.mode.toLowerCase().includes(levelToken) ||
            pkg.program.toLowerCase().includes(levelToken))
        )
          score += 30;

        // Semester type bonus
        if (semesterType === "tri-semester") {
          if (
            pkg.mode.toLowerCase().includes("trimester") ||
            pkg.program.toLowerCase().includes("trimester")
          )
            score += 20;
        }

        return score;
      };

      let best: any = null;
      let bestScore = -1;
      for (const c of candidates) {
        const s = scoreCandidate(c);
        if (s > bestScore) {
          bestScore = s;
          best = c;
        }
      }

      return best;
    };

    try {
      const pkg = findBestPackage();
      if (pkg) {
        if (appliedPackageId !== pkg.id) {
          // auto-apply
          const visibleSelected = selectedWaivers.filter(
            (id) => getWaiverById(id)?.type === "result",
          );
          const calculation = calculateWaiverAmount(
            pkg.totalEstimated,
            visibleSelected,
          );

          updateApplicationData({
            program: pkg.id,
            totalCost: pkg.totalEstimated,
            registrationPackageId: pkg.id,
          });

          setAppliedPackageId(pkg.id);
          setCostCalculation({
            originalAmount: pkg.totalEstimated,
            ...calculation,
          });

          toast({
            title: "Package selected",
            description: `${pkg.program} has been preselected based on your choices.`,
          });
        }
      } else {
        // If no package matches, clear appliedPackageId and let program cost govern
        if (appliedPackageId) {
          setAppliedPackageId(null);
          updateApplicationData({ registrationPackageId: null });
        }
      }
    } catch (e) {
      console.error("Auto-package selection error", e);
    }
    // Intentionally include selectedWaivers so waiver recalculation occurs when waivers change
  }, [
    selectedCampus,
    selectedSemester,
    selectedSemesterType,
    selectedProgram,
    selectedDepartment,
    selectedWaivers,
  ]);

  // Calculate result-based waiver when GPA changes
  useEffect(() => {
    if (sscGPA && hscGPA) {
      const sscValue = parseFloat(sscGPA);
      const hscValue = parseFloat(hscGPA);

      if (sscValue >= 0 && sscValue <= 5 && hscValue >= 0 && hscValue <= 5) {
        const resultWaiver = getResultBasedWaiverByGPA(
          sscValue,
          hscValue,
          hasFourthSubject,
        );

        if (resultWaiver) {
          setAutoSelectedResultWaiver(resultWaiver.id);
          // Update selected waivers to include the result-based waiver
          setSelectedWaivers((prev) => {
            const filtered = prev.filter(
              (id) => !getResultBasedWaivers().find((w) => w.id === id),
            );
            return [...filtered, resultWaiver.id];
          });
        } else {
          setAutoSelectedResultWaiver("");
          // Remove any result-based waivers
          setSelectedWaivers((prev) =>
            prev.filter(
              (id) => !getResultBasedWaivers().find((w) => w.id === id),
            ),
          );
        }
      }
    }
  }, [sscGPA, hscGPA, hasFourthSubject]);

  // Helper function to map program + department to eligibility program ID
  const getEligibilityProgramId = (
    programId: string,
    departmentId: string,
  ): string => {
    // Map the old generic program IDs to specific eligibility rule IDs
    if (programId === "bachelor") {
      switch (departmentId) {
        case "cse":
          return "bsc_cse";
        case "eee":
          return "bsc_eee";
        case "ce":
          return "bsc_ce";
        case "bba":
          return "bba";
        case "english":
          return "ba_english";
        case "law":
          return "llb";
        case "pharmacy":
          return "b_pharm";
        default:
          return programId; // fallback
      }
    } else if (programId === "masters") {
      switch (departmentId) {
        case "cse":
          return "msc_cse";
        case "eee":
          return "msc_eee";
        case "ce":
          return "msc_ce";
        case "bba":
          return "mba";
        case "english":
          return "ma_linguistics";
        case "law":
          return "llm";
        case "pharmacy":
          return "m_pharm";
        default:
          return programId;
      }
    }
    return programId;
  };

  // Validate science background for engineering programs
  const validateScienceBackground = (
    programId: string,
    departmentId: string,
    hasScienceBackground: boolean,
  ): string[] => {
    const errors: string[] = [];

    // Engineering departments that require science background
    const engineeringDepts = ["cse", "eee", "ce", "me", "te"];

    if (
      programId === "bachelor" &&
      engineeringDepts.includes(departmentId) &&
      !hasScienceBackground
    ) {
      errors.push(
        `❌ Science background in HSC is mandatory for ${getDepartmentById(departmentId)?.name || departmentId}`,
      );
    }

    return errors;
  };

  // Reset eligibility state when key values change (but DON'T auto-check)
  useEffect(() => {
    // Only reset state, don't auto-check as requested by user
    setEligibilityResult(null);
    setEligibilityChecked(false);
    setShowEligibilityCheck(false);
  }, [
    selectedProgram,
    academicBackgroundType,
    sscGPA,
    hscGPA,
    sscYear,
    hscYear,
    diplomaCGPA,
    diplomaProgram,
    bachelorCGPA,
    bachelorDegree,
    workExperience,
    hasThirdDivision,
    hasScienceBackground,
    oLevelSubjects,
    aLevelSubjects,
  ]);

  // Helper function to check if required academic info is provided
  const hasRequiredAcademicInfo = (): boolean => {
    switch (academicBackgroundType) {
      case "bangla_medium":
        return !!(sscGPA && hscGPA);
      case "english_medium":
        return oLevelSubjects.length >= 5 && aLevelSubjects.length >= 2;
      case "diploma":
        return !!(sscGPA && diplomaCGPA);
      case "postgraduate":
        return !!bachelorCGPA;
      default:
        return false;
    }
  };

  // Helper function to build academic record
  const buildAcademicRecord = (): AcademicRecord => {
    const record: AcademicRecord = {
      backgroundType: academicBackgroundType,
      hasThirdDivision,
      hasScienceBackground,
    };

    switch (academicBackgroundType) {
      case "bangla_medium":
        if (sscGPA) record.sscGPA = parseFloat(sscGPA);
        if (hscGPA) record.hscGPA = parseFloat(hscGPA);
        if (sscYear) record.sscYear = parseInt(sscYear);
        if (hscYear) record.hscYear = parseInt(hscYear);
        break;
      case "english_medium":
        record.oLevelSubjects = oLevelSubjects;
        record.aLevelSubjects = aLevelSubjects;
        break;
      case "diploma":
        if (sscGPA) record.sscGPA = parseFloat(sscGPA);
        if (diplomaCGPA) record.diplomaCGPA = parseFloat(diplomaCGPA);
        record.diplomaProgram = diplomaProgram;
        break;
      case "postgraduate":
        if (bachelorCGPA) record.bachelorCGPA = parseFloat(bachelorCGPA);
        record.bachelorDegree = bachelorDegree;
        record.bachelorInstitution = bachelorInstitution;
        if (workExperience) record.workExperience = parseInt(workExperience);
        break;
    }

    return record;
  };

  // Manual eligibility check function
  const performEligibilityCheck = () => {
    if (!selectedProgram) {
      toast({
        title: "Program Required",
        description: "Please select a program first.",
        variant: "destructive",
      });
      return;
    }

    if (!hasRequiredAcademicInfo()) {
      toast({
        title: "Academic Information Required",
        description: "Please complete your academic information.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDepartment) {
      toast({
        title: "Department Required",
        description: "Please select a department first.",
        variant: "destructive",
      });
      return;
    }

    // Reset previous result and show loading
    setEligibilityResult(null);
    setEligibilityChecked(false);
    setIsCheckingEligibility(true);

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.warn("⚠️ Safety timeout triggered - resetting loading state");
      setIsCheckingEligibility(false);
      toast({
        title: "Timeout",
        description: "Eligibility check took too long. Please try again.",
        variant: "destructive",
      });
    }, 10000); // 10 second safety timeout

    // Perform fresh check after a small delay
    setTimeout(() => {
      try {
        console.log("���� Starting eligibility check...");

        const academicRecord = buildAcademicRecord();
        console.log("📝 Academic record built:", academicRecord);

        // Get the correct eligibility program ID
        const eligibilityProgramId = getEligibilityProgramId(
          selectedProgram,
          selectedDepartment,
        );
        console.log("🎯 Eligibility program ID mapped:", eligibilityProgramId);

        // Check science background for engineering programs first
        const scienceErrors = validateScienceBackground(
          selectedProgram,
          selectedDepartment,
          hasScienceBackground,
        );
        console.log("🔬 Science background validation:", scienceErrors);

        console.log("🔍 Manual eligibility check:", {
          originalProgram: selectedProgram,
          department: selectedDepartment,
          eligibilityProgramId,
          academicRecord,
          scienceErrors,
        });

        let result;

        // If science background validation fails, create a failed result
        if (scienceErrors.length > 0) {
          result = {
            isEligible: false,
            route: "regular" as const,
            requiresAdmissionTest: false,
            requiresViva: false,
            missingRequirements: scienceErrors,
            warnings: [],
            suggestedPrograms: [],
          };
          console.log("❌ Science background validation failed:", result);
        } else {
          // Perform normal eligibility check with mapped program ID
          console.log("🔄 Running checkProgramEligibility...");
          result = checkProgramEligibility(
            eligibilityProgramId,
            academicRecord,
          );
          console.log("✅ Eligibility check result:", result);
        }

        // Always ensure we have a valid result
        if (!result) {
          console.error(
            "❌ No result from eligibility check - creating fallback",
          );
          result = {
            isEligible: false,
            route: "regular" as const,
            requiresAdmissionTest: false,
            requiresViva: false,
            missingRequirements: [
              "Unable to determine eligibility - please try again",
            ],
            warnings: [],
            suggestedPrograms: [],
          };
        }

        console.log("�� Final result:", result);

        // Clear safety timeout since we completed successfully
        clearTimeout(safetyTimeout);

        // Update state
        setEligibilityResult(result);
        setEligibilityChecked(true);
        setShowEligibilityCheck(true);
        setIsCheckingEligibility(false);

        console.log("✨ State updated, showing toast...");

        toast({
          title: result.isEligible ? "✅ Eligible!" : "❌ Not Eligible",
          description: result.isEligible
            ? "You meet the requirements for this program."
            : `Requirements not met: ${result.missingRequirements.length} issues found.`,
          variant: result.isEligible ? "default" : "destructive",
        });

        console.log("🎉 Eligibility check completed successfully!");
      } catch (error) {
        console.error("💥 Error during eligibility check:", error);

        // Clear safety timeout since we're handling the error
        clearTimeout(safetyTimeout);

        // Create error result
        const errorResult = {
          isEligible: false,
          route: "regular" as const,
          requiresAdmissionTest: false,
          requiresViva: false,
          missingRequirements: [
            "An error occurred during eligibility check. Please try again.",
          ],
          warnings: [],
          suggestedPrograms: [],
        };

        // Always reset loading state even on error
        setEligibilityResult(errorResult);
        setEligibilityChecked(true);
        setShowEligibilityCheck(true);
        setIsCheckingEligibility(false);

        toast({
          title: "Error",
          description:
            "An error occurred while checking eligibility. Please try again.",
          variant: "destructive",
        });
      }
    }, 500); // Slightly longer delay to show loading state
  };

  // Clear form data when starting fresh (component mount)
  useEffect(() => {
    // Check if this is a fresh start (no ongoing application)
    const urlParams = new URLSearchParams(window.location.search);
    const isNewApplication = urlParams.get("new") === "true";

    if (isNewApplication) {
      // Clear all form data for new application
      clearAllFormData();
    }
  }, []);

  // Check program limits when program or department changes
  useEffect(() => {
    if (selectedProgram && selectedDepartment) {
      checkProgramLimits(selectedProgram, selectedDepartment);
    } else {
      setCurrentProgramStatus(null);
    }
  }, [selectedProgram, selectedDepartment]);

  // Function to check program limits
  const checkProgramLimits = async (
    programCode: string,
    departmentCode: string,
  ) => {
    if (!programCode || !departmentCode) {
      setCurrentProgramStatus(null);
      return;
    }

    try {
      const settingsResponse = await apiClient.getAdmissionSettings();
      if (settingsResponse.success && settingsResponse.data?.program_limits) {
        const programKey = `${programCode}_${departmentCode}`;
        const limits = settingsResponse.data.program_limits[programKey];

        if (limits && limits.enabled) {
          const current = limits.current_applicants || 0;
          const max = limits.max_applicants || 0;
          const available = current < max;

          let message = "";
          if (!available) {
            message = `Application limit reached (${current}/${max})`;
          } else if (current >= max * 0.9) {
            message = `Almost full! Only ${max - current} spots remaining (${current}/${max})`;
          } else if (current >= max * 0.7) {
            message = `${max - current} spots remaining (${current}/${max})`;
          } else {
            message = `${max - current} spots available (${current}/${max})`;
          }

          setCurrentProgramStatus({
            available,
            current,
            max,
            message,
          });
        } else {
          setCurrentProgramStatus(null);
        }
      }
    } catch (error) {
      console.error("Error checking program limits:", error);
      setCurrentProgramStatus(null);
    }
  };

  // Function to clear all form data
  const clearAllFormData = () => {
    // Clear React state
    setSelectedCampus("");
    setSelectedSemester("");
    setSelectedSemesterType("");
    setSelectedProgram("");
    setSelectedDepartment("");
    setSscGPA("");
    setHscGPA("");
    setSscYear("");
    setHscYear("");
    setHasFourthSubject(false);
    setSelectedWaivers([]);
    setAutoSelectedResultWaiver("");

    // Clear credit transfer fields
    setPreviousInstitution("");
    setPreviousProgram("");
    setTotalCreditsInProgram("");
    setCompletedCredits("");
    setPreviousCGPA("");
    setReasonForTransfer("");
    setTranscriptFile(null);

    // Clear academic background specific fields
    setOLevelSubjects([]);
    setALevelSubjects([]);
    setDiplomaCGPA("");
    setDiplomaProgram("");
    setBachelorCGPA("");
    setBachelorDegree("");
    setBachelorInstitution("");
    setWorkExperience("");
    setHasThirdDivision(false);
    setHasScienceBackground(false);

    // Clear eligibility state
    setEligibilityResult(null);
    setEligibilityChecked(false);
    setShowEligibilityCheck(false);
    setIsCheckingEligibility(false);

    // Clear localStorage cache
    localStorage.removeItem("nu_application_draft");

    // Clear form fields to prevent browser cache
    const form = document.querySelector("form");
    if (form) {
      form.reset();
    }

    // Clear all input fields manually
    document.querySelectorAll("input, select, textarea").forEach((element) => {
      if (element instanceof HTMLInputElement) {
        element.value = "";
        element.checked = false;
      } else if (element instanceof HTMLSelectElement) {
        element.selectedIndex = 0;
      } else if (element instanceof HTMLTextAreaElement) {
        element.value = "";
      }
    });

    toast({
      title: "Form Cleared",
      description: "All form data has been cleared successfully.",
    });
  };

  // Auto-save data when form values change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        selectedCampus ||
        selectedSemester ||
        selectedSemesterType ||
        selectedProgram ||
        selectedDepartment ||
        sscGPA ||
        hscGPA
      ) {
        // Preserve any admin-applied non-result waivers from existing applicationData
        const adminNonResult = (applicationData.selectedWaivers || []).filter(
          (id: string) => getWaiverById(id)?.type !== "result",
        );
        // Only save applicant-visible (result) waivers from this form
        const visibleSelected = selectedWaivers.filter(
          (id) => getWaiverById(id)?.type === "result",
        );
        const mergedSelectedWaivers = Array.from(
          new Set([...adminNonResult, ...visibleSelected]),
        );

        updateApplicationData({
          campus: selectedCampus,
          semester: selectedSemester,
          semesterType: selectedSemesterType,
          program: selectedProgram,
          department: selectedDepartment,
          sscGPA: sscGPA ? parseFloat(sscGPA) : undefined,
          hscGPA: hscGPA ? parseFloat(hscGPA) : undefined,
          selectedWaivers: mergedSelectedWaivers,
          totalCost: costCalculation.originalAmount,
          waiverAmount: costCalculation.waiverAmount,
          finalAmount: costCalculation.finalAmount,
          session: "Spring 2024", // Default session
        });
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [
    selectedCampus,
    selectedSemester,
    selectedSemesterType,
    selectedProgram,
    selectedDepartment,
    sscGPA,
    hscGPA,
    selectedWaivers,
    costCalculation,
    updateApplicationData,
  ]);

  const handleWaiverToggle = (waiverId: string, checked: boolean) => {
    if (checked) {
      setSelectedWaivers((prev) => [...prev, waiverId]);
    } else {
      setSelectedWaivers((prev) => prev.filter((id) => id !== waiverId));
    }
  };

  const handleContinue = async () => {
    if (
      !selectedCampus ||
      !selectedSemester ||
      !selectedSemesterType ||
      !selectedProgram ||
      !selectedDepartment
    ) {
      toast({
        title: "Required Fields Missing",
        description:
          "Please select campus, semester, semester type, program, and department before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Check if required academic info is provided
    if (!hasRequiredAcademicInfo()) {
      toast({
        title: "Academic Information Required",
        description:
          "Please complete your academic information for eligibility verification.",
        variant: "destructive",
      });
      return;
    }

    // Check eligibility before allowing to continue
    if (eligibilityResult && !eligibilityResult.isEligible) {
      toast({
        title: "Eligibility Requirements Not Met",
        description:
          "You do not meet the minimum eligibility requirements for this program. Please check the eligibility section below.",
        variant: "destructive",
      });
      setShowEligibilityCheck(true);
      return;
    }

    // Additional validation for credit transfer
    if (admissionType === "credit-transfer") {
      if (
        !previousInstitution ||
        !previousProgram ||
        !totalCreditsInProgram ||
        !completedCredits ||
        !previousCGPA
      ) {
        toast({
          title: "Credit Transfer Information Required",
          description:
            "Please fill in all credit transfer information before continuing.",
          variant: "destructive",
        });
        return;
      }
    }

    // Enforce single application rule
    if (hasExistingApplication) {
      toast({
        title: "Existing Application Found",
        description:
          "You already have an application. Applicants are allowed to apply to only one program. Please view your existing application.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Build comprehensive save data
      const academicRecord = buildAcademicRecord();
      const saveData = {
        admissionType,
        campus: selectedCampus,
        semester: selectedSemester,
        semesterType: selectedSemesterType,
        program: selectedProgram,
        department: selectedDepartment,

        // Academic background data
        academicBackgroundType,
        ...academicRecord,

        // Waiver and cost data
        selectedWaivers,
        totalCost: costCalculation.originalAmount,
        waiverAmount: costCalculation.waiverAmount,
        finalAmount: costCalculation.finalAmount,
        session: "Spring 2024",

        // Eligibility results
        eligibilityResult,
      };

      // Add credit transfer data if applicable
      if (admissionType === "credit-transfer") {
        Object.assign(saveData, {
          previousInstitution,
          previousProgram,
          totalCreditsInProgram: totalCreditsInProgram
            ? parseInt(totalCreditsInProgram)
            : undefined,
          completedCredits: completedCredits
            ? parseInt(completedCredits)
            : undefined,
          previousCGPA: previousCGPA ? parseFloat(previousCGPA) : undefined,
          reasonForTransfer,
        });
      }

      updateApplicationData(saveData);

      const success = await saveCurrentStep("program-selection");

      if (success) {
        toast({
          title: t.saved,
          description: "Your program selection has been saved.",
        });

        // If admission test is required, show payment info
        if (eligibilityResult?.requiresAdmissionTest) {
          toast({
            title: "Next Step: Admission Test",
            description:
              "Complete your application and pay admission test fee to get admit card.",
          });
        }

        // Preserve offline flag if present in URL
        const urlParams = new URLSearchParams(window.location.search);
        const isOfflineNav = urlParams.get("offline") === "true";
        navigate(
          isOfflineNav
            ? "/personal-information?offline=true"
            : "/personal-information",
        );
      } else {
        toast({
          title: t.saveError,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: t.saveError,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProgramData = selectedProgram
    ? getProgramById(selectedProgram)
    : null;
  const selectedDepartmentData = selectedDepartment
    ? departments.find((d) => d.id === selectedDepartment)
    : null;

  const canProceed =
    selectedCampus &&
    selectedSemester &&
    selectedSemesterType &&
    selectedProgram &&
    selectedDepartment &&
    hasRequiredAcademicInfo() &&
    eligibilityChecked &&
    eligibilityResult?.isEligible &&
    (!currentProgramStatus || currentProgramStatus.available) &&
    !hasExistingApplication; // Check program limits and single-application rule

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-accent-purple hover:text-deep-plum mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToHome}
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-deep-plum font-poppins">
                {admissionType === "credit-transfer"
                  ? t.creditTransferTitle
                  : t.title}
              </h1>
              <p className="text-accent-purple font-medium">
                {admissionType === "credit-transfer"
                  ? t.creditTransferSubtitle
                  : t.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Clear Form Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFormData}
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                🗑�� Clear Form
              </Button>

              {/* Language Toggle */}
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

        <form
          autoComplete="off"
          data-lpignore="true"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* If an applicant already has an application, show notice and prevent new application */}
          {hasExistingApplication && (
            <div className="mb-6">
              <div className="rounded-md bg-yellow-50 p-4 border border-yellow-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-yellow-900">
                      You already have an existing application
                      {existingApplication?.trackingId
                        ? ` (Tracking ID: ${existingApplication.trackingId})`
                        : ""}
                      . Applicants may only apply to one program. Please view or
                      continue with your existing application.
                    </p>
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="text-sm"
                      >
                        View Application
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Selection Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Campus, Semester, and Semester Type Selection */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-poppins text-deep-plum">
                    Admission Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Campus Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="campus">
                      {t.selectCampus} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedCampus}
                      onValueChange={setSelectedCampus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCampus} />
                      </SelectTrigger>
                      <SelectContent>
                        {campusOptions.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id}>
                            {language === "en" ? campus.name : campus.namebn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Semester Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="semester">
                        {t.selectSemester}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedSemester}
                        onValueChange={setSelectedSemester}
                        disabled={!selectedSemesterType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectSemester} />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            getSemesterOptionsForType(selectedSemesterType) ||
                            []
                          ).map((semester) => (
                            <SelectItem key={semester.id} value={semester.id}>
                              {language === "en"
                                ? semester.name
                                : semester.namebn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Semester Type Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="semesterType">
                        {t.selectSemesterType}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedSemesterType}
                        onValueChange={(val) => {
                          setSelectedSemesterType(val);
                          const allowed = getSemesterOptionsForType(val).map(
                            (s) => s.id,
                          );
                          if (!allowed.includes(selectedSemester))
                            setSelectedSemester("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectSemesterType} />
                        </SelectTrigger>
                        <SelectContent>
                          {semesterTypeOptions.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {language === "en" ? type.name : type.namebn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Program and Department Selection */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-poppins text-deep-plum">
                    {t.programSelection}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Program Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="program">
                      {t.selectProgram} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedProgram}
                      onValueChange={setSelectedProgram}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectProgram} />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {language === "en" ? program.name : program.namebn}{" "}
                            (
                            {language === "en"
                              ? program.duration
                              : program.durationbn}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="department">
                      {t.selectDepartment}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedDepartment}
                      onValueChange={setSelectedDepartment}
                      disabled={!selectedProgram}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedProgram
                              ? t.selectDepartment
                              : t.selectProgramFirst
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDepartments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {language === "en"
                              ? department.name
                              : department.namebn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Program Limits Status */}
                  {currentProgramStatus && (
                    <Alert
                      className={`mt-4 ${
                        !currentProgramStatus.available
                          ? "border-red-500 bg-red-50"
                          : currentProgramStatus.current >=
                              currentProgramStatus.max * 0.9
                            ? "border-orange-500 bg-orange-50"
                            : "border-blue-500 bg-blue-50"
                      }`}
                    >
                      <AlertCircle
                        className={`h-4 w-4 ${
                          !currentProgramStatus.available
                            ? "text-red-500"
                            : currentProgramStatus.current >=
                                currentProgramStatus.max * 0.9
                              ? "text-orange-500"
                              : "text-blue-500"
                        }`}
                      />
                      <AlertDescription
                        className={
                          !currentProgramStatus.available
                            ? "text-red-700"
                            : currentProgramStatus.current >=
                                currentProgramStatus.max * 0.9
                              ? "text-orange-700"
                              : "text-blue-700"
                        }
                      >
                        <strong>Application Status:</strong>{" "}
                        {currentProgramStatus.message}
                        {!currentProgramStatus.available && (
                          <span className="block mt-1 text-sm">
                            Please select a different program or contact the
                            admissions office.
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Program Information */}
                  {selectedProgramData && selectedDepartmentData && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <h3 className="font-semibold text-deep-plum mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        {t.programInfo}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{t.duration}:</span>{" "}
                          {language === "en"
                            ? selectedProgramData.duration
                            : selectedProgramData.durationbn}
                        </div>
                        <div>
                          <span className="font-medium">{t.faculty}:</span>{" "}
                          {language === "en"
                            ? selectedDepartmentData.faculty
                            : selectedDepartmentData.facultybn}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">{t.description}:</span>{" "}
                          {language === "en"
                            ? selectedDepartmentData.description
                            : selectedDepartmentData.descriptionbn}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Credit Transfer Information (only for credit transfer applications) */}
              {admissionType === "credit-transfer" && (
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      {t.creditTransferInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="previousInstitution">
                          {t.previousInstitution}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="previousInstitution"
                          value={previousInstitution}
                          onChange={(e) =>
                            setPreviousInstitution(e.target.value)
                          }
                          placeholder="Enter previous institution name"
                          autoComplete="off"
                          data-lpignore="true"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="previousProgram">
                          {t.previousProgram}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="previousProgram"
                          value={previousProgram}
                          onChange={(e) => setPreviousProgram(e.target.value)}
                          placeholder="Enter previous program"
                          autoComplete="off"
                          data-lpignore="true"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalCredits">
                          {t.totalCredits}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="totalCredits"
                          type="number"
                          min="1"
                          value={totalCreditsInProgram}
                          onChange={(e) =>
                            setTotalCreditsInProgram(e.target.value)
                          }
                          placeholder="120"
                          autoComplete="off"
                          data-lpignore="true"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="completedCredits">
                          {t.completedCredits}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="completedCredits"
                          type="number"
                          min="1"
                          value={completedCredits}
                          onChange={(e) => setCompletedCredits(e.target.value)}
                          placeholder="60"
                          autoComplete="off"
                          data-lpignore="true"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="previousCGPA">
                          {t.previousCGPA}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="previousCGPA"
                          type="number"
                          min="0"
                          max="4"
                          step="0.01"
                          value={previousCGPA}
                          onChange={(e) => setPreviousCGPA(e.target.value)}
                          placeholder="3.50"
                          autoComplete="off"
                          data-lpignore="true"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reasonForTransfer">
                          {t.reasonForTransfer}
                        </Label>
                        <Input
                          id="reasonForTransfer"
                          value={reasonForTransfer}
                          onChange={(e) => setReasonForTransfer(e.target.value)}
                          placeholder="Optional reason for transfer"
                          autoComplete="off"
                          data-lpignore="true"
                        />
                      </div>
                    </div>

                    {/* Transcript Upload */}
                    <div className="space-y-2">
                      <Label>
                        {t.uploadTranscript}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent-purple transition-colors cursor-pointer"
                        onClick={() => transcriptFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add(
                            "border-accent-purple",
                            "bg-purple-50",
                          );
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove(
                            "border-accent-purple",
                            "bg-purple-50",
                          );
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove(
                            "border-accent-purple",
                            "bg-purple-50",
                          );
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            const file = files[0];
                            const acceptedTypes = [
                              ".pdf",
                              ".jpg",
                              ".jpeg",
                              ".png",
                            ];
                            const fileExtension =
                              "." + file.name.split(".").pop()?.toLowerCase();
                            if (acceptedTypes.includes(fileExtension)) {
                              setTranscriptFile(file);
                            }
                          }
                        }}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click or drag transcript file here (.pdf, .jpg, .png)
                        </p>
                        <input
                          ref={transcriptFileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setTranscriptFile(file);
                            }
                          }}
                        />
                        {transcriptFile && (
                          <p className="text-sm text-green-600 mt-2">
                            Selected: {transcriptFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Eligibility Checker */}
              {selectedProgram && hasRequiredAcademicInfo() && (
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Eligibility Verification & Admission Requirements
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      We check your academic qualifications against the official
                      university requirements for your selected program
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {eligibilityResult ? (
                      <div className="space-y-4">
                        {/* Eligibility Status */}
                        <div
                          className={`p-4 rounded-lg border ${
                            eligibilityResult.isEligible
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {eligibilityResult.isEligible ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h4
                                className={`font-semibold ${
                                  eligibilityResult.isEligible
                                    ? "text-green-800"
                                    : "text-red-800"
                                }`}
                              >
                                {eligibilityResult.isEligible
                                  ? "✅ Eligible for Admission"
                                  : "❌ Not Eligible"}
                              </h4>
                              {eligibilityResult.isEligible && (
                                <div className="mt-2 space-y-2">
                                  <p className="text-sm text-green-700">
                                    Congratulations! You meet the minimum
                                    eligibility requirements.
                                  </p>
                                  {eligibilityResult.requiresAdmissionTest && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                      <h5 className="font-medium text-blue-800 mb-1">
                                        📝 Admission Test Required
                                      </h5>
                                      <p className="text-sm text-blue-700 mb-2">
                                        This program requires an admission test{" "}
                                        {eligibilityResult.requiresViva &&
                                          "and viva voce"}
                                        .
                                      </p>
                                      {eligibilityResult.admissionTestFee && (
                                        <div className="bg-white p-2 rounded border">
                                          <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">
                                              Admission Test Fee:
                                            </span>
                                            <span className="text-lg font-bold text-blue-800">
                                              ৳
                                              {
                                                eligibilityResult.admissionTestFee
                                              }
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-600 mt-1">
                                            Payment required to download admit
                                            card
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {!eligibilityResult.requiresAdmissionTest && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                                      <h5 className="font-medium text-green-800">
                                        🎉 Direct Admission Available
                                      </h5>
                                      <p className="text-sm text-green-700">
                                        You qualify for direct admission{" "}
                                        {eligibilityResult.requiresViva
                                          ? "subject to viva voce"
                                          : ""}
                                        .
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                              {!eligibilityResult.isEligible && (
                                <p className="text-sm mt-1 text-red-700">
                                  Please review the requirements below and
                                  consider improving your qualifications.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Missing Requirements */}
                        {!eligibilityResult.isEligible &&
                          eligibilityResult.missingRequirements.length > 0 && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h5 className="font-semibold text-yellow-800 mb-2">
                                Requirements Not Met:
                              </h5>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {eligibilityResult.missingRequirements.map(
                                  (req, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-yellow-600">•</span>
                                      <span>{req}</span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}

                        {/* Suggested Programs */}
                        {!eligibilityResult.isEligible &&
                          eligibilityResult.suggestedPrograms.length > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h5 className="font-semibold text-blue-800 mb-2">
                                💡 Suggested Alternative Programs:
                              </h5>
                              <div className="space-y-2">
                                {eligibilityResult.suggestedPrograms.map(
                                  (program) => (
                                    <div
                                      key={program.programId}
                                      className="flex items-center justify-between p-2 bg-white rounded border"
                                    >
                                      <div>
                                        <span className="font-medium text-blue-900">
                                          {program.programName}
                                        </span>
                                        <span className="text-sm text-blue-600 ml-2">
                                          ({program.level})
                                        </span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedProgram(program.programId);
                                          setAvailableDepartments(
                                            getDepartmentsByProgram(
                                              program.programId,
                                            ),
                                          );
                                          setSelectedDepartment("");
                                        }}
                                        className="text-blue-600 border-blue-300 hover:bg-blue-100"
                                      >
                                        Select
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {/* Program Requirements Display */}
                        {selectedProgram && (
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <h5 className="font-semibold text-gray-800 mb-2">
                              📋 Official Program Requirements:
                            </h5>
                            {(() => {
                              const programRule =
                                PROGRAM_ELIGIBILITY_RULES.find(
                                  (r) => r.programId === selectedProgram,
                                );
                              const eligibilityRule =
                                programRule?.eligibilityRules[
                                  academicBackgroundType
                                ];

                              if (!programRule) {
                                return (
                                  <p className="text-sm text-gray-600">
                                    Program requirements not found.
                                  </p>
                                );
                              }

                              if (!eligibilityRule) {
                                return (
                                  <div className="text-sm text-gray-600">
                                    <p className="mb-2">
                                      Your academic background type (
                                      {academicBackgroundType.replace("_", " ")}
                                      ) is not supported for this program.
                                    </p>
                                    <p className="font-medium">
                                      Supported backgrounds:
                                    </p>
                                    <ul className="list-disc list-inside ml-4 mt-1">
                                      {Object.keys(
                                        programRule.eligibilityRules,
                                      ).map((bg) => (
                                        <li key={bg}>
                                          {bg
                                            .replace("_", " ")
                                            .replace(/\b\w/g, (l) =>
                                              l.toUpperCase(),
                                            )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-2 text-sm text-gray-700">
                                  {academicBackgroundType === "bangla_medium" &&
                                    "minimumSSCGPA" in eligibilityRule && (
                                      <div>
                                        <strong>
                                          Bangla Medium Requirements:
                                        </strong>
                                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                          <li>
                                            Minimum SSC GPA:{" "}
                                            {eligibilityRule.minimumSSCGPA}
                                          </li>
                                          <li>
                                            Minimum HSC GPA:{" "}
                                            {eligibilityRule.minimumHSCGPA}
                                          </li>
                                          <li>
                                            Total GPA (SSC + HSC):{" "}
                                            {eligibilityRule.minimumTotalGPA}
                                          </li>
                                          {eligibilityRule.allowedGroups && (
                                            <li>
                                              Allowed Groups:{" "}
                                              {eligibilityRule.allowedGroups.join(
                                                ", ",
                                              )}
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  {academicBackgroundType ===
                                    "english_medium" &&
                                    "minimumOLevelSubjects" in
                                      eligibilityRule && (
                                      <div>
                                        <strong>
                                          English Medium Requirements:
                                        </strong>
                                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                          <li>
                                            Minimum{" "}
                                            {
                                              eligibilityRule.minimumOLevelSubjects
                                            }{" "}
                                            O-Level subjects
                                          </li>
                                          <li>
                                            Minimum{" "}
                                            {
                                              eligibilityRule.minimumALevelSubjects
                                            }{" "}
                                            A-Level subjects
                                          </li>
                                          <li>
                                            Required:{" "}
                                            {
                                              eligibilityRule.requiredGrades
                                                .countOfBGrades
                                            }{" "}
                                            B grades (4.0 GPA)
                                          </li>
                                          <li>
                                            Required:{" "}
                                            {
                                              eligibilityRule.requiredGrades
                                                .countOfCGrades
                                            }{" "}
                                            C grades (3.5 GPA)
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  {academicBackgroundType === "diploma" &&
                                    "minimumDiplomaCGPA" in eligibilityRule && (
                                      <div>
                                        <strong>Diploma Requirements:</strong>
                                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                          <li>
                                            Minimum SSC GPA:{" "}
                                            {eligibilityRule.minimumSSCGPA}
                                          </li>
                                          <li>
                                            Minimum Diploma CGPA:{" "}
                                            {eligibilityRule.minimumDiplomaCGPA}
                                          </li>
                                          <li>
                                            Total GPA (SSC + Diploma):{" "}
                                            {eligibilityRule.minimumTotalGPA}
                                          </li>
                                          {eligibilityRule.requiresScienceBackground && (
                                            <li>
                                              Science background in SSC required
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  {academicBackgroundType === "postgraduate" &&
                                    "minimumBachelorCGPA" in
                                      eligibilityRule && (
                                      <div>
                                        <strong>
                                          Postgraduate Requirements:
                                        </strong>
                                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                          <li>
                                            Minimum Bachelor's CGPA:{" "}
                                            {
                                              eligibilityRule.minimumBachelorCGPA
                                            }
                                          </li>
                                          {eligibilityRule.noThirdDivision && (
                                            <li>
                                              No third division/class in any
                                              examination
                                            </li>
                                          )}
                                          {eligibilityRule.requiredBachelorDegree && (
                                            <li>
                                              Required degree:{" "}
                                              {eligibilityRule.requiredBachelorDegree.join(
                                                " or ",
                                              )}
                                            </li>
                                          )}
                                          {eligibilityRule.minimumWorkExperience && (
                                            <li>
                                              Minimum{" "}
                                              {
                                                eligibilityRule.minimumWorkExperience
                                              }{" "}
                                              years work experience
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  {programRule.subjectRequirements && (
                                    <div className="mt-3">
                                      <strong>Additional Requirements:</strong>
                                      <ul className="list-disc list-inside ml-4 mt-1">
                                        {programRule.subjectRequirements.map(
                                          (req, index) => (
                                            <li key={index}>{req}</li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                  {programRule.allowedPassingYears && (
                                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                      <strong className="text-yellow-800">
                                        📅 Year Restriction:
                                      </strong>
                                      <p className="text-yellow-700">
                                        HSC passing years allowed:{" "}
                                        {programRule.allowedPassingYears.join(
                                          ", ",
                                        )}
                                      </p>
                                      {hscYear &&
                                        !programRule.allowedPassingYears.includes(
                                          parseInt(hscYear),
                                        ) && (
                                          <p className="text-red-600 text-xs mt-1">
                                            ❌ Your HSC year ({hscYear}) is not
                                            in the allowed range
                                          </p>
                                        )}
                                      {!hscYear && (
                                        <p className="text-blue-600 text-xs mt-1">
                                          ℹ️ Please enter your HSC passing year
                                          above for verification
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Admit Card Generation */}
                        {eligibilityResult.isEligible &&
                          eligibilityResult.requiresAdmissionTest && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h5 className="font-semibold text-blue-800 mb-3">
                                ���� Admit Card Generation
                              </h5>
                              <p className="text-sm text-blue-700 mb-4">
                                After completing your application, you'll need
                                to pay the admission test fee to download your
                                admit card.
                              </p>
                              <div className="bg-white p-3 rounded border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">
                                    Admission Test Fee:
                                  </span>
                                  <span className="text-xl font-bold text-blue-800">
                                    ৳{eligibilityResult.admissionTestFee}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>• Payment method: bKash</p>
                                  <p>
                                    • Admit card will be available after payment
                                    verification
                                  </p>
                                  <p>
                                    • Test date and venue will be on the admit
                                    card
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-4 text-gray-500">
                          <Info className="w-8 h-8 mx-auto mb-2" />
                          <p>
                            Complete your academic information above to check
                            eligibility
                          </p>
                        </div>

                        {/* General Eligibility Information */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-semibold text-blue-800 mb-2">
                            📋 General Eligibility Requirements:
                          </h5>
                          <div className="text-sm text-blue-700 space-y-2">
                            <div>
                              <strong>For Bachelor's Programs:</strong>
                              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                <li>
                                  Minimum GPA 2.5 in both SSC and HSC or
                                  equivalent examinations
                                </li>
                                <li>
                                  OR 'O' level in five subjects and 'A' level in
                                  two subjects with minimum 'C' grade in each
                                </li>
                                <li>OR US High School Diploma</li>
                              </ul>
                            </div>
                            <div>
                              <strong>For Postgraduate Programs:</strong>
                              <ul className="list-disc list-inside ml-4 mt-1">
                                <li>
                                  Minimum Bachelor degree relevant to the
                                  Postgraduate programs
                                </li>
                                <li>
                                  Please refer to specific admission
                                  requirements for your desired program
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Waiver Calculator */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-poppins text-deep-plum flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    {t.waiverCalculator}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Academic Background Selection */}
                  <div>
                    <h3 className="font-semibold text-deep-plum mb-4">
                      Academic Background & Eligibility
                    </h3>

                    {/* Background Type Selection */}
                    <div className="space-y-2 mb-6">
                      <Label>Select Your Academic Background</Label>
                      <Select
                        value={academicBackgroundType}
                        onValueChange={(value) =>
                          setAcademicBackgroundType(
                            value as AcademicBackgroundType,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your academic background" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bangla_medium">
                            Bangla Medium (SSC + HSC)
                          </SelectItem>
                          <SelectItem value="english_medium">
                            English Medium (O Level + A Level)
                          </SelectItem>
                          <SelectItem value="diploma">
                            Diploma Background (SSC + Diploma)
                          </SelectItem>
                          <SelectItem value="postgraduate">
                            Postgraduate Application (Bachelor's Degree)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dynamic Academic Fields based on Background Type */}
                    {academicBackgroundType === "bangla_medium" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sscGPA">
                              SSC GPA <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="sscGPA"
                              type="number"
                              min="0"
                              max="5"
                              step="0.01"
                              value={sscGPA}
                              onChange={(e) => setSscGPA(e.target.value)}
                              placeholder="0.00"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hscGPA">
                              HSC GPA <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="hscGPA"
                              type="number"
                              min="0"
                              max="5"
                              step="0.01"
                              value={hscGPA}
                              onChange={(e) => setHscGPA(e.target.value)}
                              placeholder="0.00"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sscYear">SSC Passing Year</Label>
                            <Input
                              id="sscYear"
                              type="number"
                              min="2015"
                              max="2024"
                              value={sscYear}
                              onChange={(e) => setSscYear(e.target.value)}
                              placeholder="2020"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hscYear">
                              HSC Passing Year{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="hscYear"
                              type="number"
                              min="2015"
                              max="2024"
                              value={hscYear}
                              onChange={(e) => setHscYear(e.target.value)}
                              placeholder="2023"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="fourthSubject"
                            checked={hasFourthSubject}
                            onCheckedChange={(checked) =>
                              setHasFourthSubject(checked as boolean)
                            }
                          />
                          <Label htmlFor="fourthSubject" className="text-sm">
                            Had 4th subject in both SSC & HSC
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="scienceBackground"
                            checked={hasScienceBackground}
                            onCheckedChange={(checked) =>
                              setHasScienceBackground(checked as boolean)
                            }
                          />
                          <Label
                            htmlFor="scienceBackground"
                            className="text-sm"
                          >
                            Science background in HSC
                          </Label>
                        </div>

                        {/* Check Eligibility Button */}
                        <div className="mt-6 text-center">
                          <Button
                            onClick={performEligibilityCheck}
                            variant="default"
                            size="lg"
                            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3"
                            disabled={
                              !selectedProgram ||
                              !selectedDepartment ||
                              !hasRequiredAcademicInfo() ||
                              isCheckingEligibility
                            }
                          >
                            {isCheckingEligibility
                              ? "⏳ Checking..."
                              : "🔍 Check Eligibility"}
                          </Button>
                          <p className="text-sm text-gray-600 mt-2">
                            Verify if you meet the requirements for this program
                          </p>
                        </div>
                      </div>
                    )}

                    {academicBackgroundType === "english_medium" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">
                            O Level & A Level Requirements
                          </h4>
                          <p className="text-sm text-blue-700">
                            You need at least 5 O Level subjects and 2 A Level
                            subjects. Grading scale: A=5, B=4, C=3.5, D=3, E=2
                          </p>
                        </div>
                        <div className="text-center py-8 text-gray-500">
                          <p className="mb-4">
                            O Level & A Level subject entry interface will be
                            implemented here
                          </p>
                          <p className="text-sm">
                            For now, please contact administration for English
                            Medium applications
                          </p>
                        </div>

                        {/* Check Eligibility Button */}
                        <div className="mt-6 text-center">
                          <Button
                            onClick={performEligibilityCheck}
                            variant="default"
                            size="lg"
                            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3"
                            disabled={
                              !selectedProgram ||
                              !selectedDepartment ||
                              !hasRequiredAcademicInfo() ||
                              isCheckingEligibility
                            }
                          >
                            {isCheckingEligibility
                              ? "⏳ Checking..."
                              : "🔍 Check Eligibility"}
                          </Button>
                          <p className="text-sm text-gray-600 mt-2">
                            Verify if you meet the requirements for this program
                          </p>
                        </div>
                      </div>
                    )}

                    {academicBackgroundType === "diploma" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sscGPA">
                              SSC GPA <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="sscGPA"
                              type="number"
                              min="0"
                              max="5"
                              step="0.01"
                              value={sscGPA}
                              onChange={(e) => setSscGPA(e.target.value)}
                              placeholder="0.00"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="diplomaCGPA">
                              Diploma CGPA{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="diplomaCGPA"
                              type="number"
                              min="0"
                              max="4"
                              step="0.01"
                              value={diplomaCGPA}
                              onChange={(e) => setDiplomaCGPA(e.target.value)}
                              placeholder="0.00"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="diplomaProgram">
                              Diploma Program{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="diplomaProgram"
                              value={diplomaProgram}
                              onChange={(e) =>
                                setDiplomaProgram(e.target.value)
                              }
                              placeholder="e.g., Computer Science, Civil Engineering"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="scienceBackground"
                            checked={hasScienceBackground}
                            onCheckedChange={(checked) =>
                              setHasScienceBackground(checked as boolean)
                            }
                          />
                          <Label
                            htmlFor="scienceBackground"
                            className="text-sm"
                          >
                            Science background in HSC{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                        </div>

                        {/* Check Eligibility Button */}
                        <div className="mt-6 text-center">
                          <Button
                            onClick={performEligibilityCheck}
                            variant="default"
                            size="lg"
                            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3"
                            disabled={
                              !selectedProgram ||
                              !selectedDepartment ||
                              !hasRequiredAcademicInfo() ||
                              isCheckingEligibility
                            }
                          >
                            {isCheckingEligibility
                              ? "⏳ Checking..."
                              : "���� Check Eligibility"}
                          </Button>
                          <p className="text-sm text-gray-600 mt-2">
                            Verify if you meet the requirements for this program
                          </p>
                        </div>
                      </div>
                    )}

                    {academicBackgroundType === "postgraduate" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bachelorCGPA">
                              Bachelor's CGPA{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="bachelorCGPA"
                              type="number"
                              min="0"
                              max="4"
                              step="0.01"
                              value={bachelorCGPA}
                              onChange={(e) => setBachelorCGPA(e.target.value)}
                              placeholder="0.00"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="workExperience">
                              Work Experience (Years)
                            </Label>
                            <Input
                              id="workExperience"
                              type="number"
                              min="0"
                              max="50"
                              value={workExperience}
                              onChange={(e) =>
                                setWorkExperience(e.target.value)
                              }
                              placeholder="0"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bachelorDegree">
                              Bachelor's Degree{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="bachelorDegree"
                              value={bachelorDegree}
                              onChange={(e) =>
                                setBachelorDegree(e.target.value)
                              }
                              placeholder="e.g., Computer Science, Civil Engineering"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bachelorInstitution">
                              Bachelor's Institution
                            </Label>
                            <Input
                              id="bachelorInstitution"
                              value={bachelorInstitution}
                              onChange={(e) =>
                                setBachelorInstitution(e.target.value)
                              }
                              placeholder="University name"
                              autoComplete="off"
                              data-lpignore="true"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasThirdDivision"
                            checked={hasThirdDivision}
                            onCheckedChange={(checked) =>
                              setHasThirdDivision(checked as boolean)
                            }
                          />
                          <Label htmlFor="hasThirdDivision" className="text-sm">
                            I have third division/class in any examination
                          </Label>
                        </div>

                        {/* Check Eligibility Button */}
                        <div className="mt-6 text-center">
                          <Button
                            onClick={performEligibilityCheck}
                            variant="default"
                            size="lg"
                            className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3"
                            disabled={
                              !selectedProgram ||
                              !selectedDepartment ||
                              !hasRequiredAcademicInfo() ||
                              isCheckingEligibility
                            }
                          >
                            {isCheckingEligibility
                              ? "�� Checking..."
                              : "🔍 Check Eligibility"}
                          </Button>
                          <p className="text-sm text-gray-600 mt-2">
                            Verify if you meet the requirements for this program
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Result-based Waiver Display */}
                  {sscGPA && hscGPA && (
                    <div>
                      {autoSelectedResultWaiver ? (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <strong>{t.waiverApplied}:</strong>{" "}
                            {language === "en"
                              ? waiverPolicies.find(
                                  (w) => w.id === autoSelectedResultWaiver,
                                )?.name
                              : waiverPolicies.find(
                                  (w) => w.id === autoSelectedResultWaiver,
                                )?.namebn}{" "}
                            (
                            {
                              waiverPolicies.find(
                                (w) => w.id === autoSelectedResultWaiver,
                              )?.percentage
                            }
                            %)
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <AlertDescription className="text-orange-800">
                            {t.noWaiverEligible}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Available Waivers */}
                  <div>
                    <h3 className="font-semibold text-deep-plum mb-4">
                      {t.availableWaivers}
                    </h3>

                    {/* Result-based waivers are automatically applied and visible */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        {t.resultBasedWaivers}
                      </h4>
                      <div className="space-y-2">
                        {getResultBasedWaivers().map((waiver) => (
                          <div
                            key={waiver.id}
                            className="flex items-center space-x-2 p-2 bg-green-50 rounded"
                          >
                            <Label className="text-sm flex-1">
                              {language === "en" ? waiver.name : waiver.namebn}{" "}
                              ({waiver.percentage}%)
                            </Label>
                            <Badge variant="outline" className="text-xs">
                              {waiver.percentage}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Waiver Policy Notes */}
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      {t.waiverPolicyNote}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Cost Breakdown */}
            <div className="space-y-6">
              {/* Registration Packages Preview */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-indigo-50">
                  <CardTitle className="font-poppins">
                    Registration Packages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Show a single selected package or a blank placeholder to avoid overwhelming applicants */}

                  {appliedPackageId ? (
                    (() => {
                      const pkg = registrationPackages.find(
                        (p) => p.id === appliedPackageId,
                      );
                      if (!pkg)
                        return (
                          <div className="p-6 text-center text-gray-500">
                            Selected package not found.
                          </div>
                        );

                      return (
                        <div className="p-4 border rounded flex flex-col">
                          <div className="flex-1">
                            <div className="font-medium">{pkg.program}</div>
                            <div className="text-sm text-gray-500">
                              {pkg.term} • {pkg.mode}
                            </div>
                            <div className="text-sm mt-2">
                              Credits: {pkg.credits} • Per Credit: ৳
                              {pkg.perCredit.toLocaleString()}
                            </div>
                            <div className="text-sm">
                              Admission Fee: ৳
                              {pkg.admissionFee.toLocaleString()} • Fixed: ৳
                              {pkg.fixedFees.toLocaleString()}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-deep-plum font-semibold">
                              Est: ৳{pkg.totalEstimated.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  // re-apply (idempotent)
                                  const visibleSelected =
                                    selectedWaivers.filter(
                                      (id) =>
                                        getWaiverById(id)?.type === "result",
                                    );
                                  const calculation = calculateWaiverAmount(
                                    pkg.totalEstimated,
                                    visibleSelected,
                                  );
                                  updateApplicationData({
                                    program: pkg.id,
                                    totalCost: pkg.totalEstimated,
                                    registrationPackageId: pkg.id,
                                  });
                                  setCostCalculation({
                                    originalAmount: pkg.totalEstimated,
                                    ...calculation,
                                  });
                                  toast({
                                    title: "Package applied",
                                    description: `${pkg.program} applied to your application.`,
                                  });
                                }}
                              >
                                Apply
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // clear applied package and revert to program cost
                                  setAppliedPackageId(null);
                                  updateApplicationData({
                                    registrationPackageId: null,
                                  });
                                  const program = selectedProgram
                                    ? getProgramById(selectedProgram)
                                    : null;
                                  if (program) {
                                    const visibleSelected =
                                      selectedWaivers.filter(
                                        (id) =>
                                          getWaiverById(id)?.type === "result",
                                      );
                                    const calculation = calculateWaiverAmount(
                                      program.costStructure.total,
                                      visibleSelected,
                                    );
                                    setCostCalculation({
                                      originalAmount:
                                        program.costStructure.total,
                                      ...calculation,
                                    });
                                  } else {
                                    setCostCalculation({
                                      originalAmount: 0,
                                      waiverAmount: 0,
                                      waiverPercentage: 0,
                                      finalAmount: 0,
                                    });
                                  }
                                }}
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-8 text-center text-gray-600">
                      <div className="text-lg font-medium mb-2">
                        No package selected
                      </div>
                      <div className="text-sm">
                        Please select campus, semester type, semester, program
                        and department on the left to see the recommended
                        registration package.
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-sm text-gray-500">
                    The system will suggest one package based on your
                    selections. You may clear it to choose another.
                  </div>
                </CardContent>
              </Card>
              {/* Cost Breakdown */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-deep-plum text-white">
                  <CardTitle className="font-poppins flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {t.costBreakdown}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedProgramData || appliedPackageId ? (
                    <div className="space-y-4">
                      {/* Package-aware Cost Breakdown */}
                      <div className="space-y-3">
                        {(() => {
                          if (appliedPackageId) {
                            const pkg = registrationPackages.find(
                              (p) => p.id === appliedPackageId,
                            );
                            if (pkg) {
                              const admissionFee = pkg.admissionFee || 0;
                              const courseFee =
                                (pkg.perCredit || 0) * (pkg.credits || 0);
                              const others = pkg.fixedFees || 0;
                              const original =
                                pkg.totalEstimated ??
                                admissionFee + courseFee + others;
                              return (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      {t.admissionFee}
                                    </span>
                                    <span className="font-medium">
                                      ৳{admissionFee.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      {t.courseFee}
                                    </span>
                                    <span className="font-medium">
                                      ৳{courseFee.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      {t.others}
                                    </span>
                                    <span className="font-medium">
                                      ৳{others.toLocaleString()}
                                    </span>
                                  </div>

                                  <Separator />

                                  <div className="flex justify-between font-semibold">
                                    <span className="text-deep-plum">
                                      {t.originalAmount}
                                    </span>
                                    <span className="text-deep-plum">
                                      ৳{original.toLocaleString()}
                                    </span>
                                  </div>

                                  {costCalculation.waiverAmount > 0 && (
                                    <>
                                      <div className="flex justify-between text-green-600 font-medium">
                                        <span>
                                          {t.waiverAmount} (
                                          {costCalculation.waiverPercentage}%)
                                        </span>
                                        <span>
                                          -৳
                                          {costCalculation.waiverAmount.toLocaleString()}
                                        </span>
                                      </div>

                                      <Separator />
                                    </>
                                  )}

                                  <div className="flex justify-between text-xl font-bold">
                                    <span className="text-deep-plum">
                                      {t.finalAmount}
                                    </span>
                                    <span className="text-accent-purple">
                                      ৳
                                      {costCalculation.finalAmount.toLocaleString()}
                                    </span>
                                  </div>
                                </>
                              );
                            }
                          }

                          if (selectedProgramData) {
                            const cs = selectedProgramData.costStructure;
                            return (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {t.admissionFee}
                                  </span>
                                  <span className="font-medium">
                                    ৳{cs.admissionFee.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {t.courseFee}
                                  </span>
                                  <span className="font-medium">
                                    ৳{cs.courseFee.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {t.labFee}
                                  </span>
                                  <span className="font-medium">
                                    ৳{cs.labFee.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {t.others}
                                  </span>
                                  <span className="font-medium">
                                    ৳{cs.others.toLocaleString()}
                                  </span>
                                </div>

                                <Separator />

                                <div className="flex justify-between font-semibold">
                                  <span className="text-deep-plum">
                                    {t.originalAmount}
                                  </span>
                                  <span className="text-deep-plum">
                                    ৳
                                    {costCalculation.originalAmount.toLocaleString()}
                                  </span>
                                </div>

                                {costCalculation.waiverAmount > 0 && (
                                  <>
                                    <div className="flex justify-between text-green-600 font-medium">
                                      <span>
                                        {t.waiverAmount} (
                                        {costCalculation.waiverPercentage}%)
                                      </span>
                                      <span>
                                        -৳
                                        {costCalculation.waiverAmount.toLocaleString()}
                                      </span>
                                    </div>

                                    <Separator />
                                  </>
                                )}

                                <div className="flex justify-between text-xl font-bold">
                                  <span className="text-deep-plum">
                                    {t.finalAmount}
                                  </span>
                                  <span className="text-accent-purple">
                                    ৳
                                    {costCalculation.finalAmount.toLocaleString()}
                                  </span>
                                </div>
                              </>
                            );
                          }

                          return null;
                        })()}
                      </div>

                      {costCalculation.waiverAmount > 0 && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-800">
                            <Award className="w-4 h-4" />
                            <span className="font-medium">
                              You Save: ৳
                              {costCalculation.waiverAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>{t.selectProgramFirst}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Selected Waivers Summary */}
              {selectedWaivers.length > 0 && (
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-poppins text-green-800">
                      Applied Waivers ({selectedWaivers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedWaivers
                        .filter((id) =>
                          waiverPolicies.find(
                            (w) => w.id === id && w.type === "result",
                          ),
                        )
                        .map((waiverId) => {
                          const waiver = waiverPolicies.find(
                            (w) => w.id === waiverId,
                          );
                          return waiver ? (
                            <div
                              key={waiverId}
                              className="flex justify-between items-center p-2 bg-white rounded text-sm"
                            >
                              <span>
                                {language === "en"
                                  ? waiver.name
                                  : waiver.namebn}
                              </span>
                              <Badge className="bg-green-600 text-white">
                                {waiver.percentage}%
                              </Badge>
                            </div>
                          ) : null;
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cost Note */}
              <Alert className="border-gray-200 bg-gray-50">
                <Info className="w-4 h-4 text-gray-600" />
                <AlertDescription className="text-gray-700 text-xs">
                  {t.costNote}
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8 space-y-4">
            {/* Status message */}
            {!canProceed && (
              <div className="text-center text-sm text-gray-600">
                {!selectedProgram || !selectedDepartment ? (
                  <p>📋 Please select program and department</p>
                ) : !hasRequiredAcademicInfo() ? (
                  <p>📝 Please complete your academic information</p>
                ) : !eligibilityChecked ? (
                  <p>
                    ���� Please click "Check Eligibility" button to verify
                    requirements
                  </p>
                ) : eligibilityResult && !eligibilityResult.isEligible ? (
                  <p>❌ You must be eligible to continue</p>
                ) : currentProgramStatus && !currentProgramStatus.available ? (
                  <p className="text-red-600">
                    🚫 Application limit reached for this program. Please select
                    a different program.
                  </p>
                ) : (
                  <p>⏳ Completing requirements...</p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              {!hasExistingApplication ? (
                <Button
                  onClick={handleContinue}
                  className={`${
                    canProceed
                      ? "bg-deep-plum hover:bg-accent-purple"
                      : "bg-gray-300 cursor-not-allowed"
                  } font-poppins px-8 py-3`}
                  disabled={!canProceed || isSaving}
                >
                  {isSaving ? t.saving : t.continue}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  View Existing Application
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
