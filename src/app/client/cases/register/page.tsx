"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineCheck,
  HiChevronRight,
  HiChevronLeft,
  HiOutlineX,
  HiOutlineOfficeBuilding,
  HiOutlineUser
} from 'react-icons/hi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Add office and coordinator types
interface Office {
  id: string;
  name: string;
  location: string;
  description: string;
  coordinators: Coordinator[];
}

interface Coordinator {
  id: string;
  fullName: string;
  type: string;
  specialties: string[];
  status: string;
}

// Form schema for case registration
const caseSchema = z.object({
  // Step 1: Basic Information
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.enum(['CIVIL', 'CRIMINAL', 'FAMILY', 'CORPORATE', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  description: z.string().min(20, 'Description must be at least 20 characters'),

  // Step 2: Office Selection
  officeId: z.string().min(1, 'Please select an office'),

  // Step 3: Personal Information (readonly)
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),

  // Step 4: Case Details
  incidentDate: z.string(),
  location: z.string().min(3, 'Location is required'),
  witnesses: z.array(z.string()).optional(),
  evidenceDescription: z.string().optional(),
  
  // Step 5: Additional Information
  preferredLanguage: z.string(),
  urgencyReason: z.string().optional(),
  additionalNotes: z.string().optional(),
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'BOTH']),
});

type CaseFormData = z.infer<typeof caseSchema>;

const steps = [
  {
    id: 'basic-info',
    name: 'Basic Information',
    icon: HiOutlineDocumentText,
    fields: ['title', 'category', 'priority', 'description']
  },
  {
    id: 'office-selection',
    name: 'Office Selection',
    icon: HiOutlineOfficeBuilding,
    fields: ['officeId']
  },
  {
    id: 'personal-info',
    name: 'Personal Information',
    icon: HiOutlineUserGroup,
    fields: ['fullName', 'email', 'phone']
  },
  {
    id: 'case-details',
    name: 'Case Details',
    icon: HiOutlineLocationMarker,
    fields: ['incidentDate', 'location', 'witnesses', 'evidenceDescription']
  },
  {
    id: 'additional-info',
    name: 'Additional Information',
    icon: HiOutlineCalendar,
    fields: ['preferredLanguage', 'urgencyReason', 'additionalNotes', 'preferredContactMethod']
  }
];

