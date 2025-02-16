"use client";

import { useState } from 'react';
import BulkVerification from '@/components/admin/verification/BulkVerification';

export default function VerificationPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">User Verification</h1>
      </div>

      <BulkVerification />
    </div>
  );
} 