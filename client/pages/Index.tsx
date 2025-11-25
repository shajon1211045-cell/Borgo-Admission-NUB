import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../lib/api";
import {
  ChevronRight,
  Upload,
  FileText,
  CreditCard,
  DollarSign,
  CheckCircle,
  Users,
  Award,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Index() {
  const [language, setLanguage] = useState<"en" | "bn">("en");

  const texts = {
    en: {
      heroTitle: "Welcome to Your Academic Journey",
      heroSubtitle:
        "Join Northern University Bangladesh - Where Excellence Meets Opportunity",
      heroDescription:
        "Choose your admission path and begin your journey with us. We offer both regular admission and credit transfer options.",
      regularAdmission: "Regular Admission",
      creditTransfer: "Credit Transfer",
      regularAdmissionDesc: "Apply for undergraduate and graduate programs",
      creditTransferDesc: "Transfer your credits from another institution",
      uploadOffline: "Upload Offline Application",
      admissionProcess: "Simple 4-Step Admission Process",
      step1: "Choose Program & Calculate Costs",
      step1Desc: "Select program, department and see available waivers",
      step2: "Personal Details",
      step2Desc: "Fill in your personal information",
      step3: "Academic History",
      step3Desc: "Upload your academic documents",
      step4: "Review & Pay",
      step4Desc: "Complete your application",
      whyChooseUs: "Why Choose Northern University Bangladesh?",
      excellentFaculty: "Excellent Faculty",
      excellentFacultyDesc:
        "Learn from industry experts and experienced professors",
      modernFacilities: "Modern Facilities",
      modernFacilitiesDesc: "State-of-the-art labs and learning environments",
      careerSupport: "Career Support",
      careerSupportDesc: "Dedicated placement assistance and career guidance",
      affordableEducation: "Affordable Education",
      affordableEducationDesc:
        "Quality education with various scholarship opportunities",
      waiverHighlights: "Scholarship & Waiver Opportunities",
      meritBased: "Merit-Based Scholarships",
      meritBasedDesc: "Up to 100% waiver based on SSC & HSC results",
      specialWaivers: "Special Waivers Available",
      specialWaiversDesc:
        "Additional support for females, siblings, and freedom fighters",
      quickStats: "Quick Statistics",
      totalApplicants: "Total Applicants",
      programs: "Programs Available",
      scholarshipProvided: "Scholarships Provided",
      placementRate: "Placement Rate",
      contactUs: "Contact Information",
      quickLinks: "Quick Links",
      aboutUs: "About Us",
      admissions: "Admissions",
      news: "News & Events",
      campusLife: "Campus Life",
    },
    bn: {
      heroTitle: "আপনার শ��ক্ষা যাত্রায় ��্বাগতম",
      heroSubtitle:
        "নর্দার্ন ইউনিভার্সিটি বাংলাদেশে যোগ দিন - যেখানে উৎকর্ষতা সুযোগের সাথে মিলিত হয়",
      heroDescription:
        "মাত্র ৫টি সহজ ধাপে আপনার ���নলাইন ভর্তি প্রক্রিয়া শুরু করুন। আমাদের সুবিধাজনক স��স্টেম ���পনার স্বপ্নের প্রোগ্রামে আবেদন করা সহজ করে তোলে।",
      startJourney: "আপনার যাত্রা শুরু করুন",
      uploadOffline: "অফ���াইন আবেদন আপলোড করুন",
      admissionProcess: "সহজ ৪-ধাপের ভর্তি প্রক্রিয়া",
      regularAdmission: "নিয়মিত ভর্তি",
      creditTransfer: "ক্রেডিট ট্রান্সফার",
      regularAdmissionDesc:
        "স্নাতক এবং স্নাতকোত্তর প্রোগ্রামের জন্য আবেদন করু��",
      creditTransferDesc:
        "অন্��� প্রতিষ্ঠান থেকে আপনার ক্রেডিট স্থানান্তর করুন",
      step1: "প্রোগ্রাম নির্বাচন ও খরচ গণনা",
      step1Desc: "প্রোগ্রাম, বিভাগ নির্বাচন এবং উপলব্ধ মওকুফ ���েখুন",
      step2: "ব্যক্তিগত তথ্য",
      step2Desc: "আপনার ব্যক্তিগত তথ্য পূরণ করুন",
      step3: "শিক্ষাগত ইতিহাস",
      step3Desc: "আপনার শিক্ষা��ত কাগজপত্র আপলোড করুন",
      step4: "পর্যালোচনা ও পেমেন্ট",
      step4Desc: "আপনার আবেদন সম্পূর্ণ করুন",
      whyChooseUs: "কেন নর্দার্ন ইউনিভার্সিটি বাংলাদেশ বেছে নেবেন?",
      excellentFaculty: "উৎকৃষ্ট শিক্ষকমণ্��লী",
      excellentFacultyDesc:
        "শিল্প বিশেষজ্ঞ এবং অভিজ্ঞ অধ্যাপকদের কা��� থেকে শিখুন",
      modernFacilities: "আধুনিক সুবিধা",
      modernFacilitiesDesc: "অত্যাধুনিক ল্যাব এবং শিক্ষার পরিবেশ",
      careerSupport: "ক্যারিয়ার সাপোর্ট",
      careerSupportDesc: "নিবেদিত চাকরির সহায়তা এ��ং ক্যারিয়ার গাইডেন্স",
      affordableEducation: "সাশ্রয়ী শিক্ষা",
      affordableEducationDesc: "বিভিন্ন বৃত্তির সুযোগ সহ মানসম্পন্ন শিক্ষা",
      waiverHighlights: "বৃত্তি ও মওকুফের সুযো���",
      meritBased: "মেধাভিত্তিক বৃত্তি",
      meritBasedDesc: "এসএসসি ও এইচএসসি ফলাফলের ভিত্তিতে ১০০% পর্যন্ত মওকুফ",
      specialWaivers: "বিশেষ মওকুফ উপলব্ধ",
      specialWaiversDesc:
        "নারী, ���া���বোন এবং মুক্তিযোদ্ধাদের জন্য অতিরিক্ত সহায��তা",
      quickStats: "দ্রুত পরিসংখ্যান",
      totalApplicants: "মোট আবেদন���ারী",
      programs: "উপলব্ধ প্রোগ্রাম",
      scholarshipProvided: "প্রদানকৃত বৃত্তি",
      placementRate: "চাকরির হার",
      contactUs: "যোগাযোগের তথ্য",
      quickLinks: "দ্রুত লিংক",
      aboutUs: "আমাদের সম্পর্কে",
      admissions: "ভর্তি",
      news: "সং��াদ ও ইভেন্ট",
      campusLife: "ক্যাম্পাস জীবন",
    },
  };

  const t = texts[language];

  const [programs, setPrograms] = useState<any[]>([]);
  const [registrationPkgs, setRegistrationPkgs] = useState<any[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPrograms = async () => {
      setProgramsLoading(true);
      try {
        const res = await apiClient.getPrograms();
        if (res.success && res.data?.programs) {
          if (mounted) setPrograms(res.data.programs);
        } else {
          if (mounted) setProgramsError(res.error || "Failed to load programs");
        }
      } catch (e) {
        if (mounted) setProgramsError("Failed to load programs");
      } finally {
        if (mounted) setProgramsLoading(false);
      }

      // load registration packages
      try {
        const rp = await apiClient.getRegistrationPackages();
        if (rp.success && rp.data)
          setRegistrationPkgs(Array.isArray(rp.data) ? rp.data : []);
      } catch (e) {
        console.warn("Failed to load registration packages", e);
      }
    };
    fetchPrograms();
    return () => {
      mounted = false;
    };
  }, []);

  const admissionSteps = [
    {
      step: 1,
      title: t.step1,
      description: t.step1Desc,
      icon: FileText,
      color: "bg-blue-100 text-blue-800",
    },
    {
      step: 2,
      title: t.step2,
      description: t.step2Desc,
      icon: Users,
      color: "bg-green-100 text-green-800",
    },
    {
      step: 3,
      title: t.step3,
      description: t.step3Desc,
      icon: Upload,
      color: "bg-purple-100 text-purple-800",
    },
    {
      step: 4,
      title: t.step4,
      description: t.step4Desc,
      icon: CreditCard,
      color: "bg-pink-100 text-pink-800",
    },
  ];

  const whyChooseUsFeatures = [
    {
      title: t.excellentFaculty,
      description: t.excellentFacultyDesc,
      icon: Users,
      color: "from-blue-400 to-blue-600",
    },
    {
      title: t.modernFacilities,
      description: t.modernFacilitiesDesc,
      icon: Star,
      color: "from-green-400 to-green-600",
    },
    {
      title: t.careerSupport,
      description: t.careerSupportDesc,
      icon: CheckCircle,
      color: "from-purple-400 to-purple-600",
    },
    {
      title: t.affordableEducation,
      description: t.affordableEducationDesc,
      icon: DollarSign,
      color: "from-pink-400 to-pink-600",
    },
  ];

  const stats = [
    { label: t.totalApplicants, value: "15,000+", icon: Users },
    { label: t.programs, value: "50+", icon: FileText },
    { label: t.scholarshipProvided, value: "₹2.5Cr+", icon: Award },
    { label: t.placementRate, value: "95%", icon: CheckCircle },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-br from-deep-plum via-accent-purple to-pink-accent">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg"
          aria-hidden="true"
        ></div>

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-deep-plum/85 via-accent-purple/80 to-pink-accent/75"></div>

        {/* Additional overlay for text contrast */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-white">
              <div className="space-y-6">
                <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
                  🎓 Online Admission 2024 Open
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold font-poppins leading-tight">
                  {t.heroTitle}
                </h1>
                <h2 className="text-xl lg:text-2xl text-lavender-bg font-medium">
                  {t.heroSubtitle}
                </h2>
                <p className="text-lg text-lavender-bg/90 leading-relaxed">
                  {t.heroDescription}
                </p>
              </div>

              {/* Admission Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">
                  Choose Your Admission Path:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/program-selection?type=regular">
                    <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="text-white space-y-3">
                          <div className="flex items-center justify-between">
                            <FileText className="w-6 h-6" />
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg font-poppins">
                              {t.regularAdmission}
                            </h4>
                            <p className="text-sm text-white/80">
                              {t.regularAdmissionDesc}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/program-selection?type=credit-transfer">
                    <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="text-white space-y-3">
                          <div className="flex items-center justify-between">
                            <Award className="w-6 h-6" />
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg font-poppins">
                              {t.creditTransfer}
                            </h4>
                            <p className="text-sm text-white/80">
                              {t.creditTransferDesc}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                <div className="pt-4">
                  <Link to="/program-selection?offline=true">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-deep-plum text-lg px-8 py-4"
                      aria-label="Upload offline admission application"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Offline Admission
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Programs Preview - fetched from API */}
            <div className="w-full">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white/90">
                  Popular Programs
                </h3>
              </div>

              {programsLoading && (
                <div className="text-white">Loading programs...</div>
              )}

              {programsError && (
                <div className="text-red-300">{programsError}</div>
              )}

              {!programsLoading && !programsError && programs.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {programs.slice(0, 3).map((program: any) => {
                    const code = program.code || program.program_code;
                    const dept =
                      program.department_code || program.department?.code || "";
                    const shortDesc =
                      program.short_description ||
                      program.description ||
                      program.department_name ||
                      "A leading program with strong industry ties.";
                    return (
                      <Card
                        key={code}
                        className="bg-white/10 backdrop-blur-lg border-white/20 text-white"
                      >
                        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">
                              {program.name || program.program_name}
                            </div>
                            <div className="text-sm text-white/80">
                              Code: {code} •{" "}
                              {program.duration ?? program.duration_years}
                            </div>
                            <div className="text-sm text-white/80">
                              {shortDesc}
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 flex items-center gap-4">
                            <Link
                              to={`/program-selection?program=${encodeURIComponent(code)}&department=${encodeURIComponent(dept)}`}
                            >
                              <Button
                                size="sm"
                                aria-label={`Apply to ${program.name || program.program_name}`}
                              >
                                Apply
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Registration packages preview */}
                  {registrationPkgs.slice(0, 2).map((pkg: any) => (
                    <Card
                      key={pkg.id}
                      className="bg-white/10 backdrop-blur-lg border-white/20 text-white"
                    >
                      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">{pkg.program}</div>
                          <div className="text-sm text-white/80">
                            {pkg.term} • {pkg.mode}
                          </div>
                          <div className="text-sm text-white/80">
                            Credits: {pkg.credits} • Per Credit: ৳
                            {pkg.perCredit.toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-4">
                          <Link to="/program-selection">
                            <Button size="sm">View Packages</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right Content - Quick Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border-white/20 text-white"
                >
                  <CardContent className="p-6 text-center">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-white" />
                    <div className="text-3xl font-bold font-poppins">
                      {stat.value}
                    </div>
                    <p className="text-sm text-lavender-bg/90 mt-1">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admission Process Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-deep-plum font-poppins mb-4">
              {t.admissionProcess}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to complete your admission application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {admissionSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < admissionSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gray-200 z-0"></div>
                )}

                <Card className="relative z-10 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-accent-purple">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <step.icon className="w-8 h-8" />
                    </div>
                    <Badge className="mb-3 bg-deep-plum text-white">
                      Step {step.step}
                    </Badge>
                    <h3 className="text-lg font-bold text-deep-plum font-poppins mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-lavender-bg to-mint-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-deep-plum font-poppins mb-4">
              {t.whyChooseUs}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUsFeatures.map((feature, index) => (
              <Card
                key={index}
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-deep-plum font-poppins mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waiver Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-deep-plum font-poppins mb-4">
              {t.waiverHighlights}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-poppins text-green-800 flex items-center gap-3">
                  <Award className="w-8 h-8" />
                  {t.meritBased}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 text-lg mb-4">
                  {t.meritBasedDesc}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm font-medium">
                      GPA 5.00 (Both SSC & HSC)
                    </span>
                    <Badge className="bg-green-600 text-white">
                      100% Waiver
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm font-medium">GPA 4.80-4.99</span>
                    <Badge className="bg-green-500 text-white">
                      40% Waiver
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm font-medium">GPA 4.00-4.49</span>
                    <Badge className="bg-green-400 text-white">
                      20% Waiver
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-poppins text-purple-800 flex items-center gap-3">
                  <Star className="w-8 h-8" />
                  {t.specialWaivers}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 text-lg mb-4">
                  {t.specialWaiversDesc}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm font-medium">
                      Female Applicants
                    </span>
                    <Badge className="bg-purple-600 text-white">
                      5% Additional
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm font-medium">Siblings</span>
                    <Badge className="bg-purple-600 text-white">
                      20% Waiver
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm font-medium">
                      Freedom Fighter Wards
                    </span>
                    <Badge className="bg-purple-600 text-white">
                      Special Rate
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-plum text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold font-poppins mb-6">
                {t.contactUs}
              </h3>
              <div className="space-y-3 text-gray-300">
                <p>Northern University Bangladesh</p>
                <p>Dhaka, Bangladesh</p>
                <p>Phone: +880-2-123456789</p>
                <p>Email: admission@nu.edu.bd</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold font-poppins mb-6">
                {t.quickLinks}
              </h3>
              <div className="space-y-3">
                <Link
                  to="#"
                  className="block text-gray-300 hover:text-pink-accent transition-colors"
                >
                  {t.aboutUs}
                </Link>
                <Link
                  to="/program-selection"
                  className="block text-gray-300 hover:text-pink-accent transition-colors"
                >
                  {t.admissions}
                </Link>
                <Link
                  to="#"
                  className="block text-gray-300 hover:text-pink-accent transition-colors"
                >
                  {t.news}
                </Link>
                <Link
                  to="#"
                  className="block text-gray-300 hover:text-pink-accent transition-colors"
                >
                  {t.campusLife}
                </Link>
              </div>
            </div>

            <div className="md:col-span-2">
              {/* Language Toggle for Footer */}
              <div className="flex justify-end">
                <div className="flex items-center bg-accent-purple rounded-lg p-1">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      language === "en"
                        ? "bg-white text-deep-plum"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("bn")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      language === "bn"
                        ? "bg-white text-deep-plum"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-accent-purple mt-12 pt-8 text-center text-gray-300">
            <p>
              &copy; 2024 Northern University Bangladesh. All rights reserved.
            </p>
            <p className="mt-2 text-sm">
              Start your academic journey with us today!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
