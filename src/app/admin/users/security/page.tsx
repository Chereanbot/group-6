"use client";

import { useState } from 'react';
import { 
  HiOutlineShieldCheck, 
  HiOutlineLockClosed, 
  HiOutlineKey,
  HiOutlineCog
} from 'react-icons/hi';
import SecurityPolicies from '@/components/admin/security/SecurityPolicies';
import PasswordSettings from '@/components/admin/security/PasswordSettings';
import SecurityLogs from '@/components/admin/security/SecurityLogs';
import TwoFactorSettings from '@/components/admin/security/TwoFactorSettings';
import ActiveSessions from '@/components/admin/security/ActiveSessions';
import SecurityMetrics from '@/components/admin/security/SecurityMetrics';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('policies');

  const tabs = [
    { id: 'policies', name: 'Security Policies', icon: HiOutlineShieldCheck },
    { id: 'password', name: 'Password Settings', icon: HiOutlineLockClosed },
    { id: '2fa', name: 'Two-Factor Auth', icon: HiOutlineKey },
    { id: 'logs', name: 'Security Logs', icon: HiOutlineCog },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Security Settings</h1>
      </div>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityMetrics />
        <ActiveSessions />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'policies' && <SecurityPolicies />}
        {activeTab === 'password' && <PasswordSettings />}
        {activeTab === '2fa' && <TwoFactorSettings />}
        {activeTab === 'logs' && <SecurityLogs />}
      </div>
    </div>
  );
} 