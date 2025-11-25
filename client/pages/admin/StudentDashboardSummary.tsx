import React from 'react';

export default function StudentDashboardSummary() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Student Dashboard Summary</h1>
      <p className="text-sm text-gray-600 mb-4">Visitor lists, student list summaries, contact and address exports.</p>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Visitor List with details</li>
        <li>Student List (ID, UGC ID, name, program, contact)</li>
      </ul>
    </div>
  );
}
