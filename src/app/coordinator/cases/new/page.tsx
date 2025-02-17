"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineExclamationCircle,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineQuestionMarkCircle,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlinePhone as HiOutlinePhoneIcon
} from 'react-icons/hi';
import { FormField } from './FormField';
import { ReviewItem } from './ReviewItem';
import { PreviewCase } from './PreviewCase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Priority } from '@prisma/client';
import { CheckIcon } from '@heroicons/react/24/outline';
import Timeline from './Timeline';
import type { TimelineEvent } from './Timeline';

// Import the same types and components from admin
const caseTypes = [
  { value: 'CIVIL', label: 'Civil Case' },
  { value: 'CRIMINAL', label: 'Criminal Case' },
  { value: 'FAMILY', label: 'Family Law' },
  { value: 'PROPERTY', label: 'Property Dispute' },
  { value: 'LABOR', label: 'Labor Law' },
  { value: 'DIVORCE', label: 'Divorce' },
  { value: 'INHERITANCE', label: 'Inheritance' },
  { value: 'DOMESTIC_VIOLENCE', label: 'Domestic Violence' },
  { value: 'LAND_DISPUTE', label: 'Land Dispute' },
  { value: 'CONTRACT', label: 'Contract Related' },
  { value: 'HUMAN_RIGHTS', label: 'Human Rights' },
  { value: 'CONSTITUTIONAL', label: 'Constitutional Law' },
  { value: 'ENVIRONMENTAL', label: 'Environmental Law' },
  { value: 'INTELLECTUAL_PROPERTY', label: 'Intellectual Property' },
  { value: 'IMMIGRATION', label: 'Immigration Law' },
  { value: 'TAX', label: 'Tax Law' },
  { value: 'BANKRUPTCY', label: 'Bankruptcy Law' },
  { value: 'INSURANCE', label: 'Insurance Law' },
  { value: 'MEDICAL_MALPRACTICE', label: 'Medical Malpractice' },
  { value: 'EDUCATION', label: 'Education Law' },
  { value: 'OTHER', label: 'Other' }
];

const documentTypes = [
  'ID_CARD',
  'INCOME_PROOF',
  'RESIDENCE_PROOF', 
  'COURT_DOCUMENTS',
  'WITNESS_STATEMENTS',
  'PROPERTY_DOCUMENTS',
  'MEDICAL_RECORDS',
  'POLICE_REPORT',
  'PREVIOUS_CASE_DOCUMENTS',
  'FINANCIAL_RECORDS',
  'EMPLOYMENT_RECORDS',
  'EDUCATIONAL_RECORDS',
  'IMMIGRATION_DOCUMENTS',
  'BUSINESS_RECORDS',
  'CONTRACTS',
  'CORRESPONDENCE',
  'PHOTOGRAPHS',
  'VIDEO_EVIDENCE',
  'EXPERT_REPORTS',
  'INSURANCE_DOCUMENTS',
  'OTHER'
];

const documentCategories = [
  { value: 'IDENTIFICATION', label: 'Identification Documents' },
  { value: 'LEGAL', label: 'Legal Documents' },
  { value: 'EVIDENCE', label: 'Evidence Documents' },
  { value: 'WITNESS', label: 'Witness Statements' },
  { value: 'COURT', label: 'Court Documents' },
  { value: 'FINANCIAL', label: 'Financial Documents' },
  { value: 'MEDICAL', label: 'Medical Documents' },
  { value: 'EMPLOYMENT', label: 'Employment Documents' },
  { value: 'EDUCATIONAL', label: 'Educational Documents' },
  { value: 'MULTIMEDIA', label: 'Multimedia Evidence' },
  { value: 'OTHER', label: 'Other Documents' }
];

const caseCategories = {
  FAMILY: {
    label: 'Family Law',
    types: [
      { value: 'DIVORCE', label: 'Divorce' },
      { value: 'CHILD_CUSTODY', label: 'Child Custody' },
      { value: 'CHILD_SUPPORT', label: 'Child Support' },
      { value: 'ADOPTION', label: 'Adoption' },
      { value: 'DOMESTIC_VIOLENCE', label: 'Domestic Violence' },
      { value: 'MARRIAGE_DISPUTE', label: 'Marriage Dispute' },
      { value: 'ALIMONY', label: 'Alimony' },
      { value: 'INHERITANCE', label: 'Inheritance' },
      { value: 'GUARDIANSHIP', label: 'Guardianship' },
      { value: 'PROPERTY_DIVISION', label: 'Property Division' },
      { value: 'PRENUPTIAL_AGREEMENT', label: 'Prenuptial Agreement' },
      { value: 'SURROGACY', label: 'Surrogacy' },
      { value: 'PATERNITY', label: 'Paternity' },
      { value: 'ELDER_LAW', label: 'Elder Law' },
      { value: 'OTHER', label: 'Other Family Matter' }
    ]
  },
  // ... rest of the case categories remain the same as admin
};

