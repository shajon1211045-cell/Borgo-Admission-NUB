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

export default function AdminEmployees() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [roleKey, setRoleKey] = useState<string>("");

  const load = async () => {
    const res = await apiClient.listEmployees(roleFilter || undefined);
    if (res.success) setEmployees(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const assignRole = async () => {
    if (!userId || !roleKey)
      return toast({
        title: "Missing",
        description: "userId and roleKey required",
        variant: "destructive",
      });
    const res = await apiClient.assignUserRole(userId, roleKey);
    if (res.success) {
      toast({ title: "Assigned" });
      await load();
    } else
      toast({
        title: "Failed",
        description: String(res.error),
        variant: "destructive",
      });
  };

  const removeRole = async (id: number, rk: string) => {
    const res = await apiClient.removeUserRole(id, rk);
    if (res.success) {
      toast({ title: "Removed" });
      await load();
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
        <h1 className="text-2xl font-semibold">Employees & Roles (Demo)</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by role key (e.g., admission_officer)"
            value={roleFilter}
            onChange={(e: any) => setRoleFilter(e.target.value)}
          />
          <Button onClick={load}>Filter</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {employees.length === 0 ? (
                <div className="text-sm text-gray-500">No employees</div>
              ) : (
                employees.map((e) => (
                  <div
                    key={e.id}
                    className="p-2 border rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {e.name} ({e.email})
                      </div>
                      <div className="text-xs text-gray-500">
                        {e.department || ""} — {e.designation || ""}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setUserId(e.id);
                          setRoleKey("admission_officer");
                        }}
                      >
                        Assign Admission
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeRole(e.id, "admission_officer")}
                      >
                        Remove Admission
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="User ID"
                value={userId ?? ""}
                onChange={(e: any) => setUserId(Number(e.target.value || null))}
              />
              <Input
                placeholder="Role Key (e.g., admission_officer)"
                value={roleKey}
                onChange={(e: any) => setRoleKey(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={assignRole}>Assign</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
