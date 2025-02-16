"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export default function SecurityPolicies() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([
    {
      id: 'session',
      name: 'Session Security',
      description: 'Configure session timeout and concurrent login settings',
      enabled: true,
      settings: {
        sessionTimeout: 30,
        maxConcurrentSessions: 1
      }
    },
    {
      id: 'ip',
      name: 'IP Filtering',
      description: 'Control access based on IP addresses',
      enabled: false,
      settings: {
        allowedIPs: [],
        blockedIPs: []
      }
    },
    // Add more policies as needed
  ]);

  const handleTogglePolicy = async (policyId: string) => {
    try {
      // API call to update policy
      setPolicies(policies.map(policy => 
        policy.id === policyId 
          ? { ...policy, enabled: !policy.enabled }
          : policy
      ));
      toast.success('Policy updated successfully');
    } catch (error) {
      toast.error('Failed to update policy');
    }
  };

  return (
    <div className="space-y-6">
      {policies.map(policy => (
        <div key={policy.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium dark:text-white">{policy.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{policy.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={policy.enabled}
                onChange={() => handleTogglePolicy(policy.id)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          {policy.enabled && (
            <div className="mt-4 space-y-4">
              {/* Render policy-specific settings */}
              {policy.id === 'session' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={policy.settings.sessionTimeout}
                      onChange={(e) => {
                        // Handle setting update
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Concurrent Sessions
                    </label>
                    <input
                      type="number"
                      value={policy.settings.maxConcurrentSessions}
                      onChange={(e) => {
                        // Handle setting update
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 