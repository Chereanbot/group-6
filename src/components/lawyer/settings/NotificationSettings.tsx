"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { NotificationType } from "@prisma/client";

const notificationFormSchema = z.object({
  preferences: z.array(z.object({
    type: z.nativeEnum(NotificationType),
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
  })),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const notificationTypes = [
  {
    type: NotificationType.SERVICE_REQUEST,
    label: "Service Requests",
    description: "Notifications about new service requests and updates",
  },
  {
    type: NotificationType.DOCUMENT_UPLOAD,
    label: "Document Uploads",
    description: "Notifications when documents are uploaded or shared",
  },
  {
    type: NotificationType.PAYMENT,
    label: "Payments",
    description: "Payment confirmations and billing updates",
  },
  {
    type: NotificationType.APPOINTMENT,
    label: "Appointments",
    description: "Reminders about upcoming appointments and meetings",
  },
  {
    type: NotificationType.CHAT_MESSAGE,
    label: "Chat Messages",
    description: "New messages and chat notifications",
  },
  {
    type: NotificationType.SYSTEM_UPDATE,
    label: "System Updates",
    description: "Important system updates and announcements",
  },
  {
    type: NotificationType.TASK_ASSIGNED,
    label: "Task Assignments",
    description: "Notifications when tasks are assigned to you",
  },
  {
    type: NotificationType.DEADLINE_REMINDER,
    label: "Deadline Reminders",
    description: "Reminders about upcoming case deadlines",
  },
  {
    type: NotificationType.STATUS_UPDATE,
    label: "Status Updates",
    description: "Updates about case status changes",
  },
  {
    type: NotificationType.VERIFICATION,
    label: "Verifications",
    description: "Account and document verification notifications",
  },
];

export default function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      preferences: notificationTypes.map(type => ({
        type: type.type,
        email: true,
        sms: true,
        push: true,
        inApp: true,
      })),
    },
  });

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/lawyer/settings/notifications");
        if (!response.ok) throw new Error("Failed to load notification preferences");
        
        const data = await response.json();
        
        // Map the preferences to match form structure
        const formattedPreferences = notificationTypes.map(type => {
          const existingPref = data.preferences.find(p => p.type === type.type);
          return existingPref || {
            type: type.type,
            email: true,
            sms: true,
            push: true,
            inApp: true,
          };
        });

        form.reset({ preferences: formattedPreferences });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load notification preferences. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadPreferences();
  }, []);

  async function onSubmit(values: NotificationFormValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update notification preferences");

      toast({
        title: "Success",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CardContent className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            {notificationTypes.map((notificationType, index) => (
              <div key={notificationType.type} className="rounded-lg border p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium leading-none">
                      {notificationType.label}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {notificationType.description}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`preferences.${index}.email`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Email</FormLabel>
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
                      name={`preferences.${index}.sms`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>SMS</FormLabel>
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
                      name={`preferences.${index}.push`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>Push</FormLabel>
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
                      name={`preferences.${index}.inApp`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel>In-App</FormLabel>
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
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </CardContent>
  );
} 