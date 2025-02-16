"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { HiOutlineQrcode, HiOutlineMail, HiOutlineDeviceMobile } from 'react-icons/hi';

interface TwoFactorMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: any;
}

export default function TwoFactorSettings() {
  const [methods, setMethods] = useState<TwoFactorMethod[]>([
    {
      id: 'authenticator',
      name: 'Authenticator App',
      description: 'Use Google Authenticator or similar apps',
      enabled: true,
      icon: HiOutlineQrcode
    },
    {
      id: 'email',
      name: 'Email Verification',
      description: 'Receive codes via email',
      enabled: true,
      icon: HiOutlineMail
    },
    {
      id: 'sms',
      name: 'SMS Verification',
      description: 'Receive codes via SMS',
      enabled: false,
      icon: HiOutlineDeviceMobile
    }
  ]);

  const [settings, setSettings] = useState({
    requireForAll: false,
    graceLoginPeriod: 24,
    rememberDevice: true,
    rememberPeriod: 30
  });

  const handleMethodToggle = async (methodId: string) => {
    try {
      // API call to update 2FA method
      setMethods(methods.map(method =>
        method.id === methodId
          ? { ...method, enabled: !method.enabled }
          : method
      ));
      toast.success('2FA method updated successfully');
    } catch (error) {
      toast.error('Failed to update 2FA method');
    }
  };

  const handleSaveSettings = async () => {
    try {
      // API call to save 2FA settings
      toast.success('2FA settings updated successfully');
    } catch (error) {
      toast.error('Failed to update 2FA settings');
    }
  };

  return (
    <div className="space-y-8">
      {/* 2FA Methods */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Authentication Methods</h2>
        <div className="space-y-4">
          {methods.map(method => (
            <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <method.icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <div>
                  <h3 className="font-medium dark:text-white">{method.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={method.enabled}
                  onChange={() => handleMethodToggle(method.id)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 2FA Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">General Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium dark:text-white">Require 2FA for All Users</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Make two-factor authentication mandatory</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.requireForAll}
                onChange={(e) => setSettings({ ...settings, requireForAll: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grace Period (hours)
              </label>
              <input
                type="number"
                value={settings.graceLoginPeriod}
                onChange={(e) => setSettings({ ...settings, graceLoginPeriod: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Remember Device Period (days)
              </label>
              <input
                type="number"
                value={settings.rememberPeriod}
                onChange={(e) => setSettings({ ...settings, rememberPeriod: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.rememberDevice}
              onChange={(e) => setSettings({ ...settings, rememberDevice: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Allow "Remember this device"
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
} 