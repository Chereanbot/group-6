"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';

interface AgentSettings {
  enableNotifications: boolean;
  notificationSound: boolean;
  checkInterval: number;
  autoRefresh: boolean;
  theme: 'light' | 'dark' | 'system';
}

export default function AgentSettings() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<AgentSettings>({
    enableNotifications: true,
    notificationSound: true,
    checkInterval: 5,
    autoRefresh: true,
    theme: 'system',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/coordinator/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/coordinator/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Agent Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Customize how the AI agent works and interacts with you
        </p>
      </div>

      <Separator />

      <div className="space-y-8">
        {/* Notifications Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications about agent activities
              </p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, enableNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notification Sound</Label>
              <p className="text-sm text-gray-500">
                Play a sound when receiving notifications
              </p>
            </div>
            <Switch
              checked={settings.notificationSound}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notificationSound: checked }))
              }
            />
          </div>
        </div>

        {/* Monitoring Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Monitoring</h3>
          
          <div className="space-y-2">
            <Label>Check Interval (minutes)</Label>
            <Input
              type="number"
              min="1"
              max="60"
              value={settings.checkInterval}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  checkInterval: parseInt(e.target.value) || 5,
                }))
              }
            />
            <p className="text-sm text-gray-500">
              How often should the agent check for updates
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Refresh</Label>
              <p className="text-sm text-gray-500">
                Automatically refresh data in the interface
              </p>
            </div>
            <Switch
              checked={settings.autoRefresh}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, autoRefresh: checked }))
              }
            />
          </div>
        </div>

        {/* Theme Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Appearance</h3>
          
          <div className="space-y-2">
            <Label>Theme</Label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={settings.theme}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  theme: e.target.value as 'light' | 'dark' | 'system',
                }))
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <p className="text-sm text-gray-500">
              Choose your preferred color theme
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}
