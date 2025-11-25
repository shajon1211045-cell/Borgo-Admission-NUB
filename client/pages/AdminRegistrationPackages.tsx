import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import apiClient from "../lib/api";
import { useToast } from "../hooks/use-toast";

export default function AdminRegistrationPackages() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [termFilter, setTermFilter] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getRegistrationPackages();
      if (res.success && res.data)
        setPackages(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to load registration packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = packages.filter((p) => {
    if (search && !`${p.program}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (termFilter && p.term !== termFilter) return false;
    if (modeFilter && p.mode !== modeFilter) return false;
    return true;
  });

  const terms = Array.from(new Set(packages.map((p) => p.term))).sort();
  const modes = Array.from(new Set(packages.map((p) => p.mode))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-deep-plum">
          Registration Packages
        </h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by program name"
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
          <Button variant="outline" onClick={() => load()}>
            Refresh
          </Button>
          <Button
            onClick={() => {
              setEditingPackage({
                id: `pkg-${Date.now()}`,
                program: "",
                term: "",
                mode: "",
                credits: 0,
                admission_fee: 0,
                per_credit: 0,
                fixed_fees: 0,
                total_estimated: 0,
              });
              setEditModalOpen(true);
            }}
          >
            New Package
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packages ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <select
              value={termFilter ?? ""}
              onChange={(e) => setTermFilter(e.target.value || null)}
              className="border rounded p-2"
            >
              <option value="">All Terms</option>
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={modeFilter ?? ""}
              onChange={(e) => setModeFilter(e.target.value || null)}
              className="border rounded p-2"
            >
              <option value="">All Modes</option>
              {modes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Admission Fee</TableHead>
                <TableHead>Per Credit</TableHead>
                <TableHead>Fixed Fees</TableHead>
                <TableHead>Total (Est)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.program}</TableCell>
                  <TableCell>{p.term}</TableCell>
                  <TableCell>{p.mode}</TableCell>
                  <TableCell>{p.credits}</TableCell>
                  <TableCell>৳{p.admissionFee.toLocaleString()}</TableCell>
                  <TableCell>৳{p.perCredit.toLocaleString()}</TableCell>
                  <TableCell>৳{p.fixedFees.toLocaleString()}</TableCell>
                  <TableCell>৳{p.totalEstimated.toLocaleString()}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updatePackageSelection(p);
                      }}
                    >
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPackage(p);
                        setEditModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm("Delete this package?")) return;
                        try {
                          const res = await apiClient.deleteRegistrationPackage(
                            p.id,
                          );
                          if (res.success) {
                            toast({ title: "Deleted" });
                            load();
                          } else
                            toast({
                              title: "Error",
                              description: res.error || "Failed to delete",
                              variant: "destructive",
                            });
                        } catch (e) {
                          console.error(e);
                          toast({
                            title: "Error",
                            description: "Failed to delete",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editModalOpen && editingPackage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Edit Package: {editingPackage.program}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={editingPackage.program}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    program: e.target.value,
                  })
                }
                placeholder="Program name"
              />
              <Input
                value={editingPackage.term}
                onChange={(e: any) =>
                  setEditingPackage({ ...editingPackage, term: e.target.value })
                }
                placeholder="Term"
              />
              <Input
                value={editingPackage.mode}
                onChange={(e: any) =>
                  setEditingPackage({ ...editingPackage, mode: e.target.value })
                }
                placeholder="Mode"
              />
              <Input
                value={editingPackage.credits}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    credits: Number(e.target.value),
                  })
                }
                placeholder="Credits"
              />
              <Input
                value={editingPackage.admissionFee}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    admissionFee: Number(e.target.value),
                  })
                }
                placeholder="Admission Fee"
              />
              <Input
                value={editingPackage.perCredit}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    perCredit: Number(e.target.value),
                  })
                }
                placeholder="Per Credit"
              />
              <Input
                value={editingPackage.fixedFees}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    fixedFees: Number(e.target.value),
                  })
                }
                placeholder="Fixed Fees"
              />
              <Input
                value={editingPackage.totalEstimated}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    totalEstimated: Number(e.target.value),
                  })
                }
                placeholder="Total Estimated"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingPackage(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setSaving(true);
                  try {
                    const payload = { ...editingPackage };
                    let res;
                    // if id exists in DB treat as update, else create
                    const exists = await apiClient.getRegistrationPackages();
                    const found =
                      exists.success &&
                      Array.isArray(exists.data) &&
                      exists.data.find((x: any) => x.id === editingPackage.id);
                    if (found) {
                      res = await apiClient.updateRegistrationPackage(
                        editingPackage.id,
                        payload,
                      );
                    } else {
                      res = await apiClient.createRegistrationPackage(payload);
                    }

                    if (res.success) {
                      toast({ title: "Saved" });
                      setEditModalOpen(false);
                      setEditingPackage(null);
                      load();
                    } else
                      toast({
                        title: "Error",
                        description: res.error || "Failed to save",
                        variant: "destructive",
                      });
                  } catch (e) {
                    console.error(e);
                    toast({
                      title: "Error",
                      description: "Failed to save",
                      variant: "destructive",
                    });
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function updatePackageSelection(pkg: any) {
    // Pre-fill application draft via localStorage to keep consistent with ApplicationContext
    try {
      const draft = JSON.parse(
        localStorage.getItem("nu_application_draft") || "{}",
      );
      const updated = {
        ...draft,
        program: pkg.id,
        totalCost: pkg.totalEstimated,
      };
      localStorage.setItem("nu_application_draft", JSON.stringify(updated));
      toast({
        title: "Package applied",
        description: `${pkg.program} applied to draft.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to apply package",
        variant: "destructive",
      });
    }
  }
}
