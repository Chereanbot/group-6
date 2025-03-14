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
import { Textarea } from "@/components/ui/textarea";

const documentSchema = z.object({
  storage: z.object({
    defaultLocation: z.enum(['LOCAL', 'CLOUD', 'HYBRID']),
    autoBackup: z.boolean(),
    backupFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    retentionPeriod: z.number(),
  }),
  templates: z.array(z.object({
    name: z.string(),
    category: z.enum(['CONTRACT', 'LETTER', 'PLEADING', 'MOTION', 'OTHER']),
    content: z.string(),
    isDefault: z.boolean(),
    tags: z.array(z.string()),
  })),
  naming: z.object({
    convention: z.string(),
    autoIncrement: z.boolean(),
    dateFormat: z.string(),
    includeCategory: z.boolean(),
    includeClient: z.boolean(),
  }),
  versioning: z.object({
    enabled: z.boolean(),
    maxVersions: z.number().min(1).max(100),
    autoSaveInterval: z.number(),
    keepDrafts: z.boolean(),
  }),
  sharing: z.object({
    defaultPermission: z.enum(['VIEW', 'EDIT', 'NONE']),
    requireApproval: z.boolean(),
    watermark: z.boolean(),
    expiryDays: z.number().optional(),
  }),
});

type DocumentSettingsValues = z.infer<typeof documentSchema>;

export default function DocumentSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DocumentSettingsValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      storage: {
        defaultLocation: 'CLOUD',
        autoBackup: true,
        backupFrequency: 'DAILY',
        retentionPeriod: 365,
      },
      templates: [],
      naming: {
        convention: '[CATEGORY]-[DATE]-[CLIENT]-[COUNTER]',
        autoIncrement: true,
        dateFormat: 'YYYY-MM-DD',
        includeCategory: true,
        includeClient: true,
      },
      versioning: {
        enabled: true,
        maxVersions: 10,
        autoSaveInterval: 5,
        keepDrafts: true,
      },
      sharing: {
        defaultPermission: 'VIEW',
        requireApproval: true,
        watermark: true,
        expiryDays: 30,
      },
    },
  });

  useEffect(() => {
    loadDocumentSettings();
  }, []);

  const loadDocumentSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/documents");
      if (!response.ok) throw new Error("Failed to load document settings");
      
      const data = await response.json();
      form.reset(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load document settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: DocumentSettingsValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast({
        title: "Success",
        description: "Document settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document settings",
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
          {/* Storage Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Storage Settings</h3>
            <FormField
              control={form.control}
              name="storage.defaultLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Storage Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOCAL">Local Storage</SelectItem>
                      <SelectItem value="CLOUD">Cloud Storage</SelectItem>
                      <SelectItem value="HYBRID">Hybrid Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storage.autoBackup"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Auto Backup</FormLabel>
                    <FormDescription>
                      Automatically backup documents
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
              name="storage.backupFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backup Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select backup frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Document Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Document Templates</h3>
            {form.watch('templates').map((_, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-lg">
                <FormField
                  control={form.control}
                  name={`templates.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`templates.${index}.category`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                          <SelectItem value="LETTER">Letter</SelectItem>
                          <SelectItem value="PLEADING">Pleading</SelectItem>
                          <SelectItem value="MOTION">Motion</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`templates.${index}.content`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const templates = form.getValues('templates');
                form.setValue('templates', [
                  ...templates,
                  { name: '', category: 'OTHER', content: '', isDefault: false, tags: [] },
                ]);
              }}
            >
              Add Template
            </Button>
          </div>

          <Separator />

          {/* Naming Convention */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Naming Convention</h3>
            <FormField
              control={form.control}
              name="naming.convention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Naming Pattern</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Use [CATEGORY], [DATE], [CLIENT], [COUNTER] as placeholders
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="naming.autoIncrement"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Auto Increment</FormLabel>
                    <FormDescription>
                      Automatically increment counter in file names
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

          {/* Version Control */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Version Control</h3>
            <FormField
              control={form.control}
              name="versioning.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Enable Version Control</FormLabel>
                    <FormDescription>
                      Track changes and maintain document versions
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
              name="versioning.maxVersions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Versions</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="versioning.autoSaveInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auto-save Interval (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Sharing Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sharing Settings</h3>
            <FormField
              control={form.control}
              name="sharing.defaultPermission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Permission</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default permission" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VIEW">View Only</SelectItem>
                      <SelectItem value="EDIT">Edit</SelectItem>
                      <SelectItem value="NONE">No Access</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sharing.requireApproval"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Require Approval</FormLabel>
                    <FormDescription>
                      Require approval for document access
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
              name="sharing.watermark"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Add Watermark</FormLabel>
                    <FormDescription>
                      Add watermark to shared documents
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
              name="sharing.expiryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Expiry (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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