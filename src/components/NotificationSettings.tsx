import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface NotificationSettingsProps {
  userId: string;
  userType: 'client' | 'coordinator';
}

export default function NotificationSettings({ userId, userType }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    reminderBefore: 24, // hours
    reminderFrequency: 'daily', // daily, weekly
  });

  const handleSettingChange = async (setting: string, value: any) => {
    try {
      const response = await fetch(`/api/${userType}/notification-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          setting,
          value,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in again to update your settings.",
          });
          return;
        }
        throw new Error('Failed to update notification settings');
      }

      setSettings(prev => ({
        ...prev,
        [setting]: value,
      }));

      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Appointment Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            <Switch
              id="sms-notifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-before">Reminder Before (hours)</Label>
            <select
              id="reminder-before"
              className="w-full p-2 border rounded-md"
              value={settings.reminderBefore}
              onChange={(e) => handleSettingChange('reminderBefore', parseInt(e.target.value))}
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
            <select
              id="reminder-frequency"
              className="w-full p-2 border rounded-md"
              value={settings.reminderFrequency}
              onChange={(e) => handleSettingChange('reminderFrequency', e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 