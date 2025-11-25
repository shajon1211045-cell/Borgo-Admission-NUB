import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import apiClient from "../../lib/api";
import { Mail, MessageCircle, RotateCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "../../components/ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { exportToCsv } from "../../lib/csv";
import useDebouncedValue from "../../hooks/use-debounce";
import CsvExportSelector from "../../components/CsvExportSelector";

export default function AdminMessaging() {
  const [emails, setEmails] = useState<any[]>([]);
  const [sms, setSms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [emailQuery, setEmailQuery] = useState("");
  const [smsQuery, setSmsQuery] = useState("");
  const debouncedEmailQuery = useDebouncedValue(emailQuery, 300);
  const debouncedSmsQuery = useDebouncedValue(smsQuery, 300);
  const [showEmailExportDialog, setShowEmailExportDialog] = useState(false);
  const [showSmsExportDialog, setShowSmsExportDialog] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | {
    type: "resend" | "send";
    id: number;
  }>(null);

  // Export jobs UI
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsOpen, setJobsOpen] = useState(false);
  const loadJobs = async () => {
    try {
      const res = await apiClient.listExportJobs();
      if (res.success && Array.isArray(res.data)) setJobs(res.data);
    } catch (e) {
      console.error(e);
    }
  };
  const processJob = async (jobId: number) => {
    try {
      const r = await apiClient.processExportJob(jobId);
      if (r.success) {
        toast({
          title: "Job processed",
          description: "Export job processed successfully.",
        });
      } else {
        toast({
          title: "Processing failed",
          description: String(r.error),
          variant: "destructive",
        });
      }
      await loadJobs();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to process job",
        variant: "destructive",
      });
    }
  };
  const downloadJob = async (jobId: number) => {
    try {
      const r = await apiClient.downloadExportJob(jobId);
      if (r.success && (r.data as any)?.isFile) {
        const { blob, filename } = r.data as any;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        toast({
          title: "Download failed",
          description: r.error || "File not available",
          variant: "destructive",
        });
      }
      await loadJobs();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const { toast } = useToast();

  const filteredEmails = emails.filter((e) => {
    if (!debouncedEmailQuery) return true;
    const q = debouncedEmailQuery.toLowerCase();
    return [e.to_address, e.subject, e.body, String(e.application_id)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const filteredSms = sms.filter((s) => {
    if (!debouncedSmsQuery) return true;
    const q = debouncedSmsQuery.toLowerCase();
    return [s.to_number, s.message, s.provider, String(s.status)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const load = async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([
        apiClient.getMockEmails(),
        apiClient.getSmsQueue(),
      ]);
      if (eRes.success && Array.isArray(eRes.data)) setEmails(eRes.data);
      if (sRes.success && Array.isArray(sRes.data)) setSms(sRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openResendConfirm = (id: number) => {
    setConfirmAction({ type: "resend", id });
    setConfirmOpen(true);
  };

  const openSendConfirm = (id: number) => {
    setConfirmAction({ type: "send", id });
    setConfirmOpen(true);
  };

  const performConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "resend") {
        const res = await apiClient.resendMockEmail(confirmAction.id);
        if (res.success) {
          toast({
            title: "Email resent",
            description: "Mock email has been duplicated and marked as sent.",
          });
        } else {
          toast({
            title: "Resend failed",
            description: String(res.error),
            variant: "destructive",
          });
        }
      } else if (confirmAction.type === "send") {
        const res = await apiClient.sendSmsById(confirmAction.id);
        if (res.success) {
          toast({
            title: "SMS sent",
            description: "Queued SMS has been marked as sent.",
          });
        } else {
          toast({
            title: "Send failed",
            description: String(res.error),
            variant: "destructive",
          });
        }
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Action failed",
        description: "Unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setConfirmOpen(false);
      setConfirmAction(null);
      await load();
    }
  };

  const handleResendEmail = (id: number) => openResendConfirm(id);
  const handleSendSms = (sms_id: number) => openSendConfirm(sms_id);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <RotateCw className="w-5 h-5" /> Messaging Admin (Mock)
          </h2>
          <div>
            <Button onClick={load} disabled={loading}>
              Refresh
            </Button>
            <Button
              className="ml-2"
              onClick={async () => {
                setJobsOpen(true);
                await loadJobs();
              }}
              disabled={loading}
            >
              Queued Exports
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Mock Emails
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-64">
                    <Input
                      placeholder="Search emails by recipient, subject or body"
                      value={emailQuery}
                      onChange={(e) => setEmailQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowEmailExportDialog(true)}
                    disabled={filteredEmails.length === 0}
                  >
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      const res = await apiClient.serverExportMockEmails({
                        search: debouncedEmailQuery,
                        format: "csv",
                      });
                      if (res.success && (res.data as any)?.isFile) {
                        const { blob, filename } = res.data as any;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } else if (res.success && (res.data as any)?.async) {
                        alert((res.data as any).message || "Export queued");
                      } else {
                        alert(res.error || "Export failed");
                      }
                    }}
                  >
                    Server Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEmails.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No mock emails found.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEmails.map((e) => (
                    <div key={e.id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-gray-600">
                            To: {e.to_address || "-"}
                          </div>
                          <div className="font-semibold">
                            {e.subject || "(no subject)"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Application: {e.application_id || "-"} —{" "}
                            {new Date(e.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResendEmail(e.id)}
                          >
                            <RotateCw className="w-4 h-4 mr-1" /> Resend
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                        {e.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> SMS Queue
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-64">
                    <Input
                      placeholder="Search SMS by number, message or status"
                      value={smsQuery}
                      onChange={(e) => setSmsQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowSmsExportDialog(true)}
                    disabled={filteredSms.length === 0}
                  >
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      const res = await apiClient.serverExportSms({
                        search: debouncedSmsQuery,
                        format: "csv",
                      });
                      if (res.success && (res.data as any)?.isFile) {
                        const { blob, filename } = res.data as any;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } else if (res.success && (res.data as any)?.async) {
                        alert((res.data as any).message || "Export queued");
                      } else {
                        alert(res.error || "Export failed");
                      }
                    }}
                  >
                    Server Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSms.length === 0 ? (
                <div className="text-sm text-gray-500">No SMS in queue.</div>
              ) : (
                <div className="space-y-3">
                  {filteredSms.map((s) => (
                    <div key={s.sms_id} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-gray-600">
                            To: {s.to_number}
                          </div>
                          <div className="font-semibold">{s.message}</div>
                          <div className="text-xs text-gray-500">
                            Provider: {s.provider || "-"} — {s.status} —{" "}
                            {new Date(s.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendSms(s.sms_id)}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onOpenChange={(open) => setConfirmOpen(open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to{" "}
                {confirmAction?.type === "resend"
                  ? "resend this email"
                  : "send this SMS"}
                ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmAction(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={performConfirmAction}>Confirm</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Jobs Dialog */}
        <Dialog
          open={jobsOpen}
          onOpenChange={(open) => {
            setJobsOpen(open);
            if (!open) setJobs([]);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Queued Exports</DialogTitle>
              <DialogDescription>
                Manage queued exports and download generated files (demo).
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3 max-h-96 overflow-auto">
              {jobs.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No queued exports found.
                </div>
              ) : (
                jobs.map((j) => (
                  <div
                    key={j.job_id}
                    className="border rounded p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {j.export_type || "export"} — {j.file_name || ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {j.status} — Requested:{" "}
                        {new Date(j.created_at).toLocaleString()}
                      </div>
                      {j.error ? (
                        <div className="text-xs text-red-600">
                          Error: {String(j.error)}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => processJob(j.job_id)}
                        disabled={j.status === "processing"}
                      >
                        Process
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadJob(j.job_id)}
                        disabled={!j.file_path}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setJobsOpen(false);
                    setJobs([]);
                  }}
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CsvExportSelector
          open={showEmailExportDialog}
          onOpenChange={(open) => setShowEmailExportDialog(open)}
          availableColumns={[
            { key: "id", label: "ID" },
            { key: "to_address", label: "To" },
            { key: "subject", label: "Subject" },
            { key: "application_id", label: "Application ID" },
            { key: "created_at", label: "Created At" },
            { key: "sent_at", label: "Sent At" },
            { key: "body", label: "Body" },
          ]}
          defaultSelected={[
            "id",
            "to_address",
            "subject",
            "application_id",
            "created_at",
          ]}
          onExport={(cols) =>
            exportToCsv(`mock_emails_${Date.now()}.csv`, filteredEmails, cols)
          }
        />

        <CsvExportSelector
          open={showSmsExportDialog}
          onOpenChange={(open) => setShowSmsExportDialog(open)}
          availableColumns={[
            { key: "sms_id", label: "ID" },
            { key: "to_number", label: "To" },
            { key: "message", label: "Message" },
            { key: "provider", label: "Provider" },
            { key: "status", label: "Status" },
            { key: "created_at", label: "Created At" },
            { key: "processed_at", label: "Processed At" },
          ]}
          defaultSelected={[
            "sms_id",
            "to_number",
            "message",
            "status",
            "created_at",
          ]}
          onExport={(cols) =>
            exportToCsv(`sms_queue_${Date.now()}.csv`, filteredSms, cols)
          }
        />
      </div>
    </div>
  );
}
