import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { departments, getProgramById } from "@/lib/programData";
import { Link } from "react-router-dom";

const demoStudents = [
  {
    id: "stu-1",
    student_id: 1001,
    ugc_id: "UGC2024001",
    full_name: "Md Shariful Islam",
    program_code: "CSE101",
    program_name: "Computer Science & Engineering",
    campus: "Main Campus",
    batch: "Spring 2024",
    mobile_number: "+8801712340001",
    email: "sharif@example.com",
    is_active: true,
  },
  {
    id: "stu-2",
    student_id: 1002,
    ugc_id: "UGC2024002",
    full_name: "Rahat Ahmed",
    program_code: "BBA101",
    program_name: "Bachelor of Business Administration",
    campus: "Main Campus",
    batch: "Spring 2024",
    mobile_number: "+8801712340002",
    email: "rahat@example.com",
    is_active: true,
  },
  {
    id: "stu-3",
    student_id: 1003,
    ugc_id: "UGC2024003",
    full_name: "Ayesha Siddique",
    program_code: "EEE101",
    program_name: "Electrical & Electronic Engineering",
    campus: "Khulna Campus",
    batch: "Fall 2023",
    mobile_number: "+8801712340003",
    email: "ayesha@example.com",
    is_active: true,
  },
  {
    id: "stu-4",
    student_id: 1004,
    ugc_id: "UGC2024004",
    full_name: "Rahim Uddin",
    program_code: "CSE101",
    program_name: "Computer Science & Engineering",
    campus: "Uttara Campus",
    batch: "Spring 2023",
    mobile_number: "+8801712340004",
    email: "rahim@example.com",
    is_active: false,
  },
  {
    id: "stu-5",
    student_id: 1005,
    ugc_id: "UGC2024005",
    full_name: "Samina Akter",
    program_code: "BBA101",
    program_name: "Bachelor of Business Administration",
    campus: "Main Campus",
    batch: "Fall 2022",
    mobile_number: "+8801712340005",
    email: "samina@example.com",
    is_active: true,
  },
  {
    id: "stu-6",
    student_id: 1006,
    ugc_id: "UGC2024006",
    full_name: "Tanvir Hossain",
    program_code: "BSC_EEE",
    program_name: "BSc Electrical & Electronic Engineering",
    campus: "Main Campus",
    batch: "Spring 2024",
    mobile_number: "+8801712340006",
    email: "tanvir@example.com",
    is_active: true,
  },
];

