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
  HiOutlineMail
} from 'react-icons/hi';
import { FormField } from './FormField';
import { ReviewItem } from './ReviewItem';
import { PreviewCase } from './PreviewCase';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Priority } from '@prisma/client';
import { CheckIcon } from '@heroicons/react/24/outline';

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
    customFields: {}
  });

  useEffect(() => {
    setMounted(true);
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
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'documents') {
          formData.documents.forEach(doc => {
            formDataToSend.append('documents', doc);
          });
        } else if (typeof value === 'object') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value?.toString() || '');
        }
      });

      const response = await fetch('/api/coordinator/cases', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setShowSuccess(true);
      } else {
        toast.error(result.error || 'Failed to create case');
      }
    } catch (error) {
      console.error('Error creating case:', error);
      toast.error('Failed to create case');
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
                    onChange={(e) => handleInputChange(e, 'clientName')}
                    required
                  />
                  <FormField
                    label="Phone Number"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange(e, 'clientPhone')}
                    required
                  />
                  <FormField
                    label="Email"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange(e, 'clientEmail')}
                  />
                  <FormField
                    label="Address"
                    type="text"
                    value={formData.clientAddress}
                    onChange={(e) => handleInputChange(e, 'clientAddress')}
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
                    onChange={(e) => handleInputChange(e, 'caseType')}
                    options={caseTypes}
                    required
                  />
                  <FormField
                    label="Case Description"
                    type="textarea"
                    value={formData.caseDescription}
                    onChange={(e) => handleInputChange(e, 'caseDescription')}
                    required
                  />
                  <FormField
                    label="Priority"
                    type="select"
                    value={formData.priority}
                    onChange={(e) => handleInputChange(e, 'priority')}
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
                    onChange={(e) => handleInputChange(e, 'expectedResolutionDate')}
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
                    onChange={(e) => handleInputChange(e, 'region')}
                  />
                  <FormField
                    label="Zone"
                    type="text"
                    value={formData.zone}
                    onChange={(e) => handleInputChange(e, 'zone')}
                  />
                  <FormField
                    label="Wereda"
                    type="text"
                    value={formData.wereda}
                    onChange={(e) => handleInputChange(e, 'wereda')}
                    required
                  />
                  <FormField
                    label="Kebele"
                    type="text"
                    value={formData.kebele}
                    onChange={(e) => handleInputChange(e, 'kebele')}
                    required
                  />
                  <FormField
                    label="House Number"
                    type="text"
                    value={formData.houseNumber}
                    onChange={(e) => handleInputChange(e, 'houseNumber')}
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
                    onChange={(e) => handleInputChange(e, 'clientRequest')}
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

      {/* Help Guide Modal */}
      <AnimatePresence>
        {showHelpGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">Case Registration Help Guide</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Step 1: Client Information</h3>
                  <p className="text-gray-600">Enter the client's basic contact information.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Step 2: Case Details</h3>
                  <p className="text-gray-600">Select the case type and provide a detailed description.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Step 3: Location</h3>
                  <p className="text-gray-600">Specify the location details for the case.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Step 4: Additional Details</h3>
                  <p className="text-gray-600">Add any supporting documents and extra information.</p>
                </div>
              </div>
              <button
                onClick={toggleHelpGuide}
                className="btn btn-primary mt-6"
              >
                Close Guide
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 