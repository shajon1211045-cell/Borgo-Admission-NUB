import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogDescription,
} from "../../components/ui/alert-dialog";
import { useToast } from "../../hooks/use-toast";
import apiClient from "../../lib/api";

const PROGRAMS = ["CSE", "EEE", "BBA", "LAW", "ME", "CE", "PHARM"];

export default function FeeStructureManagement() {
  const { toast } = useToast();

  // Packages
  const [packages, setPackages] = useState<any[]>([
    {
      id: "pkg-1",
      name: "CSE-Basic",
      program: "CSE",
      admissionFee: 35000,
      perCreditFee: 2500,
      fixedFees: 15000,
      notes: "Default package",
    },
    {
      id: "pkg-2",
      name: "BBA-Standard",
      program: "BBA",
      admissionFee: 30000,
      perCreditFee: 2000,
      fixedFees: 12000,
      notes: "Includes basic facilities",
    },
  ]);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [pkgDialogOpen, setPkgDialogOpen] = useState(false);

  // Applications (for selecting student to edit previous education)
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [academicHistory, setAcademicHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newHistory, setNewHistory] = useState<any>({
    level: "SSC",
    exam_name: "",
    institute_name: "",
    passing_year: new Date().getFullYear(),
    grade_point: "",
  });

  // Helpers
  const calcPackageTotal = (p: any) => {
    return Number(p.admissionFee || 0) + Number(p.fixedFees || 0);
  };

  // Packages handlers
  const openAddPackage = () => {
    setEditingPackage({
      name: "",
      program: PROGRAMS[0],
      admissionFee: 0,
      perCreditFee: 0,
      fixedFees: 0,
      notes: "",
    });
    setPkgDialogOpen(true);
  };

  const savePackage = () => {
    if (!editingPackage) return;
    if (!editingPackage.name) {
      toast({ title: "Validation", description: "Package name required" });
      return;
    }
    if (!editingPackage.id) {
      editingPackage.id = `pkg-${Date.now()}`;
      setPackages((s) => [editingPackage, ...s]);
      toast({ title: "Package added" });
    } else {
      setPackages((s) =>
        s.map((p) => (p.id === editingPackage.id ? editingPackage : p)),
      );
      toast({ title: "Package updated" });
    }
    setPkgDialogOpen(false);
    setEditingPackage(null);
  };

  const deletePackage = (id: string) => {
    setPackages((s) => s.filter((p) => p.id !== id));
    toast({ title: "Package deleted" });
  };

  // Load applications for student selector
  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await apiClient.getApplications({ limit: 100 });
        if (res.success && res.data)
          setApplications(res.data.applications || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadApps();
  }, []);

  // Load academic history when student selected
  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedAppId) {
        setAcademicHistory([]);
        return;
      }
      setLoadingHistory(true);
      try {
        const res = await apiClient.getAcademicHistory(Number(selectedAppId));
        if (res.success) setAcademicHistory(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [selectedAppId]);

  const addHistory = async () => {
    if (!selectedAppId) {
      toast({ title: "Select Student first" });
      return;
    }
    try {
      const payload = { ...newHistory, application_id: selectedAppId };
      const res = await apiClient.addAcademicHistory(payload);
      if (res.success) {
        toast({ title: "Added", description: "Academic history added." });
        setNewHistory({
          level: "SSC",
          exam_name: "",
          institute_name: "",
          passing_year: new Date().getFullYear(),
          grade_point: "",
        });
        // reload
        const hres = await apiClient.getAcademicHistory(Number(selectedAppId));
        if (hres.success) setAcademicHistory(hres.data || []);
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
    }
  };

  const feeCalculation = (
    pkg: any,
    credits: number,
    percentWaiver = 0,
    percentDiscount = 0,
    quotaPercent = 0,
  ) => {
    const admission = Number(pkg.admissionFee || 0);
    const tuition = Number(pkg.perCreditFee || 0) * credits;
    const fixed = Number(pkg.fixedFees || 0);
    const gross = admission + tuition + fixed;
    // quotas applied before waiver
    const quotaAmount = gross * (quotaPercent / 100);
    const afterQuota = gross - quotaAmount;
    const waiverAmount = afterQuota * (percentWaiver / 100);
    const discountAmount = afterQuota * (percentDiscount / 100);
    const total = afterQuota - waiverAmount - discountAmount;
    return {
      admission,
      tuition,
      fixed,
      gross,
      quotaAmount,
      waiverAmount,
      discountAmount,
      total,
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Admission & Fee Structure Management
      </h2>

      {/* Packages */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fee Structure & Package Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div />
            <div>
              <Button onClick={openAddPackage}>+ Add Package</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Admission Fee</TableHead>
                <TableHead>Per Credit Fee</TableHead>
                <TableHead>Fixed Fees</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.program}</TableCell>
                  <TableCell>{p.admissionFee}</TableCell>
                  <TableCell>{p.perCreditFee}</TableCell>
                  <TableCell>{p.fixedFees}</TableCell>
                  <TableCell>{calcPackageTotal(p)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingPackage({ ...p });
                          setPkgDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Package</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this package?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePackage(p.id)}
                            >
                              Yes, Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Previous Education Data Management: select a student and edit academic history */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Previous Education Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label>Select Student (from Admissions)</Label>
              <Select
                value={selectedAppId ? String(selectedAppId) : undefined}
                onValueChange={(v: any) =>
                  setSelectedAppId(v ? Number(v) : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((a: any) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.applicant_name} — {a.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-600">
                Choose a student first. Their academic history is editable and
                stored per application.
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Academic History</h3>
            {loadingHistory ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-2">
                {academicHistory.length === 0 ? (
                  <div className="text-sm text-gray-500">No records</div>
                ) : (
                  academicHistory.map((h: any) => (
                    <div
                      key={h.academic_history_id || h.id}
                      className="p-2 border rounded"
                    >
                      <div className="font-semibold">
                        {h.level} — {h.institute_name} ({h.passing_year})
                      </div>
                      <div className="text-xs text-gray-500">
                        {h.exam_name} — GPA: {h.grade_point || h.grade_point}
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-4 border-t pt-3">
                  <h4 className="font-medium">Add Academic History</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
                    <Input
                      placeholder="Level (SSC/HSC/etc)"
                      value={newHistory.level}
                      onChange={(e: any) =>
                        setNewHistory({ ...newHistory, level: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Exam Name"
                      value={newHistory.exam_name}
                      onChange={(e: any) =>
                        setNewHistory({
                          ...newHistory,
                          exam_name: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Institute"
                      value={newHistory.institute_name}
                      onChange={(e: any) =>
                        setNewHistory({
                          ...newHistory,
                          institute_name: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Passing Year"
                      type="number"
                      value={newHistory.passing_year}
                      onChange={(e: any) =>
                        setNewHistory({
                          ...newHistory,
                          passing_year: Number(e.target.value),
                        })
                      }
                    />
                    <Input
                      placeholder="Grade Point / GPA"
                      value={newHistory.grade_point}
                      onChange={(e: any) =>
                        setNewHistory({
                          ...newHistory,
                          grade_point: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button onClick={addHistory} disabled={!selectedAppId}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs: Package */}
      <Dialog open={pkgDialogOpen} onOpenChange={setPkgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPackage?.id ? "Edit Package" : "Add Package"}
            </DialogTitle>
            <DialogDescription>
              Package Name, Program, Fees and Notes
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <Label>Package Name</Label>
              <Input
                value={editingPackage?.name || ""}
                onChange={(e: any) =>
                  setEditingPackage({ ...editingPackage, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Program</Label>
              <Select
                value={editingPackage?.program || PROGRAMS[0]}
                onValueChange={(v: any) =>
                  setEditingPackage({ ...editingPackage, program: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Admission Fee</Label>
              <Input
                type="number"
                value={editingPackage?.admissionFee || 0}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    admissionFee: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Per Credit Fee</Label>
              <Input
                type="number"
                value={editingPackage?.perCreditFee || 0}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    perCreditFee: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Fixed Fees</Label>
              <Input
                type="number"
                value={editingPackage?.fixedFees || 0}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    fixedFees: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editingPackage?.notes || ""}
                onChange={(e: any) =>
                  setEditingPackage({
                    ...editingPackage,
                    notes: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={savePackage}>Save</Button>
            <Button
              variant="outline"
              onClick={() => {
                setPkgDialogOpen(false);
                setEditingPackage(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
