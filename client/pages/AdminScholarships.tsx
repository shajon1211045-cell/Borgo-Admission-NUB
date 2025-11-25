import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import apiClient from "../lib/api";
import { useToast } from "../hooks/use-toast";

export default function AdminScholarships() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [newPolicy, setNewPolicy] = useState<any>({
    code: "",
    name: "",
    percentage: 0,
  });
  const [assignPayload, setAssignPayload] = useState<any>({
    application_id: "",
    scholarship_id: "",
    percent: 0,
  });

  const loadPolicies = async () => {
    const res = await apiClient.getScholarships();
    if (res.success) setPolicies(res.data || []);
  };
  const loadAssignments = async () => {
    const res = await apiClient.listScholarshipAssignments(
      applicationId ? Number(applicationId) : undefined,
    );
    if (res.success) setAssignments(res.data || []);
  };

  useEffect(() => {
    loadPolicies();
  }, []);
  useEffect(() => {
    if (applicationId) loadAssignments();
    else setAssignments([]);
  }, [applicationId]);

  const createPolicy = async () => {
    const res = await apiClient.createScholarship(newPolicy);
    if (res.success) {
      toast({ title: "Created", description: "Scholarship policy created" });
      setNewPolicy({ code: "", name: "", percentage: 0 });
      await loadPolicies();
    } else {
      toast({
        title: "Failed",
        description: String(res.error),
        variant: "destructive",
      });
    }
  };

  const assign = async () => {
    const payload = {
      application_id: Number(assignPayload.application_id),
      scholarship_id: Number(assignPayload.scholarship_id),
      percent: Number(assignPayload.percent || 0),
    };
    const res = await apiClient.assignScholarship(payload);
    if (res.success) {
      toast({
        title: "Assigned",
        description: "Scholarship assigned to application",
      });
      setAssignPayload({ application_id: "", scholarship_id: "", percent: 0 });
      await loadAssignments();
    } else {
      toast({
        title: "Failed",
        description: String(res.error),
        variant: "destructive",
      });
    }
  };

  const lock = async (id: number) => {
    const res = await apiClient.lockScholarshipAssignment(id);
    if (res.success) {
      toast({ title: "Locked" });
      await loadAssignments();
    } else
      toast({
        title: "Failed",
        description: String(res.error),
        variant: "destructive",
      });
  };
  const unlock = async (id: number) => {
    const res = await apiClient.unlockScholarshipAssignment(id);
    if (res.success) {
      toast({ title: "Unlocked" });
      await loadAssignments();
    } else
      toast({
        title: "Failed",
        description: String(res.error),
        variant: "destructive",
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Scholarships & Assignments (Demo)
        </h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Application ID"
            value={applicationId ?? ""}
            onChange={(e: any) =>
              setApplicationId(Number(e.target.value || null))
            }
          />
          <Button onClick={loadAssignments} disabled={!applicationId}>
            Load Assignments
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {policies.length === 0 ? (
                <div className="text-sm text-gray-500">No policies</div>
              ) : (
                policies.map((p) => (
                  <div
                    key={p.scholarship_id}
                    className="p-2 border rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {p.name} ({p.code})
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.description || ""} — {p.percentage}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {p.scholarship_id}
                    </div>
                  </div>
                ))
              )}

              <div className="mt-4 border-t pt-3">
                <h3 className="font-medium">Create Policy</h3>
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="Code"
                    value={newPolicy.code}
                    onChange={(e: any) =>
                      setNewPolicy((p: any) => ({ ...p, code: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Name"
                    value={newPolicy.name}
                    onChange={(e: any) =>
                      setNewPolicy((p: any) => ({ ...p, name: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Percentage"
                    value={newPolicy.percentage}
                    onChange={(e: any) =>
                      setNewPolicy((p: any) => ({
                        ...p,
                        percentage: Number(e.target.value),
                      }))
                    }
                  />
                  <div className="flex justify-end">
                    <Button onClick={createPolicy}>Create</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.length === 0 ? (
                <div className="text-sm text-gray-500">No assignments</div>
              ) : (
                assignments.map((a) => (
                  <div
                    key={a.scholarship_assignment_id}
                    className="p-2 border rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        Scholarship ID: {a.scholarship_id} —{" "}
                        {a.amount || a.percent || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Application: {a.application_id} — Assigned:{" "}
                        {new Date(a.assigned_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => lock(a.scholarship_assignment_id)}
                        disabled={a.locked}
                      >
                        Lock
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unlock(a.scholarship_assignment_id)}
                        disabled={!a.locked}
                      >
                        Unlock
                      </Button>
                    </div>
                  </div>
                ))
              )}

              <div className="mt-4 border-t pt-3">
                <h3 className="font-medium">Assign Scholarship</h3>
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="Application ID"
                    value={assignPayload.application_id}
                    onChange={(e: any) =>
                      setAssignPayload((p: any) => ({
                        ...p,
                        application_id: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Scholarship ID"
                    value={assignPayload.scholarship_id}
                    onChange={(e: any) =>
                      setAssignPayload((p: any) => ({
                        ...p,
                        scholarship_id: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Percent"
                    value={assignPayload.percent}
                    onChange={(e: any) =>
                      setAssignPayload((p: any) => ({
                        ...p,
                        percent: Number(e.target.value),
                      }))
                    }
                  />
                  <div className="flex justify-end">
                    <Button onClick={assign}>Assign</Button>
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
