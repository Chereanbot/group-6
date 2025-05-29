"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineOfficeBuilding,
  HiOutlineUpload,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineCheck
} from 'react-icons/hi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/providers/LanguageProvider';

// Create a function to get localized validation messages
const getValidationMessages = (t) => ({
  nameMin: t('registration.validation.nameMin', 'Name must be at least 2 characters'),
  phoneMin: t('registration.validation.phoneMin', 'Phone number must be at least 10 characters'),
  emailInvalid: t('registration.validation.emailInvalid', 'Invalid email address'),
  ageMin: t('registration.validation.ageMin', 'Must be at least 18 years old'),
  familyMembersMin: t('registration.validation.familyMembersMin', 'Must be 0 or greater'),
  regionRequired: t('registration.validation.regionRequired', 'Region is required'),
  zoneRequired: t('registration.validation.zoneRequired', 'Zone is required'),
  weredaRequired: t('registration.validation.weredaRequired', 'Wereda is required'),
  kebeleRequired: t('registration.validation.kebeleRequired', 'Kebele is required'),
  caseTypeRequired: t('registration.validation.caseTypeRequired', 'Case type is required'),
  caseDescriptionMin: t('registration.validation.caseDescriptionMin', 'Case description must be at least 10 characters'),
  officeRequired: t('registration.validation.officeRequired', 'Office selection is required'),
});

// Create the form schema with dynamic validation messages
const createFormSchema = (t) => {
  const messages = getValidationMessages(t);
  
  return z.object({
    // Personal Information
    fullName: z.string().min(2, messages.nameMin),
    phone: z.string().min(10, messages.phoneMin),
    email: z.string().email(messages.emailInvalid).optional(),
    age: z.number().min(18, messages.ageMin),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    familyMembers: z.number().min(0, messages.familyMembersMin),
    healthStatus: z.enum(['HEALTHY', 'DISABLED', 'CHRONIC_ILLNESS', 'OTHER']),

    // Location Information
    region: z.string().min(1, messages.regionRequired),
    zone: z.string().min(1, messages.zoneRequired),
    wereda: z.string().min(1, messages.weredaRequired),
    kebele: z.string().min(1, messages.kebeleRequired),
    houseNumber: z.string().optional(),

    // Case Information
    caseType: z.string().min(1, messages.caseTypeRequired),
    caseCategory: z.enum(['FAMILY', 'CRIMINAL', 'CIVIL', 'PROPERTY', 'LABOR', 'COMMERCIAL', 'CONSTITUTIONAL', 'ADMINISTRATIVE', 'OTHER']),
    caseDescription: z.string().min(10, messages.caseDescriptionMin),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),

    // Office Information
    officeId: z.string().min(1, messages.officeRequired),
  });
};

const getSteps = (t) => [
  {
    id: 'personal',
    title: t('registration.steps.personal.title', 'Personal Information'),
    icon: HiOutlineUser,
    description: t('registration.steps.personal.description', 'Basic personal details')
  },
  {
    id: 'location',
    title: t('registration.steps.location.title', 'Location'),
    icon: HiOutlineLocationMarker,
    description: t('registration.steps.location.description', 'Your current address')
  },
  {
    id: 'case',
    title: t('registration.steps.case.title', 'Case Details'),
    icon: HiOutlineDocumentText,
    description: t('registration.steps.case.description', 'Information about your case')
  },
  {
    id: 'office',
    title: t('registration.steps.office.title', 'Office Selection'),
    icon: HiOutlineOfficeBuilding,
    description: t('registration.steps.office.description', 'Choose legal aid office')
  },
  {
    id: 'documents',
    title: t('registration.steps.documents.title', 'Documents'),
    icon: HiOutlineUpload,
    description: t('registration.steps.documents.description', 'Upload required documents')
  }
];

const getCaseTypes = (t) => [
  { value: 'CIVIL', label: t('registration.caseTypes.civil', 'Civil Case') },
  { value: 'CRIMINAL', label: t('registration.caseTypes.criminal', 'Criminal Case') },
  { value: 'FAMILY', label: t('registration.caseTypes.family', 'Family Law') },
  { value: 'PROPERTY', label: t('registration.caseTypes.property', 'Property Dispute') },
  { value: 'LABOR', label: t('registration.caseTypes.labor', 'Labor Law') },
  { value: 'DIVORCE', label: t('registration.caseTypes.divorce', 'Divorce') },
  { value: 'INHERITANCE', label: t('registration.caseTypes.inheritance', 'Inheritance') },
  { value: 'DOMESTIC_VIOLENCE', label: t('registration.caseTypes.domesticViolence', 'Domestic Violence') },
  { value: 'LAND_DISPUTE', label: t('registration.caseTypes.landDispute', 'Land Dispute') },
  { value: 'CONTRACT', label: t('registration.caseTypes.contract', 'Contract Related') },
  { value: 'HUMAN_RIGHTS', label: t('registration.caseTypes.humanRights', 'Human Rights') },
  { value: 'CONSTITUTIONAL', label: t('registration.caseTypes.constitutional', 'Constitutional Law') },
  { value: 'OTHER', label: t('registration.caseTypes.other', 'Other') }
];

