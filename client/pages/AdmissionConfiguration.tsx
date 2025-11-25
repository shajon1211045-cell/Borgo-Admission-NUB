// @ts-nocheck - Temporarily disable type checking for this component
import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Calendar,
  FileText,
  Users,
  Bell,
  Shield,
  CreditCard,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useToast } from "../hooks/use-toast";
import apiClient from "../lib/api";
import {
  PROGRAM_ELIGIBILITY_RULES,
  type ProgramEligibilityRule,
} from "../lib/eligibilityRules";
import { GraduationCap } from "lucide-react";

interface AdmissionSettings {
  application_start_date: string;
  application_deadline: string;
  late_fee_deadline: string;
  session_name: string;
  admission_fee: number;
  late_fee: number;
  max_waiver_percentage: number;
  is_admission_open: boolean;
  allow_application_editing: boolean;
  waiver_enabled: boolean;
  auto_approve_applications: boolean;
  require_payment_for_review: boolean;
  enable_sms_notifications: boolean;
  enable_email_notifications: boolean;
  contact_email: string;
  contact_phone: string;
  help_desk_hours: string;
  // Eligibility Configuration
  eligibility_check_enabled: boolean;
  strict_eligibility_enforcement: boolean;
  allow_eligibility_override: boolean;
  minimum_ssc_gpa: number;
  minimum_hsc_gpa: number;
  minimum_bachelor_gpa: number;
  minimum_master_gpa: number;
  allow_alternative_qualifications: boolean;
  show_suggested_programs: boolean;
  // Waiver Configuration
  max_combined_waiver: number;
  require_document_verification_for_waiver: boolean;
  auto_calculate_result_waiver: boolean;
  allow_manual_waiver_override: boolean;
  // Admission Test Configuration
  law_admission_test_date: string;
  architecture_admission_test_date: string;
  admission_test_fee: number;
  law_test_time: string;
  architecture_test_time: string;
  law_test_venue_main: string;
  law_test_venue_khulna: string;
  architecture_test_venue_main: string;
  architecture_test_venue_khulna: string;
  // Referral Configuration
  referral_enabled?: boolean;
  default_referral_commission?: number; // percentage (e.g., 5 means 5%)
}

interface ProgramLimits {
  [key: string]: {
    // Program + Department combination (e.g., "bachelor_cse")
    max_applicants: number;
    current_applicants?: number;
    enabled: boolean;
  };
}

interface ProgramEligibilityConfig {
  [key: string]: {
    // Program + Department combination (e.g., "bachelor_cse")
    min_ssc_gpa: number;
    min_hsc_gpa: number;
    min_total_gpa: number;
    requires_science_background: boolean;
    allowed_backgrounds: string[];
    additional_requirements: string[];
    enabled: boolean;
  };
}

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
  account_number: string;
  instructions: string;
  processing_fee: number;
  minimum_amount: number;
  maximum_amount: number;
  bank_name?: string;
  routing_number?: string;
  is_active?: boolean;
  order_priority?: number;
}

interface DocumentRequirement {
  id: number;
  name: string;
  type: string;
  is_required: boolean;
  allowed_formats: string[];
  max_file_size: string;
  description: string;
  order_priority?: number;
}

