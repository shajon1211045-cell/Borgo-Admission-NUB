import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

const sampleStudents = Array.from({ length: 12 }).map((_, i) => ({
  studentId: `STU${String(i + 1).padStart(3, "0")}`,
  name: ["Kamal Ahmed", "Rashida Khatun", "Abdul Rahman", "Fatima Begum"][
    i % 4
  ],
  program: ["CSE", "EEE", "BBA", "LAW"][i % 4],
  campus: ["Main", "Uttara", "Khulna"][i % 3],
  gender: i % 2 === 0 ? "Male" : "Female",
  mobile: `0171000${i.toString().padStart(4, "0")}`,
  email: `student${i + 1}@example.com`,
  admissionDate: `2024-0${(i % 9) + 1}-0${(i % 9) + 1}`,
  district: ["Dhaka", "Chittagong", "Sylhet"][i % 3],
  country: "Bangladesh",
  address: `${i + 1} Some Street, ${["Dhaka", "Chittagong", "Sylhet"][i % 3]}`,
}));

const sampleCreditTransfers = Array.from({ length: 8 }).map((_, i) => ({
  studentId: `CT${String(i + 1).padStart(3, "0")}`,
  name: [`Ahmed Ali`, `Rashida Ahmed`, `Mohammad Khan`][i % 3],
  program: ["CSE", "BBA", "EEE"][i % 3],
  institution: ["XYZ University", "ABC College"][i % 2],
  courses: ["Math101, Phys101", "Eng101, Hist101"][i % 2],
  credits: [24, 36, 45][i % 3],
  semester: ["Spring 2024", "Fall 2024"][i % 2],
  campus: ["Main", "Uttara"][i % 2],
}));