const getHealthStatusOptions = (t) => [
  { value: 'HEALTHY', label: t('registration.healthStatus.healthy', 'Healthy') },
  { value: 'DISABLED', label: t('registration.healthStatus.disabled', 'Disabled') },
  { value: 'CHRONIC_ILLNESS', label: t('registration.healthStatus.chronicIllness', 'Chronic Illness') },
  { value: 'OTHER', label: t('registration.healthStatus.other', 'Other') }
];

const getGenderOptions = (t) => [
  { value: 'MALE', label: t('registration.gender.male', 'Male') },
  { value: 'FEMALE', label: t('registration.gender.female', 'Female') },
  { value: 'OTHER', label: t('registration.gender.other', 'Other') }
];

export default function RegistrationPage() {
  const { t, locale, setLocale } = useLanguage();
  const steps = getSteps(t);
  const caseTypes = getCaseTypes(t);
  const healthStatusOptions = getHealthStatusOptions(t);
  const genderOptions = getGenderOptions(t);
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<File[]>([]);
  const [offices, setOffices] = useState([]);
  
  // Create form schema with localized validation messages
  const formSchema = createFormSchema(t);
  
  // Function to toggle language
  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'am' : 'en');
  };
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveCase, setHasActiveCase] = useState(false);
  const [profile, setProfile] = useState(null);
  const [clientCases, setClientCases] = useState([]);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await fetch('/api/client/registration');
        if (!response.ok) {
          throw new Error('Failed to fetch offices');
        }
        const data = await response.json();
        if (data.success) {
          setOffices(data.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load office list",
          variant: "destructive"
        });
      }
    };

    fetchOffices();
  }, [toast]);

  // Fetch client profile and case status
  useEffect(() => {
    const fetchProfileAndCases = async () => {
      try {
        const response = await fetch('/api/client/profile');
        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
          
          // Fetch client cases
          const casesResponse = await fetch('/api/client/cases');
          const casesData = await casesResponse.json();
          
          if (casesData.success) {
            setClientCases(casesData.data);
            const activeCase = casesData.data.find(
              case_ => case_.status !== 'CLOSED' && case_.status !== 'REJECTED'
            );
            setHasActiveCase(!!activeCase);
            
            if (activeCase) {
              toast({
                title: "Active Case Found",
                description: "You already have an active case. You cannot register a new case until the current one is closed.",
                variant: "default",
                className: "bg-yellow-500 text-white"
              });
              router.push('/client/cases/waiting');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your profile information",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndCases();
  }, []);

  // Update form with profile data when available
  useEffect(() => {
    if (profile && profile.user) {
      form.reset({
        fullName: profile.user.fullName || '',
        phone: profile.phone || '',
        email: profile.user.email || '',
        age: profile.age || 18,
        gender: profile.sex || 'MALE',
        familyMembers: profile.numberOfFamily || 0,
        healthStatus: profile.healthStatus || 'HEALTHY',
        region: profile.region || '',
        zone: profile.zone || '',
        wereda: profile.wereda || '',
        kebele: profile.kebele || '',
        houseNumber: profile.houseNumber || '',
        officeId: profile.assignedOffice?.id || ''
      });
    }
  }, [profile]);

  // Create form with dynamic schema
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      age: 18,
      gender: 'MALE',
      familyMembers: 0,
      healthStatus: 'HEALTHY',
      region: '',
      zone: '',
      wereda: '',
      kebele: '',
      houseNumber: '',
      caseType: '',
      caseCategory: 'CIVIL',
      caseDescription: '',
      priority: 'MEDIUM',
      officeId: '',
    },
  });
  
  // Update form validation when language changes
  useEffect(() => {
    form.clearErrors();
  }, [locale, form]);

  const handleNext = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fields);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): (keyof z.infer<typeof formSchema>)[] => {
    switch (step) {
      case 0: // Personal
        return ['fullName', 'phone', 'email', 'age', 'gender', 'familyMembers', 'healthStatus'];
      case 1: // Location
        return ['region', 'zone', 'wereda', 'kebele'];
      case 2: // Case
        return ['caseType', 'caseCategory', 'caseDescription', 'priority'];
      case 3: // Office
        return ['officeId'];
      default:
        return [];
    }
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (currentStep !== steps.length - 1) {
      handleNext();
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append documents with unique keys
      documents.forEach((doc, index) => {
        formData.append(`document_${index}`, doc, doc.name);
      });

      const response = await fetch('/api/client/registration', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      toast({
        title: "Success",
        description: "Registration submitted successfully",
        variant: "default",
        className: "bg-green-500 text-white"
      });

      router.push('/client/cases/register');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit registration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (hasActiveCase) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="p-6">
          <Alert>
            <AlertTitle>{t('registration.activeCase.title', 'Active Case Found')}</AlertTitle>
            <AlertDescription>
              {t('registration.activeCase.description', 'You already have an active case. You cannot register a new case until the current one is closed.')}
              <Button
                className="mt-4"
                onClick={() => router.push('/client/cases/waiting')}
              >
                {t('registration.activeCase.viewButton', 'View Active Case')}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (profile && clientCases.length > 0) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold dark:text-white">Welcome back, {profile.user?.fullName || 'Client'}!</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Your registered cases are listed below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Case Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {clientCases.map((caseItem: any) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {caseItem.title || 'Untitled'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {caseItem.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          caseItem.status === 'OPEN' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          caseItem.status === 'CLOSED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Button
                          onClick={() => router.push(`/client/cases/case-activity?id=${caseItem.id}`)}
                          className="mr-2 bg-primary-500 hover:bg-primary-600 text-white"
                          size="sm"
                        >
                          View Activity
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => router.push('/client/cases/case-activity')}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                Go to Case Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Language Toggle */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={toggleLanguage} 
          className="flex items-center space-x-2"
        >
          <span>{locale === 'en' ? 'አማርኛ' : 'English'}</span>
        </Button>
      </div>
      
      {/* Timeline Progress */}
      <div className="mb-8">
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between w-full overflow-x-auto md:overflow-hidden pb-4 md:pb-0">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center min-w-[100px] md:min-w-0 ${
                  index <= currentStep ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <div className={`
                  rounded-full transition-colors duration-200
                  flex items-center justify-center w-8 h-8
                  ${index <= currentStep 
                    ? 'bg-primary-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `}>
                  <step.icon className={`w-5 h-5 ${
                    index <= currentStep 
                      ? 'text-white' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <div className="text-xs mt-2 text-center whitespace-nowrap dark:text-gray-300">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 dark:text-white">
          {steps[currentStep].title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
          {steps[currentStep].description}
        </p>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...form.register('fullName')}
                    placeholder="Enter your full name"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="Enter your phone number"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="Enter your email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register('age', { valueAsNumber: true })}
                    placeholder="Enter your age"
                  />
                  {form.formState.errors.age && (
                    <p className="text-sm text-red-500">{form.formState.errors.age.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(value) => form.setValue('gender', value as 'MALE' | 'FEMALE' | 'OTHER')}
                    defaultValue={form.getValues('gender')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gender && (
                    <p className="text-sm text-red-500">{form.formState.errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familyMembers">Number of Family Members</Label>
                  <Input
                    id="familyMembers"
                    type="number"
                    {...form.register('familyMembers', { valueAsNumber: true })}
                    placeholder="Enter number of family members"
                  />
                  {form.formState.errors.familyMembers && (
                    <p className="text-sm text-red-500">{form.formState.errors.familyMembers.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthStatus">Health Status</Label>
                  <Select
                    onValueChange={(value) => form.setValue('healthStatus', value as 'HEALTHY' | 'DISABLED' | 'CHRONIC_ILLNESS' | 'OTHER')}
                    defaultValue={form.getValues('healthStatus')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                    <SelectContent>
                      {healthStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.healthStatus && (
                    <p className="text-sm text-red-500">{form.formState.errors.healthStatus.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region" className="dark:text-gray-200">Region</Label>
                  <Input
                    id="region"
                    {...form.register('region')}
                    className={cn(
                      "mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                      form.formState.errors.region && "border-red-500"
                    )}
                  />
                  {form.formState.errors.region && (
                    <p className="text-sm text-red-500">{form.formState.errors.region.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="zone" className="dark:text-gray-200">Zone</Label>
                  <Input
                    id="zone"
                    {...form.register('zone')}
                    className={cn(
                      "mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                      form.formState.errors.zone && "border-red-500"
                    )}
                  />
                  {form.formState.errors.zone && (
                    <p className="text-sm text-red-500">{form.formState.errors.zone.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wereda" className="dark:text-gray-200">Wereda</Label>
                  <Input
                    id="wereda"
                    {...form.register('wereda')}
                    className={cn(
                      "mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                      form.formState.errors.wereda && "border-red-500"
                    )}
                  />
                  {form.formState.errors.wereda && (
                    <p className="text-sm text-red-500">{form.formState.errors.wereda.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="kebele" className="dark:text-gray-200">Kebele</Label>
                  <Input
                    id="kebele"
                    {...form.register('kebele')}
                    className={cn(
                      "mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                      form.formState.errors.kebele && "border-red-500"
                    )}
                  />
                  {form.formState.errors.kebele && (
                    <p className="text-sm text-red-500">{form.formState.errors.kebele.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="houseNumber" className="dark:text-gray-200">House Number (Optional)</Label>
                <Input
                  id="houseNumber"
                  {...form.register('houseNumber')}
                  className={cn(
                    "mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                    form.formState.errors.houseNumber && "border-red-500"
                  )}
                />
                {form.formState.errors.houseNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.houseNumber.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Case Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseType">Case Type</Label>
                  <Select
                    onValueChange={(value) => form.setValue('caseType', value)}
                    defaultValue={form.getValues('caseType')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIVIL">Civil</SelectItem>
                      <SelectItem value="CRIMINAL">Criminal</SelectItem>
                      <SelectItem value="FAMILY">Family</SelectItem>
                      <SelectItem value="PROPERTY">Property</SelectItem>
                      <SelectItem value="LABOR">Labor</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="CONSTITUTIONAL">Constitutional</SelectItem>
                      <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="caseCategory">Case Category</Label>
                  <Select
                    onValueChange={(value: "FAMILY" | "CRIMINAL" | "CIVIL" | "PROPERTY" | "LABOR" | "COMMERCIAL" | "CONSTITUTIONAL" | "ADMINISTRATIVE" | "OTHER") => 
                      form.setValue('caseCategory', value)
                    }
                    defaultValue={form.getValues('caseCategory')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select case category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIVIL">Civil</SelectItem>
                      <SelectItem value="CRIMINAL">Criminal</SelectItem>
                      <SelectItem value="FAMILY">Family</SelectItem>
                      <SelectItem value="PROPERTY">Property</SelectItem>
                      <SelectItem value="LABOR">Labor</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="CONSTITUTIONAL">Constitutional</SelectItem>
                      <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="caseDescription">Case Description</Label>
                <Textarea
                  id="caseDescription"
                  {...form.register('caseDescription')}
                  placeholder="Describe your case in detail"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => 
                    form.setValue('priority', value)
                  }
                  defaultValue={form.getValues('priority')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Office Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="officeId" className="dark:text-gray-200">Select Office</Label>
                {offices.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400 mt-2">
                    Loading offices...
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => form.setValue('officeId', value)}
                    defaultValue={form.getValues('officeId')}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select an office" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {offices.map((office: any) => (
                        <SelectItem 
                          key={office.id} 
                          value={office.id}
                          className="dark:text-white dark:focus:bg-gray-700"
                        >
                          <div className="flex flex-col">
                            <span>{office.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {office.location?.region}, {office.location?.zone}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {form.formState.errors.officeId && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    {form.formState.errors.officeId.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Document Upload */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label className="dark:text-gray-200">Required Documents</Label>
                <div className="mt-2 space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <Input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files);
                          setDocuments(prevDocs => [...prevDocs, ...files]);
                        }
                      }}
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <HiOutlineUpload className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Click to upload or drag and drop
                      </span>
                      <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        PDF, DOC, DOCX, JPG, JPEG, PNG
                      </span>
                    </label>
                  </div>
                  
                  {documents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 dark:text-gray-200">Uploaded Documents</h4>
                      <ul className="space-y-2">
                        {documents.map((doc, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            <span className="text-sm truncate dark:text-gray-200">{doc.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                const newDocs = [...documents];
                                newDocs.splice(index, 1);
                                setDocuments(newDocs);
                              }}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove
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

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <HiOutlineChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>Submit</span>
                    <HiOutlineCheck className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 