export default function CaseRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [isLoadingOffices, setIsLoadingOffices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingCase, setHasExistingCase] = useState(false);

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: '',
      category: 'CIVIL',
      priority: 'MEDIUM',
      description: '',
      fullName: '',
      email: '',
      phone: '',
      incidentDate: '',
      location: '',
      witnesses: [],
      evidenceDescription: '',
      preferredLanguage: 'English',
      urgencyReason: '',
      additionalNotes: '',
      preferredContactMethod: 'EMAIL'
    }
  });

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/client/profile');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error(data.message || 'Failed to fetch profile');
      }

      if (data.data) {
        // Debug: log the address object
        console.log('Fetched address from profile:', data.data.address);
        // Create profile data object with individual address components
        const profileData = {
          fullName: data.data.fullName || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
        };

        // Set form values and validate immediately
        await Promise.all(
          Object.entries(profileData).map(async ([key, value]) => {
            form.setValue(key as keyof typeof profileData, value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });
          })
        );

        // Force validation of all fields
        await form.trigger(['fullName', 'email', 'phone']);

        // Set preferred language if available
        if (data.data.preferredLanguage) {
          form.setValue('preferredLanguage', data.data.preferredLanguage, {
            shouldValidate: true
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOffices = async () => {
    try {
      setIsLoadingOffices(true);
      setError(null);
      const response = await fetch('/api/offices/client');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login'); // Redirect to login if unauthorized
          return;
        }
        throw new Error(data.message || 'Failed to fetch offices');
      }

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from server');
      }

      // Filter out offices with no active coordinators
      const availableOffices = data.data.filter(
        office => office.coordinators && office.coordinators.length > 0
      );

      if (availableOffices.length === 0) {
        toast({
          title: "Notice",
          description: "No offices with available coordinators found in your region.",
          variant: "default"
        });
      }

      setOffices(availableOffices);
    } catch (error) {
      console.error('Error fetching offices:', error);
      setError(error instanceof Error ? error.message : 'Failed to load offices');
      toast({
        title: "Error",
        description: "Failed to load offices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOffices(false);
    }
  };

  const checkExistingCases = async () => {
    try {
      const response = await fetch('/api/client/cases');
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const activeCase = data.data.find(
          case_ => case_.status !== 'CLOSED' && case_.status !== 'REJECTED'
        );

        if (activeCase) {
          setHasExistingCase(true);
          toast({
            title: "Active Case Found",
            description: "You already have an active case. Redirecting to case activity...",
            variant: "default",
            className: "bg-yellow-500 text-white"
          });
          
          // Redirect to case activity after a short delay
          setTimeout(() => {
            router.push('/client/cases/case-activity');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error checking existing cases:', error);
    }
  };

  useEffect(() => {
    // Check for existing cases first
    checkExistingCases();
    
    // Then fetch profile and offices data
    Promise.all([fetchUserProfile(), fetchOffices()]).catch(error => {
      console.error('Error initializing page:', error);
    });
  }, []);

  const handleOfficeSelect = (officeId: string) => {
    const office = offices.find(o => o.id === officeId);
    setSelectedOffice(office || null);
    form.setValue('officeId', officeId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Convert FileList to array for easier handling
    const fileArray = Array.from(files);
    
    // Validate each file
    const validFiles = fileArray.filter(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }

      // Check file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      if (!validTypes.includes(file.type)) {
        setUploadError(`${file.name} has invalid format. Allowed formats: PDF, DOC, DOCX, JPG, PNG`);
        return false;
      }

      return true;
    });

    // Add valid files to state
    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // Clear error after 5 seconds
    if (uploadError) {
      setTimeout(() => setUploadError(''), 5000);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    
    try {
      // Special handling for personal information step
      if (currentStep === 2) {
        const values = form.getValues();
        console.log('Personal info values:', values); // Debug log
        
        // Check if all required fields are filled
        const missingFields = ['fullName', 'email', 'phone']
          .filter(field => !values[field]?.trim());
        
        if (missingFields.length > 0) {
          toast({
            title: "Missing Information",
            description: `Please ensure all personal information fields are filled: ${missingFields.join(', ')}`,
            variant: "destructive"
          });
          return;
        }
        
        // If all fields are filled, proceed to next step
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        return;
      }

      // For other steps, validate the fields
      const isValid = await form.trigger(fields as any);
      
      if (isValid) {
        // Special handling for office selection step
        if (currentStep === 1 && !selectedOffice) {
          toast({
            title: "Required",
            description: "Please select an office to continue",
            variant: "destructive"
          });
          return;
        }
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      } else {
        // Show validation errors
        const errors = form.formState.errors;
        const errorMessages = Object.values(errors)
          .filter(error => error && error.message)
          .map(error => error.message);
        
        if (errorMessages.length > 0) {
          toast({
            title: "Validation Error",
            description: errorMessages[0],
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Error",
        description: "An error occurred while validating the form",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: CaseFormData) => {
    setIsSubmitting(true);
    try {
      // Upload files first if any
      let documentIds: string[] = [];
      if (uploadedFiles.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        uploadedFiles.forEach(file => {
          formData.append('files', file);
        });
        
        try {
          const uploadResponse = await fetch('/api/client/documents/upload', {
            method: 'POST',
            body: formData
          });
          
          const uploadResult = await uploadResponse.json();
          
          if (!uploadResponse.ok) {
            throw new Error(uploadResult.error || 'Failed to upload documents');
          }
          
          documentIds = uploadResult.data.documentIds;
          
          toast({
            title: "Success",
            description: "Documents uploaded successfully",
            variant: "default"
          });
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
          toast({
            title: "Error",
            description: "Failed to upload documents. Please try again.",
            variant: "destructive"
          });
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Submit case registration
      const response = await fetch('/api/client/cases/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          documentIds
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (result.errors) {
          const errorMessage = Array.isArray(result.errors) 
            ? result.errors.join('\n') 
            : result.message || 'Failed to register case';
          throw new Error(errorMessage);
        }
        throw new Error(result.message || 'Failed to register case');
      }

      toast({
        title: "Success",
        description: "Your case has been successfully registered.",
        variant: "default"
      });

      // Redirect to case details page
      router.push(`/client/cases/${result.data.id}`);
    } catch (error) {
      console.error('Error registering case:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register case. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasExistingCase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Redirecting to Case Activity...
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                You already have an active case. Please wait while we redirect you.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Register New Case
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Please provide the required information to register your case
          </p>
        </div>

        {/* Progress Steps */}
        <nav className="mb-8">
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.id} className={cn(
                "relative flex items-center justify-center p-4",
                "rounded-lg border",
                "transition-all duration-200 ease-in-out",
                currentStep === index
                  ? "border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20"
                  : index < currentStep
                  ? "border-green-600 bg-green-50 dark:border-green-400 dark:bg-green-900/20"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              )}>
                <div className="flex flex-col items-center space-y-2">
                  <span className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    currentStep === index
                      ? "bg-primary-600 text-white dark:bg-primary-400"
                      : index < currentStep
                      ? "bg-green-600 text-white dark:bg-green-400"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  )}>
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.name}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Form */}
        <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Step 1: Basic Information */}
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Case Title</Label>
                        <Input
                          id="title"
                          {...form.register('title')}
                          placeholder="Enter case title"
                          className={cn(
                            "w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
                            "focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400",
                            "placeholder-gray-400 dark:placeholder-gray-500",
                            "text-gray-900 dark:text-gray-100",
                            form.formState.errors.title ? 'border-red-500 dark:border-red-400' : ''
                          )}
                          aria-invalid={!!form.formState.errors.title}
                        />
                        {form.formState.errors.title && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{form.formState.errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="category">Case Category</Label>
                        <div>
                          <select
                            id="category"
                            {...form.register('category')}
                            className={cn(
                              "w-full rounded-md border bg-white dark:bg-gray-800",
                              "border-gray-300 dark:border-gray-600",
                              "text-gray-900 dark:text-gray-100",
                              "px-3 py-2 text-sm",
                              "focus:ring-primary-500 dark:focus:ring-primary-400",
                              "focus:border-primary-500 dark:focus:border-primary-400",
                              "shadow-sm"
                            )}
                          >
                            <option value="CIVIL" className="dark:bg-gray-800">Civil Law</option>
                            <option value="CRIMINAL" className="dark:bg-gray-800">Criminal Law</option>
                            <option value="FAMILY" className="dark:bg-gray-800">Family Law</option>
                            <option value="CORPORATE" className="dark:bg-gray-800">Corporate Law</option>
                            <option value="OTHER" className="dark:bg-gray-800">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority Level</Label>
                        <div>
                          <select
                            id="priority"
                            {...form.register('priority')}
                            className={cn(
                              "w-full rounded-md border bg-white dark:bg-gray-800",
                              "border-gray-300 dark:border-gray-600",
                              "text-gray-900 dark:text-gray-100",
                              "px-3 py-2 text-sm",
                              "focus:ring-primary-500 dark:focus:ring-primary-400",
                              "focus:border-primary-500 dark:focus:border-primary-400",
                              "shadow-sm"
                            )}
                          >
                            <option value="LOW" className="dark:bg-gray-800">Low</option>
                            <option value="MEDIUM" className="dark:bg-gray-800">Medium</option>
                            <option value="HIGH" className="dark:bg-gray-800">High</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Case Description</Label>
                        <Textarea
                          id="description"
                          {...form.register('description')}
                          placeholder="Provide a detailed description of your case"
                          rows={4}
                          className={cn(
                            "w-full bg-white dark:bg-gray-800",
                            "border-gray-300 dark:border-gray-600",
                            "focus:ring-primary-500 dark:focus:ring-primary-400",
                            "focus:border-primary-500 dark:focus:border-primary-400",
                            "placeholder-gray-400 dark:placeholder-gray-500",
                            "text-gray-900 dark:text-gray-100",
                            form.formState.errors.description ? 'border-red-500 dark:border-red-400' : ''
                          )}
                          aria-invalid={!!form.formState.errors.description}
                        />
                        {form.formState.errors.description && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{form.formState.errors.description.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Office Selection */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      {isLoadingOffices ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                      ) : error ? (
                        <div className="text-center py-12">
                          <p className="text-red-500 dark:text-red-400">{error}</p>
                          <Button
                            onClick={fetchOffices}
                            variant="outline"
                            className="mt-4"
                          >
                            Retry Loading Offices
                          </Button>
                        </div>
                      ) : offices.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 dark:text-gray-400">No offices available in your region.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          {offices.map((office) => (
                            <div
                              key={office.id}
                              className={cn(
                                "relative rounded-lg border p-6 cursor-pointer transition-all",
                                selectedOffice?.id === office.id
                                  ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20"
                                  : "border-gray-200 bg-white hover:border-primary-200 dark:border-gray-700 dark:bg-gray-800"
                              )}
                              onClick={() => handleOfficeSelect(office.id)}
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {office.name}
                                  </h3>
                                  {selectedOffice?.id === office.id && (
                                    <HiOutlineCheck className="h-5 w-5 text-primary-500 dark:text-primary-400" />
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {office.description}
                                </p>
                                
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Location:
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {office.location}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Available Coordinators:
                                  </p>
                                  <div className="space-y-2">
                                    {office.coordinators.map((coordinator) => (
                                      <div
                                        key={coordinator.id}
                                        className="flex items-center space-x-2 text-sm"
                                      >
                                        <HiOutlineUser className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">
                                          {coordinator.fullName}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                          ({coordinator.type})
                                        </span>
                                        <Badge variant="outline" className={
                                          coordinator.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }>
                                          {coordinator.status}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Personal Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          {...form.register('fullName')}
                          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-gray-900 dark:text-gray-100"
                          readOnly
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          {...form.register('email')}
                          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-gray-900 dark:text-gray-100"
                          readOnly
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          {...form.register('phone')}
                          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-gray-900 dark:text-gray-100"
                          readOnly
                        />
                      </div>

                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2">
                          <HiOutlineCheck className="h-5 w-5 text-green-500" />
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Your personal information has been automatically filled from your profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Case Details */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="incidentDate">Date of Incident</Label>
                        <Input
                          id="incidentDate"
                          type="date"
                          {...form.register('incidentDate')}
                          className={form.formState.errors.incidentDate ? 'border-red-500' : ''}
                          aria-invalid={!!form.formState.errors.incidentDate}
                        />
                        {form.formState.errors.incidentDate && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.incidentDate.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          {...form.register('location')}
                          placeholder="Enter incident location"
                          className={form.formState.errors.location ? 'border-red-500' : ''}
                          aria-invalid={!!form.formState.errors.location}
                        />
                        {form.formState.errors.location && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.location.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="evidenceDescription">Evidence Description</Label>
                        <Textarea
                          id="evidenceDescription"
                          {...form.register('evidenceDescription')}
                          placeholder="Describe any evidence you have"
                          rows={3}
                          className={form.formState.errors.evidenceDescription ? 'border-red-500' : ''}
                          aria-invalid={!!form.formState.errors.evidenceDescription}
                        />
                        {form.formState.errors.evidenceDescription && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.evidenceDescription.message}</p>
                        )}
                      </div>

                      <div>
                        <Label>Supporting Documents</Label>
                        <div className="mt-2">
                          <div className="flex items-center justify-center w-full">
                            <label className={cn(
                              "flex flex-col items-center justify-center w-full h-32",
                              "border-2 border-dashed rounded-lg cursor-pointer",
                              "bg-gray-50 dark:bg-gray-800",
                              "border-gray-300 dark:border-gray-600",
                              "hover:bg-gray-100 dark:hover:bg-gray-700",
                              "transition-colors duration-200"
                            )}>
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <HiOutlinePhotograph className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                multiple
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                            </label>
                          </div>

                          {uploadError && (
                            <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                              {uploadError}
                            </p>
                          )}

                          {uploadedFiles.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                                Uploaded Files:
                              </h4>
                              <ul className="space-y-2">
                                {uploadedFiles.map((file, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <HiOutlineDocumentText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {file.name}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(index)}
                                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                    >
                                      <HiOutlineX className="w-5 h-5" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Additional Information */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="preferredLanguage">Preferred Language</Label>
                        <div>
                          <select
                            id="preferredLanguage"
                            {...form.register('preferredLanguage')}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="English">English</option>
                            <option value="Amharic">Amharic</option>
                            <option value="Oromiffa">Oromiffa</option>
                            <option value="Tigrigna">Tigrigna</option>
                          </select>
                          {form.formState.errors.preferredLanguage && (
                            <p className="mt-1 text-sm text-red-500">{form.formState.errors.preferredLanguage.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="urgencyReason">Reason for Urgency</Label>
                        <Textarea
                          id="urgencyReason"
                          {...form.register('urgencyReason')}
                          placeholder="If your case is urgent, please explain why"
                          rows={3}
                          className={form.formState.errors.urgencyReason ? 'border-red-500' : ''}
                          aria-invalid={!!form.formState.errors.urgencyReason}
                        />
                        {form.formState.errors.urgencyReason && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.urgencyReason.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                        <div>
                          <select
                            id="preferredContactMethod"
                            {...form.register('preferredContactMethod')}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="EMAIL">Email</option>
                            <option value="PHONE">Phone</option>
                            <option value="BOTH">Both Email and Phone</option>
                          </select>
                          {form.formState.errors.preferredContactMethod && (
                            <p className="mt-1 text-sm text-red-500">{form.formState.errors.preferredContactMethod.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="additionalNotes">Additional Notes</Label>
                        <Textarea
                          id="additionalNotes"
                          {...form.register('additionalNotes')}
                          placeholder="Any additional information you'd like to provide"
                          rows={4}
                          className={form.formState.errors.additionalNotes ? 'border-red-500' : ''}
                          aria-invalid={!!form.formState.errors.additionalNotes}
                        />
                        {form.formState.errors.additionalNotes && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.additionalNotes.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    <HiChevronLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    Next
                    <HiChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <HiOutlineCheck className="h-5 w-5 mr-2" />
                        Submit Case
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
} 