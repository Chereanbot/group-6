"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineBell,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineGlobe,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineSave,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

interface SettingsState {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    position: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    caseUpdates: boolean;
    systemAlerts: boolean;
  };
  appearance: {
    darkMode: boolean;
    language: string;
    timezone: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
}

const initialSettings: SettingsState = {
  profile: {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+251911234567',
    position: 'Kebele Manager'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    caseUpdates: true,
    systemAlerts: true
  },
  appearance: {
    darkMode: false,
    language: 'English',
    timezone: 'Africa/Addis_Ababa'
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30
  }
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Implement save logic here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const updateProfile = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const toggleNotification = (field: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field as keyof typeof prev.notifications]
      }
    }));
  };

  const updateAppearance = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }));
  };

  const updateSecurity = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: HiOutlineUser },
    { id: 'notifications', name: 'Notifications', icon: HiOutlineBell },
    { id: 'appearance', name: 'Appearance', icon: HiOutlineSun },
    { id: 'security', name: 'Security', icon: HiOutlineShieldCheck }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
            transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          <HiOutlineSave className="h-5 w-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 flex items-center space-x-2 border-b-2 transition-colors duration-200
              ${activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl">
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={settings.profile.fullName}
                    onChange={(e) => updateProfile('fullName', e.target.value)}
                    className="pl-10 w-full border border-gray-200 dark:border-gray-700 rounded-lg py-2
                      focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Position
                </label>
                <div className="mt-1 relative">
                  <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={settings.profile.position}
                    onChange={(e) => updateProfile('position', e.target.value)}
                    className="pl-10 w-full border border-gray-200 dark:border-gray-700 rounded-lg py-2
                      focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1 relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateProfile('email', e.target.value)}
                    className="pl-10 w-full border border-gray-200 dark:border-gray-700 rounded-lg py-2
                      focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <div className="mt-1 relative">
                  <HiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    className="pl-10 w-full border border-gray-200 dark:border-gray-700 rounded-lg py-2
                      focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <HiOutlineMail className="h-6 w-6 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={() => toggleNotification('emailNotifications')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer 
                    dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                    after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <HiOutlinePhone className="h-6 w-6 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={() => toggleNotification('smsNotifications')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer 
                    dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                    after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <HiOutlineBell className="h-6 w-6 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Case Updates</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about case status changes</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.caseUpdates}
                    onChange={() => toggleNotification('caseUpdates')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer 
                    dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                    after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"
                  />
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {settings.appearance.darkMode ? (
                    <HiOutlineMoon className="h-6 w-6 text-gray-400" />
                  ) : (
                    <HiOutlineSun className="h-6 w-6 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode theme</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.appearance.darkMode}
                    onChange={(e) => updateAppearance('darkMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer 
                    dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                    after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"
                  />
                </label>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <HiOutlineGlobe className="h-6 w-6 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Language</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
                  </div>
                </div>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => updateAppearance('language', e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="English">English</option>
                  <option value="Amharic">Amharic</option>
                  <option value="Oromiffa">Oromiffa</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <HiOutlineLockClosed className="h-6 w-6 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => updateSecurity('twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer 
                    dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                    after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
                    after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"
                  />
                </label>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <HiOutlineCog className="h-6 w-6 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Session Timeout</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Set automatic logout time (minutes)</p>
                  </div>
                </div>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 