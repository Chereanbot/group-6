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
  HiOutlineX
} from 'react-icons/hi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Form schema for case registration
const caseSchema = z.object({
  // Step 1: Basic Information
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.enum(['CIVIL', 'CRIMINAL', 'FAMILY', 'CORPORATE', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  description: z.string().min(20, 'Description must be at least 20 characters'),

  // Step 2: Personal Information
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(5, 'Address is required'),

  // Step 3: Case Details
  incidentDate: z.string(),
  location: z.string().min(3, 'Location is required'),
  witnesses: z.array(z.string()).optional(),
  evidenceDescription: z.string().optional(),
  
  // Step 4: Additional Information
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
    id: 'personal-info',
    name: 'Personal Information',
    icon: HiOutlineUserGroup,
    fields: ['fullName', 'email', 'phone', 'address']
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
      address: '',
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

  const fetchClientInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/client/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Raw API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch client information');
      }

      // Check if data exists and has the user property
      if (data && data.user) {
        const userData = data.user;
        console.log('User Data:', userData);

        // Set form values with fallbacks
        form.setValue('fullName', userData.fullName || '');
        form.setValue('email', userData.email || '');
        form.setValue('phone', userData.phone || '');
        form.setValue('address', userData.address || '');

        console.log('Form values set:', {
          fullName: form.getValues('fullName'),
          email: form.getValues('email'),
          phone: form.getValues('phone'),
          address: form.getValues('address')
        });
      } else {
        console.log('No user data in response:', data);
        toast({
          title: "Notice",
          description: "Could not load your information. Please fill in the details manually.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
      toast({
        title: "Error",
        description: "Failed to load your information. Please fill in the details manually.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientInfo();
  }, []);

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
    const isValid = await form.trigger(fields as any);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      // Show validation errors
      const errors = form.formState.errors;
      const errorMessages = Object.values(errors).map(error => error.message);
      if (errorMessages.length > 0) {
        toast({
          title: "Validation Error",
          description: errorMessages[0],
          variant: "destructive"
        });
      }
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
        throw new Error(result.error || 'Failed to register case');
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

                  {/* Step 2: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName" className="text-gray-900 dark:text-gray-100">Full Name</Label>
                        <Input
                          id="fullName"
                          {...form.register('fullName')}
                          placeholder="Enter your full name"
                          className={cn(
                            "w-full bg-white dark:bg-gray-800",
                            "text-gray-900 dark:text-gray-100",
                            "border-gray-300 dark:border-gray-600",
                            "focus:ring-primary-500 dark:focus:ring-primary-400",
                            "focus:border-primary-500 dark:focus:border-primary-400",
                            form.formState.errors.fullName ? 'border-red-500' : ''
                          )}
                        />
                        {form.formState.errors.fullName && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register('email')}
                          placeholder="Enter your email address"
                          className={cn(
                            "w-full bg-white dark:bg-gray-800",
                            "text-gray-900 dark:text-gray-100",
                            "border-gray-300 dark:border-gray-600",
                            "focus:ring-primary-500 dark:focus:ring-primary-400",
                            "focus:border-primary-500 dark:focus:border-primary-400",
                            form.formState.errors.email ? 'border-red-500' : ''
                          )}
                        />
                        {form.formState.errors.email && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-gray-900 dark:text-gray-100">Phone Number</Label>
                        <Input
                          id="phone"
                          {...form.register('phone')}
                          placeholder="Enter your phone number"
                          className={cn(
                            "w-full bg-white dark:bg-gray-800",
                            "text-gray-900 dark:text-gray-100",
                            "border-gray-300 dark:border-gray-600",
                            "focus:ring-primary-500 dark:focus:ring-primary-400",
                            "focus:border-primary-500 dark:focus:border-primary-400",
                            form.formState.errors.phone ? 'border-red-500' : ''
                          )}
                        />
                        {form.formState.errors.phone && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-gray-900 dark:text-gray-100">Full Address</Label>
                        <Textarea
                          id="address"
                          {...form.register('address')}
                          placeholder="Enter your full address"
                          className={cn(
                            "w-full bg-white dark:bg-gray-800",
                            "text-gray-900 dark:text-gray-100",
                            "border-gray-300 dark:border-gray-600",
                            "focus:ring-primary-500 dark:focus:ring-primary-400",
                            "focus:border-primary-500 dark:focus:border-primary-400",
                            form.formState.errors.address ? 'border-red-500' : ''
                          )}
                          rows={3}
                        />
                        {form.formState.errors.address && (
                          <p className="mt-1 text-sm text-red-500">{form.formState.errors.address.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Case Details */}
                  {currentStep === 2 && (
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

                  {/* Step 4: Additional Information */}
                  {currentStep === 3 && (
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