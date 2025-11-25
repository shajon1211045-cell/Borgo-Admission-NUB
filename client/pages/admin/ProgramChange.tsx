import React from 'react';

export default function ProgramChange() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Program Change Requests</h1>
      <p className="text-sm text-gray-600 mb-4">Manage program change requests submitted by applicants. Approve/Reject and track history.</p>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>List program change requests</li>
        <li>Review details and documents</li>
        <li>Approve/Reject with notes</li>
      </ul>
    </div>
  );
}