interface NewCaseFormProps {
  darkMode?: boolean;
}

interface Office {
  id: string;
  name: string;
  location?: string;
}

interface SuccessOption {
  title: string;
  description: string;
  icon: string;
  href: string;
}

interface FormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  caseType: string;
  caseCategory: string;
  caseSubType: string;
  caseDescription: string;
  priority: Priority;
  expectedResolutionDate: string;
  region: string;
  zone: string;
  wereda: string;
  kebele: string;
  houseNumber: string;
  clientRequest: string;
  requestDetails: Record<string, any>;
  tags: string[];
  documents: File[];
  officeId: string;
  status: string;
  assignedTo: string | null;
  notes: string;
  customFields: Record<string, any>;
  coordinatorId?: string;
  coordinatorName?: string;
  officeName?: string;
}

interface Coordinator {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  office: {
    id: string;
    name: string;
    location: string;
  };
}

export default function NewCaseForm({ darkMode = false }: NewCaseFormProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showStepHelp, setShowStepHelp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Client Information
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    
    // Case Details
    caseType: '',
    caseCategory: '',
    caseSubType: '',
    caseDescription: '',
    priority: Priority.MEDIUM,
    expectedResolutionDate: '',
    
    // Location
    region: '',
    zone: '',
    wereda: '',
    kebele: '',
    houseNumber: '',
    
    // Additional Details
    clientRequest: '',
    requestDetails: {},
    tags: [],
    documents: [],
    
    // Office Assignment
    officeId: '',
    
    // Metadata
    status: 'PENDING',
    assignedTo: null,
    notes: '',
    customFields: {},
    coordinatorId: undefined,
    coordinatorName: undefined,
    officeName: undefined
  });
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: 'Case Registration Initiated',
      description: 'Initial case registration process started by coordinator',
      date: new Date(),
      status: 'completed',
      icon: 'DOCUMENT',
      details: {
        notes: 'Case registration process has begun'
      }
    },
    {
      id: '2',
      title: 'Document Verification',
      description: 'Required documents are being verified',
      date: new Date(),
      status: 'current',
      icon: 'VERIFY',
      details: {
        documents: [
          'Client Identification',
          'Case Related Documents',
          'Supporting Evidence'
        ]
      }
    },
    {
      id: '3',
      title: 'Case Assignment',
      description: 'Case will be assigned to the appropriate department',
      date: new Date(),
      status: 'upcoming',
      icon: 'OFFICE',
      details: {
        location: coordinator?.office?.name || 'Pending'
      }
    }
  ]);

  useEffect(() => {
    setMounted(true);
    // Fetch coordinator profile when component mounts
    const fetchCoordinatorProfile = async () => {
      try {
        const response = await fetch('/api/coordinator/profile');
        const result = await response.json();
        
        if (result.success && result.data) {
          setCoordinator(result.data);
          // Pre-fill office information and coordinator details
          if (result.data.office) {
            setFormData(prev => ({
              ...prev,
              officeId: result.data.office.id,
              officeName: result.data.office.name,
              coordinatorId: result.data.id,
              coordinatorName: result.data.user.fullName
            }));
          } else {
            toast.error('No office assigned to coordinator');
          }
        } else {
          toast.error(result.error || 'Failed to load coordinator information');
        }
      } catch (error) {
        console.error('Error fetching coordinator profile:', error);
        toast.error('Failed to load coordinator information');
      }
    };

    fetchCoordinatorProfile();
  }, []);

  const successOptions: SuccessOption[] = [
    {
      title: 'View Case Details',
      description: "View the details of the case you've just created",
      icon: 'VIEW',
      href: '/coordinator/cases'
    },
    {
      title: 'Register Another Case',
      description: "Start a new case registration process for another client or legal matter that needs attention.",
      icon: 'NEW',
      href: '/coordinator/cases/new'
    },
    {
      title: 'Return to Dashboard',
      description: "Go back to your dashboard to manage other tasks and cases.",
      icon: 'DASHBOARD',
      href: '/coordinator/dashboard'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update timeline for case submission
      const updatedTimelineEvents: TimelineEvent[] = [
        ...timelineEvents,
        {
          id: '4',
          title: 'Case Submitted',
          description: 'Case has been successfully registered in the system',
          date: new Date(),
          status: 'completed' as const,
          icon: 'DOCUMENT',
          details: {
            assignedTo: coordinator?.user?.fullName,
            location: coordinator?.office?.name,
            notes: 'Case registration completed successfully'
          }
        }
      ];

      // Prepare the submission data
      const submissionData = {
        ...formData,
        coordinatorId: coordinator?.id,
        coordinatorName: coordinator?.user?.fullName,
        officeId: coordinator?.office?.id,
        officeName: coordinator?.office?.name,
        timelineEvents: updatedTimelineEvents,
        registrationDate: new Date().toISOString(),
        status: 'PENDING',
        priority: formData.priority || 'MEDIUM'
      };

      const response = await fetch('/api/coordinator/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.success) {
        setTimelineEvents(updatedTimelineEvents);
        setShowSuccess(true);
        toast.success('Case registered successfully!');
      } else {
        toast.error(result.error || 'Failed to register case');
      }
    } catch (error) {
      console.error('Error submitting case:', error);
      toast.error('An error occurred while registering the case');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Client Information
        return !!(formData.clientName && formData.clientPhone);
      case 2: // Case Details
        return !!(formData.caseType && formData.caseDescription);
      case 3: // Location
        return !!(formData.wereda && formData.kebele);
      case 4: // Additional Details
        return !!(formData.clientRequest);
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const toggleHelpGuide = () => {
    setShowHelpGuide(!showHelpGuide);
  };

  const toggleStepHelp = () => {
    setShowStepHelp(!showStepHelp);
  };

  // Update the onChange handlers with proper types
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
    }
  };

  if (!mounted) return null;

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <CheckIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold">Case Successfully Registered</h2>
          <p className="mt-2 text-gray-600">What would you like to do next?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successOptions.map((option) => (
            <button
              key={option.title}
              onClick={() => router.push(option.href)}
              className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
            >
              <h3 className="font-semibold">{option.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {coordinator && coordinator.office && (
          <div className="mb-6 space-y-4">
            {/* Coordinator Information Card */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Case Registration Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coordinator Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <HiOutlineIdentification className="h-5 w-5 mr-2" />
                    Coordinator Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <HiOutlineUser className="h-5 w-5 mr-2" />
                      <span className="font-medium">{coordinator.user.fullName}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <HiOutlinePhoneIcon className="h-5 w-5 mr-2" />
                      <span>{coordinator.user.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <HiOutlineMail className="h-5 w-5 mr-2" />
                      <span>{coordinator.user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Office Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <HiOutlineOfficeBuilding className="h-5 w-5 mr-2" />
                    Office Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <HiOutlineLocationMarker className="h-5 w-5 mr-2" />
                      <span className="font-medium">{coordinator.office.name}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <HiOutlineTag className="h-5 w-5 mr-2" />
                      <span>{coordinator.office.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <HiOutlineCalendar className="h-5 w-5 mr-2" />
                      <span>Registration Date: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Registration Progress
                </h3>
                <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                  Step {currentStep} of 4
                </span>
              </div>
              <div className="relative">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
                    Client Info
                  </span>
                  <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
                    Case Details
                  </span>
                  <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>
                    Location
                  </span>
                  <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : ''}>
                    Documents
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Office Information Section */}
        {coordinator && coordinator.office && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <HiOutlineOfficeBuilding className="h-6 w-6 mr-2" />
              Office Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Office Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <HiOutlineOfficeBuilding className="h-5 w-5 mr-2" />
                  Office Information
                </h3>
                <div className="space-y-3">
                  <FormField
                    label="Office Name"
                    type="text"
                    value={coordinator.office.name}
                    disabled
                    helpText="The office handling this case"
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                  <FormField
                    label="Office Location"
                    type="text"
                    value={coordinator.office.location}
                    disabled
                    helpText="Physical location of the office"
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                  <FormField
                    label="Office ID"
                    type="text"
                    value={coordinator.office.id}
                    disabled
                    helpText="Unique identifier for the office"
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Coordinator Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <HiOutlineUser className="h-5 w-5 mr-2" />
                  Coordinator Information
                </h3>
                <div className="space-y-3">
                  <FormField
                    label="Coordinator Name"
                    type="text"
                    value={coordinator.user.fullName}
                    disabled
                    helpText="Name of the assigned coordinator"
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                  <FormField
                    label="Coordinator Phone"
                    type="tel"
                    value={coordinator.user.phone}
                    disabled
                    helpText="Contact number for the coordinator"
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                  <FormField
                    label="Coordinator Email"
                    type="email"
                    value={coordinator.user.email}
                    disabled
                    helpText="Email address for the coordinator"
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Registration Date"
                    type="text"
                    value={new Date().toLocaleDateString()}
                    disabled
                    helpText="Date of case registration"
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                  <FormField
                    label="Office Status"
                    type="text"
                    value="ACTIVE"
                    disabled
                    helpText="Current status of the office"
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className={`max-w-4xl mx-auto p-6 ${darkMode ? 'dark' : ''}`}>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">New Case Registration</h1>
                <div className="flex space-x-4">
                  <button
                    onClick={toggleHelpGuide}
                    className="btn btn-ghost btn-circle"
                    title="Help Guide"
                  >
                    <HiOutlineQuestionMarkCircle className="h-6 w-6" />
                  </button>
                  <button
                    onClick={togglePreview}
                    className="btn btn-ghost btn-circle"
                    title="Preview Case"
                  >
                    <HiOutlineDocumentText className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {showPreview ? (
                  <PreviewCase formData={formData} onClose={togglePreview} />
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                {/* Step 1: Client Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                        <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Client Information</h2>
                          {showStepHelp && (
                            <div className="text-sm text-gray-600">
                              Fill in the client's basic information
                            </div>
                          )}
                        </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Client Name"
                            type="text"
                            value={formData.clientName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'clientName')}
                            required
                          />
                          <FormField
                            label="Phone Number"
                            type="tel"
                            value={formData.clientPhone}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'clientPhone')}
                            required
                          />
                          <FormField
                            label="Email"
                            type="email"
                            value={formData.clientEmail}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'clientEmail')}
                          />
                          <FormField
                            label="Address"
                            type="text"
                            value={formData.clientAddress}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'clientAddress')}
                          />
                    </div>
                  </div>
                )}

                {/* Step 2: Case Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                        <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Case Details</h2>
                          {showStepHelp && (
                            <div className="text-sm text-gray-600">
                              Provide details about the case type and description
                            </div>
                          )}
                        </div>
                    <div className="grid grid-cols-1 gap-4">
                          <FormField
                            label="Case Type"
                            type="select"
                            value={formData.caseType}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange(e, 'caseType')}
                            options={caseTypes}
                            required
                          />
                          <FormField
                            label="Case Description"
                            type="textarea"
                            value={formData.caseDescription}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e, 'caseDescription')}
                            required
                          />
                          <FormField
                            label="Priority"
                            type="select"
                            value={formData.priority}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleInputChange(e, 'priority')}
                            options={[
                              { value: Priority.LOW, label: 'Low' },
                              { value: Priority.MEDIUM, label: 'Medium' },
                              { value: Priority.HIGH, label: 'High' },
                              { value: Priority.URGENT, label: 'Urgent' }
                            ]}
                            required
                          />
                          <FormField
                            label="Expected Resolution Date"
                            type="date"
                            value={formData.expectedResolutionDate}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'expectedResolutionDate')}
                          />
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                        <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Location Details</h2>
                          {showStepHelp && (
                            <div className="text-sm text-gray-600">
                              Enter the location details for the case
                            </div>
                          )}
                        </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Region"
                            type="text"
                            value={formData.region}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'region')}
                          />
                          <FormField
                            label="Zone"
                            type="text"
                            value={formData.zone}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'zone')}
                          />
                          <FormField
                            label="Wereda"
                            type="text"
                            value={formData.wereda}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'wereda')}
                            required
                          />
                          <FormField
                            label="Kebele"
                            type="text"
                            value={formData.kebele}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'kebele')}
                            required
                          />
                          <FormField
                            label="House Number"
                            type="text"
                            value={formData.houseNumber}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'houseNumber')}
                          />
                    </div>
                  </div>
                )}

                {/* Step 4: Additional Details */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                        <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Additional Details</h2>
                          {showStepHelp && (
                            <div className="text-sm text-gray-600">
                              Provide any additional information and documents
                            </div>
                          )}
                        </div>
                    <div className="grid grid-cols-1 gap-4">
                          <FormField
                            label="Client Request"
                            type="textarea"
                            value={formData.clientRequest}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e, 'clientRequest')}
                            required
                          />
                          <FormField
                            label="Tags"
                            type="tags"
                            value={formData.tags}
                            onChange={handleTagsChange}
                          />
                          <FormField
                            label="Documents"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                          />
                          <div className="flex flex-wrap gap-2">
                            {formData.documents.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1"
                              >
                                <span className="text-sm">{doc.name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      documents: prev.documents.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <HiOutlineX className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="btn btn-outline"
                    >
                      <HiOutlineChevronLeft className="h-5 w-5 mr-2" />
                      Previous
                    </button>
                  )}
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn btn-primary ml-auto"
                    >
                      Next
                      <HiOutlineChevronRight className="h-5 w-5 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary ml-auto"
                    >
                      {loading ? (
                        <>
                          <HiOutlineClock className="h-5 w-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <HiOutlineCheck className="h-5 w-5 mr-2" />
                          Submit Case
                        </>
                      )}
                    </button>
                  )}
                </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <Timeline events={timelineEvents} />
          </div>
        </div>
      </div>
    </div>
  );
} 