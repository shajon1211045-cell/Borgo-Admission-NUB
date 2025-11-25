import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { departments, getProgramById } from "@/lib/programData";

const leftTabs = [
  "Program-wise Admitted Students",
  "Fee Collection Reports",
  "Admission Flowcharts",
  "Student Lists",
  "Waiver Reports",
  "Admission Targets",
  "Feeder Districts",
  "Credit Transfer Students",
];

const sampleProgramWise = [
  {
    serial: 1,
    programCode: "CSE101",
    programName: "Computer Science & Engineering",
    male: 89,
    female: 67,
    total: 156,
    semester: "Spring 2024",
    year: 2024,
  },
  {
    serial: 2,
    programCode: "EEE101",
    programName: "Electrical & Electronic Engineering",
    male: 78,
    female: 45,
    total: 123,
    semester: "Spring 2024",
    year: 2024,
  },
  {
    serial: 3,
    programCode: "CIV101",
    programName: "Civil Engineering",
    male: 92,
    female: 34,
    total: 126,
    semester: "Spring 2024",
    year: 2024,
  },
  {
    serial: 4,
    programCode: "BBA101",
    programName: "Bachelor of Business Administration",
    male: 65,
    female: 98,
    total: 163,
    semester: "Spring 2024",
    year: 2024,
  },
];

const sampleEmployeeCollections = [
  {
    employeeName: "Ahmed Rahman",
    officerId: "EMP001",
    collectedAmount: 125000,
    collectionDate: "2024-01-15",
  },
  {
    employeeName: "Fatima Khan",
    officerId: "EMP002",
    collectedAmount: 98000,
    collectionDate: "2024-01-15",
  },
];

const sampleStudents = [
  {
    studentId: "STU001",
    name: "Kamal Ahmed",
    program: "CSE",
    gender: "Male",
    mobile: "01712345678",
    email: "kamal@example.com",
    admissionDate: "2024-01-15",
    address: "Dhaka",
  },
  {
    studentId: "STU002",
    name: "Rashida Khatun",
    program: "EEE",
    gender: "Female",
    mobile: "01798765432",
    email: "rashida@example.com",
    admissionDate: "2024-01-16",
    address: "Chittagong",
  },
];

const sampleWaivers = [
  {
    studentId: "SW001",
    name: "Kamal Ahmed",
    program: "CSE",
    waiverPercent: 30,
    waiverAmount: 15000,
    semester: "Spring 2024",
  },
  {
    studentId: "SW002",
    name: "Rashida Khatun",
    program: "EEE",
    waiverPercent: 25,
    waiverAmount: 12500,
    semester: "Spring 2024",
  },
];

const feederDistricts = [
  { district: "Dhaka", total: 234, programs: 12 },
  { district: "Chittagong", total: 189, programs: 10 },
];

const creditTransfers = [
  {
    studentId: "CT001",
    name: "Ahmed Ali",
    program: "CSE",
    transferredCourses: "Math101, Phys101",
    credits: 45,
  },
];

