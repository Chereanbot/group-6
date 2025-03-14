"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Bell } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Case {
  id: string;
  title: string;
  status: string;
  category: string;
  priority: string;
  clientId: string;
}

const formSchema = z.object({
  caseId: z.string({
    required_error: "Please select a case",
  }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum([
    "COURT_HEARING",
    "DOCUMENT_FILING",
    "CLIENT_MEETING",
    "COURT_FILING",
    "EVIDENCE_COLLECTION",
    "WITNESS_INTERVIEW",
    "SETTLEMENT_DISCUSSION",
    "DOCUMENT_REVIEW",
    "LEGAL_RESEARCH",
    "CLIENT_COMMUNICATION",
    "OTHER"
  ], {
    required_error: "Please select an activity type",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    required_error: "Please select a priority level",
  }),
  dueDate: z.date().optional(),
  courtDate: z.date().optional(),
  courtLocation: z.string().optional(),
  notifyClient: z.boolean().default(false),
  notifyAdmin: z.boolean().default(false),
  reminderBefore: z.enum(["1_HOUR", "3_HOURS", "1_DAY", "3_DAYS", "1_WEEK"]).optional(),
  additionalNotes: z.string().optional(),
});

export function CreateCaseActivity() {
  const [isLoading, setIsLoading] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [isCasesLoading, setIsCasesLoading] = useState(true);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      title: "",
      notifyClient: false,
      notifyAdmin: false,
    },
  });

  // Watch the activity type to show/hide relevant fields
  const activityType = form.watch("type");
  const isCourtRelated = activityType === "COURT_HEARING" || activityType === "COURT_FILING";

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch("/api/lawyer/cases");
        if (!response.ok) throw new Error("Failed to fetch cases");
        const data = await response.json();
        setCases(data.cases);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load cases. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsCasesLoading(false);
      }
    }

    fetchCases();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/cases/case-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create activity");
      }

      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "URGENT":
        return "bg-purple-100 text-purple-800";
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Group cases by status
  const groupedCases = cases.reduce((acc, case_) => {
    const status = case_.status.toUpperCase();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(case_);
    return acc;
  }, {} as Record<string, Case[]>);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
        {/* Case Selection */}
        <FormField
          control={form.control}
          name="caseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isCasesLoading ? "Loading cases..." : "Select a case"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isCasesLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading cases...
                    </SelectItem>
                  ) : cases.length > 0 ? (
                    Object.entries(groupedCases).map(([status, statusCases]) => (
                      <SelectGroup key={status}>
                        <SelectLabel className="px-2 py-1.5 text-sm font-semibold">
                          {status} Cases
                        </SelectLabel>
                        {statusCases.map((case_) => (
                          <SelectItem
                            key={case_.id}
                            value={case_.id}
                            className="flex items-center space-x-2"
                          >
                            <div className="flex flex-col space-y-1">
                              <span>{case_.title}</span>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="secondary"
                                  className={getStatusColor(case_.status)}
                                >
                                  {case_.status}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={getPriorityColor(case_.priority)}
                                >
                                  {case_.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {case_.category}
                                </Badge>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))
                  ) : (
                    <SelectItem value="no-cases" disabled>
                      No cases available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the case this activity belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Activity Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Activity title" {...field} />
              </FormControl>
              <FormDescription>
                A brief title describing the activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Activity Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the activity"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide detailed information about the activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Activity Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Court Related</SelectLabel>
                    <SelectItem value="COURT_HEARING">Court Hearing</SelectItem>
                    <SelectItem value="COURT_FILING">Court Filing</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Client Related</SelectLabel>
                    <SelectItem value="CLIENT_MEETING">Client Meeting</SelectItem>
                    <SelectItem value="CLIENT_COMMUNICATION">Client Communication</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Case Work</SelectLabel>
                    <SelectItem value="DOCUMENT_FILING">Document Filing</SelectItem>
                    <SelectItem value="EVIDENCE_COLLECTION">Evidence Collection</SelectItem>
                    <SelectItem value="WITNESS_INTERVIEW">Witness Interview</SelectItem>
                    <SelectItem value="SETTLEMENT_DISCUSSION">Settlement Discussion</SelectItem>
                    <SelectItem value="DOCUMENT_REVIEW">Document Review</SelectItem>
                    <SelectItem value="LEGAL_RESEARCH">Legal Research</SelectItem>
                  </SelectGroup>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of activity being recorded
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set the priority level for this activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Set a due date for the activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Court Date and Location (only shown for court-related activities) */}
        {isCourtRelated && (
          <>
            <FormField
              control={form.control}
              name="courtDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Court Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a court date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Set the court date for this activity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courtLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter court location" {...field} />
                  </FormControl>
                  <FormDescription>
                    Specify the court location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Notification Settings */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="notifyClient"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Notify Client</FormLabel>
                  <FormDescription>
                    Send a notification to the client about this activity
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
            name="notifyAdmin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Notify Admin</FormLabel>
                  <FormDescription>
                    Send a notification to the admin about this activity
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

        {/* Reminder Settings */}
        <FormField
          control={form.control}
          name="reminderBefore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Set reminder before the activity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1_HOUR">1 Hour Before</SelectItem>
                  <SelectItem value="3_HOURS">3 Hours Before</SelectItem>
                  <SelectItem value="1_DAY">1 Day Before</SelectItem>
                  <SelectItem value="3_DAYS">3 Days Before</SelectItem>
                  <SelectItem value="1_WEEK">1 Week Before</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set when to receive a reminder for this activity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Notes */}
        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes or comments"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add any additional information or notes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading || isCasesLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Activity
        </Button>
      </form>
    </Form>
  );
} 