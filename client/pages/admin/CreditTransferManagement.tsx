import React from 'react';

import CreditTransferList from "../CreditTransferList";

export default function CreditTransferManagement() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Credit Transfer Student Management</h1>
      <p className="text-sm text-gray-600 mb-4">Manage transferred courses, grade equivalency, integration of transferred grades into current CGPA and transcript exports.</p>
      <CreditTransferList />
    </div>
  );
}
