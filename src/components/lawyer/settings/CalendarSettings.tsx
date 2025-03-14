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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const calendarSchema = z.object({
  workingHours: z.object({
    monday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    tuesday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    wednesday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    thursday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    friday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    saturday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
    sunday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
  }),
  meetingPreferences: z.object({
    defaultDuration: z.number().min(15).max(480),
    bufferTime: z.number().min(0).max(60),
    autoAccept: z.boolean(),
    defaultLocation: z.enum(['OFFICE', 'VIRTUAL', 'CLIENT_LOCATION']),
    virtualMeetingProvider: z.enum(['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS']).optional(),
  }),
  reminders: z.object({
    defaultReminder: z.number().min(5),
    additionalReminders: z.array(z.number()),
    notificationMethods: z.array(z.enum(['EMAIL', 'SMS', 'PUSH'])),
  }),
  integrations: z.object({
    googleCalendar: z.boolean(),
    outlookCalendar: z.boolean(),
    appleCalendar: z.boolean(),
  }),
  availability: z.object({
    bookingWindow: z.object({
      min: z.number(),
      max: z.number(),
    }),
    unavailableDates: z.array(z.string()),
  }),
});

type CalendarSettingsValues = z.infer<typeof calendarSchema>;

export default function CalendarSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CalendarSettingsValues>({
    resolver: zodResolver(calendarSchema),
    defaultValues: {
      workingHours: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
      },
      meetingPreferences: {
        defaultDuration: 60,
        bufferTime: 15,
        autoAccept: false,
        defaultLocation: 'OFFICE',
      },
      reminders: {
        defaultReminder: 15,
        additionalReminders: [60, 1440],
        notificationMethods: ['EMAIL', 'PUSH'],
      },
      integrations: {
        googleCalendar: false,
        outlookCalendar: false,
        appleCalendar: false,
      },
      availability: {
        bookingWindow: {
          min: 1,
          max: 30,
        },
        unavailableDates: [],
      },
    },
  });

  useEffect(() => {
    loadCalendarSettings();
  }, []);

  const loadCalendarSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/calendar");
      if (!response.ok) throw new Error("Failed to load calendar settings");
      
      const data = await response.json();
      form.reset(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calendar settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: CalendarSettingsValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast({
        title: "Success",
        description: "Calendar settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update calendar settings",
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
          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Working Hours</h3>
            {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((day) => (
              <div key={day} className="space-y-4">
                <h4 className="capitalize">{day}</h4>
                {(form.watch(`workingHours.${day}`) || []).map((_, index) => (
                  <div key={index} className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name={`workingHours.${day}.${index}.start` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={field.value || ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`workingHours.${day}.${index}.end` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} value={field.value || ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Separator />

          {/* Meeting Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Meeting Preferences</h3>
            <FormField
              control={form.control}
              name="meetingPreferences.defaultDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={15}
                      max={480}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meetingPreferences.bufferTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buffer Time (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meetingPreferences.defaultLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OFFICE">Office</SelectItem>
                      <SelectItem value="VIRTUAL">Virtual</SelectItem>
                      <SelectItem value="CLIENT_LOCATION">Client Location</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {form.watch("meetingPreferences.defaultLocation") === "VIRTUAL" && (
              <FormField
                control={form.control}
                name="meetingPreferences.virtualMeetingProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Virtual Meeting Provider</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ZOOM">Zoom</SelectItem>
                        <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                        <SelectItem value="MICROSOFT_TEAMS">Microsoft Teams</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </div>

          <Separator />

          {/* Reminders */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Reminders</h3>
            <FormField
              control={form.control}
              name="reminders.defaultReminder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Reminder (minutes before)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reminders.notificationMethods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Methods</FormLabel>
                  <div className="space-y-2">
                    {(['EMAIL', 'SMS', 'PUSH'] as const).map((method) => (
                      <FormItem key={method} className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value.includes(method)}
                            onChange={(e) => {
                              const newValue = e.target.checked
                                ? [...field.value, method as "EMAIL" | "SMS" | "PUSH"]
                                : field.value.filter((v) => v !== method);
                              field.onChange(newValue);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="capitalize">{method.toLowerCase()}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Calendar Integrations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Calendar Integrations</h3>
            <FormField
              control={form.control}
              name="integrations.googleCalendar"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Google Calendar</FormLabel>
                    <FormDescription>
                      Sync with Google Calendar
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
            <FormField
              control={form.control}
              name="integrations.outlookCalendar"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Outlook Calendar</FormLabel>
                    <FormDescription>
                      Sync with Outlook Calendar
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </CardContent>
  );
} 