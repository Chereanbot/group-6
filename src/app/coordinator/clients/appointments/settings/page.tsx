"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  HiOutlineBell,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineTemplate,
  HiOutlineCalendar,
} from 'react-icons/hi';

interface NotificationTemplate {
  id: string;
  name: string;
  content: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
}

export default function AppointmentSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    automaticNotifications: true,
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    reminderTiming: {
      before: 24,
      frequency: 'once', // once, daily, custom
      customIntervals: [24, 12, 1], // hours before
    },
    priorityLevels: {
      urgent: true,
      high: true,
      medium: true,
      low: true,
    },
    templates: {
      confirmation: '',
      reminder: '',
      cancellation: '',
      rescheduling: '',
    },
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    blackoutDates: [] as string[],
    customRules: [] as string[],
  });

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    // Fetch settings from API
    fetchSettings();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/coordinator/notification-settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/notification-templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/coordinator/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your notification settings have been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Appointment Notification Settings
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Configure automatic notifications and reminders for client appointments
          </p>
        </div>
        <Button onClick={handleSaveSettings} size="lg">
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineBell className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="automatic-notifications">Automatic Notifications</Label>
              <Switch
                id="automatic-notifications"
                checked={settings.automaticNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, automaticNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailEnabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <Switch
                id="sms-notifications"
                checked={settings.smsEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, smsEnabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={settings.pushEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Reminder Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineClock className="h-5 w-5" />
              Reminder Timing
            </CardTitle>
            <CardDescription>
              Set when and how often to send reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Reminder Time</Label>
              <Select
                value={settings.reminderTiming.before.toString()}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    reminderTiming: { ...settings.reminderTiming, before: parseInt(value) }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour before</SelectItem>
                  <SelectItem value="2">2 hours before</SelectItem>
                  <SelectItem value="12">12 hours before</SelectItem>
                  <SelectItem value="24">24 hours before</SelectItem>
                  <SelectItem value="48">48 hours before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reminder Frequency</Label>
              <Select
                value={settings.reminderTiming.frequency}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    reminderTiming: { ...settings.reminderTiming, frequency: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="custom">Custom Intervals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Message Templates */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineTemplate className="h-5 w-5" />
              Notification Templates
            </CardTitle>
            <CardDescription>
              Customize messages for different notification types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Confirmation Template</Label>
                <Textarea
                  value={settings.templates.confirmation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, confirmation: e.target.value }
                    })
                  }
                  placeholder="Enter confirmation message template..."
                  className="h-32"
                />
              </div>
              <div>
                <Label>Reminder Template</Label>
                <Textarea
                  value={settings.templates.reminder}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, reminder: e.target.value }
                    })
                  }
                  placeholder="Enter reminder message template..."
                  className="h-32"
                />
              </div>
              <div>
                <Label>Cancellation Template</Label>
                <Textarea
                  value={settings.templates.cancellation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, cancellation: e.target.value }
                    })
                  }
                  placeholder="Enter cancellation message template..."
                  className="h-32"
                />
              </div>
              <div>
                <Label>Rescheduling Template</Label>
                <Textarea
                  value={settings.templates.rescheduling}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, rescheduling: e.target.value }
                    })
                  }
                  placeholder="Enter rescheduling message template..."
                  className="h-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineCalendar className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>
              Configure advanced notification rules and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Working Hours</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-sm text-gray-500">Start Time</Label>
                    <Input
                      type="time"
                      value={settings.workingHours.start}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workingHours: { ...settings.workingHours, start: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">End Time</Label>
                    <Input
                      type="time"
                      value={settings.workingHours.end}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workingHours: { ...settings.workingHours, end: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Priority Levels</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(settings.priorityLevels).map(([level, enabled]) => (
                    <div key={level} className="flex items-center justify-between">
                      <Label className="capitalize">{level}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            priorityLevels: { ...settings.priorityLevels, [level]: checked }
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 