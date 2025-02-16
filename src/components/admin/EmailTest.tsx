'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function EmailTest() {
  const [testing, setTesting] = useState(false);

  const handleTestEmail = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/test/email', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Email test completed successfully');
      } else {
        throw new Error(data.error || 'Test failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to test email');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Email Configuration Test</h3>
      <button
        onClick={handleTestEmail}
        disabled={testing}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Test Email Setup'}
      </button>
    </div>
  );
} 