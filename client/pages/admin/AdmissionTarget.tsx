import React from 'react';

export default function AdmissionTarget() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admission Target Management</h1>
      <p className="text-sm text-gray-600 mb-4">Set and view admission targets by Semester, Program, Campus. Track achievements and add remarks.</p>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Define targets per semester/program/campus</li>
        <li>View achievement and remarks</li>
        <li>Actions: Edit, Archive</li>
      </ul>
    </div>
  );
}
