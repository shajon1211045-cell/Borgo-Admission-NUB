import React from 'react';

export default function NewStudentProfile() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">New Student Profile Creation</h1>
      <p className="text-sm text-gray-600 mb-4">This module will handle automatic generation of University ID, UGC ID, semester selection, batch selection, email generation, initial course & fee generation, and related profile fields.</p>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li>Automatic University ID / Roll generation</li>
        <li>Automatic UGC Unique ID generation</li>
        <li>Automatic Semester, Program Type and Batch selection</li>
        <li>Personal details (parents, contact, address, DOB, gender, quota)</li>
        <li>Generate admission fee receipt (PDF) and welcome email</li>
      </ul>
    </div>
  );
}
