"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { mockUsers } from "@/app/lawyer/compliance/audit/mockData";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  type: z.enum(['INTERNAL', 'EXTERNAL', 'REGULATORY', 'CLIENT', 'FINANCIAL', 'OPERATIONAL']),
  category: z.enum([
    'CASE_MANAGEMENT',
    'CLIENT_CONFIDENTIALITY',
    'DOCUMENT_RETENTION',
    'FINANCIAL_COMPLIANCE',
    'ETHICS',
    'DATA_PROTECTION',
    'PROFESSIONAL_CONDUCT'
  ]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Due date must be in the future",
  }),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  assignedTo: z.string().min(1, "Please select an assignee"),
});

type FormValues = z.infer<typeof formSchema>;

const AUDIT_OPTIONS = {
  type: [
    { value: 'INTERNAL', label: 'Internal' },
    { value: 'EXTERNAL', label: 'External' },
    { value: 'REGULATORY', label: 'Regulatory' },
    { value: 'CLIENT', label: 'Client' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'OPERATIONAL', label: 'Operational' },
  ],
  category: [
    { value: 'CASE_MANAGEMENT', label: 'Case Management' },
    { value: 'CLIENT_CONFIDENTIALITY', label: 'Client Confidentiality' },
    { value: 'DOCUMENT_RETENTION', label: 'Document Retention' },
    { value: 'FINANCIAL_COMPLIANCE', label: 'Financial Compliance' },
    { value: 'ETHICS', label: 'Ethics' },
    { value: 'DATA_PROTECTION', label: 'Data Protection' },
    { value: 'PROFESSIONAL_CONDUCT', label: 'Professional Conduct' },
  ],
  priority: [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ],
} as const;

export function NewAuditDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      dueDate: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Add API call here
      console.log('Form data:', data);
      toast.success("Audit created successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create audit");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Audit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Audit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AUDIT_OPTIONS.type.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
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
                        {AUDIT_OPTIONS.category.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of the audit"
                      className="resize-none"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AUDIT_OPTIONS.priority.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Audit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 