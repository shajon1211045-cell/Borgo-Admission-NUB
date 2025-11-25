import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import apiClient from "../lib/api";

export default function CreditTransferList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getApplications({ admission_type: "credit_transfer", limit: 1000 });
      if (res.success && res.data) {
        const apps = res.data.applications || res.data || [];
        setApplications(Array.isArray(apps) ? apps : []);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load credit transfer applicants", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = applications.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (a.applicant_name || "").toLowerCase().includes(s) || (a.university_id || "").toLowerCase().includes(s) || (a.id || "").toLowerCase().includes(s);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-deep-plum">Credit Transfer List</h1>
        <div className="flex gap-2">
          <Input placeholder="Search by applicant, id" value={search} onChange={(e:any)=>setSearch(e.target.value)} />
          <Button onClick={()=>load()} variant="outline">Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicants ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant ID</TableHead>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Program Applied</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Application Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a:any)=> (
                <TableRow key={a.id || a.uuid}>
                  <TableCell>{a.id || a.university_id || '-'}</TableCell>
                  <TableCell>{a.applicant_name}</TableCell>
                  <TableCell>{a.program_name || a.program_code}</TableCell>
                  <TableCell>{a.campus || '-'}</TableCell>
                  <TableCell>{a.status || '-'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={()=>navigate(`/admin/credit-transfer/${encodeURIComponent(a.id || a.uuid)}`)}>
                      <Eye className="w-4 h-4 mr-2"/> Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
