"use client";

import CaseManagementDashboard from '@/components/admin/cases/CaseManagementDashboard';

export default function CaseDashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Case Management Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and analyze case performance metrics
        </p>
      </div>
      
      <CaseManagementDashboard />
    </div>
  );
} 