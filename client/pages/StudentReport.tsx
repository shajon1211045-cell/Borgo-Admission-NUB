import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Label } from '../components/ui/label';
import apiClient from '../lib/api';
import { defaultSyllabuses } from '../lib/syllabusData';

export default function StudentReport() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [report, setReport] = useState<any | null>(location.state?.report || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (report) return;
    (async () => {
      if (!id) return;
      setLoading(true);
      const res = await apiClient.getApplication(id);
      if (res.success && res.data?.data?.application) {
        const app = res.data.data.application || res.data.application || res.data;
        // try to build report from application data
        const programName = (app?.program_name || app?.program || 'Program').toString();
        const programId = (app?.department_code || app?.program_code || '').toString().toLowerCase();
        const syllabus = defaultSyllabuses.find((s) => (s.programId && programId && s.programId === programId) || s.programName.toLowerCase().includes(programName.toLowerCase())) || defaultSyllabuses[0];

        const firstSemester = syllabus?.semesters?.[0] || { courses: [], totalCredits: 0 };
        const perCreditFee = syllabus?.feeStructure?.perCreditFee || 0;
        const labCourses = (firstSemester.courses || []).filter((c: any) => c?.type === 'lab').length;
        const firstSemesterCredits = firstSemester.totalCredits || firstSemester.courses.reduce((s: number, c: any) => s + (c?.credits || 0), 0);
        const tuitionFirstSemester = perCreditFee * firstSemesterCredits + (syllabus?.feeStructure?.labFeePerCourse || 0) * labCourses;

        const detailed = {
          university_id: app?.id_generation?.student_id || app?.student_id || `GEN-${app?.id}`,
          ugc_id: app?.id_generation?.ugc_id || app?.id_generation?.ugcId || null,
          semester: app?.semester || 'Spring',
          program: syllabus?.programName || programName,
          admission_fees: app?.fees || [],
          mr: { number: app?.mr_number || `MR-${Date.now()}`, url: app?.mr_url || `/mock-receipts/MR-${Date.now()}.pdf` },
          program_type: syllabus?.programName?.toLowerCase().includes('master') ? 'Masters' : 'Bachelors',
          batch: app?.semester || 'Batch 2024',
          university_email: app?.id_generation?.generated_email || `${(app?.student_id || 'student').toLowerCase()}@nu.edu.bd`,
          fee_structure: syllabus?.feeStructure || {},
          syllabus_version: syllabus?.packageCode || syllabus?.id || 'v1',
          first_semester_courses: (firstSemester.courses || []).map((c: any) => ({
            code: c.code,
            title: c.name,
            credits: c.credits,
            section: 'A',
            faculty: app.department_name || 'Faculty',
          })),
          first_semester_tuition: { amount: tuitionFirstSemester, url: `/mock-receipts/tuition-MR-${Date.now()}.pdf` },
          personal_info: app?.personal_info || app?.personalInfo || {},
        };

        setReport(detailed);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading || !report) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <div className="text-center text-gray-600">Loading report...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Admission Report</h1>
            <div className="text-sm text-gray-600">University ID: <span className="font-mono">{report.university_id}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/applicant/${id}`} className="text-sm text-gray-600">Back to Applicant</Link>
            <a href={report.mr?.url} target="_blank" rel="noreferrer">
              <Button variant="outline">Download MR</Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 overflow-y-auto max-h-[60vh] space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated IDs & Basic Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>University ID / Roll:</strong> <span className="font-mono">{report.university_id}</span></div>
                  <div><strong>UGC Unique ID:</strong> <span className="font-mono">{report.ugc_id || '-'}</span></div>
                  <div><strong>Semester:</strong> {report.semester}</div>
                  <div><strong>Program:</strong> {report.program}</div>
                  <div><strong>Program Type:</strong> {report.program_type}</div>
                  <div><strong>Batch:</strong> {report.batch}</div>
                  <div><strong>University Email:</strong> {report.university_email}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>First Semester Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-sm">
                    <thead>
                      <tr className="text-xs text-gray-600 border-b">
                        <th className="px-2 py-1">Code</th>
                        <th className="px-2 py-1">Title</th>
                        <th className="px-2 py-1">Credits</th>
                        <th className="px-2 py-1">Section</th>
                        <th className="px-2 py-1">Faculty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(report.first_semester_courses || []).map((c: any, i: number) => (
                        <tr key={i} className="odd:bg-white even:bg-gray-50">
                          <td className="px-2 py-1">{c.code}</td>
                          <td className="px-2 py-1">{c.title}</td>
                          <td className="px-2 py-1">{c.credits}</td>
                          <td className="px-2 py-1">{c.section}</td>
                          <td className="px-2 py-1">{c.faculty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">First Semester Tuition</div>
                    <div className="text-xs text-gray-500">Calculated tuition for first semester</div>
                  </div>
                  <div className="text-sm font-mono">BDT {Number(report.first_semester_tuition?.amount || 0).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Structure & Syllabus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div><strong>Fee Structure</strong></div>
                  <div>Admission Fee: BDT {Number(report.fee_structure?.admissionFee || 0).toLocaleString()}</div>
                  <div>Per Credit Fee: BDT {Number(report.fee_structure?.perCreditFee || 0).toLocaleString()}</div>
                  <div>Lab Fee per Course: BDT {Number(report.fee_structure?.labFeePerCourse || 0).toLocaleString()}</div>
                  <div>Other Fees: BDT {Number(report.fee_structure?.otherFees || 0).toLocaleString()}</div>
                  <div className="mt-2"><strong>Syllabus Version:</strong> {report.syllabus_version}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admission Fees & Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {(report.admission_fees || []).map((f: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <div>{f.cost_head || f.name || 'Fee'}</div>
                      <div className="font-mono">BDT {Number(f.cost_amount || f.amount || 0).toLocaleString()}</div>
                    </div>
                  ))}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500">Money Receipt</div>
                    <a href={report.mr?.url} target="_blank" rel="noreferrer" className="text-deep-plum">Download</a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <a className="text-sm text-deep-plum" href={`mailto:${report.personal_info?.student_email}`}>Send Welcome Email</a>
                  <a className="text-sm text-deep-plum" href={report.first_semester_tuition?.url} target="_blank" rel="noreferrer">Download Tuition Bill</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
