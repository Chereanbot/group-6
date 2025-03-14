"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  twoFactorEnabled: z.boolean(),
  sessionTimeout: z.number().min(5).max(1440), // in minutes
  securityQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
});

type SecuritySettingsValues = z.infer<typeof securitySchema>;

type Session = {
  id: string;
  userAgent: string;
  lastIpAddress: string;
  location: string | null;
  createdAt: string;
  updatedAt: string;
};

type SecurityLog = {
  eventType: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  severity: string;
  status: string;
};

export default function SecuritySettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const form = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      twoFactorEnabled: false,
      sessionTimeout: 60,
      securityQuestions: [],
    },
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/security");
      if (!response.ok) throw new Error("Failed to load security settings");
      
      const data = await response.json();
      setSecurityLogs(data.securityLogs);
      setSessions(data.sessions);
      form.reset({
        twoFactorEnabled: data.twoFactorEnabled,
        sessionTimeout: data.sessionTimeout,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: SecuritySettingsValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast({
        title: "Success",
        description: "Security settings updated successfully",
      });

      // Reset password fields
      form.reset({
        ...values,
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters long
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
            <FormField
              control={form.control}
              name="twoFactorEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Enable 2FA</FormLabel>
                    <FormDescription>
                      Add an extra layer of security to your account
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Session Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Session Settings</h3>
            <FormField
              control={form.control}
              name="sessionTimeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Timeout (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      max={1440}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Automatically log out after period of inactivity
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Active Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Active Sessions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.userAgent}</TableCell>
                    <TableCell>{session.location || 'Unknown'}</TableCell>
                    <TableCell>{new Date(session.updatedAt).toLocaleString()}</TableCell>
                    <TableCell>{session.lastIpAddress}</TableCell>
                  </TableRow>
                ))}
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No active sessions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Security Logs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Security Activity</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{log.eventType}</TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                        log.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {securityLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No recent security activity
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </CardContent>
  );
} 