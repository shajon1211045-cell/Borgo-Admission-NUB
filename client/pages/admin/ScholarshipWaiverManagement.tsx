import React from 'react';

export default function ScholarshipWaiverManagement() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Scholarship & Waiver Management</h1>
      <p className="text-sm text-gray-600 mb-4">Manage scholarship eligibility, setup waiver tables, lock/unlock and edit scholarships.</p>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Scholarship eligibility configuration</li>
        <li>Waiver policy implementation and limits</li>
        <li>Setup waiver/scholarship table (code, name, percent, type, SSC CGPA range)</li>
      </ul>
    </div>
  );
}
