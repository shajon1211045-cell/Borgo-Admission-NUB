import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import apiClient from "../../lib/api";
import { MessageCircle, Play } from "lucide-react";

export default function SmsQueue() {
  const [sms, setSms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getSmsQueue();
      if (res.success && Array.isArray(res.data)) setSms(res.data);
    } catch (e) {
      console.error("Failed to load sms queue", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = sms.filter((s) => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    return [s.to_number, s.message, s.provider, String(s.status)].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  useEffect(() => {
    load();
  }, []);

  const processNext = async () => {
    setProcessing(true);
    try {
      const res = await apiClient.processSms(false);
      if (res.success) {
        await load();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const processAll = async () => {
    setProcessing(true);
    try {
      const res = await apiClient.processSms(true);
      if (res.success) {
        await load();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> SMS Queue
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-64">
              <Input placeholder="Search SMS by number, message or status" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Button onClick={() => setShowExportDialog(true)} disabled={loading || filtered.length===0}>
              Export CSV
            </Button>
            <Button onClick={async () => {
              const res = await apiClient.serverExportSms({ search: debouncedQuery, format: 'csv' });
              if (res.success && (res.data as any)?.isFile) {
                const { blob, filename } = (res.data as any);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } else if (res.success && (res.data as any)?.async) {
                alert((res.data as any).message || 'Export queued');
              } else {
                alert(res.error || 'Export failed');
              }
            }} disabled={loading}>
              Server Export
            </Button>
            <Button onClick={load} disabled={loading}>
              Refresh
            </Button>
            <Button onClick={processNext} disabled={processing || sms.length === 0}>
              <Play className="w-4 h-4 mr-1" /> Process Next
            </Button>
            <Button onClick={processAll} disabled={processing || sms.length === 0}>
              <Play className="w-4 h-4 mr-1" /> Process All
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Queued SMS</CardTitle>
          </CardHeader>
          <CardContent>
            {sms.length === 0 ? (
              <div className="text-sm text-gray-500">No SMS in queue.</div>
            ) : (
              <div className="space-y-3">
                {sms.map((s) => (
                  <div key={s.sms_id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-600">To: {s.to_number}</div>
                        <div className="font-semibold">{s.message}</div>
                        <div className="text-xs text-gray-500">Provider: {s.provider || "-"} — {s.status} — {new Date(s.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CsvExportSelector
          open={showExportDialog}
          onOpenChange={(open) => setShowExportDialog(open)}
          availableColumns={[
            { key: 'sms_id', label: 'ID' },
            { key: 'to_number', label: 'To' },
            { key: 'message', label: 'Message' },
            { key: 'provider', label: 'Provider' },
            { key: 'status', label: 'Status' },
            { key: 'created_at', label: 'Created At' },
            { key: 'processed_at', label: 'Processed At' },
          ]}
          defaultSelected={['sms_id','to_number','message','status','created_at']}
          onExport={(cols) => exportToCsv(`sms_queue_${Date.now()}.csv`, filtered, cols)}
        />
      </div>
    </div>
  );
}