export default function StudentSearch() {
  const { toast } = useToast();

  // Filters
  const [anyText, setAnyText] = useState("");
  const [cellNumber, setCellNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [admissionSemester, setAdmissionSemester] = useState("");
  const [programCode, setProgramCode] = useState("");
  const [campus, setCampus] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Results
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);

  // Sorting
  const [sortField, setSortField] = useState<string>("full_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const campusOptions = [
    { id: "__all", name: "All Campuses" },
    { id: "Main Campus", name: "Main Campus" },
    { id: "Khulna Campus", name: "Khulna Campus" },
  ];

  const programOptions = departments.map((d) => ({ id: d.id, name: d.name }));

  const applyClientFilters = (list: any[], params: any) => {
    let filtered = [...list];
    if (params.search) {
      const q = params.search.toString().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.full_name || "").toString().toLowerCase().includes(q) ||
          (s.student_id || "").toString().toLowerCase().includes(q) ||
          (s.ugc_id || "").toString().toLowerCase().includes(q) ||
          (s.mobile_number || "").toString().toLowerCase().includes(q) ||
          (s.email || "").toString().toLowerCase().includes(q),
      );
    }
    if (params.program_code) {
      filtered = filtered.filter((s) => s.program_code === params.program_code);
    }
    if (params.semester) {
      filtered = filtered.filter(
        (s) => (s.batch || s.semester) === params.semester,
      );
    }
    if (params.campus) {
      filtered = filtered.filter((s) => s.campus === params.campus);
    }

    // exact match overrides
    if (params.uniqueId)
      filtered = filtered.filter((s) => (s.ugc_id || "") === params.uniqueId);
    if (params.cellNumber)
      filtered = filtered.filter(
        (s) => (s.mobile_number || "") === params.cellNumber,
      );
    if (params.studentName) {
      const q = params.studentName.toLowerCase();
      filtered = filtered.filter((s) =>
        (s.full_name || "").toLowerCase().includes(q),
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const av = (a[sortField] || "").toString().toLowerCase();
      const bv = (b[sortField] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    const totalLocal = filtered.length;
    const start = ((params.page || 1) - 1) * (params.limit || limit);
    const paged = filtered.slice(start, start + (params.limit || limit));
    return { students: paged, total: totalLocal };
  };

  const runSearch = async (p = 1) => {
    setLoading(true);
    setPage(p);
    try {
      // Priority exact lookups
      if (studentId) {
        const sid = Number(studentId);
        const res = await apiClient.getStudent(sid);
        if (res.success) {
          setResults([res.data]);
          setTotal(1);
        } else {
          setResults([]);
          setTotal(0);
          toast({
            title: "Not found",
            description: "No student found for that ID",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      const params: any = { page: p, limit };
      if (uniqueId) params.search = uniqueId;
      else if (cellNumber) params.search = cellNumber;
      else if (studentName) params.search = studentName;
      else if (anyText) params.search = anyText;
      if (programCode && programCode !== "__all")
        params.program_code = programCode;
      if (admissionSemester && admissionSemester !== "__all")
        params.semester = admissionSemester;
      if (campus && campus !== "__all") params.campus = campus;

      const res = await apiClient.getStudents(params);

      let students: any[] = [];
      let totalRes = 0;

      if (res.success) {
        students = res.data?.students || [];
        totalRes = res.data?.total ?? students.length;
      }

      // If server returned no students or failed, fallback to demoStudents filtered client-side
      if (!res.success || (Array.isArray(students) && students.length === 0)) {
        const clientParams = {
          ...params,
          uniqueId,
          cellNumber,
          studentName,
        };
        const local = applyClientFilters(demoStudents, clientParams);
        students = local.students;
        totalRes = local.total;
      } else {
        // apply exact-match filters client-side where required
        if (uniqueId)
          students = students.filter((s) => (s.ugc_id || "") === uniqueId);
        if (cellNumber)
          students = students.filter(
            (s) => (s.mobile_number || "") === cellNumber,
          );
        if (studentName) {
          const q = studentName.toLowerCase();
          students = students.filter((s) =>
            (s.full_name || "").toLowerCase().includes(q),
          );
        }

        // client-side sort
        students.sort((a, b) => {
          const av = (a[sortField] || "").toString().toLowerCase();
          const bv = (b[sortField] || "").toString().toLowerCase();
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }

      setResults(students);
      setTotal(totalRes);
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error",
        description: String(e.message || e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setAnyText("");
    setCellNumber("");
    setStudentId("");
    setUniqueId("");
    setStudentName("");
    setAdmissionSemester("");
    setProgramCode("");
    setCampus("");
    setResults(demoStudents);
    setTotal(demoStudents.length);
    setPage(1);
  };

  useEffect(() => {
    // show demo students by default so search & filters can be demonstrated
    setResults(demoStudents);
    setTotal(demoStudents.length);
  }, []);

  const changeSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Student Search</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-2">
              <Label>Any detail</Label>
              <Input
                placeholder="Search by any detail..."
                value={anyText}
                onChange={(e: any) => setAnyText(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <div className="w-full">
                <Label>&nbsp;</Label>
                <div className="flex gap-2">
                  <Button onClick={() => runSearch(1)}>Search</Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced((s) => !s)}
                  >
                    {showAdvanced ? "Hide Filters" : "Advanced Filters"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {showAdvanced && (
            <div className="border rounded p-3 mb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Cell Number</Label>
                  <Input
                    placeholder="Enter Mobile Number"
                    value={cellNumber}
                    onChange={(e: any) => setCellNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Student ID</Label>
                  <Input
                    placeholder="Enter Student ID"
                    value={studentId}
                    onChange={(e: any) => setStudentId(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Unique ID (UGC)</Label>
                  <Input
                    placeholder="Enter UGC/Unique ID"
                    value={uniqueId}
                    onChange={(e: any) => setUniqueId(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Student Name</Label>
                  <Input
                    placeholder="Enter Full or Partial Name"
                    value={studentName}
                    onChange={(e: any) => setStudentName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Admission Semester</Label>
                  <Select
                    value={admissionSemester}
                    onValueChange={(v: any) => setAdmissionSemester(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                      <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                      <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                      <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Program</Label>
                  <Select
                    value={programCode}
                    onValueChange={(v: any) => setProgramCode(v)}
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
                <div>
                  <Label>Campus</Label>
                  <Select
                    value={campus}
                    onValueChange={(v: any) => setCampus(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {campusOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-gray-600 mb-2">
              Results: {total} — Page {page}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => changeSort("student_id")}
                    className="cursor-pointer"
                  >
                    Student ID
                  </TableHead>
                  <TableHead>Unique ID (UGC)</TableHead>
                  <TableHead
                    onClick={() => changeSort("full_name")}
                    className="cursor-pointer"
                  >
                    Student Name
                  </TableHead>
                  <TableHead
                    onClick={() => changeSort("program_code")}
                    className="cursor-pointer"
                  >
                    Program
                  </TableHead>
                  <TableHead>Admission Semester</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((s: any) => (
                  <TableRow key={s.student_id}>
                    <TableCell>{s.student_id}</TableCell>
                    <TableCell>{s.ugc_id || s.university_id || "-"}</TableCell>
                    <TableCell>{s.full_name || "-"}</TableCell>
                    <TableCell>
                      {getProgramById(s.program_code || "")?.name ||
                        s.program_code ||
                        "-"}
                    </TableCell>
                    <TableCell>{s.batch || s.semester || "-"}</TableCell>
                    <TableCell>{s.campus || "-"}</TableCell>
                    <TableCell>{s.mobile_number || "-"}</TableCell>
                    <TableCell>{s.is_active ? "Active" : "Inactive"}</TableCell>
                    <TableCell>
                      <Link
                        to={`/admin/student-profile?id=${s.student_id}`}
                        className="text-deep-plum hover:underline"
                      >
                        View Profile
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <Button
                  onClick={() => runSearch(Math.max(1, page - 1))}
                  disabled={page <= 1 || loading}
                >
                  Prev
                </Button>
                <Button
                  className="ml-2"
                  onClick={() => runSearch(page + 1)}
                  disabled={page * limit >= total || loading}
                >
                  Next
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {results.length} of {total}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
