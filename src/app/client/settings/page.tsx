"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiOutlineMoon,
  HiOutlineTranslate,
  HiOutlineShieldCheck,
  HiOutlineKey,
  HiOutlineDeviceMobile
} from 'react-icons/hi';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection = ({ title, description, icon, children }: SettingsSectionProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
    <div className="pt-4 space-y-4">
      {children}
    </div>
  </div>
);

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    twoFactorAuth: true,
    language: 'English',
    timezone: 'UTC',
    autoSave: true,
    soundEffects: false
  });

  const handleSettingChange = (setting: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
      duration: 2000
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8 space-y-8"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SettingsSection
            title="Notifications"
            description="Configure how you want to be notified"
            icon={<HiOutlineBell className="w-6 h-6 text-blue-600" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Get notifications on your phone</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Appearance"
            description="Customize your interface"
            icon={<HiOutlineColorSwatch className="w-6 h-6 text-blue-600" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Dark Mode</p>
                  <p className="text-sm text-gray-500">Toggle dark color scheme</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Security"
            description="Manage your account security"
            icon={<HiOutlineShieldCheck className="w-6 h-6 text-blue-600" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title="Preferences"
            description="Set your preferences"
            icon={<HiOutlineCog className="w-6 h-6 text-blue-600" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Auto-save</p>
                  <p className="text-sm text-gray-500">Automatically save changes</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">Sound Effects</p>
                  <p className="text-sm text-gray-500">Play sounds for notifications</p>
                </div>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
                />
              </div>
            </div>
          </SettingsSection>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 
                     dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                     rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast({
                title: "Settings Saved",
                description: "All your settings have been saved successfully.",
                duration: 3000
              });
            }}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 
                     rounded-lg transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage; 