export default function ReportCentre() {
  // Section 1 filters
  const [s1Semester, setS1Semester] = useState("__all");
  const [s1Campus, setS1Campus] = useState("__all");
  const [s1Program, setS1Program] = useState("__all");
  const [s1Gender, setS1Gender] = useState("__all");
  const [s1From, setS1From] = useState("");
  const [s1To, setS1To] = useState("");

  // Section 2 filters
  const [s2Program, setS2Program] = useState("__all");
  const [s2Campus, setS2Campus] = useState("__all");
  const [s2Semester, setS2Semester] = useState("__all");
  const [s2Country, setS2Country] = useState("__all");
  const [s2District, setS2District] = useState("__all");
  const [s2Type, setS2Type] = useState("both");
  const [selectedAddresses, setSelectedAddresses] = useState<
    Record<string, boolean>
  >({});

  // Section 3 filters
  const [s3Program, setS3Program] = useState("__all");
  const [s3Semester, setS3Semester] = useState("__all");
  const [s3Year, setS3Year] = useState("2024");
  const [s3Campus, setS3Campus] = useState("__all");
  const [s3Search, setS3Search] = useState("");
  const [s3Page, setS3Page] = useState(1);
  const pageSize = 10;

  // Loading states for exports
  const [loadingExport, setLoadingExport] = useState(false);

  const semesters = [
    "__all",
    "Spring 2024",
    "Summer 2024",
    "Fall 2024",
    "Spring 2025",
  ];
  const campuses = ["__all", "Main", "Uttara", "Khulna"];
  const programs = ["__all", "CSE", "EEE", "BBA", "LAW"];
  const genders = ["__all", "Male", "Female"];
  const years = ["2022", "2023", "2024", "2025"];

  const filteredStudents = useMemo(() => {
    return sampleStudents.filter((s) => {
      if (
        s1Semester !== "__all" &&
        s1Semester &&
        !s.admissionDate.includes(s1Semester.split(" ")[0])
      )
        return false;
      if (s1Campus !== "__all" && s1Campus !== s.campus) return false;
      if (s1Program !== "__all" && s1Program !== s.program) return false;
      if (s1Gender !== "__all" && s1Gender !== s.gender) return false;
      if (s1From && new Date(s.admissionDate) < new Date(s1From)) return false;
      if (s1To && new Date(s.admissionDate) > new Date(s1To)) return false;
      return true;
    });
  }, [s1Semester, s1Campus, s1Program, s1Gender, s1From, s1To]);

  const filteredAddresses = useMemo(() => {
    return sampleStudents.filter((s) => {
      if (s2Program !== "__all" && s2Program !== s.program) return false;
      if (s2Campus !== "__all" && s2Campus !== s.campus) return false;
      if (
        s2Semester !== "__all" &&
        s2Semester &&
        !s.admissionDate.includes(s2Semester.split(" ")[0])
      )
        return false;
      if (s2Country !== "__all" && s2Country !== s.country) return false;
      if (s2District !== "__all" && s2District !== s.district) return false;
      // type filter is placeholder (admitted/registered/both)
      return true;
    });
  }, [s2Program, s2Campus, s2Semester, s2Country, s2District, s2Type]);

  const filteredCreditTransfers = useMemo(() => {
    let list = sampleCreditTransfers.slice();
    if (s3Program !== "__all")
      list = list.filter((c) => c.program === s3Program);
    if (s3Semester !== "__all")
      list = list.filter((c) => c.semester === s3Semester);
    if (s3Year) list = list.filter((c) => c.semester.includes(s3Year));
    if (s3Campus !== "__all") list = list.filter((c) => c.campus === s3Campus);
    if (s3Search)
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(s3Search.toLowerCase()) ||
          c.studentId.toLowerCase().includes(s3Search.toLowerCase()),
      );
    return list;
  }, [s3Program, s3Semester, s3Year, s3Campus, s3Search]);

  const pagedCreditTransfers = useMemo(() => {
    const start = (s3Page - 1) * pageSize;
    return filteredCreditTransfers.slice(start, start + pageSize);
  }, [filteredCreditTransfers, s3Page]);

  const toggleSelectAddress = (id: string) => {
    setSelectedAddresses((s) => ({ ...s, [id]: !s[id] }));
  };

  const exportPdf = async () => {
    setLoadingExport(true);
    // placeholder: simulate
    await new Promise((r) => setTimeout(r, 800));
    setLoadingExport(false);
    alert("Exported PDF (demo)");
  };

  const exportExcel = async () => {
    setLoadingExport(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoadingExport(false);
    alert("Exported Excel (demo)");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Report Centre</h1>
      <hr className="mb-6" />

      {/* Section 1 */}
      <Card className="mb-6 bg-white shadow-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            Student List Details and Address Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="w-1/5 min-w-[160px]">
              <Label>Admission Semester</Label>
              <Select
                value={s1Semester}
                onValueChange={(v: any) => setS1Semester(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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
            <div className="w-1/6 min-w-[140px]">
              <Label>Campus</Label>
              <Select
                value={s1Campus}
                onValueChange={(v: any) => setS1Campus(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "__all" ? "All" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[140px]">
              <Label>Program</Label>
              <Select
                value={s1Program}
                onValueChange={(v: any) => setS1Program(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p === "__all" ? "All" : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[120px]">
              <Label>Gender</Label>
              <Select
                value={s1Gender}
                onValueChange={(v: any) => setS1Gender(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g === "__all" ? "All" : g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[160px]">
              <Label>From</Label>
              <Input
                type="date"
                value={s1From}
                onChange={(e: any) => setS1From(e.target.value)}
              />
            </div>
            <div className="w-1/6 min-w-[160px]">
              <Label>To</Label>
              <Input
                type="date"
                value={s1To}
                onChange={(e: any) => setS1To(e.target.value)}
              />
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                className="bg-[#3B0A45] text-white"
                onClick={() => {
                  /* search placeholder */
                }}
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setS1Semester("__all");
                  setS1Campus("__all");
                  setS1Program("__all");
                  setS1Gender("__all");
                  setS1From("");
                  setS1To("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto mb-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((s) => (
                  <TableRow
                    key={s.studentId}
                    className={"odd:bg-gray-50 even:bg-white"}
                  >
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.program}</TableCell>
                    <TableCell>{s.campus}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>{s.mobile}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.admissionDate}</TableCell>
                    <TableCell>{s.district}</TableCell>
                    <TableCell>{s.country}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <div />
            <div className="flex gap-2">
              <Button
                className="bg-[#3B0A45] text-white"
                onClick={exportPdf}
                disabled={loadingExport}
              >
                {loadingExport ? "Exporting..." : "Export as PDF"}
              </Button>
              <Button variant="outline" onClick={exportExcel}>
                Export as Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card className="mb-6 bg-white shadow-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            Admitted/Registered Students Address (Envelope) Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="w-1/5 min-w-[160px]">
              <Label>Program</Label>
              <Select
                value={s2Program}
                onValueChange={(v: any) => setS2Program(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p === "__all" ? "All" : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[140px]">
              <Label>Campus</Label>
              <Select
                value={s2Campus}
                onValueChange={(v: any) => setS2Campus(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "__all" ? "All" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[140px]">
              <Label>Admission Semester</Label>
              <Select
                value={s2Semester}
                onValueChange={(v: any) => setS2Semester(v)}
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
            <div className="w-1/6 min-w-[140px]">
              <Label>Country</Label>
              <Select
                value={s2Country}
                onValueChange={(v: any) => setS2Country(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All</SelectItem>
                  <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[140px]">
              <Label>District</Label>
              <Select
                value={s2District}
                onValueChange={(v: any) => setS2District(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All</SelectItem>
                  <SelectItem value="Dhaka">Dhaka</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[140px]">
              <Label>Type</Label>
              <Select value={s2Type} onValueChange={(v: any) => setS2Type(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex gap-2">
              <Button className="bg-[#3B0A45] text-white">Generate List</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setS2Program("__all");
                  setS2Campus("__all");
                  setS2Semester("__all");
                  setS2Country("__all");
                  setS2District("__all");
                  setS2Type("both");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto mb-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAddresses.map((s) => (
                  <TableRow
                    key={s.studentId}
                    className={"odd:bg-gray-50 even:bg-white"}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={!!selectedAddresses[s.studentId]}
                        onChange={() => toggleSelectAddress(s.studentId)}
                      />
                    </TableCell>
                    <TableCell>{s.studentId}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.address}</TableCell>
                    <TableCell>{s.district}</TableCell>
                    <TableCell>{s.country}</TableCell>
                    <TableCell>{s.program}</TableCell>
                    <TableCell>Admitted</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <div />
            <div className="flex gap-2 flex-wrap">
              <Button className="bg-[#3B0A45] text-white">
                Print Selected Addresses
              </Button>
              <Button variant="outline">Export PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 */}
      <Card className="mb-6 bg-white shadow-sm rounded-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            Credit Transferred Student List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="w-1/5 min-w-[160px]">
              <Label>Program</Label>
              <Select
                value={s3Program}
                onValueChange={(v: any) => setS3Program(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p === "__all" ? "All" : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[140px]">
              <Label>Semester</Label>
              <Select
                value={s3Semester}
                onValueChange={(v: any) => setS3Semester(v)}
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
            <div className="w-1/6 min-w-[140px]">
              <Label>Year</Label>
              <Select value={s3Year} onValueChange={(v: any) => setS3Year(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/6 min-w-[140px]">
              <Label>Campus</Label>
              <Select
                value={s3Campus}
                onValueChange={(v: any) => setS3Campus(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "__all" ? "All" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/5 min-w-[160px]">
              <Label>Search</Label>
              <Input
                placeholder="Student name or ID"
                value={s3Search}
                onChange={(e: any) => setS3Search(e.target.value)}
              />
            </div>

            <div className="ml-auto flex gap-2">
              <Button
                className="bg-[#3B0A45] text-white"
                onClick={() => {
                  setS3Page(1);
                }}
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setS3Program("__all");
                  setS3Semester("__all");
                  setS3Year("2024");
                  setS3Campus("__all");
                  setS3Search("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto mb-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Transferred Institution</TableHead>
                  <TableHead>Transferred Courses</TableHead>
                  <TableHead>Total Credits Transferred</TableHead>
                  <TableHead>Semester</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedCreditTransfers.map((ct) => (
                  <TableRow key={ct.studentId}>
                    <TableCell>{ct.studentId}</TableCell>
                    <TableCell>{ct.name}</TableCell>
                    <TableCell>{ct.program}</TableCell>
                    <TableCell>{ct.institution}</TableCell>
                    <TableCell>{ct.courses}</TableCell>
                    <TableCell>{ct.credits}</TableCell>
                    <TableCell>{ct.semester}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {s3Page} of{" "}
              {Math.max(
                1,
                Math.ceil(filteredCreditTransfers.length / pageSize),
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setS3Page((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <Button
                onClick={() => setS3Page((p) => p + 1)}
                disabled={s3Page * pageSize >= filteredCreditTransfers.length}
              >
                Next
              </Button>
              <Button className="bg-[#3B0A45] text-white" onClick={exportPdf}>
                {loadingExport ? "Exporting..." : "Export as PDF"}
              </Button>
              <Button variant="outline" onClick={exportExcel}>
                Export as Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
