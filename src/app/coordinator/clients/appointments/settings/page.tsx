"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  HiOutlineX,
} from 'react-icons/hi';
import { Badge } from "@/components/ui/badge";
import NotificationHistory from '@/components/NotificationHistory';

interface NotificationTemplate {
  id: string;
  name: string;
  content: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
}

export default function AppointmentSettingsPage() {
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState({
    automaticNotifications: true,
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    reminderTiming: {
      before: 24,
      frequency: 'once',
      customIntervals: [24, 12, 1],
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
  const [userId, setUserId] = useState<string>('');
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    // Fetch settings from API
    fetchSettings();
    fetchTemplates();
    // Fetch user info from local storage or context
    const storedUserId = localStorage.getItem('userId');
    const storedUserType = localStorage.getItem('userType');
    if (storedUserId && storedUserType) {
      setUserId(storedUserId);
      setUserType(storedUserType);
    }
    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/coordinator/notification-settings', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in again to view your settings.",
          });
          return;
        }
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notification settings.",
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/notification-templates', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in again to view templates.",
          });
          return;
        }
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notification templates.",
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/coordinator/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in again to save your settings.",
          });
          return;
        }
        throw new Error('Failed to save settings');
      }
      
      toast({
        title: "Settings Saved",
        description: "Your notification settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    }
  };

  const updateUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 relative">
      {/* Enhanced floating button for notification history */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed right-8 top-24 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant={showHistory ? "secondary" : "default"}
            className="flex items-center gap-3 shadow-lg hover:shadow-xl transition-all rounded-full px-6 py-6 relative overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={showHistory ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <HiOutlineBell className="h-6 w-6" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 400 }}
                >
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full animate-pulse"
                  >
                    {unreadCount}
                  </Badge>
                </motion.div>
              )}
            </motion.div>
            <motion.span
              initial={false}
              animate={showHistory ? { x: 5 } : { x: 0 }}
              className="font-medium whitespace-nowrap"
            >
              {showHistory ? 'Close History' : 'Notifications History'}
            </motion.span>
            {unreadCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-primary/5 dark:bg-primary/10"
                style={{ borderRadius: 9999 }}
              />
            )}
          </Button>
        </motion.div>
      </motion.div>

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

      {/* Enhanced Notification History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowHistory(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 30, 
                stiffness: 400,
                duration: 0.2 
              }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50">
                <div className="flex items-center gap-4">
                  <motion.div 
                    initial={{ rotate: -30, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="bg-primary/10 p-3 rounded-full"
                  >
                    <HiOutlineBell className="h-7 w-7 text-primary" />
                  </motion.div>
                  <div>
                    <motion.h2 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-2xl font-semibold"
                    >
                      Notification History
                    </motion.h2>
                    <motion.p 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      View and manage your notifications and messages
                    </motion.p>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowHistory(false)}
                  >
                    <HiOutlineX className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
              >
                <NotificationHistory userId={userId} userType={userType} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 