import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import apiClient from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useToast } from "../hooks/use-toast";

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { toast } = useToast();

  const loadSummary = async () => {
    const res = await apiClient.getDashboardSummary();
    if (res.success) setSummary(res.data || {});
  };

  const loadApplications = async () => {
    try {
      const res = await apiClient.getApplications({ search, page, limit });
      if (res.success) setApplications(res.data.applications || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load applications." });
    }
  };

  useEffect(() => {
    loadSummary();
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admission Dashboard (Officer)</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => { loadSummary(); loadApplications(); }}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary?.totalApplications ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need Review</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary?.needReview ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary?.admitted ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today's Applicants</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary?.todayApplicants ?? "—"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Search applicants by name/tracking id/email"
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
              />
              <Button
                onClick={() => {
                  setPage(1);
                  loadApplications();
                }}
              >
                Search
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((a: any, idx: number) => (
                  <TableRow key={a.id}>
                    <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                    <TableCell>{a.full_name || a.name}</TableCell>
                    <TableCell>{a.tracking_id || a.id}</TableCell>
                    <TableCell>{a.program_name || a.program_code}</TableCell>
                    <TableCell>{a.status || a.admission_status || "—"}</TableCell>
                    <TableCell>
                      <Link to={`/admin/applicant/${a.id}`} className="text-accent-purple hover:underline">View</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-between">
              <div>
                <Button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                <Button onClick={() => setPage((p) => p + 1)} className="ml-2">Next</Button>
              </div>
              <div>Page {page}</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Link to="/admin/visitors-log" className="text-deep-plum hover:underline">Visitors List</Link>
                <Link to="/admin/admission-target" className="text-deep-plum hover:underline">Admission Target</Link>
                <Link to="/admin/program-change" className="text-deep-plum hover:underline">Program Change</Link>
                <Link to="/admin/scholarships" className="text-deep-plum hover:underline">Waiver List</Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>Total Waivers Assigned: {summary?.totalWaiverAssignments ?? '—'}</div>
                <div>Total Collected: {summary?.totalCollected ?? '—'}</div>
                <div>Active Students: {summary?.activeStudents ?? '—'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
