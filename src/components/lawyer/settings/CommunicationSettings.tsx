"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const communicationSettingsSchema = z.object({
  email: z.object({
    signature: z.string(),
    replyTo: z.string().email().optional(),
    ccAddresses: z.array(z.string().email()),
    bccAddresses: z.array(z.string().email()),
    defaultTemplate: z.string(),
    followUpReminders: z.boolean(),
    followUpDays: z.number().min(1),
  }),
  messaging: z.object({
    availabilityStatus: z.enum(['ONLINE', 'AWAY', 'BUSY', 'OFFLINE']),
    autoReply: z.boolean(),
    autoReplyMessage: z.string(),
    deliveryReceipts: z.boolean(),
    readReceipts: z.boolean(),
  }),
  clientCommunication: z.object({
    preferredMethod: z.enum(['EMAIL', 'PHONE', 'SMS', 'PORTAL']),
    responseTimeLimit: z.number(),
    autoResponseEnabled: z.boolean(),
    autoResponseMessage: z.string(),
    followUpSchedule: z.array(z.object({
      days: z.number(),
      message: z.string(),
    })),
  }),
  autoResponders: z.array(z.object({
    name: z.string(),
    trigger: z.enum(['OUT_OF_OFFICE', 'AFTER_HOURS', 'VACATION', 'CUSTOM']),
    message: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    active: z.boolean(),
  })),
  templates: z.array(z.object({
    name: z.string(),
    subject: z.string(),
    content: z.string(),
    category: z.enum(['GENERAL', 'FOLLOW_UP', 'MEETING', 'BILLING', 'LEGAL']),
    variables: z.array(z.string()),
    isDefault: z.boolean(),
  })),
});

type CommunicationSettingsValues = z.infer<typeof communicationSettingsSchema>;

export default function CommunicationSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CommunicationSettingsValues>({
    resolver: zodResolver(communicationSettingsSchema),
    defaultValues: {
      email: {
        signature: "",
        ccAddresses: [],
        bccAddresses: [],
        defaultTemplate: "",
        followUpReminders: true,
        followUpDays: 3,
      },
      messaging: {
        availabilityStatus: "ONLINE",
        autoReply: false,
        autoReplyMessage: "",
        deliveryReceipts: true,
        readReceipts: true,
      },
      clientCommunication: {
        preferredMethod: "EMAIL",
        responseTimeLimit: 24,
        autoResponseEnabled: true,
        autoResponseMessage: "Thank you for your message. I will respond within 24 hours.",
        followUpSchedule: [
          { days: 3, message: "First follow-up" },
          { days: 7, message: "Second follow-up" },
        ],
      },
      autoResponders: [],
      templates: [],
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/communication");
      if (!response.ok) throw new Error("Failed to load settings");
      
      const data = await response.json();
      form.reset(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load communication settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: CommunicationSettingsValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/communication", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast({
        title: "Success",
        description: "Communication settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update communication settings",
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
          {/* Email Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Email Settings</h3>
            <FormField
              control={form.control}
              name="email.signature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Signature</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Your professional email signature
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email.followUpReminders"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Follow-up Reminders</FormLabel>
                    <FormDescription>
                      Enable automatic follow-up reminders
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

          {/* Messaging Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Messaging Settings</h3>
            <FormField
              control={form.control}
              name="messaging.availabilityStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="AWAY">Away</SelectItem>
                      <SelectItem value="BUSY">Busy</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="messaging.autoReply"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Auto Reply</FormLabel>
                    <FormDescription>
                      Enable automatic replies when you're unavailable
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

          {/* Client Communication Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Client Communication</h3>
            <FormField
              control={form.control}
              name="clientCommunication.preferredMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Communication Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PHONE">Phone</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="PORTAL">Client Portal</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientCommunication.responseTimeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Time Limit (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximum time to respond to client messages
                  </FormDescription>
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