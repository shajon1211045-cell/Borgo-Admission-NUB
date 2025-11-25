import React, { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import apiClient from "../lib/api";
import { useToast } from "../hooks/use-toast";

export default function AdminAcademic() {
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newHistory, setNewHistory] = useState<any>({
    level: "SSC",
    exam_name: "",
    institute_name: "",
    passing_year: new Date().getFullYear(),
  });
  const [equivItems, setEquivItems] = useState<any[]>([
    { source_scale: "default", source_value: "A", credits: 3 },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (applicationId) loadAll();
  }, [applicationId]);

  const loadAll = async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const [hRes, tRes] = await Promise.all([
        apiClient.getAcademicHistory(applicationId),
        apiClient.getCreditTransfers(applicationId),
      ]);
      if (hRes.success) setHistory(hRes.data || []);
      if (tRes.success) setTransfers(tRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addHistory = async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const payload = { ...newHistory, application_id: applicationId };
      const res = await apiClient.addAcademicHistory(payload);
      if (res.success) {
        toast({ title: "Added", description: "Academic history added." });
        setNewHistory({
          level: "SSC",
          exam_name: "",
          institute_name: "",
          passing_year: new Date().getFullYear(),
        });
        await loadAll();
      } else {
        toast({
          title: "Failed",
          description: String(res.error),
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to add",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEquiv = async () => {
    try {
      const res = await apiClient.calculateCreditEquivalency(equivItems);
      if (res.success) {
        toast({
          title: "Calculated",
          description: `Average mapped GP: ${res.data.average ?? "N/A"}`,
        });
      } else {
        toast({
          title: "Failed",
          description: String(res.error),
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Academic & Credit Transfer (Demo)
        </h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Application ID"
            value={applicationId ?? ""}
            onChange={(e: any) =>
              setApplicationId(Number(e.target.value || null))
            }
          />
          <Button onClick={loadAll} disabled={!applicationId}>
            Load
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Academic History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-sm text-gray-500">No records</div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.academic_history_id}
                    className="p-2 border rounded"
                  >
                    <div className="font-semibold">
                      {h.level} — {h.institute_name} ({h.passing_year})
                    </div>
                    <div className="text-xs text-gray-500">
                      {h.exam_name} — {h.group_subject} — GPA: {h.grade_point}
                    </div>
                  </div>
                ))
              )}

              <div className="mt-4 border-t pt-3">
                <h3 className="font-medium">Add History</h3>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <Input
                    placeholder="Level (SSC/HSC/Graduation)"
                    value={newHistory.level}
                    onChange={(e: any) =>
                      setNewHistory((p: any) => ({
                        ...p,
                        level: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Exam Name"
                    value={newHistory.exam_name}
                    onChange={(e: any) =>
                      setNewHistory((p: any) => ({
                        ...p,
                        exam_name: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Institute"
                    value={newHistory.institute_name}
                    onChange={(e: any) =>
                      setNewHistory((p: any) => ({
                        ...p,
                        institute_name: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Passing Year"
                    value={newHistory.passing_year}
                    onChange={(e: any) =>
                      setNewHistory((p: any) => ({
                        ...p,
                        passing_year: Number(e.target.value),
                      }))
                    }
                  />
                  <div className="flex justify-end">
                    <Button onClick={addHistory} disabled={!applicationId}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Transfer & Equivalency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transfers.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No credit transfer records
                </div>
              ) : (
                transfers.map((t) => (
                  <div key={t.transfer_id} className="p-2 border rounded">
                    <div className="font-semibold">
                      Transferred: {t.transferred_credits} — New CGPA:{" "}
                      {t.new_cgpa}
                    </div>
                    <div className="text-xs text-gray-500">
                      Processed at: {new Date(t.processed_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}

              <div className="mt-4 border-t pt-3">
                <h3 className="font-medium">Demo Equivalency Calculator</h3>
                <div className="space-y-2 mt-2">
                  {equivItems.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2">
                      <Input
                        value={it.source_scale}
                        onChange={(e: any) => {
                          const copy = [...equivItems];
                          copy[idx].source_scale = e.target.value;
                          setEquivItems(copy);
                        }}
                        placeholder="Scale"
                      />
                      <Input
                        value={it.source_value}
                        onChange={(e: any) => {
                          const copy = [...equivItems];
                          copy[idx].source_value = e.target.value;
                          setEquivItems(copy);
                        }}
                        placeholder="Value"
                      />
                      <Input
                        value={it.credits}
                        onChange={(e: any) => {
                          const copy = [...equivItems];
                          copy[idx].credits = Number(e.target.value);
                          setEquivItems(copy);
                        }}
                        placeholder="Credits"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setEquivItems((p) => [
                          ...p,
                          {
                            source_scale: "default",
                            source_value: "",
                            credits: 3,
                          },
                        ])
                      }
                    >
                      Add Row
                    </Button>
                    <Button variant="outline" onClick={calculateEquiv}>
                      Calculate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