export default function AdmissionDepartmentalReports() {
  const [activeTab, setActiveTab] = useState(leftTabs[0]);

  // Program-wise filters
  const [pwSemester, setPwSemester] = useState("__all");
  const [pwProgram, setPwProgram] = useState("__all");
  const [pwYear, setPwYear] = useState<number | string>(2024);

  // Fee collection filters
  const [fcEmployee, setFcEmployee] = useState("__all");
  const [fcOfficerId, setFcOfficerId] = useState("");
  const [fcFrom, setFcFrom] = useState("");
  const [fcTo, setFcTo] = useState("");

  // Flowchart filters
  const [flowProgram, setFlowProgram] = useState("__all");
  const [flowDepartment, setFlowDepartment] = useState("__all");
  const [flowSemester, setFlowSemester] = useState("__all");
  const [flowView, setFlowView] = useState<"program" | "department">("program");

  // Student list tabs
  const [studentListTab, setStudentListTab] = useState("Student List");

  // Waiver filters
  const [waiverDept, setWaiverDept] = useState("__all");
  const [waiverSemester, setWaiverSemester] = useState("__all");
  const [waiverProgram, setWaiverProgram] = useState("__all");
  const [waiverYear, setWaiverYear] = useState<number | string>(2024);

  // Admission target form
  const [targetDept, setTargetDept] = useState("__all");
  const [targetNumber, setTargetNumber] = useState<number | string>("");
  const [targetYear, setTargetYear] = useState<number | string>(2024);
  const [targetSemester, setTargetSemester] = useState("__all");
  const [targets, setTargets] = useState<any[]>([]);

  // Feeder districts filters
  const [fdCountry, setFdCountry] = useState("__all");
  const [fdDistrict, setFdDistrict] = useState("__all");
  const [fdYear, setFdYear] = useState<number | string>(2024);
  const [fdSemester, setFdSemester] = useState("__all");

  // Credit transfer filters
  const [ctProgram, setCtProgram] = useState("__all");
  const [ctSemester, setCtSemester] = useState("__all");
  const [ctYear, setCtYear] = useState<number | string>(2024);

  const semesters = [
    "__all",
    "Spring 2024",
    "Summer 2024",
    "Fall 2024",
    "Spring 2025",
  ];
  const years = [2022, 2023, 2024, 2025];
  const programOptions = departments.map((d) => ({ id: d.id, name: d.name }));

  const filteredProgramWise = useMemo(() => {
    let list = sampleProgramWise.slice();
    if (pwSemester && pwSemester !== "__all")
      list = list.filter((r) => r.semester === pwSemester);
    if (pwProgram && pwProgram !== "__all")
      list = list.filter((r) => r.programCode === pwProgram);
    if (pwYear) list = list.filter((r) => r.year === Number(pwYear));
    return list;
  }, [pwSemester, pwProgram, pwYear]);

  const saveTarget = () => {
    if (!targetDept || targetDept === "__all" || !targetNumber) return;
    const t = {
      department: targetDept,
      year: Number(targetYear),
      semester: targetSemester,
      target: Number(targetNumber),
      achieved: 0,
    };
    setTargets((s) => [t, ...s]);
    setTargetNumber("");
  };

  const clearPwFilters = () => {
    setPwSemester("__all");
    setPwProgram("__all");
    setPwYear(2024);
  };

  const clearFcFilters = () => {
    setFcEmployee("__all");
    setFcOfficerId("");
    setFcFrom("");
    setFcTo("");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Admission Departmental Reports
      </h1>
      <div className="grid grid-cols-1 gap-4">
        <div className="col-span-1 md:col-span-1">
          <Card className="bg-[rgba(248,242,248,0.8)]">
            <CardHeader>
              <CardTitle className="text-lg">{activeTab}</CardTitle>
            </CardHeader>
            {/* Tabs */}
            <div className="px-6 -mt-3">
              <div className="flex flex-wrap gap-2 mb-4">
                {leftTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-2 rounded ${activeTab === t ? "bg-deep-plum text-white" : "hover:bg-gray-100 text-gray-700"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <CardContent style={{ padding: 24 }}>
              {/* Program-wise Admitted Students */}
              {activeTab === "Program-wise Admitted Students" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    View the total admitted students per semester and program.
                  </p>

                  <div className="flex flex-wrap gap-3 items-end mb-4">
                    <div className="w-1/4 min-w-[160px]">
                      <Label>Semester</Label>
                      <Select
                        value={pwSemester}
                        onValueChange={(v: any) => setPwSemester(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s === "__all" ? "All" : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-1/4 min-w-[160px]">
                      <Label>Program</Label>
                      <Select
                        value={pwProgram}
                        onValueChange={(v: any) => setPwProgram(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All Programs</SelectItem>
                          {programOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-1/6 min-w-[110px]">
                      <Label>Year</Label>
                      <Select
                        value={String(pwYear)}
                        onValueChange={(v: any) => setPwYear(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 ml-auto">
                      <Button
                        className="bg-[#3B0A45] text-white"
                        onClick={() => {
                          /* search */
                        }}
                      >
                        Search
                      </Button>
                      <Button variant="outline" onClick={clearPwFilters}>
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serial</TableHead>
                          <TableHead>Program Name</TableHead>
                          <TableHead>Male</TableHead>
                          <TableHead>Female</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProgramWise.map((r) => (
                          <TableRow key={r.serial}>
                            <TableCell>{r.serial}</TableCell>
                            <TableCell>{r.programName}</TableCell>
                            <TableCell>{r.male}</TableCell>
                            <TableCell>{r.female}</TableCell>
                            <TableCell>{r.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div />
                    <div className="flex gap-2">
                      <Button
                        className="bg-[#3B0A45] text-white"
                        onClick={() => window.print()}
                      >
                        Export as PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          /* export excel */
                        }}
                      >
                        Export as Excel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Collection Reports */}
              {activeTab === "Fee Collection Reports" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    View employee-wise admission fee collections and daily
                    reports.
                  </p>

                  <div className="flex flex-wrap gap-3 items-end mb-4">
                    <div className="w-1/4 min-w-[160px]">
                      <Label>Employee Name</Label>
                      <Select
                        value={fcEmployee}
                        onValueChange={(v: any) => setFcEmployee(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All Employees</SelectItem>
                          <SelectItem value="Ahmed Rahman">
                            Ahmed Rahman
                          </SelectItem>
                          <SelectItem value="Fatima Khan">
                            Fatima Khan
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-1/6 min-w-[120px]">
                      <Label>Officer ID</Label>
                      <Input
                        value={fcOfficerId}
                        onChange={(e: any) => setFcOfficerId(e.target.value)}
                      />
                    </div>

                    <div className="w-1/6 min-w-[140px]">
                      <Label>Date From</Label>
                      <Input
                        type="date"
                        value={fcFrom}
                        onChange={(e: any) => setFcFrom(e.target.value)}
                      />
                    </div>

                    <div className="w-1/6 min-w-[140px]">
                      <Label>Date To</Label>
                      <Input
                        type="date"
                        value={fcTo}
                        onChange={(e: any) => setFcTo(e.target.value)}
                      />
                    </div>

                    <div className="ml-auto">
                      <Button className="bg-[#3B0A45] text-white">
                        Search
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Officer ID</TableHead>
                          <TableHead>Collected Amount</TableHead>
                          <TableHead>Collection Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleEmployeeCollections.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.employeeName}</TableCell>
                            <TableCell>{r.officerId}</TableCell>
                            <TableCell>{r.collectedAmount}</TableCell>
                            <TableCell>{r.collectionDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div />
                    <Button
                      className="bg-[#3B0A45] text-white"
                      onClick={() => window.print()}
                    >
                      Export as PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Admission Flowcharts */}
              {activeTab === "Admission Flowcharts" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    View department-wise or program-wise admission flowcharts.
                  </p>

                  <div className="flex gap-3 items-end mb-4">
                    <div className="w-1/4 min-w-[160px]">
                      <Label>Program</Label>
                      <Select
                        value={flowProgram}
                        onValueChange={(v: any) => setFlowProgram(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All Programs</SelectItem>
                          {programOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-1/4 min-w-[160px]">
                      <Label>Department</Label>
                      <Select
                        value={flowDepartment}
                        onValueChange={(v: any) => setFlowDepartment(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All Departments</SelectItem>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-1/4 min-w-[140px]">
                      <Label>Semester</Label>
                      <Select
                        value={flowSemester}
                        onValueChange={(v: any) => setFlowSemester(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s === "__all" ? "All" : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="ml-auto">
                      {/* Flowchart view toggle removed per request */}
                    </div>
                  </div>

                  <div className="border rounded p-4 mb-3 bg-white shadow-sm min-h-[220px]">
                    <div className="text-sm text-gray-700">
                      {flowView === "program"
                        ? "Program-wise flowchart placeholder (boxes with counts)"
                        : "Department-wise flowchart placeholder"}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="p-3 border rounded">
                        Step A<br />
                        Count: 120
                      </div>
                      <div className="p-3 border rounded">
                        Step B<br />
                        Count: 80
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-[#3B0A45] text-white"
                      onClick={() => window.print()}
                    >
                      Export as PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Student Lists */}
              {activeTab === "Student Lists" && (
                <div>
                  <div className="flex gap-2 mb-4">
                    {[
                      "Student List",
                      "Detailed Student List",
                      "Student List with Address",
                      "Student ID Cards",
                    ].map((t) => (
                      <button
                        key={t}
                        onClick={() => setStudentListTab(t)}
                        className={`px-3 py-2 rounded ${studentListTab === t ? "bg-deep-plum text-white" : "hover:bg-gray-100"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {studentListTab === "Student List" && (
                    <div>
                      <div className="flex gap-3 items-end mb-3">
                        <div className="w-1/4">
                          <Label>Semester</Label>
                          <Select value="__all" onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-1/4">
                          <Label>Campus</Label>
                          <Input placeholder="Campus" />
                        </div>
                        <div className="w-1/4">
                          <Label>Program</Label>
                          <Select value="__all" onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="ml-auto">
                          <Button className="bg-[#3B0A45] text-white">
                            View Student List
                          </Button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Program</TableHead>
                              <TableHead>Gender</TableHead>
                              <TableHead>Mobile</TableHead>
                              <TableHead>Email</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sampleStudents.map((s) => (
                              <TableRow key={s.studentId}>
                                <TableCell>{s.studentId}</TableCell>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.program}</TableCell>
                                <TableCell>{s.gender}</TableCell>
                                <TableCell>{s.mobile}</TableCell>
                                <TableCell>{s.email}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-3 flex justify-between">
                        <div />
                        <div className="flex gap-2">
                          <Button className="bg-[#3B0A45] text-white">
                            Export PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {studentListTab === "Detailed Student List" && (
                    <div>
                      <div className="flex gap-3 items-end mb-3">
                        <div className="w-1/4">
                          <Label>Semester</Label>
                          <Select value="__all" onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-1/4">
                          <Label>Program</Label>
                          <Select value="__all" onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-1/4">
                          <Label>Campus</Label>
                          <Input placeholder="Campus" />
                        </div>
                        <div className="ml-auto">
                          <Button className="bg-[#3B0A45] text-white">
                            View Detailed List
                          </Button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Gender</TableHead>
                              <TableHead>Mobile</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Admission Date</TableHead>
                              <TableHead>Address</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sampleStudents.map((s) => (
                              <TableRow key={s.studentId}>
                                <TableCell>{s.studentId}</TableCell>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.gender}</TableCell>
                                <TableCell>{s.mobile}</TableCell>
                                <TableCell>{s.email}</TableCell>
                                <TableCell>{s.admissionDate}</TableCell>
                                <TableCell>{s.address}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {studentListTab === "Student List with Address" && (
                    <div>
                      <div className="flex gap-3 items-end mb-3">
                        <div className="w-1/4">
                          <Label>Country</Label>
                          <Input placeholder="Country" />
                        </div>
                        <div className="w-1/4">
                          <Label>District</Label>
                          <Input placeholder="District" />
                        </div>
                        <div className="w-1/6">
                          <Label>Gender</Label>
                          <Select value="__all" onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-1/6">
                          <Label>From</Label>
                          <Input type="date" />
                        </div>
                        <div className="w-1/6">
                          <Label>To</Label>
                          <Input type="date" />
                        </div>
                        <div className="ml-auto flex gap-2">
                          <Button>Admitted Students Address</Button>
                          <Button>Registered Students Address</Button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Address</TableHead>
                              <TableHead>District</TableHead>
                              <TableHead>Country</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sampleStudents.map((s) => (
                              <TableRow key={s.studentId}>
                                <TableCell>{s.studentId}</TableCell>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.address}</TableCell>
                                <TableCell>{s.address}</TableCell>
                                <TableCell>Bangladesh</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button>Admitted Students List with Address</Button>
                        <Button>Registered Students List with Address</Button>
                      </div>
                    </div>
                  )}

                  {studentListTab === "Student ID Cards" && (
                    <div>
                      <div className="flex gap-3 items-end mb-3">
                        <div className="w-1/4">
                          <Label>Semester</Label>
                          <Select value="__all" onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-1/4">
                          <Label>Program</Label>
                          <Select value="__all" onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="ml-auto flex gap-2">
                          <Button className="bg-[#3B0A45] text-white">
                            Download All ID Cards
                          </Button>
                          <Button>View Individual ID Card</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Waiver Reports */}
              {activeTab === "Waiver Reports" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Waiver amounts and summaries.
                  </p>

                  <div className="flex gap-3 items-end mb-3">
                    <div className="w-1/4">
                      <Label>Department</Label>
                      <Select
                        value={waiverDept}
                        onValueChange={(v: any) => setWaiverDept(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Dept" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All</SelectItem>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/4">
                      <Label>Semester</Label>
                      <Select
                        value={waiverSemester}
                        onValueChange={(v: any) => setWaiverSemester(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sem" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s === "__all" ? "All" : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/4">
                      <Label>Program</Label>
                      <Select
                        value={waiverProgram}
                        onValueChange={(v: any) => setWaiverProgram(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All</SelectItem>
                          {programOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/6">
                      <Label>Year</Label>
                      <Select
                        value={String(waiverYear)}
                        onValueChange={(v: any) => setWaiverYear(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="ml-auto">
                      <Button className="bg-[#3B0A45] text-white">
                        Search
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Waiver %</TableHead>
                          <TableHead>Waiver Amount</TableHead>
                          <TableHead>Semester</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sampleWaivers.map((w) => (
                          <TableRow key={w.studentId}>
                            <TableCell>{w.studentId}</TableCell>
                            <TableCell>{w.name}</TableCell>
                            <TableCell>{w.program}</TableCell>
                            <TableCell>{w.waiverPercent}%</TableCell>
                            <TableCell>{w.waiverAmount}</TableCell>
                            <TableCell>{w.semester}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button className="bg-[#3B0A45] text-white">
                      Export PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Admission Targets */}
              {activeTab === "Admission Targets" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Set and view admission targets by department.
                  </p>

                  <div className="flex gap-3 items-end mb-3">
                    <div className="w-1/4">
                      <Label>Department</Label>
                      <Select
                        value={targetDept}
                        onValueChange={(v: any) => setTargetDept(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Dept" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">
                            Select Department
                          </SelectItem>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/6">
                      <Label>Target Number</Label>
                      <Input
                        type="number"
                        value={String(targetNumber)}
                        onChange={(e: any) => setTargetNumber(e.target.value)}
                      />
                    </div>
                    <div className="w-1/6">
                      <Label>Year</Label>
                      <Select
                        value={String(targetYear)}
                        onValueChange={(v: any) => setTargetYear(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/6">
                      <Label>Semester</Label>
                      <Select
                        value={targetSemester}
                        onValueChange={(v: any) => setTargetSemester(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sem" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s === "__all" ? "All" : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="ml-auto">
                      <Button
                        className="bg-[#3B0A45] text-white"
                        onClick={saveTarget}
                      >
                        Save Target
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Achieved</TableHead>
                          <TableHead>Remaining</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {targets.map((t, i) => (
                          <TableRow key={i}>
                            <TableCell>{t.department}</TableCell>
                            <TableCell>{t.year}</TableCell>
                            <TableCell>{t.target}</TableCell>
                            <TableCell>{t.achieved}</TableCell>
                            <TableCell>{t.target - t.achieved}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-3" />
                </div>
              )}

              {/* Feeder Districts */}
              {activeTab === "Feeder Districts" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Feeder district reports.
                  </p>

                  <div className="flex gap-3 items-end mb-3">
                    <div className="w-1/6">
                      <Label>Country</Label>
                      <Input placeholder="Country" />
                    </div>
                    <div className="w-1/6">
                      <Label>District</Label>
                      <Input placeholder="District" />
                    </div>
                    <div className="w-1/6">
                      <Label>Year</Label>
                      <Select
                        value={String(fdYear)}
                        onValueChange={(v: any) => setFdYear(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/6">
                      <Label>Semester</Label>
                      <Select
                        value={fdSemester}
                        onValueChange={(v: any) => setFdSemester(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s === "__all" ? "All" : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="ml-auto">
                      <Button className="bg-[#3B0A45] text-white">
                        Search
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">
                      All Programs View
                    </div>
                    <div className="overflow-x-auto mb-3">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>District</TableHead>
                            <TableHead>Total Students</TableHead>
                            <TableHead>Programs Represented</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feederDistricts.map((d) => (
                            <TableRow key={d.district}>
                              <TableCell>{d.district}</TableCell>
                              <TableCell>{d.total}</TableCell>
                              <TableCell>{d.programs}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="text-sm font-medium mb-2">
                      Single Program View
                    </div>
                    <div className="overflow-x-auto">
                      <div className="flex gap-3 items-end mb-2">
                        <div className="w-1/4">
                          <Label>Program</Label>
                          <Select value={"__all"} onValueChange={() => {}}>
                            <SelectTrigger>
                              <SelectValue placeholder="Program" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="ml-auto">
                          <Button className="bg-[#3B0A45] text-white">
                            Export PDF
                          </Button>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>District</TableHead>
                            <TableHead>Number of Students</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feederDistricts.map((d) => (
                            <TableRow key={d.district}>
                              <TableCell>{d.district}</TableCell>
                              <TableCell>{d.total}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-3">
                      <Button>Download Report</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Transfer Students */}
              {activeTab === "Credit Transfer Students" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Credit transfer student lists and exports.
                  </p>

                  <div className="flex gap-3 items-end mb-3">
                    <div className="w-1/4">
                      <Label>Program</Label>
                      <Select
                        value={ctProgram}
                        onValueChange={(v: any) => setCtProgram(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all">All</SelectItem>
                          {programOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/6">
                      <Label>Semester</Label>
                      <Select
                        value={ctSemester}
                        onValueChange={(v: any) => setCtSemester(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s === "__all" ? "All" : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/6">
                      <Label>Year</Label>
                      <Select
                        value={String(ctYear)}
                        onValueChange={(v: any) => setCtYear(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="ml-auto">
                      <Button className="bg-[#3B0A45] text-white">
                        Search
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Program</TableHead>
                          <TableHead>Transferred Courses</TableHead>
                          <TableHead>Total Credits Transferred</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {creditTransfers.map((ct) => (
                          <TableRow key={ct.studentId}>
                            <TableCell>{ct.studentId}</TableCell>
                            <TableCell>{ct.name}</TableCell>
                            <TableCell>{ct.program}</TableCell>
                            <TableCell>{ct.transferredCourses}</TableCell>
                            <TableCell>{ct.credits}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button className="bg-[#3B0A45] text-white">
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Report Centre */}
              {activeTab === "Report Centre" && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Central place for generating and downloading student lists,
                    address labels, and credit transfer lists.
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <a
                        className="text-deep-plum hover:underline cursor-pointer"
                        onClick={() => setActiveTab("Student Lists")}
                      >
                        Student list details and address exports
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-deep-plum hover:underline cursor-pointer"
                        onClick={() => setActiveTab("Student Lists")}
                      >
                        Admitted/Registered students address (envelope) exports
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-deep-plum hover:underline cursor-pointer"
                        onClick={() => setActiveTab("Credit Transfer Students")}
                      >
                        Credit transferred student list
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
