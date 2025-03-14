"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Upload, X, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { AppealStatus } from "@prisma/client";
import { useDropzone } from "react-dropzone";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z.object({
  caseId: z.string().min(1, "Please select a case"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.nativeEnum(AppealStatus).optional(),
  hearingDate: z.date().optional(),
  documents: z.array(z.object({
    title: z.string().min(1, "Document title is required"),
    path: z.string().min(1, "Document path is required"),
  })).optional(),
});

interface Case {
  id: string;
  title: string;
  status: string;
}

interface FileUpload {
  title: string;
  file: File | null;
  progress?: number;
  error?: string;
  path?: string;
}

interface Appeal {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: string;
  hearingDate?: Date;
  documents: {
    title: string;
    path: string;
  }[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

export function CreateAppeal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appealId = searchParams.get('id');
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialAppeal, setInitialAppeal] = useState<Appeal | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      documents: [],
    },
  });

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentUploads, setCurrentUploads] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCases();
    if (appealId) {
      fetchAppealDetails(appealId);
    }
  }, [appealId]);

  async function fetchCases() {
    try {
      const response = await fetch("/api/lawyer/cases");
      if (!response.ok) throw new Error("Failed to fetch cases");

      const data = await response.json();
      setCases(data.cases);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cases. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function fetchAppealDetails(id: string) {
    try {
      setLoading(true);
      const response = await fetch(`/api/lawyer/cases/appeals/${id}`);
      if (!response.ok) throw new Error("Failed to fetch appeal details");

      const appeal = await response.json();
      setInitialAppeal(appeal);
      setIsEditMode(true);

      // Set form values
      form.reset({
        caseId: appeal.caseId,
        title: appeal.title,
        description: appeal.description,
        status: appeal.status as AppealStatus,
        hearingDate: appeal.hearingDate ? new Date(appeal.hearingDate) : undefined,
      });

      // Set existing documents
      if (appeal.documents?.length) {
        const existingDocs = appeal.documents.map(doc => ({
          title: doc.title,
          file: null as any, // We don't need the file object for existing docs
          progress: 100,
          path: doc.path,
        }));
        setCurrentUploads(existingDocs);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appeal details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(rejection => {
        if (rejection.size > MAX_FILE_SIZE) {
          return `${rejection.file.name} is too large. Maximum size is 10MB.`;
        }
        return `${rejection.file.name} is not a supported file type.`;
      });
      setUploadError(errors.join('\n'));
      return;
    }

    // Handle accepted files
    const newUploads = acceptedFiles.map(file => ({
      title: file.name,
      file,
      progress: 0,
    }));

    setCurrentUploads(prev => [...prev, ...newUploads]);
    setUploadError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeUpload = (index: number) => {
    setCurrentUploads(prev => prev.filter((_, i) => i !== index));
  };

  const simulateProgress = (index: number) => {
    const interval = setInterval(() => {
      setCurrentUploads(prev => {
        const newUploads = [...prev];
        if (newUploads[index] && (newUploads[index].progress ?? 0) < 90) {
          newUploads[index] = {
            ...newUploads[index],
            progress: (newUploads[index].progress ?? 0) + 10
          };
        }
        return newUploads;
      });
    }, 200);

    return interval;
  };

  async function handleUpdate(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const intervals: NodeJS.Timeout[] = [];

      // Upload new files first
      const newUploads = currentUploads.filter(upload => upload.file);
      const uploadPromises = newUploads.map(async (upload, index) => {
        try {
          const interval = simulateProgress(index);
          intervals.push(interval);

          const formData = new FormData();
          formData.append('file', upload.file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload file');
          }

          const data = await response.json();
          setCurrentUploads(prev => {
            const newUploads = [...prev];
            if (newUploads[index]) {
              newUploads[index] = {
                ...newUploads[index],
                progress: 100,
                path: data.path,
              };
            }
            return newUploads;
          });

          return {
            title: upload.title,
            path: data.path,
          };
        } catch (error) {
          setCurrentUploads(prev => {
            const newUploads = [...prev];
            if (newUploads[index]) {
              newUploads[index] = {
                ...newUploads[index],
                error: error instanceof Error ? error.message : 'Failed to upload'
              };
            }
            return newUploads;
          });
          throw error;
        } finally {
          clearInterval(intervals[index]);
        }
      });

      // Get existing documents that weren't removed
      const existingDocs = currentUploads
        .filter(upload => !upload.file && upload.path)
        .map(upload => ({
          title: upload.title,
          path: upload.path,
        }));

      const newDocs = await Promise.all(uploadPromises);
      const allDocuments = [...existingDocs, ...newDocs];

      const response = await fetch(`/api/lawyer/cases/appeals/${appealId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          documents: allDocuments,
        }),
      });

      if (!response.ok) throw new Error("Failed to update appeal");

      toast({
        title: "Success",
        description: "Appeal updated successfully",
      });

      router.push('/lawyer/cases/appeals');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appeal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      const response = await fetch(`/api/lawyer/cases/appeals/${appealId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete appeal");

      toast({
        title: "Success",
        description: "Appeal deleted successfully",
      });

      router.push('/lawyer/cases/appeals');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appeal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      // Handle file uploads first
      const uploadPromises = fileUploads.map(async (upload, index) => {
        if (!upload.file || upload.path) return upload;
        
        const formData = new FormData();
        formData.append("file", upload.file);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload file ${upload.title}`);
        }
        
        const data = await response.json();
        return { ...upload, path: data.path };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const documents = uploadedFiles
        .filter(file => file.path)
        .map(({ title, path }) => ({ title, path }));

      const response = await fetch(`/api/lawyer/cases/appeals${appealId ? `?id=${appealId}` : ''}`, {
        method: appealId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          documents,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.pendingAppealId) {
          // If there's already a pending appeal
          toast({
            title: "Cannot Submit Appeal",
            description: data.error,
            variant: "destructive",
          });
          
          // Redirect to the appeals list after 3 seconds
          setTimeout(() => {
            router.push("/lawyer/cases/appeals");
          }, 3000);
          
          return;
        }
        throw new Error(data.error || "Failed to submit appeal");
      }

      toast({
        title: "Success",
        description: data.message,
      });

      // Show a more detailed success message
      toast({
        title: "Next Steps",
        description: "Your appeal request has been submitted and is now pending review. You will be notified once the law school reviews your appeal.",
      });

      // Clear form and redirect to list after successful submission
      if (data.redirectToList) {
        setTimeout(() => {
          router.push("/lawyer/cases/appeals");
        }, 2000);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit appeal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isEditMode ? 'Edit Appeal' : 'File New Appeal'}
        </h2>
        {isEditMode && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Appeal</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the appeal
                  and all its associated documents.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
          <FormField
            control={form.control}
            name="caseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Case</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cases.map((case_) => (
                      <SelectItem key={case_.id} value={case_.id}>
                        {case_.title}
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appeal Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter appeal title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the grounds for appeal"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(AppealStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
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
            name="hearingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hearing Date (Optional)</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Supporting Documents</FormLabel>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      Drag & drop files here, or click to select files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (Max size: 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <p>{uploadError}</p>
              </div>
            )}

            <div className="grid gap-4">
              {currentUploads.map((upload, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {upload.title}
                    </p>
                    {upload.progress !== undefined && !upload.error && (
                      <div className="space-y-1">
                        <Progress value={upload.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground">
                          {upload.progress === 100 ? 'Uploaded' : 'Uploading...'}
                        </p>
                      </div>
                    )}
                    {upload.error && (
                      <p className="text-xs text-destructive">{upload.error}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeUpload(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {appealId ? "Update Appeal" : "Submit Appeal Request"}
            </Button>
            {!appealId && (
              <p className="text-sm text-muted-foreground">
                Note: You can only have one pending appeal request at a time.
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
} 