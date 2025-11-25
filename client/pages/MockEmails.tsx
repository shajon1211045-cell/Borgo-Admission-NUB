import React, { useEffect, useState, useMemo } from "react";
import apiClient from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Download, Mail, Search } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Input } from "../components/ui/input";

export default function MockEmails() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<any[]>([]);

  // Filters
  const [q, setQ] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getMockEmails();
      if (res.success) {
        const data = res.data;
        if (Array.isArray(data)) {
          setEmails(data);
        } else if (data && Array.isArray((data as any).emails)) {
          setEmails((data as any).emails);
        } else {
          setEmails([]);
        }
      } else {
        toast({ title: "Failed to load mock emails", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading mock emails", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return emails.filter((e) => {
      // text search over to_address and subject
      if (q) {
        const qq = q.toLowerCase();
        if (
          !(
            (e.to_address || "").toLowerCase().includes(qq) ||
            (e.subject || "").toLowerCase().includes(qq) ||
            (e.body || "").toLowerCase().includes(qq)
          )
        )
          return false;
      }
      if (applicationFilter) {
        if (!String(e.application_id || "").includes(applicationFilter))
          return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(e.created_at) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        // include whole day
        to.setHours(23, 59, 59, 999);
        if (new Date(e.created_at) > to) return false;
      }
      return true;
    });
  }, [emails, q, applicationFilter, dateFrom, dateTo]);

  const downloadEmail = (email: any) => {
    const blob = new Blob([email.body || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_email_${email.id || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Email downloaded" });
  };

  const clearFilters = () => {
    setQ("");
    setApplicationFilter("");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-deep-plum font-poppins">
          Mock Emails
        </h1>
        <p className="text-gray-600 mt-1">
          List of mock outgoing emails generated during development (admin-only)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" /> Mock Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row gap-3 items-start">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by recipient, subject or content"
                value={q}
                onChange={(e: any) => setQ(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Application ID"
                value={applicationFilter}
                onChange={(e: any) => setApplicationFilter(e.target.value)}
                className="w-40"
              />
              <input
                type="date"
                value={dateFrom || ""}
                onChange={(e) => setDateFrom(e.target.value || undefined)}
                className="border rounded p-2"
              />
              <input
                type="date"
                value={dateTo || ""}
                onChange={(e) => setDateTo(e.target.value || undefined)}
                className="border rounded p-2"
              />
              <Button
                onClick={clearFilters}
                className="bg-gray-200 text-gray-800"
              >
                Clear
              </Button>
              <Button
                onClick={load}
                className="bg-deep-plum hover:bg-accent-purple"
              >
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-sm">
                        {e.to_address}
                      </TableCell>
                      <TableCell className="text-sm">{e.subject}</TableCell>
                      <TableCell className="text-sm">
                        {e.application_id || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(e.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => downloadEmail(e)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
