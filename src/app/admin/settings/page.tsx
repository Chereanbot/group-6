"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

interface SystemSettings {
  automaticUpdates: boolean;
  updateInterval: number;
  emailNotifications: boolean;
  workloadAlerts: boolean;
  maxCaseLoad: number;
  defaultOffice: string;
  language: string;
  timezone: string;
}

interface NotificationSettings {
  caseAssignments: boolean;
  caseUpdates: boolean;
  workloadAlerts: boolean;
  performanceReports: boolean;
  systemUpdates: boolean;
  emailDigest: 'never' | 'daily' | 'weekly' | 'monthly';
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
  ipWhitelist: string[];
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    automaticUpdates: true,
    updateInterval: 30,
    emailNotifications: true,
    workloadAlerts: true,
    maxCaseLoad: 50,
    defaultOffice: 'main',
    language: 'en',
    timezone: 'UTC',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    caseAssignments: true,
    caseUpdates: true,
    workloadAlerts: true,
    performanceReports: true,
    systemUpdates: true,
    emailDigest: 'daily',
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: [],
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      const data = await response.json();
      setSystemSettings(data.system);
      setNotificationSettings(data.notifications);
      setSecuritySettings(data.security);
    } catch (error) {
      toast.error('Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (
    type: 'system' | 'notifications' | 'security',
    settings: SystemSettings | NotificationSettings | SecuritySettings
  ) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-gray-500">Manage system configuration and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <CogIcon className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure general system settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="automaticUpdates">Automatic Updates</Label>
                    <Switch
                      id="automaticUpdates"
                      checked={systemSettings.automaticUpdates}
                      onCheckedChange={(checked) =>
                        setSystemSettings({ ...systemSettings, automaticUpdates: checked })
                      }
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Enable automatic system updates and maintenance
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="updateInterval">Update Interval (days)</Label>
                  <Input
                    id="updateInterval"
                    type="number"
                    value={systemSettings.updateInterval}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        updateInterval: parseInt(e.target.value),
                      })
                    }
                    min={1}
                    max={90}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCaseLoad">Maximum Case Load</Label>
                  <Input
                    id="maxCaseLoad"
                    type="number"
                    value={systemSettings.maxCaseLoad}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maxCaseLoad: parseInt(e.target.value),
                      })
                    }
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">System Language</Label>
                  <Select
                    value={systemSettings.language}
                    onValueChange={(value) =>
                      setSystemSettings({ ...systemSettings, language: value })
                    }
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={systemSettings.timezone}
                    onValueChange={(value) =>
                      setSystemSettings({ ...systemSettings, timezone: value })
                    }
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="CST">Central Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => saveSettings('system', systemSettings)}
                  disabled={loading}
                >
                  Save System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="caseAssignments">Case Assignments</Label>
                    <Switch
                      id="caseAssignments"
                      checked={notificationSettings.caseAssignments}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          caseAssignments: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="caseUpdates">Case Updates</Label>
                    <Switch
                      id="caseUpdates"
                      checked={notificationSettings.caseUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          caseUpdates: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="workloadAlerts">Workload Alerts</Label>
                    <Switch
                      id="workloadAlerts"
                      checked={notificationSettings.workloadAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          workloadAlerts: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="performanceReports">Performance Reports</Label>
                    <Switch
                      id="performanceReports"
                      checked={notificationSettings.performanceReports}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          performanceReports: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="systemUpdates">System Updates</Label>
                    <Switch
                      id="systemUpdates"
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          systemUpdates: checked,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailDigest">Email Digest Frequency</Label>
                    <Select
                      value={notificationSettings.emailDigest}
                      onValueChange={(value: 'never' | 'daily' | 'weekly' | 'monthly') =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailDigest: value,
                        })
                      }
                    >
                      <SelectTrigger id="emailDigest">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => saveSettings('notifications', notificationSettings)}
                  disabled={loading}
                >
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <Switch
                      id="twoFactorAuth"
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorAuth: checked,
                        })
                      }
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Require two-factor authentication for all admin accounts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                    min={5}
                    max={240}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        passwordExpiry: parseInt(e.target.value),
                      })
                    }
                    min={30}
                    max={365}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        loginAttempts: parseInt(e.target.value),
                      })
                    }
                    min={3}
                    max={10}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Input
                    id="ipWhitelist"
                    placeholder="Enter IP addresses (comma-separated)"
                    value={securitySettings.ipWhitelist.join(', ')}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        ipWhitelist: e.target.value.split(',').map((ip) => ip.trim()),
                      })
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Leave empty to allow all IP addresses
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => saveSettings('security', securitySettings)}
                  disabled={loading}
                >
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 