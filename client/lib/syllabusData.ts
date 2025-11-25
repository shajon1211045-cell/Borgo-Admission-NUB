// Syllabus Management System for Northern University Bangladesh

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  type: "theory" | "lab";
  description?: string;
  prerequisites?: string[];
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
  totalCredits: number;
}

export interface Syllabus {
  id: string;
  programId: string;
  programName: string;
  packageCode: string;
  totalSemesters: number;
  totalCredits: number;
  semesters: Semester[];
  feeStructure: {
    admissionFee: number;
    perCreditFee: number;
    labFeePerCourse: number;
    otherFees: number;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Course data for different programs
const coursesDatabase: Course[] = [
  // Computer Science & Engineering Courses
  {
    id: "cse-101",
    name: "Introduction to Computer Science",
    code: "CSE 101",
    credits: 3,
    type: "theory",
    description: "Basic concepts of computer science, programming fundamentals",
  },
  {
    id: "cse-101-lab",
    name: "Introduction to Computer Science Lab",
    code: "CSE 101L",
    credits: 1,
    type: "lab",
    description: "Practical implementation of CSE 101 concepts",
  },
  {
    id: "cse-102",
    name: "Programming Fundamentals",
    code: "CSE 102",
    credits: 3,
    type: "theory",
    description: "C/C++ programming, algorithms, data structures basics",
  },
  {
    id: "cse-102-lab",
    name: "Programming Fundamentals Lab",
    code: "CSE 102L",
    credits: 1,
    type: "lab",
    description: "Hands-on programming practice",
  },
  {
    id: "math-101",
    name: "Calculus and Analytical Geometry",
    code: "MATH 101",
    credits: 3,
    type: "theory",
    description: "Differential and integral calculus",
  },
  {
    id: "eng-101",
    name: "English Composition",
    code: "ENG 101",
    credits: 3,
    type: "theory",
    description: "Academic writing and communication skills",
  },
  {
    id: "phy-101",
    name: "Physics I",
    code: "PHY 101",
    credits: 3,
    type: "theory",
    description: "Mechanics, thermodynamics, and waves",
  },
  {
    id: "phy-101-lab",
    name: "Physics I Lab",
    code: "PHY 101L",
    credits: 1,
    type: "lab",
    description: "Experimental physics laboratory",
  },

  // Electrical & Electronic Engineering Courses
  {
    id: "eee-101",
    name: "Electrical Circuit Analysis",
    code: "EEE 101",
    credits: 3,
    type: "theory",
    description: "Basic electrical circuits, Ohm's law, Kirchhoff's laws",
  },
  {
    id: "eee-101-lab",
    name: "Electrical Circuit Analysis Lab",
    code: "EEE 101L",
    credits: 1,
    type: "lab",
    description: "Circuit simulation and practical measurements",
  },
  {
    id: "eee-102",
    name: "Electronics Fundamentals",
    code: "EEE 102",
    credits: 3,
    type: "theory",
    description: "Diodes, transistors, amplifiers",
  },
  {
    id: "eee-102-lab",
    name: "Electronics Fundamentals Lab",
    code: "EEE 102L",
    credits: 1,
    type: "lab",
    description: "Electronic component testing and circuit building",
  },

  // Business Administration Courses
  {
    id: "bba-101",
    name: "Principles of Management",
    code: "BBA 101",
    credits: 3,
    type: "theory",
    description: "Management principles, organizational behavior",
  },
  {
    id: "bba-102",
    name: "Business Mathematics",
    code: "BBA 102",
    credits: 3,
    type: "theory",
    description: "Mathematical concepts for business applications",
  },
  {
    id: "bba-103",
    name: "Accounting Principles",
    code: "BBA 103",
    credits: 3,
    type: "theory",
    description: "Basic accounting concepts and financial statements",
  },
  {
    id: "bba-103-lab",
    name: "Accounting Software Lab",
    code: "BBA 103L",
    credits: 1,
    type: "lab",
    description: "Practical use of accounting software",
  },
  {
    id: "eco-101",
    name: "Microeconomics",
    code: "ECO 101",
    credits: 3,
    type: "theory",
    description: "Supply and demand, market structures, consumer behavior",
  },

  // Law Courses
  {
    id: "law-101",
    name: "Introduction to Law",
    code: "LAW 101",
    credits: 3,
    type: "theory",
    description: "Legal system, sources of law, legal methodology",
  },
  {
    id: "law-102",
    name: "Constitutional Law",
    code: "LAW 102",
    credits: 3,
    type: "theory",
    description: "Constitutional principles, fundamental rights",
  },
  {
    id: "law-103",
    name: "Legal Research and Writing",
    code: "LAW 103",
    credits: 3,
    type: "theory",
    description: "Legal research methodology and academic writing",
  },
  {
    id: "law-103-lab",
    name: "Legal Research Lab",
    code: "LAW 103L",
    credits: 1,
    type: "lab",
    description: "Practical legal research using databases",
  },
  {
    id: "pol-101",
    name: "Political Science",
    code: "POL 101",
    credits: 3,
    type: "theory",
    description: "Political systems, governance, public policy",
  },

  // Civil Engineering Courses
  {
    id: "ce-101",
    name: "Engineering Mechanics",
    code: "CE 101",
    credits: 3,
    type: "theory",
    description: "Statics, dynamics, and strength of materials",
  },
  {
    id: "ce-101-lab",
    name: "Engineering Mechanics Lab",
    code: "CE 101L",
    credits: 1,
    type: "lab",
    description: "Material testing and structural analysis",
  },
  {
    id: "ce-102",
    name: "Engineering Drawing",
    code: "CE 102",
    credits: 3,
    type: "theory",
    description: "Technical drawing, CAD fundamentals",
  },
  {
    id: "ce-102-lab",
    name: "CAD Lab",
    code: "CE 102L",
    credits: 1,
    type: "lab",
    description: "Computer-aided design practical",
  },

  // Mechanical Engineering Courses
  {
    id: "me-101",
    name: "Thermodynamics",
    code: "ME 101",
    credits: 3,
    type: "theory",
    description: "Laws of thermodynamics, heat engines, refrigeration",
  },
  {
    id: "me-101-lab",
    name: "Thermodynamics Lab",
    code: "ME 101L",
    credits: 1,
    type: "lab",
    description: "Heat transfer experiments and engine testing",
  },
  {
    id: "me-102",
    name: "Engineering Materials",
    code: "ME 102",
    credits: 3,
    type: "theory",
    description: "Material properties, testing, and selection",
  },
  {
    id: "me-102-lab",
    name: "Materials Testing Lab",
    code: "ME 102L",
    credits: 1,
    type: "lab",
    description: "Mechanical testing of engineering materials",
  },

  // Pharmacy Courses
  {
    id: "pharm-101",
    name: "Pharmaceutical Chemistry",
    code: "PHARM 101",
    credits: 3,
    type: "theory",
    description: "Drug chemistry, molecular structure and activity",
  },
  {
    id: "pharm-101-lab",
    name: "Pharmaceutical Chemistry Lab",
    code: "PHARM 101L",
    credits: 1,
    type: "lab",
    description: "Drug synthesis and analysis laboratory",
  },
  {
    id: "pharm-102",
    name: "Pharmacology",
    code: "PHARM 102",
    credits: 3,
    type: "theory",
    description: "Drug action, pharmacokinetics, pharmacodynamics",
  },
  {
    id: "pharm-102-lab",
    name: "Pharmacology Lab",
    code: "PHARM 102L",
    credits: 1,
    type: "lab",
    description: "Drug testing and biological assays",
  },
  {
    id: "bio-101",
    name: "Biochemistry",
    code: "BIO 101",
    credits: 3,
    type: "theory",
    description: "Biomolecules, metabolic pathways, enzymology",
  },

  // General Education Courses
  {
    id: "soc-101",
    name: "Introduction to Sociology",
    code: "SOC 101",
    credits: 3,
    type: "theory",
    description: "Social structures, institutions, and behavior",
  },
  {
    id: "psy-101",
    name: "General Psychology",
    code: "PSY 101",
    credits: 3,
    type: "theory",
    description: "Human behavior, cognition, and mental processes",
  },
  {
    id: "stat-101",
    name: "Statistics",
    code: "STAT 101",
    credits: 3,
    type: "theory",
    description: "Descriptive and inferential statistics",
  },
  {
    id: "stat-101-lab",
    name: "Statistics Lab",
    code: "STAT 101L",
    credits: 1,
    type: "lab",
    description: "Statistical software and data analysis",
  },
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
    description: "Global historical developments from ancient to modern times",
  },
];

// Default syllabuses for each program
export const defaultSyllabuses: Syllabus[] = [
  // Computer Science & Engineering
  {
    id: "syl-cse-bachelor",
    programId: "cse",
    programName: "Bachelor in Computer Science & Engineering",
    packageCode: "CSE-B-2024",
    totalSemesters: 8,
    totalCredits: 144,
    feeStructure: {
      admissionFee: 35000,
      perCreditFee: 2500,
      labFeePerCourse: 5000,
      otherFees: 15000,
    },
    semesters: [
      {
        id: "cse-sem-1",
        name: "Semester 1",
        courses: [
          coursesDatabase.find((c) => c.id === "cse-101")!,
          coursesDatabase.find((c) => c.id === "cse-101-lab")!,
          coursesDatabase.find((c) => c.id === "math-101")!,
          coursesDatabase.find((c) => c.id === "eng-101")!,
          coursesDatabase.find((c) => c.id === "phy-101")!,
        ],
        totalCredits: 13,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },

  // Electrical & Electronic Engineering
  {
    id: "syl-eee-bachelor",
    programId: "eee",
    programName: "Bachelor in Electrical & Electronic Engineering",
    packageCode: "EEE-B-2024",
    totalSemesters: 8,
    totalCredits: 144,
    feeStructure: {
      admissionFee: 40000,
      perCreditFee: 2800,
      labFeePerCourse: 6000,
      otherFees: 18000,
    },
    semesters: [
      {
        id: "eee-sem-1",
        name: "Semester 1",
        courses: [
          coursesDatabase.find((c) => c.id === "eee-101")!,
          coursesDatabase.find((c) => c.id === "eee-101-lab")!,
          coursesDatabase.find((c) => c.id === "math-101")!,
          coursesDatabase.find((c) => c.id === "eng-101")!,
          coursesDatabase.find((c) => c.id === "phy-101")!,
        ],
        totalCredits: 13,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },

  // Business Administration
  {
    id: "syl-bba-bachelor",
    programId: "bba",
    programName: "Bachelor in Business Administration",
    packageCode: "BBA-B-2024",
    totalSemesters: 8,
    totalCredits: 120,
    feeStructure: {
      admissionFee: 30000,
      perCreditFee: 2000,
      labFeePerCourse: 3000,
      otherFees: 12000,
    },
    semesters: [
      {
        id: "bba-sem-1",
        name: "Semester 1",
        courses: [
          coursesDatabase.find((c) => c.id === "bba-101")!,
          coursesDatabase.find((c) => c.id === "bba-102")!,
          coursesDatabase.find((c) => c.id === "bba-103")!,
          coursesDatabase.find((c) => c.id === "eng-101")!,
          coursesDatabase.find((c) => c.id === "eco-101")!,
        ],
        totalCredits: 15,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },

  // Law
  {
    id: "syl-law-bachelor",
    programId: "law",
    programName: "Bachelor of Laws (LLB)",
    packageCode: "LAW-B-2024",
    totalSemesters: 8,
    totalCredits: 128,
    feeStructure: {
      admissionFee: 35000,
      perCreditFee: 2200,
      labFeePerCourse: 4000,
      otherFees: 14000,
    },
    semesters: [
      {
        id: "law-sem-1",
        name: "Semester 1",
        courses: [
          coursesDatabase.find((c) => c.id === "law-101")!,
          coursesDatabase.find((c) => c.id === "law-102")!,
          coursesDatabase.find((c) => c.id === "law-103")!,
          coursesDatabase.find((c) => c.id === "eng-101")!,
          coursesDatabase.find((c) => c.id === "pol-101")!,
        ],
        totalCredits: 15,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },

  // Civil Engineering
  {
    id: "syl-ce-bachelor",
    programId: "ce",
    programName: "Bachelor in Civil Engineering",
    packageCode: "CE-B-2024",
    totalSemesters: 8,
    totalCredits: 144,
    feeStructure: {
      admissionFee: 38000,
      perCreditFee: 2600,
      labFeePerCourse: 5500,
      otherFees: 16000,
    },
    semesters: [
      {
        id: "ce-sem-1",
        name: "Semester 1",
        courses: [
          coursesDatabase.find((c) => c.id === "ce-101")!,
          coursesDatabase.find((c) => c.id === "ce-101-lab")!,
          coursesDatabase.find((c) => c.id === "math-101")!,
          coursesDatabase.find((c) => c.id === "eng-101")!,
          coursesDatabase.find((c) => c.id === "phy-101")!,
        ],
        totalCredits: 13,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },

  // Mechanical Engineering
  {
    id: "syl-me-bachelor",
    programId: "me",
    programName: "Bachelor in Mechanical Engineering",
    packageCode: "ME-B-2024",
    totalSemesters: 8,
    totalCredits: 144,
    feeStructure: {
      admissionFee: 40000,
      perCreditFee: 2700,
      labFeePerCourse: 6000,
      otherFees: 17000,
    },
    semesters: [
      {
        id: "me-sem-1",
        name: "Semester 1",
        courses: [
          coursesDatabase.find((c) => c.id === "me-101")!,
          coursesDatabase.find((c) => c.id === "me-101-lab")!,
          coursesDatabase.find((c) => c.id === "math-101")!,
          coursesDatabase.find((c) => c.id === "eng-101")!,
          coursesDatabase.find((c) => c.id === "phy-101")!,
        ],
        totalCredits: 13,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },

  // Pharmacy
  {
    id: "syl-pharmacy-bachelor",
    programId: "pharmacy",
    programName: "Bachelor in Pharmacy",
    packageCode: "PHARM-B-2024",
    totalSemesters: 8,
    totalCredits: 144,
    feeStructure: {
      admissionFee: 40000,
      perCreditFee: 3000,
      labFeePerCourse: 7000,
      otherFees: 20000,
    },
    semesters: [
      {
        id: "pharmacy-sem-1",
        name: "Semester 1",
        courses: [
          coursesDatabase.find((c) => c.id === "pharm-101")!,
          coursesDatabase.find((c) => c.id === "pharm-101-lab")!,
          coursesDatabase.find((c) => c.id === "bio-101")!,
          coursesDatabase.find((c) => c.id === "eng-101")!,
          coursesDatabase.find((c) => c.id === "math-101")!,
        ],
        totalCredits: 13,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
];

// Utility functions
export const getSyllabusByProgramId = (
  programId: string,
): Syllabus | undefined => {
  return defaultSyllabuses.find((s) => s.programId === programId && s.isActive);
};

export const getAllSyllabuses = (): Syllabus[] => {
  return defaultSyllabuses.filter((s) => s.isActive);
};

export const getAllCourses = (): Course[] => {
  return coursesDatabase;
};

export const getCourseById = (courseId: string): Course | undefined => {
  return coursesDatabase.find((c) => c.id === courseId);
};

export const getFirstSemesterCourses = (programId: string): Course[] => {
  const syllabus = getSyllabusByProgramId(programId);
  return syllabus?.semesters[0]?.courses || [];
};

export const calculateFirstSemesterFee = (
  programId: string,
  waiverPercentage: number = 0,
): {
  admissionFee: number;
  tuitionFee: number;
  labFee: number;
  otherFees: number;
  subtotal: number;
  waiverAmount: number;
  grandTotal: number;
  courses: Course[];
  packageCode: string;
} => {
  const syllabus = getSyllabusByProgramId(programId);

  if (!syllabus) {
    return {
      admissionFee: 0,
      tuitionFee: 0,
      labFee: 0,
      otherFees: 0,
      subtotal: 0,
      waiverAmount: 0,
      grandTotal: 0,
      courses: [],
      packageCode: "",
    };
  }

  const firstSemesterCourses = syllabus.semesters[0]?.courses || [];
  const totalCredits = firstSemesterCourses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const labCourses = firstSemesterCourses.filter(
    (course) => course.type === "lab",
  );

  const admissionFee = syllabus.feeStructure.admissionFee;
  const tuitionFee = totalCredits * syllabus.feeStructure.perCreditFee;
  const labFee = labCourses.length * syllabus.feeStructure.labFeePerCourse;
  const otherFees = syllabus.feeStructure.otherFees;

  const subtotal = admissionFee + tuitionFee + labFee + otherFees;
  const waiverAmount = (subtotal * waiverPercentage) / 100;
  const grandTotal = subtotal - waiverAmount;

  return {
    admissionFee,
    tuitionFee,
    labFee,
    otherFees,
    subtotal,
    waiverAmount,
    grandTotal,
    courses: firstSemesterCourses,
    packageCode: syllabus.packageCode,
  };
};

// CRUD operations for syllabus management
export const createSyllabus = (
  syllabus: Omit<Syllabus, "id" | "createdAt" | "updatedAt">,
): Syllabus => {
  const newSyllabus: Syllabus = {
    ...syllabus,
    id: `syl-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  defaultSyllabuses.push(newSyllabus);
  return newSyllabus;
};

export const updateSyllabus = (
  id: string,
  updates: Partial<Syllabus>,
): Syllabus | null => {
  const index = defaultSyllabuses.findIndex((s) => s.id === id);
  if (index === -1) return null;

  defaultSyllabuses[index] = {
    ...defaultSyllabuses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return defaultSyllabuses[index];
};

export const deleteSyllabus = (id: string): boolean => {
  const index = defaultSyllabuses.findIndex((s) => s.id === id);
  if (index === -1) return false;

  defaultSyllabuses[index].isActive = false;
  defaultSyllabuses[index].updatedAt = new Date().toISOString();
  return true;
};

export const addCourseToSyllabus = (
  syllabusId: string,
  semesterId: string,
  course: Course,
): boolean => {
  const syllabus = defaultSyllabuses.find((s) => s.id === syllabusId);
  if (!syllabus) return false;

  const semester = syllabus.semesters.find((sem) => sem.id === semesterId);
  if (!semester) return false;

  semester.courses.push(course);
  semester.totalCredits = semester.courses.reduce(
    (sum, c) => sum + c.credits,
    0,
  );
  syllabus.updatedAt = new Date().toISOString();

  return true;
};

export const removeCourseFromSyllabus = (
  syllabusId: string,
  semesterId: string,
  courseId: string,
): boolean => {
  const syllabus = defaultSyllabuses.find((s) => s.id === syllabusId);
  if (!syllabus) return false;

  const semester = syllabus.semesters.find((sem) => sem.id === semesterId);
  if (!semester) return false;

  const courseIndex = semester.courses.findIndex((c) => c.id === courseId);
  if (courseIndex === -1) return false;

  semester.courses.splice(courseIndex, 1);
  semester.totalCredits = semester.courses.reduce(
    (sum, c) => sum + c.credits,
    0,
  );
  syllabus.updatedAt = new Date().toISOString();

  return true;
};
