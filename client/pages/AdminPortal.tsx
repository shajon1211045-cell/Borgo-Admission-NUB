import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function AdminPortal() {
  const { user, role, setRole, setPermissions } = useAuth();

  const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const r = e.target.value || null;
    setRole(r);
    // map default permissions for demo
    if (r === "admin") setPermissions(["all"]);
    else if (r === "admission_officer")
      setPermissions([
        "applications:view",
        "applications:approve",
        "waivers:manage",
      ]);
    else if (r === "finance_officer")
      setPermissions(["finance:view", "finance:billing"]);
    else setPermissions([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Portal</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Signed in as: {user?.name} ({role || user?.type})
          </div>
          <select
            className="border rounded p-2"
            value={role || ""}
            onChange={onRoleChange}
            aria-label="Select demo role"
          >
            <option value="">None</option>
            <option value="admin">Admin</option>
            <option value="admission_officer">Admission Officer</option>
            <option value="finance_officer">Finance Officer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Admission Officer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access to application review, waivers, offer courses, student
              management.
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/admin/admissions">
                <Button>Applications</Button>
              </Link>
              <Link to="/admin/imports">
                <Button variant="ghost">Imports</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Finance Officer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access billing, money receipts, fee structure, payments.
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/admin/finance">
                <Button>Finance Panel</Button>
              </Link>
              <Link to="/admin/id-card-generation">
                <Button variant="outline">ID Cards</Button>
              </Link>
              <Link to="/admin/imports">
                <Button variant="ghost">Imports</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings & Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Centralized admission settings and user permission configuration.
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/admin/configuration">
                <Button>Admission Settings</Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline">Users & Permissions</Button>
              </Link>
              <Link to="/admin/kpi-cache">
                <Button variant="ghost">KPI Cache</Button>
              </Link>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                KPI Cache
              </h3>
              <div className="flex items-center gap-2">
                <input
                  id="kpi_semester"
                  placeholder="Semester ID"
                  className="border rounded px-2 py-1 text-sm"
                />
                <Button
                  onClick={async () => {
                    try {
                      const sem = (
                        document.getElementById(
                          "kpi_semester",
                        ) as HTMLInputElement
                      ).value;
                      if (!sem) return alert("Please enter semester_id");
                      const res = await fetch("/api/admissions/kpi/refresh", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ semester_id: sem }),
                      });
                      const json = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(json.error || "Failed");
                      alert(
                        "KPI refresh started.\n" +
                          JSON.stringify(json.data || json),
                      );
                    } catch (e) {
                      console.error(e);
                      alert("KPI refresh failed");
                    }
                  }}
                >
                  Force Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
