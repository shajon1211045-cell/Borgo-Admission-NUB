import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import apiClient from "../lib/api";
import { useToast } from "../hooks/use-toast";

export default function ReferralRequestsCard() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [selectedPercent, setSelectedPercent] = useState<
    Record<number, number>
  >({});

  const mockRequests = [
    {
      application_id: 1001,
      uuid: "app-1001",
      tracking_id: "TRK-1001",
      first_name: "Ahsan",
      last_name: "Khan",
      email: "ahsan@example.com",
      phone: "+8801710000001",
      total_cost: 20000,
      final_amount: 18000,
      payment_status: "pending",
      referrer_employee_id: "EMP001",
      referrer_name: "Dr. Smith",
      created_at: new Date().toISOString(),
    },
    {
      application_id: 1002,
      uuid: "app-1002",
      tracking_id: "TRK-1002",
      first_name: "Fatima",
      last_name: "Rahman",
      email: "fatima@example.com",
      phone: "+8801710000002",
      total_cost: 25000,
      final_amount: 25000,
      payment_status: "paid",
      referrer_employee_id: "EMP002",
      referrer_name: "Ms. Fatima",
      created_at: new Date().toISOString(),
    },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getReferralRequests();
      if (res && res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        // Fallback to frontend mock (no backend required)
        setRequests(mockRequests);
      }
    } catch (e) {
      console.error(e);
      // Fallback to frontend mock when API fails
      setRequests(mockRequests);
      toast({
        title: "Notice",
        description: "Using mock referral requests (no backend).",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (app: any) => {
    const percentage = selectedPercent[app.application_id] ?? 5;
    setApproving(app.application_id);
    try {
      const res = await apiClient.approveReferralRequest(
        app.application_id,
        Number(percentage),
      );

      // Calculate commission amount based on final_amount or total_cost
      const baseAmount = Number(app.final_amount ?? app.total_cost) || 0;
      const commissionAmount = Math.round(
        (Number(percentage) / 100) * baseAmount,
      );

      // Persist approved referral to localStorage so Reports can show it (frontend mock)
      try {
        const raw =
          (typeof localStorage !== "undefined" &&
            localStorage.getItem("nu_approved_referrals")) ||
          "[]";
        let list: any[] = [];
        try {
          list = JSON.parse(raw || "[]");
          if (!Array.isArray(list)) list = [];
        } catch {
          list = [];
        }
        const entry = {
          application_id: app.application_id,
          uuid: app.uuid,
          tracking_id: app.tracking_id,
          applicant_name: `${app.first_name} ${app.last_name}`,
          referrer_employee_id: app.referrer_employee_id,
          referrer_name: app.referrer_name,
          percentage: Number(percentage),
          commission_amount: commissionAmount,
          final_amount: baseAmount,
          approved_at: new Date().toISOString(),
        };
        list.unshift(entry);
        localStorage.setItem("nu_approved_referrals", JSON.stringify(list));
      } catch (e) {
        // ignore localStorage errors
        console.warn("Failed to persist approved referral locally", e);
      }

      if (res && res.success) {
        toast({
          title: "Approved",
          description: `Approved ${percentage}% for ${app.first_name} ${app.last_name}`,
        });
        load();
      } else {
        // If backend not available, simulate approval on frontend only
        setRequests((prev) =>
          prev.filter((p: any) => p.application_id !== app.application_id),
        );
        toast({
          title: "Approved (mock)",
          description: `Approved ${percentage}% for ${app.first_name} ${app.last_name} (mock)`,
        });
      }
    } catch (e) {
      console.error(e);
      // Simulate approval in catch as well
      setRequests((prev) =>
        prev.filter((p: any) => p.application_id !== app.application_id),
      );
      toast({
        title: "Approved (mock)",
        description: `Approved ${percentage}% for ${app.first_name} ${app.last_name} (mock)`,
      });
    } finally {
      setApproving(null);
    }
  };

  const presets = [5, 10, 15, 20];

  if (!requests || requests.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Referral Requests ({requests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>Final Amount</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r: any) => (
              <TableRow key={r.application_id}>
                <TableCell>
                  {r.first_name} {r.last_name}
                </TableCell>
                <TableCell>{r.tracking_id || r.uuid}</TableCell>
                <TableCell>
                  {r.referrer_name || r.referrer_employee_id}
                </TableCell>
                <TableCell>{r.final_amount ?? r.total_cost}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded p-1"
                      value={selectedPercent[r.application_id] ?? 5}
                      onChange={(e) =>
                        setSelectedPercent((prev) => ({
                          ...prev,
                          [r.application_id]: Number(e.target.value),
                        }))
                      }
                    >
                      {presets.map((p) => (
                        <option key={p} value={p}>
                          {p}%
                        </option>
                      ))}
                      <option value={0}>Custom</option>
                    </select>
                    <Button
                      onClick={() => approve(r)}
                      disabled={approving === r.application_id}
                      className="bg-deep-plum text-white"
                    >
                      {approving === r.application_id
                        ? "Approving..."
                        : "Approve"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