export default function AdmissionConfiguration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AdmissionSettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<
    DocumentRequirement[]
  >([]);
  const [programLimits, setProgramLimits] = useState<ProgramLimits>({});
  const [programEligibility, setProgramEligibility] =
    useState<ProgramEligibilityConfig>({});
  // Referrers list for referral config preview
  const [referrersList, setReferrersList] = useState<any[]>([]);
  const [programWaiverRules, setProgramWaiverRules] = useState<
    Record<string, { maxPercentage: number; types: string[] }>
  >({});
  const [programTestConfig, setProgramTestConfig] = useState<
    Record<string, { requiresAdmissionTest: boolean; admissionTestFee: number }>
  >({});

  // Validation errors for inline messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep track of last focused element to restore focus after dialogs close
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [editingDocument, setEditingDocument] =
    useState<DocumentRequirement | null>(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({
    name: "",
    type: "bank",
    account_number: "",
    account_name: "",
    routing_number: "",
    instructions: "",
    is_active: true,
    order_priority: 0,
  });

  const [documentForm, setDocumentForm] = useState<
    Partial<DocumentRequirement>
  >({
    name: "",
    description: "",
    is_required: true,
    file_types: "pdf,jpg,jpeg,png",
    max_file_size_mb: 5,
    order_priority: 0,
    is_active: true,
  });

  // Initialize program configurations from settings
  const initializeProgramConfigurations = (settingsData?: any) => {
    // Load program limits from settings if available
    if (settingsData?.program_limits) {
      setProgramLimits(settingsData.program_limits);
    }

    // Initialize program eligibility configs with defaults
    const programDeptCombinations = [
      // Bachelor's programs
      { program: "bachelor", dept: "cse", name: "Bachelor in CSE" },
      { program: "bachelor", dept: "eee", name: "Bachelor in EEE" },
      {
        program: "bachelor",
        dept: "ce",
        name: "Bachelor in Civil Engineering",
      },
      {
        program: "bachelor",
        dept: "architecture",
        name: "Bachelor in Architecture",
      },
      {
        program: "bachelor",
        dept: "bba",
        name: "Bachelor in Business Administration",
      },
      { program: "bachelor", dept: "law", name: "Bachelor of Laws (LL.B)" },
      { program: "bachelor", dept: "pharmacy", name: "Bachelor of Pharmacy" },
      { program: "bachelor", dept: "english", name: "Bachelor in English" },

      // Master's programs
      { program: "masters", dept: "cse", name: "Master's in CSE" },
      { program: "masters", dept: "eee", name: "Master's in EEE" },
      {
        program: "masters",
        dept: "bba",
        name: "Master's in Business Administration (MBA)",
      },
    ];

    // Initialize program eligibility configs
    const defaultEligibility: ProgramEligibilityConfig = {};
    programDeptCombinations.forEach(({ program, dept }) => {
      const key = `${program}_${dept}`;
      defaultEligibility[key] = {
        min_ssc_gpa: 2.5,
        min_hsc_gpa: 2.5,
        min_total_gpa: 5.0,
        requires_science_background: [
          "cse",
          "eee",
          "ce",
          "architecture",
          "pharmacy",
        ].includes(dept),
        allowed_backgrounds: ["bangla_medium", "english_medium"],
        additional_requirements: [],
        enabled: true,
      };
    });

    setProgramEligibility(defaultEligibility);

    // Initialize programTestConfig defaults from PROGRAM_ELIGIBILITY_RULES if empty
    const defaultTestConfig: Record<
      string,
      { requiresAdmissionTest: boolean; admissionTestFee: number }
    > = {};
    PROGRAM_ELIGIBILITY_RULES.forEach((p) => {
      defaultTestConfig[p.programId] = {
        requiresAdmissionTest: p.requiresAdmissionTest || false,
        admissionTestFee: p.admissionTestFee || 0,
      };
    });
    setProgramTestConfig((prev) => ({ ...defaultTestConfig, ...prev }));
  };

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);

      // Load admission settings
      const settingsResponse = await apiClient.getAdmissionSettings();
      if (settingsResponse.success && settingsResponse.data) {
        setSettings(settingsResponse.data);
        setProgramWaiverRules(settingsResponse.data.program_waiver_rules || {});
        setProgramTestConfig(settingsResponse.data.program_test_config || {});
        // Initialize program configurations with settings data
        initializeProgramConfigurations(settingsResponse.data);
      } else {
        // Initialize with defaults if settings failed to load
        const defaultSettings: AdmissionSettings = {
          application_start_date: new Date().toISOString().slice(0, 10),
          application_deadline: new Date().toISOString().slice(0, 10),
          late_fee_deadline: new Date().toISOString().slice(0, 10),
          session_name: "",
          admission_fee: 0,
          late_fee: 0,
          max_waiver_percentage: 0,
          is_admission_open: false,
          allow_application_editing: true,
          waiver_enabled: false,
          auto_approve_applications: false,
          require_payment_for_review: false,
          enable_sms_notifications: false,
          enable_email_notifications: false,
          contact_email: "",
          contact_phone: "",
          help_desk_hours: "",
          eligibility_check_enabled: false,
          strict_eligibility_enforcement: false,
          allow_eligibility_override: false,
          minimum_ssc_gpa: 0,
          minimum_hsc_gpa: 0,
          minimum_bachelor_gpa: 0,
          minimum_master_gpa: 0,
          allow_alternative_qualifications: false,
          show_suggested_programs: false,
          max_combined_waiver: 0,
          require_document_verification_for_waiver: false,
          auto_calculate_result_waiver: false,
          allow_manual_waiver_override: false,
          law_admission_test_date: "",
          architecture_admission_test_date: "",
          admission_test_fee: 0,
          law_test_time: "",
          architecture_test_time: "",
          law_test_venue_main: "",
          law_test_venue_khulna: "",
          architecture_test_venue_main: "",
          architecture_test_venue_khulna: "",
          referral_enabled: false,
          default_referral_commission: 0,
        };
        setSettings(defaultSettings);
        initializeProgramConfigurations();
        toast({
          title: "Warning",
          description: "Failed to load admission settings. Using defaults.",
          variant: "destructive",
        });
      }

      // Load payment methods
      const paymentResponse = await apiClient.getPaymentMethods();
      if (paymentResponse.success && paymentResponse.data) {
        setPaymentMethods(paymentResponse.data);
      }

      // Load document requirements
      const documentResponse = await apiClient.getDocumentRequirements();
      if (documentResponse.success && documentResponse.data) {
        setDocumentRequirements(documentResponse.data);
      }

      // Load referrers list for referral previews
      try {
        const refRes = await apiClient.getReferrers();
        if (refRes.success && refRes.data) {
          setReferrersList(refRes.data.referrers || []);
        }
      } catch (err) {
        console.warn("Failed to load referrers", err);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load configuration data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Focus management for payment dialog: focus first input when opened and restore focus on close
  useEffect(() => {
    if (paymentDialogOpen) {
      // clear related errors when opening dialog
      setErrors((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([k]) => !k.startsWith("payment_")),
        ),
      );
      setTimeout(() => {
        (
          document.getElementById("payment_name") as HTMLElement | null
        )?.focus();
      }, 0);
    } else {
      // restore focus to last active element
      try {
        lastActiveElementRef.current?.focus?.();
      } catch (e) {
        // ignore
      }
    }
  }, [paymentDialogOpen]);

  // Focus management for document dialog
  useEffect(() => {
    if (documentDialogOpen) {
      setErrors((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([k]) => !k.startsWith("doc_")),
        ),
      );
      setTimeout(() => {
        (document.getElementById("doc_name") as HTMLElement | null)?.focus();
      }, 0);
    } else {
      try {
        lastActiveElementRef.current?.focus?.();
      } catch (e) {}
    }
  }, [documentDialogOpen]);

  // Save admission settings
  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      // Clear previous errors
      setErrors({});

      // Validate using helper
      try {
        // import helper dynamically to avoid circular issues in some test environments
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { validateAdmissionSettings } = require("./admissionConfigUtils");
        const { errors: validationErrors } =
          validateAdmissionSettings(settings);
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          toast({
            title: "Validation Error",
            description: "Please fix the highlighted fields.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      } catch (e) {
        // if helper fails for some reason, continue with existing flow
        console.warn("Validation helper failed", e);
      }

      // Combine all settings including program limits and eligibility
      const combinedSettings = {
        ...settings,
        program_limits: programLimits,
        program_eligibility: programEligibility,
        program_waiver_rules: programWaiverRules,
        program_test_config: programTestConfig,
      };

      const response =
        await apiClient.updateAdmissionSettings(combinedSettings);

      if (response.success) {
        toast({
          title: "Success",
          description:
            "Admission settings, program limits, and eligibility rules saved successfully",
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Payment method handlers
  const openPaymentDialog = (payment?: PaymentMethod) => {
    // remember the element that had focus so we can restore it when dialog closes
    try {
      lastActiveElementRef.current =
        document.activeElement as HTMLElement | null;
    } catch (e) {
      lastActiveElementRef.current = null;
    }

    if (payment) {
      setEditingPayment(payment);
      setPaymentForm(payment);
    } else {
      setEditingPayment(null);
      setPaymentForm({
        name: "",
        type: "bank",
        account_number: "",
        account_name: "",
        routing_number: "",
        instructions: "",
        is_active: true,
        order_priority: paymentMethods.length,
      });
    }
    setPaymentDialogOpen(true);
  };

  const savePaymentMethod = async () => {
    try {
      const response = editingPayment
        ? await apiClient.updatePaymentMethod(
            editingPayment.id.toString(),
            paymentForm,
          )
        : await apiClient.createPaymentMethod(paymentForm);

      if (response.success) {
        toast({
          title: "Success",
          description: `Payment method ${editingPayment ? "updated" : "created"} successfully`,
        });
        setPaymentDialogOpen(false);
        loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      });
    }
  };

  const deletePaymentMethod = async (id: number) => {
    try {
      const response = await apiClient.deletePaymentMethod(id.toString());
      if (response.success) {
        toast({
          title: "Success",
          description: "Payment method deleted successfully",
        });
        loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  // Document requirement handlers
  const openDocumentDialog = (document?: DocumentRequirement) => {
    try {
      lastActiveElementRef.current =
        document.activeElement as HTMLElement | null;
    } catch (e) {
      lastActiveElementRef.current = null;
    }

    if (document) {
      setEditingDocument(document);
      setDocumentForm(document);
    } else {
      setEditingDocument(null);
      setDocumentForm({
        name: "",
        description: "",
        is_required: true,
        file_types: "pdf,jpg,jpeg,png",
        max_file_size_mb: 5,
        order_priority: documentRequirements.length,
        is_active: true,
      });
    }
    setDocumentDialogOpen(true);
  };

  const saveDocumentRequirement = async () => {
    try {
      const response = editingDocument
        ? await apiClient.updateDocumentRequirement(
            editingDocument.id.toString(),
            documentForm,
          )
        : await apiClient.createDocumentRequirement(documentForm);

      if (response.success) {
        toast({
          title: "Success",
          description: `Document requirement ${editingDocument ? "updated" : "created"} successfully`,
        });
        setDocumentDialogOpen(false);
        loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error saving document requirement:", error);
      toast({
        title: "Error",
        description: "Failed to save document requirement",
        variant: "destructive",
      });
    }
  };

  const deleteDocumentRequirement = async (id: number) => {
    try {
      const response = await apiClient.deleteDocumentRequirement(id.toString());

      if (response.success) {
        toast({
          title: "Success",
          description: "Document requirement deleted successfully",
        });
        loadData();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error deleting document requirement:", error);
      toast({
        title: "Error",
        description: "Failed to delete document requirement",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-deep-plum" />
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load admission settings. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-deep-plum font-poppins flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Admission Configuration
            </h1>
            <p className="text-gray-600 mt-1">
              Manage admission settings, payment methods, and document
              requirements
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="border-accent-purple text-accent-purple hover:bg-accent-purple hover:text-white"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General Settings
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Eligibility & Waiver Settings
          </TabsTrigger>
          <TabsTrigger
            value="admission-test"
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Admission Tests
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Document Requirements
          </TabsTrigger>
          <TabsTrigger value="referral" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Referral & Commission Rules
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Admission Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Application Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={settings.application_start_date?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        application_start_date: e.target.value,
                      })
                    }
                  />
                  {errors.application_start_date && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.application_start_date}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={settings.application_deadline?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        application_deadline: e.target.value,
                      })
                    }
                  />
                  {errors.application_deadline && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.application_deadline}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="late_deadline">Late Fee Deadline</Label>
                  <Input
                    id="late_deadline"
                    type="datetime-local"
                    value={settings.late_fee_deadline?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        late_fee_deadline: e.target.value,
                      })
                    }
                  />
                  {errors.late_fee_deadline && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.late_fee_deadline}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="session_name">Session Name</Label>
                  <Input
                    id="session_name"
                    value={settings.session_name || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        session_name: e.target.value,
                      })
                    }
                    placeholder="e.g., Spring 2024"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Application Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="admission_open">Admission Open</Label>
                    <Switch
                      id="admission_open"
                      checked={settings.is_admission_open}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          is_admission_open: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="editing_allowed">
                      Allow Application Editing
                    </Label>
                    <Switch
                      id="editing_allowed"
                      checked={settings.allow_application_editing}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          allow_application_editing: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="waiver_enabled">Enable Waiver System</Label>
                    <Switch
                      id="waiver_enabled"
                      checked={settings.waiver_enabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          waiver_enabled: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto_approve">
                      Auto-approve Applications
                    </Label>
                    <Switch
                      id="auto_approve"
                      checked={settings.auto_approve_applications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          auto_approve_applications: checked,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="phone_verification">
                      Require Phone Verification
                    </Label>
                    <Switch
                      id="phone_verification"
                      checked={settings.require_phone_verification}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          require_phone_verification: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_verification">
                      Require Email Verification
                    </Label>
                    <Switch
                      id="email_verification"
                      checked={settings.require_email_verification}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          require_email_verification: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="document_upload">
                      Require Document Upload
                    </Label>
                    <Switch
                      id="document_upload"
                      checked={settings.require_document_upload}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          require_document_upload: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                    <Switch
                      id="sms_notifications"
                      checked={settings.send_sms_notifications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          send_sms_notifications: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="max_applications">
                  Max Applications per User
                </Label>
                <Input
                  id="max_applications"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.max_applications_per_user || 1}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_applications_per_user: Number(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content & Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact_email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact_phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="admission_notice">Admission Notice</Label>
                <Textarea
                  id="admission_notice"
                  rows={3}
                  value={settings.admission_notice || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      admission_notice: e.target.value,
                    })
                  }
                  placeholder="Welcome message or important notice for applicants..."
                />
              </div>
              <div>
                <Label htmlFor="payment_instructions">
                  Payment Instructions
                </Label>
                <Textarea
                  id="payment_instructions"
                  rows={3}
                  value={settings.payment_instructions || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment_instructions: e.target.value,
                    })
                  }
                  placeholder="Instructions for payment process..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-deep-plum hover:bg-accent-purple"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Eligibility & Waiver Configuration Tab */}
        <TabsContent value="eligibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Eligibility & Waiver Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Eligibility System Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="eligibility_enabled">
                      Enable Eligibility Check
                    </Label>
                    <Switch
                      id="eligibility_enabled"
                      checked={settings.eligibility_check_enabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          eligibility_check_enabled: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="strict_enforcement">
                      Strict Enforcement
                    </Label>
                    <Switch
                      id="strict_enforcement"
                      checked={settings.strict_eligibility_enforcement}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          strict_eligibility_enforcement: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow_override">Allow Admin Override</Label>
                    <Switch
                      id="allow_override"
                      checked={settings.allow_eligibility_override}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          allow_eligibility_override: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_suggestions">
                      Show Suggested Programs
                    </Label>
                    <Switch
                      id="show_suggestions"
                      checked={settings.show_suggested_programs}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          show_suggested_programs: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alternative_quals">
                      Allow Alternative Qualifications
                    </Label>
                    <Switch
                      id="alternative_quals"
                      checked={settings.allow_alternative_qualifications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          allow_alternative_qualifications: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto_waiver">
                      Auto-Calculate Result Waiver
                    </Label>
                    <Switch
                      id="auto_waiver"
                      checked={settings.auto_calculate_result_waiver}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          auto_calculate_result_waiver: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="waiver_override">
                      Allow Waiver Override
                    </Label>
                    <Switch
                      id="waiver_override"
                      checked={settings.allow_manual_waiver_override}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          allow_manual_waiver_override: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="waiver_docs">
                      Require Documents for Waiver
                    </Label>
                    <Switch
                      id="waiver_docs"
                      checked={
                        settings.require_document_verification_for_waiver
                      }
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          require_document_verification_for_waiver: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Minimum GPA Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-deep-plum mb-4">
                  Minimum GPA Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="min_ssc">Minimum SSC GPA</Label>
                    <Input
                      id="min_ssc"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={settings.minimum_ssc_gpa}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimum_ssc_gpa: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_hsc">Minimum HSC GPA</Label>
                    <Input
                      id="min_hsc"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={settings.minimum_hsc_gpa}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimum_hsc_gpa: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_bachelor">Minimum Bachelor GPA</Label>
                    <Input
                      id="min_bachelor"
                      type="number"
                      step="0.1"
                      min="0"
                      max="4"
                      value={settings.minimum_bachelor_gpa}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimum_bachelor_gpa: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="min_master">Minimum Master GPA</Label>
                    <Input
                      id="min_master"
                      type="number"
                      step="0.1"
                      min="0"
                      max="4"
                      value={settings.minimum_master_gpa}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimum_master_gpa: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Waiver Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-deep-plum mb-4">
                  Waiver Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max_waiver">
                      Maximum Combined Waiver (%)
                    </Label>
                    <Input
                      id="max_waiver"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.max_combined_waiver}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          max_combined_waiver: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Program-wise Limits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-deep-plum">
                  Program Applicant Limits
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Max Applicants</TableHead>
                        <TableHead>Current Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(programLimits).map(
                        ([programKey, limits]) => {
                          const programName = programKey
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ");

                          return (
                            <TableRow key={programKey}>
                              <TableCell className="font-medium">
                                {programName}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  className="w-24"
                                  value={limits.max_applicants}
                                  onChange={(e) =>
                                    setProgramLimits((prev) => ({
                                      ...prev,
                                      [programKey]: {
                                        ...prev[programKey],
                                        max_applicants:
                                          parseInt(e.target.value) || 0,
                                      },
                                    }))
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    (limits.current_applicants || 0) >=
                                    limits.max_applicants
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {limits.current_applicants || 0} /{" "}
                                  {limits.max_applicants}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={limits.enabled}
                                  onCheckedChange={(checked) =>
                                    setProgramLimits((prev) => ({
                                      ...prev,
                                      [programKey]: {
                                        ...prev[programKey],
                                        enabled: checked,
                                      },
                                    }))
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Program-wise Eligibility Rules */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-deep-plum">
                  Program-Specific Eligibility Rules
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Min SSC GPA</TableHead>
                        <TableHead>Min HSC GPA</TableHead>
                        <TableHead>Min Total GPA</TableHead>
                        <TableHead>Science Required</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(programEligibility).map(
                        ([programKey, config]) => {
                          const programName = programKey
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ");

                          return (
                            <TableRow key={programKey}>
                              <TableCell className="font-medium">
                                {programName}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                  className="w-20"
                                  value={config.min_ssc_gpa}
                                  onChange={(e) =>
                                    setProgramEligibility((prev) => ({
                                      ...prev,
                                      [programKey]: {
                                        ...prev[programKey],
                                        min_ssc_gpa:
                                          parseFloat(e.target.value) || 0,
                                      },
                                    }))
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                  className="w-20"
                                  value={config.min_hsc_gpa}
                                  onChange={(e) =>
                                    setProgramEligibility((prev) => ({
                                      ...prev,
                                      [programKey]: {
                                        ...prev[programKey],
                                        min_hsc_gpa:
                                          parseFloat(e.target.value) || 0,
                                      },
                                    }))
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  className="w-20"
                                  value={config.min_total_gpa}
                                  onChange={(e) =>
                                    setProgramEligibility((prev) => ({
                                      ...prev,
                                      [programKey]: {
                                        ...prev[programKey],
                                        min_total_gpa:
                                          parseFloat(e.target.value) || 0,
                                      },
                                    }))
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={config.requires_science_background}
                                  onCheckedChange={(checked) =>
                                    setProgramEligibility((prev) => ({
                                      ...prev,
                                      [programKey]: {
                                        ...prev[programKey],
                                        requires_science_background: checked,
                                      },
                                    }))
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={config.enabled}
                                  onCheckedChange={(checked) =>
                                    setProgramEligibility((prev) => ({
                                      ...prev,
                                      [programKey]: {
                                        ...prev[programKey],
                                        enabled: checked,
                                      },
                                    }))
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Could open a dialog for more detailed editing
                                    toast({
                                      title: "Feature Coming Soon",
                                      description:
                                        "Advanced rule editing will be available in the next update.",
                                    });
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Note:</strong> These rules will be used for
                    automatic eligibility checking during application.
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>
                      <strong>Min SSC/HSC GPA:</strong> Minimum GPA required for
                      each level
                    </li>
                    <li>
                      <strong>Min Total GPA:</strong> Combined minimum GPA
                      requirement (SSC + HSC)
                    </li>
                    <li>
                      <strong>Science Required:</strong> Whether science
                      background is mandatory for the program
                    </li>
                    <li>
                      <strong>Status:</strong> Enable/disable automatic
                      eligibility checking for this program
                    </li>
                  </ul>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Waiver Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Configure per-program maximum waiver percentage and
                      allowed waiver types.
                    </p>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Program</TableHead>
                            <TableHead>Max Waiver %</TableHead>
                            <TableHead>Allowed Types</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(programEligibility).map(
                            ([key, cfg]) => {
                              const rule = programWaiverRules[key] || {
                                maxPercentage:
                                  settings.max_combined_waiver || 0,
                                types: [],
                              };
                              const programLabel = key
                                .split("_")
                                .map(
                                  (w) => w.charAt(0).toUpperCase() + w.slice(1),
                                )
                                .join(" ");
                              return (
                                <TableRow key={key}>
                                  <TableCell className="font-medium">
                                    {programLabel}
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      className="w-24"
                                      value={rule.maxPercentage}
                                      onChange={(e) =>
                                        setProgramWaiverRules((prev) => ({
                                          ...prev,
                                          [key]: {
                                            ...(prev[key] || { types: [] }),
                                            maxPercentage: Number(
                                              e.target.value,
                                            ),
                                          },
                                        }))
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      {[
                                        "merit",
                                        "sibling",
                                        "staff",
                                        "sports",
                                      ].map((t) => (
                                        <label
                                          key={t}
                                          className="inline-flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={rule.types.includes(t)}
                                            onChange={(e) => {
                                              setProgramWaiverRules((prev) => {
                                                const prevTypes =
                                                  prev[key]?.types || [];
                                                const nextTypes = e.target
                                                  .checked
                                                  ? [...prevTypes, t]
                                                  : prevTypes.filter(
                                                      (x) => x !== t,
                                                    );
                                                return {
                                                  ...prev,
                                                  [key]: {
                                                    ...(prev[key] || {}),
                                                    maxPercentage:
                                                      rule.maxPercentage,
                                                    types: nextTypes,
                                                  },
                                                };
                                              });
                                            }}
                                          />
                                          <span className="capitalize">
                                            {t}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Eligibility & Waiver Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admission Test Configuration Tab */}
        <TabsContent value="admission-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Admission Test Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Admission Test Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admission_test_fee">
                    Admission Test Fee (৳)
                  </Label>
                  <Input
                    id="admission_test_fee"
                    type="number"
                    min="0"
                    value={settings?.admission_test_fee || ""}
                    onChange={(e) =>
                      settings &&
                      setSettings({
                        ...settings,
                        admission_test_fee: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Program Test Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-deep-plum">
                  Program-wise Test Requirements
                </h3>
                <p className="text-sm text-gray-600">
                  Toggle which programs require an admission test and adjust
                  test fee per program.
                </p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Requires Test</TableHead>
                        <TableHead>Test Fee (৳)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PROGRAM_ELIGIBILITY_RULES.map((p) => {
                        const cfg = programTestConfig[p.programId] || {
                          requiresAdmissionTest:
                            p.requiresAdmissionTest || false,
                          admissionTestFee: p.admissionTestFee || 0,
                        };
                        return (
                          <TableRow key={p.programId}>
                            <TableCell className="font-medium">
                              {p.programName}
                            </TableCell>
                            <TableCell>
                              {p.level === "undergraduate"
                                ? "Undergraduate"
                                : "Postgraduate"}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={!!cfg.requiresAdmissionTest}
                                onCheckedChange={(v) =>
                                  setProgramTestConfig((prev) => ({
                                    ...prev,
                                    [p.programId]: {
                                      ...(prev[p.programId] || {}),
                                      requiresAdmissionTest: v as boolean,
                                      admissionTestFee: cfg.admissionTestFee,
                                    },
                                  }))
                                }
                                aria-label={`Toggle admission test for ${p.programName}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                className="w-36"
                                value={cfg.admissionTestFee}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setProgramTestConfig((prev) => ({
                                    ...prev,
                                    [p.programId]: {
                                      ...(prev[p.programId] || {}),
                                      admissionTestFee: val,
                                      requiresAdmissionTest:
                                        cfg.requiresAdmissionTest,
                                    },
                                  }));
                                }}
                                aria-label={`Admission test fee for ${p.programName}`}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Law Department Test Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-deep-plum">
                  Law Department
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="law_test_date">Test Date</Label>
                    <Input
                      id="law_test_date"
                      type="date"
                      value={
                        settings?.law_admission_test_date?.slice(0, 10) || ""
                      }
                      onChange={(e) =>
                        settings &&
                        setSettings({
                          ...settings,
                          law_admission_test_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="law_test_time">Test Time</Label>
                    <Input
                      id="law_test_time"
                      value={settings?.law_test_time || ""}
                      onChange={(e) =>
                        settings &&
                        setSettings({
                          ...settings,
                          law_test_time: e.target.value,
                        })
                      }
                      placeholder="e.g., 10:00 AM - 12:00 PM"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="law_venue_main">Main Campus Venue</Label>
                    <Input
                      id="law_venue_main"
                      value={settings?.law_test_venue_main || ""}
                      onChange={(e) =>
                        settings &&
                        setSettings({
                          ...settings,
                          law_test_venue_main: e.target.value,
                        })
                      }
                      placeholder="Room number and building"
                    />
                  </div>
                  <div>
                    <Label htmlFor="law_venue_khulna">
                      Khulna Campus Venue
                    </Label>
                    <Input
                      id="law_venue_khulna"
                      value={settings?.law_test_venue_khulna || ""}
                      onChange={(e) =>
                        settings &&
                        setSettings({
                          ...settings,
                          law_test_venue_khulna: e.target.value,
                        })
                      }
                      placeholder="Room number and building"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Architecture Department Test Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-deep-plum">
                  Architecture Department
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="architecture_test_date">Test Date</Label>
                    <Input
                      id="architecture_test_date"
                      type="date"
                      value={
                        settings?.architecture_admission_test_date?.slice(
                          0,
                          10,
                        ) || ""
                      }
                      onChange={(e) =>
                        settings &&
                        setSettings({
                          ...settings,
                          architecture_admission_test_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="architecture_test_time">Test Time</Label>
                    <Input
                      id="architecture_test_time"
                      value={settings?.architecture_test_time || ""}
                      onChange={(e) =>
                        settings &&
                        setSettings({
                          ...settings,
                          architecture_test_time: e.target.value,
                        })
                      }
                      placeholder="e.g., 2:00 PM - 4:00 PM"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="architecture_venue_main">
                      Main Campus Venue
                    </Label>
                    <Input
                      id="architecture_venue_main"
                      value={settings?.architecture_test_venue_main || ""}
                      onChange={(e) =>
                        settings &&
                        setSettings({
                          ...settings,
                          architecture_test_venue_main: e.target.value,
                        })
                      }
                      placeholder="Room number and building"
                    />
                  </div>
                  <div>
                    <Label htmlFor="architecture_venue_khulna">
                      Khulna Campus Venue
                    </Label>
                    <Input
                      id="architecture_venue_khulna"
                      value={settings?.architecture_test_venue_khulna || ""}
                      onChange={(e) =>
                        settings &&
                        setSettings({
                          ...settings,
                          architecture_test_venue_khulna: e.target.value,
                        })
                      }
                      placeholder="Room number and building"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-deep-plum hover:bg-accent-purple"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Admission Test Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment Methods</CardTitle>
              <Button onClick={() => openPaymentDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">
                        {method.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{method.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {method.account_number}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={method.is_active ? "default" : "secondary"}
                        >
                          {method.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{method.order_priority}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPaymentDialog(method)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePaymentMethod(method.id!)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Requirements Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Document Requirements</CardTitle>
              <Button onClick={() => openDocumentDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Document Requirement
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>File Types</TableHead>
                    <TableHead>Max Size</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentRequirements.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.is_required ? "destructive" : "secondary"
                          }
                        >
                          {doc.is_required ? "Required" : "Optional"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {doc.file_types}
                      </TableCell>
                      <TableCell>{doc.max_file_size_mb} MB</TableCell>
                      <TableCell>{doc.order_priority}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDocumentDialog(doc)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteDocumentRequirement(doc.id!)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waiver Configuration Tab */}
        <TabsContent value="referral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Referral & Commission Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white border rounded-lg">
                  <Label className="font-medium">Enable Referral Program</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Switch
                      checked={!!settings?.referral_enabled}
                      onCheckedChange={(v) =>
                        setSettings((prev) =>
                          prev
                            ? { ...prev, referral_enabled: v as boolean }
                            : prev,
                        )
                      }
                    />
                    <p className="text-sm text-gray-600">
                      Allow admission officers to register referrals and
                      applicants to enter referral IDs.
                    </p>
                  </div>

                  <div className="mt-4">
                    <Label className="font-medium">
                      Default Commission (%)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={settings?.default_referral_commission ?? 5}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                default_referral_commission: Number(
                                  e.target.value,
                                ),
                              }
                            : prev,
                        )
                      }
                      className="w-32"
                    />
                    {errors.default_referral_commission && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.default_referral_commission}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      This is the default commission rate applied to referrals
                      when not overridden per employee.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <CardTitle className="text-sm font-medium mb-2">
                    Top Referrers Preview
                  </CardTitle>
                  <p className="text-xs text-gray-500 mb-3">
                    A preview of active referrers and their commission rates
                    (managed in Referrals page).
                  </p>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {!Array.isArray(referrersList) ||
                    referrersList.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No referrers found.
                      </div>
                    ) : (
                      (referrersList as any[]).map((r) => (
                        <div
                          key={r.employee_id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {r.name} ({r.employee_id})
                            </div>
                            <div className="text-xs text-gray-500">
                              {r.department} • {r.designation}
                            </div>
                          </div>
                          <div className="text-sm text-gray-700">
                            {(r.commission_rate * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-deep-plum"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Referral Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waiver" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Comprehensive Eligibility Rules & Admission Requirements
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                View program-specific eligibility requirements and admission
                test information
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Global Settings Summary */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    📋 Admission Test & Payment Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Standard Test Fee:</Label>
                      <p className="text-gray-700">৳500 BDT</p>
                    </div>
                    <div>
                      <Label className="font-medium">Payment Method:</Label>
                      <p className="text-gray-700">bKash Mobile Banking</p>
                    </div>
                    <div>
                      <Label className="font-medium">Admit Card:</Label>
                      <p className="text-gray-700">
                        Download after payment verification
                      </p>
                    </div>
                  </div>
                </div>

                {/* Program Requirements Overview */}
                <div>
                  <h4 className="font-semibold text-deep-plum mb-4">
                    🎓 Program-wise Eligibility Requirements
                  </h4>
                  <div className="space-y-4">
                    {PROGRAM_ELIGIBILITY_RULES.map((rule) => (
                      <Card
                        key={rule.programId}
                        className="border border-gray-200"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-deep-plum">
                                {rule.programName}
                              </CardTitle>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="w-4 h-4" />
                                  {rule.level === "undergraduate"
                                    ? "Undergraduate"
                                    : "Postgraduate"}
                                </span>
                                {rule.requiresAdmissionTest && (
                                  <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    <FileText className="w-4 h-4" />
                                    Admission Test Required
                                  </span>
                                )}
                                {rule.requiresViva && (
                                  <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                    <Users className="w-4 h-4" />
                                    Viva Voce
                                  </span>
                                )}
                                {rule.admissionTestFee && (
                                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                                    <CreditCard className="w-4 h-4" />৳
                                    {rule.admissionTestFee}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            {/* Bangla Medium Requirements */}
                            {rule.eligibilityRules.bangla_medium && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                  🇧🇩 Bangla Medium
                                </h5>
                                <div className="space-y-1 text-green-700">
                                  <p>
                                    • Min SSC GPA:{" "}
                                    <strong>
                                      {
                                        rule.eligibilityRules.bangla_medium
                                          .minimumSSCGPA
                                      }
                                    </strong>
                                  </p>
                                  <p>
                                    • Min HSC GPA:{" "}
                                    <strong>
                                      {
                                        rule.eligibilityRules.bangla_medium
                                          .minimumHSCGPA
                                      }
                                    </strong>
                                  </p>
                                  <p>
                                    • Total Required:{" "}
                                    <strong>
                                      {
                                        rule.eligibilityRules.bangla_medium
                                          .minimumTotalGPA
                                      }
                                    </strong>
                                  </p>
                                  {rule.eligibilityRules.bangla_medium
                                    .allowedGroups && (
                                    <p className="text-xs">
                                      • Groups:{" "}
                                      {rule.eligibilityRules.bangla_medium.allowedGroups.join(
                                        ", ",
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* English Medium Requirements */}
                            {rule.eligibilityRules.english_medium && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                  🇬🇧 English Medium
                                </h5>
                                <div className="space-y-1 text-blue-700">
                                  <p>
                                    • O Level:{" "}
                                    <strong>
                                      ≥
                                      {
                                        rule.eligibilityRules.english_medium
                                          .minimumOLevelSubjects
                                      }
                                    </strong>{" "}
                                    subjects
                                  </p>
                                  <p>
                                    • A Level:{" "}
                                    <strong>
                                      ≥
                                      {
                                        rule.eligibilityRules.english_medium
                                          .minimumALevelSubjects
                                      }
                                    </strong>{" "}
                                    subjects
                                  </p>
                                  <p>
                                    • Need:{" "}
                                    <strong>
                                      {
                                        rule.eligibilityRules.english_medium
                                          .requiredGrades.countOfBGrades
                                      }{" "}
                                      B's +{" "}
                                      {
                                        rule.eligibilityRules.english_medium
                                          .requiredGrades.countOfCGrades
                                      }{" "}
                                      C's
                                    </strong>
                                  </p>
                                  <p className="text-xs">
                                    • Best 7 subjects considered
                                  </p>
                                  <p className="text-xs">
                                    • Scale: A=5, B=4, C=3.5, D=3, E=2
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Diploma Requirements */}
                            {rule.eligibilityRules.diploma && (
                              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                                <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                                  🎓 Diploma Background
                                </h5>
                                <div className="space-y-1 text-orange-700">
                                  <p>
                                    • Min SSC GPA:{" "}
                                    <strong>
                                      {
                                        rule.eligibilityRules.diploma
                                          .minimumSSCGPA
                                      }
                                    </strong>
                                  </p>
                                  <p>
                                    • Min Diploma CGPA:{" "}
                                    <strong>
                                      {
                                        rule.eligibilityRules.diploma
                                          .minimumDiplomaCGPA
                                      }
                                    </strong>
                                  </p>
                                  <p>
                                    • Total Required:{" "}
                                    <strong>
                                      {
                                        rule.eligibilityRules.diploma
                                          .minimumTotalGPA
                                      }
                                    </strong>
                                  </p>
                                  {rule.eligibilityRules.diploma
                                    .requiresScienceBackground && (
                                    <p className="text-xs">
                                      • Science background required
                                    </p>
                                  )}
                                  {rule.eligibilityRules.diploma
                                    .allowedDiplomaPrograms && (
                                    <p className="text-xs">
                                      • Programs:{" "}
                                      {rule.eligibilityRules.diploma.allowedDiplomaPrograms.join(
                                        ", ",
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Postgraduate Requirements */}
                            {rule.eligibilityRules.postgraduate && (
                              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                                <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                                  ��� Postgraduate
                                </h5>
                                <div className="space-y-1 text-purple-700">
                                  <p>
                                    • Min Bachelor CGPA:{" "}
                                    <strong>
                                      {
                                        rule.eligibilityRules.postgraduate
                                          .minimumBachelorCGPA
                                      }
                                    </strong>
                                  </p>
                                  {rule.eligibilityRules.postgraduate
                                    .noThirdDivision && (
                                    <p className="text-xs">
                                      • No third division allowed
                                    </p>
                                  )}
                                  {rule.eligibilityRules.postgraduate
                                    .minimumWorkExperience && (
                                    <p className="text-xs">
                                      •{" "}
                                      <strong>
                                        {
                                          rule.eligibilityRules.postgraduate
                                            .minimumWorkExperience
                                        }
                                        +
                                      </strong>{" "}
                                      years experience
                                    </p>
                                  )}
                                  {rule.eligibilityRules.postgraduate
                                    .requiredBachelorDegree && (
                                    <p className="text-xs">
                                      • Degrees:{" "}
                                      {rule.eligibilityRules.postgraduate.requiredBachelorDegree.join(
                                        ", ",
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Additional Requirements & Year Restrictions */}
                          {(rule.subjectRequirements ||
                            rule.specialRequirements ||
                            rule.allowedPassingYears) && (
                            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                              <h6 className="font-medium text-gray-800 mb-2">
                                📋 Additional Requirements
                              </h6>
                              <div className="text-sm text-gray-700 space-y-1">
                                {rule.subjectRequirements &&
                                  rule.subjectRequirements.map((req, index) => (
                                    <p key={index}>��� {req}</p>
                                  ))}
                                {rule.specialRequirements &&
                                  rule.specialRequirements.map((req, index) => (
                                    <p key={index}>• {req}</p>
                                  ))}
                                {rule.allowedPassingYears && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="font-medium text-yellow-800">
                                      📅 Year Restriction:
                                    </p>
                                    <p className="text-yellow-700">
                                      HSC passing years:{" "}
                                      <strong>
                                        {rule.allowedPassingYears.join(", ")}
                                      </strong>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Important Notes */}
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        <strong>📝 Important Notes:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          These requirements are based on official Northern
                          University Bangladesh admission criteria
                        </li>
                        <li>
                          All GPA/CGPA calculations are automatically verified
                          during the application process
                        </li>
                        <li>
                          Programs marked with "Admission Test Required" need
                          fee payment for admit card download
                        </li>
                        <li>
                          Payment verification is done automatically through
                          bKash integration
                        </li>
                        <li>
                          Viva voce is conducted after passing the written test
                          (where applicable)
                        </li>
                        <li>
                          Year restrictions apply to ensure recent academic
                          qualifications
                        </li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment_name">Name</Label>
              <Input
                id="payment_name"
                value={paymentForm.name || ""}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Dutch Bangla Bank"
              />
            </div>
            <div>
              <Label htmlFor="payment_type">Type</Label>
              <Select
                value={paymentForm.type}
                onValueChange={(value) =>
                  setPaymentForm({
                    ...paymentForm,
                    type: value as "bank" | "mobile" | "online",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="mobile">Mobile Banking</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={paymentForm.account_number || ""}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    account_number: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={paymentForm.account_name || ""}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    account_name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="routing_number">Routing Number (Optional)</Label>
              <Input
                id="routing_number"
                value={paymentForm.routing_number || ""}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    routing_number: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="payment_instructions">Instructions</Label>
              <Textarea
                id="payment_instructions"
                value={paymentForm.instructions || ""}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    instructions: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="payment_active">Active</Label>
              <Switch
                id="payment_active"
                checked={paymentForm.is_active}
                onCheckedChange={(checked) =>
                  setPaymentForm({
                    ...paymentForm,
                    is_active: checked,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="payment_priority">Display Priority</Label>
              <Input
                id="payment_priority"
                type="number"
                value={paymentForm.order_priority || 0}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    order_priority: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={savePaymentMethod}>
                {editingPayment ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Requirement Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDocument
                ? "Edit Document Requirement"
                : "Add Document Requirement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="doc_name">Name</Label>
              <Input
                id="doc_name"
                value={documentForm.name || ""}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., SSC Certificate"
              />
            </div>
            <div>
              <Label htmlFor="doc_description">Description</Label>
              <Textarea
                id="doc_description"
                value={documentForm.description || ""}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    description: e.target.value,
                  })
                }
                rows={2}
                placeholder="Brief description of the document requirement"
              />
            </div>
            <div>
              <Label htmlFor="file_types">Allowed File Types</Label>
              <Input
                id="file_types"
                value={documentForm.file_types || ""}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    file_types: e.target.value,
                  })
                }
                placeholder="pdf,jpg,jpeg,png"
              />
            </div>
            <div>
              <Label htmlFor="max_size">Max File Size (MB)</Label>
              <Input
                id="max_size"
                type="number"
                value={documentForm.max_file_size_mb || 5}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    max_file_size_mb: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="doc_required">Required</Label>
              <Switch
                id="doc_required"
                checked={documentForm.is_required}
                onCheckedChange={(checked) =>
                  setDocumentForm({
                    ...documentForm,
                    is_required: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="doc_active">Active</Label>
              <Switch
                id="doc_active"
                checked={documentForm.is_active}
                onCheckedChange={(checked) =>
                  setDocumentForm({
                    ...documentForm,
                    is_active: checked,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="doc_priority">Display Priority</Label>
              <Input
                id="doc_priority"
                type="number"
                value={documentForm.order_priority || 0}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    order_priority: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDocumentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveDocumentRequirement}>
                {editingDocument ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
