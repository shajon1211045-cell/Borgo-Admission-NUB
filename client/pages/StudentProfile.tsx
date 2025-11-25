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

export default function StudentProfile({}: {}) {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    // Try to read student id from query param ?id=123 for demo
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) setStudentId(Number(id));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (studentId) load();
  }, [studentId]);

  const load = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await apiClient.getStudent(studentId);
      if (res.success) {
        setForm(res.data || {});
      } else {
        toast({
          title: "Failed",
          description: String(res.error),
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const update = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        mobile_number: form.mobile_number,
        father_name: form.father_name,
        father_phone: form.father_phone,
        mother_name: form.mother_name,
        mother_phone: form.mother_phone,
        guardian_name: form.guardian_name,
        guardian_phone: form.guardian_phone,
        guardian_address: form.guardian_address,
        quota: form.quota,
        religion: form.religion,
        disability_status: form.disability_status,
        blood_group: form.blood_group,
        passport_no: form.passport_no,
        nid_no: form.nid_no,
        birth_certificate_no: form.birth_certificate_no,
        required_credits: form.required_credits,
        grading_system: form.grading_system,
        remarks: form.remarks,
        present_address: form.present_address,
        permanent_address: form.permanent_address,
        photo_url: form.photo_url,
        batch: form.batch,
        program_code: form.program_code,
        semester_id: form.semester_id,
      };
      const res = await apiClient.updateStudent(studentId, payload);
      if (res.success) {
        toast({ title: "Saved", description: "Student profile updated." });
        setForm(res.data || form);
      } else {
        toast({
          title: "Save failed",
          description: String(res.error),
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to save",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (k: string, v: any) =>
    setForm((prev: any) => ({ ...prev, [k]: v }));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Student Profile (Demo)</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Student ID (for demo)"
            value={studentId ?? ""}
            onChange={(e: any) => setStudentId(Number(e.target.value || null))}
          />
          <Button onClick={load} disabled={!studentId || loading}>
            Load
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <Input
                value={form.full_name || ""}
                onChange={(e: any) => onChange("full_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                value={form.email || ""}
                onChange={(e: any) => onChange("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mobile
              </label>
              <Input
                value={form.mobile_number || ""}
                onChange={(e: any) => onChange("mobile_number", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Batch
              </label>
              <Input
                value={form.batch || ""}
                onChange={(e: any) => onChange("batch", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Program Code
              </label>
              <Input
                value={form.program_code || ""}
                onChange={(e: any) => onChange("program_code", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Semester ID
              </label>
              <Input
                value={form.semester_id || ""}
                onChange={(e: any) => onChange("semester_id", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Present Address
              </label>
              <Input
                value={form.present_address || ""}
                onChange={(e: any) =>
                  onChange("present_address", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Permanent Address
              </label>
              <Input
                value={form.permanent_address || ""}
                onChange={(e: any) =>
                  onChange("permanent_address", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Photo URL
              </label>
              <Input
                value={form.photo_url || ""}
                onChange={(e: any) => onChange("photo_url", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Required Credits
              </label>
              <Input
                value={form.required_credits || ""}
                onChange={(e: any) =>
                  onChange("required_credits", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Grading System
              </label>
              <Input
                value={form.grading_system || ""}
                onChange={(e: any) =>
                  onChange("grading_system", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Disability Status
              </label>
              <Input
                value={form.disability_status || ""}
                onChange={(e: any) =>
                  onChange("disability_status", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Blood Group
              </label>
              <Input
                value={form.blood_group || ""}
                onChange={(e: any) => onChange("blood_group", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quota
              </label>
              <Input
                value={form.quota || ""}
                onChange={(e: any) => onChange("quota", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Religion
              </label>
              <Input
                value={form.religion || ""}
                onChange={(e: any) => onChange("religion", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Passport No
              </label>
              <Input
                value={form.passport_no || ""}
                onChange={(e: any) => onChange("passport_no", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                NID No
              </label>
              <Input
                value={form.nid_no || ""}
                onChange={(e: any) => onChange("nid_no", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birth Certificate No
              </label>
              <Input
                value={form.birth_certificate_no || ""}
                onChange={(e: any) =>
                  onChange("birth_certificate_no", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Father Name
              </label>
              <Input
                value={form.father_name || ""}
                onChange={(e: any) => onChange("father_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Father Phone
              </label>
              <Input
                value={form.father_phone || ""}
                onChange={(e: any) => onChange("father_phone", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mother Name
              </label>
              <Input
                value={form.mother_name || ""}
                onChange={(e: any) => onChange("mother_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mother Phone
              </label>
              <Input
                value={form.mother_phone || ""}
                onChange={(e: any) => onChange("mother_phone", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Guardian Name
              </label>
              <Input
                value={form.guardian_name || ""}
                onChange={(e: any) => onChange("guardian_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Guardian Phone
              </label>
              <Input
                value={form.guardian_phone || ""}
                onChange={(e: any) =>
                  onChange("guardian_phone", e.target.value)
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Guardian Address
              </label>
              <Input
                value={form.guardian_address || ""}
                onChange={(e: any) =>
                  onChange("guardian_address", e.target.value)
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <Input
                value={form.remarks || ""}
                onChange={(e: any) => onChange("remarks", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={update} disabled={!studentId || loading}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
