"use client";

import { useState, useEffect } from 'react';
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
import { FormField } from '@/app/admin/cases/new/FormField';
import { ReviewItem } from '@/app/admin/cases/new/ReviewItem';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PreviewCase } from './PreviewCase';
import { CaseFormData } from './types';
import { Priority } from '@prisma/client';
import { CheckIcon } from '@heroicons/react/24/outline';

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
  CRIMINAL: {
    label: 'Criminal Law',
    types: [
      { value: 'THEFT', label: 'Theft' },
      { value: 'ASSAULT', label: 'Assault' },
      { value: 'FRAUD', label: 'Fraud' },
      { value: 'HOMICIDE', label: 'Homicide' },
      { value: 'DRUG_RELATED', label: 'Drug Related' },
      { value: 'CYBERCRIME', label: 'Cybercrime' },
      { value: 'DOMESTIC_VIOLENCE', label: 'Domestic Violence' },
      { value: 'SEXUAL_OFFENSE', label: 'Sexual Offense' },
      { value: 'WHITE_COLLAR', label: 'White Collar Crime' },
      { value: 'JUVENILE', label: 'Juvenile Crime' },
      { value: 'TRAFFIC_VIOLATION', label: 'Traffic Violation' },
      { value: 'PUBLIC_ORDER', label: 'Public Order Offense' },
      { value: 'ORGANIZED_CRIME', label: 'Organized Crime' },
      { value: 'TERRORISM', label: 'Terrorism' },
      { value: 'MONEY_LAUNDERING', label: 'Money Laundering' },
      { value: 'HUMAN_TRAFFICKING', label: 'Human Trafficking' },
      { value: 'OTHER', label: 'Other Criminal Matter' }
    ]
  },
  CIVIL: {
    label: 'Civil Law',
    types: [
      { value: 'CONTRACT_DISPUTE', label: 'Contract Dispute' },
      { value: 'PERSONAL_INJURY', label: 'Personal Injury' },
      { value: 'PROPERTY_DISPUTE', label: 'Property Dispute' },
      { value: 'DEFAMATION', label: 'Defamation' },
      { value: 'NEGLIGENCE', label: 'Negligence' },
      { value: 'CIVIL_RIGHTS', label: 'Civil Rights' },
      { value: 'MALPRACTICE', label: 'Malpractice' },
      { value: 'CONSUMER_PROTECTION', label: 'Consumer Protection' },
      { value: 'PRODUCT_LIABILITY', label: 'Product Liability' },
      { value: 'CLASS_ACTION', label: 'Class Action' },
      { value: 'DEBT_COLLECTION', label: 'Debt Collection' },
      { value: 'INSURANCE_CLAIMS', label: 'Insurance Claims' },
      { value: 'OTHER', label: 'Other Civil Matter' }
    ]
  },
  PROPERTY: {
    label: 'Property Law',
    types: [
      { value: 'LAND_DISPUTE', label: 'Land Dispute' },
      { value: 'REAL_ESTATE', label: 'Real Estate' },
      { value: 'TENANT_RIGHTS', label: 'Tenant Rights' },
      { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
      { value: 'BOUNDARY_DISPUTE', label: 'Boundary Dispute' },
      { value: 'EVICTION', label: 'Eviction' },
      { value: 'ZONING', label: 'Zoning Issues' },
      { value: 'CONSTRUCTION', label: 'Construction Disputes' },
      { value: 'EASEMENTS', label: 'Easements' },
      { value: 'FORECLOSURE', label: 'Foreclosure' },
      { value: 'HOMEOWNERS_ASSOCIATION', label: 'HOA Disputes' },
      { value: 'OTHER', label: 'Other Property Matter' }
    ]
  },
  LABOR: {
    label: 'Labor Law',
    types: [
      { value: 'WRONGFUL_TERMINATION', label: 'Wrongful Termination' },
      { value: 'DISCRIMINATION', label: 'Discrimination' },
      { value: 'WORKPLACE_HARASSMENT', label: 'Workplace Harassment' },
      { value: 'WAGE_DISPUTE', label: 'Wage Dispute' },
      { value: 'WORKERS_COMPENSATION', label: 'Workers Compensation' },
      { value: 'LABOR_RIGHTS', label: 'Labor Rights' },
      { value: 'WORKPLACE_SAFETY', label: 'Workplace Safety' },
      { value: 'UNION_DISPUTES', label: 'Union Disputes' },
      { value: 'EMPLOYEE_BENEFITS', label: 'Employee Benefits' },
      { value: 'WHISTLEBLOWER', label: 'Whistleblower Cases' },
      { value: 'SEVERANCE', label: 'Severance Disputes' },
      { value: 'OTHER', label: 'Other Labor Matter' }
    ]
  },
  COMMERCIAL: {
    label: 'Commercial Law',
    types: [
      { value: 'BUSINESS_DISPUTE', label: 'Business Dispute' },
      { value: 'CORPORATE_LAW', label: 'Corporate Law' },
      { value: 'INTELLECTUAL_PROPERTY', label: 'Intellectual Property' },
      { value: 'TRADE_DISPUTE', label: 'Trade Dispute' },
      { value: 'BANKRUPTCY', label: 'Bankruptcy' },
      { value: 'SECURITIES', label: 'Securities' },
      { value: 'MERGERS_ACQUISITIONS', label: 'Mergers & Acquisitions' },
      { value: 'ANTITRUST', label: 'Antitrust' },
      { value: 'FRANCHISING', label: 'Franchising' },
      { value: 'INTERNATIONAL_TRADE', label: 'International Trade' },
      { value: 'VENTURE_CAPITAL', label: 'Venture Capital' },
      { value: 'OTHER', label: 'Other Commercial Matter' }
    ]
  },
  ADMINISTRATIVE: {
    label: 'Administrative Law',
    types: [
      { value: 'LICENSING', label: 'Licensing' },
      { value: 'REGULATORY_COMPLIANCE', label: 'Regulatory Compliance' },
      { value: 'TAX_DISPUTE', label: 'Tax Dispute' },
      { value: 'IMMIGRATION', label: 'Immigration' },
      { value: 'ENVIRONMENTAL', label: 'Environmental' },
      { value: 'GOVERNMENT_BENEFITS', label: 'Government Benefits' },
      { value: 'EDUCATION_LAW', label: 'Education Law' },
      { value: 'HEALTHCARE_REGULATION', label: 'Healthcare Regulation' },
      { value: 'MUNICIPAL_LAW', label: 'Municipal Law' },
      { value: 'ZONING_PERMITS', label: 'Zoning & Permits' },
      { value: 'PUBLIC_UTILITIES', label: 'Public Utilities' },
      { value: 'OTHER', label: 'Other Administrative Matter' }
    ]
  }
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

export default function NewCaseForm({ darkMode = false }: NewCaseFormProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showStepHelp, setShowStepHelp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string>('');
  const router = useRouter();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize form data with all required fields
  const [formData, setFormData] = useState<CaseFormData>({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    region: '',
    zone: '',
    wereda: '',
    kebele: '',
    houseNumber: '',
    kebeleDetails: {
      kebeleNumber: '',
      kebeleName: '',
      manager: {
        fullName: '',
        phone: '',
        email: ''
      }
    },
    caseType: '',
    caseDescription: '',
    tags: [],
    documents: [],
    clientRequest: '',
    requestDetails: {
      questions: [],
      additionalNotes: ''
    },
    documentNotes: '',
    documentChecklist: {},
    assignmentDetails: {
      assignedLawyer: '',
      assignedOffice: '',
      assignmentNotes: '',
      assignmentDate: ''
    }
  });

  const successOptions: SuccessOption[] = [
    {
      title: "Forward to Coordinator",
      description: "Assign this case to a coordinator for initial review and processing. They will help manage and track the case progress.",
      icon: "UserGroupIcon",
      href: "/admin/cases/assign"
    },
    {
      title: "Assign to Lawyer",
      description: "Directly assign this case to a qualified lawyer who will handle the legal proceedings and client representation.",
      icon: "BriefcaseIcon",
      href: "/admin/cases/assign"
    },
    {
      title: "View All Cases",
      description: "Go to the cases dashboard to see all active and pending cases, track their progress, and manage assignments.",
      icon: "FolderOpenIcon",
      href: "/admin/cases"
    },
    {
      title: "Create Another Case",
      description: "Start a new case registration process for another client or legal matter that needs attention.",
      icon: "PlusCircleIcon",
      href: "/admin/cases/new"
    }
  ];

  // Fetch offices when component mounts
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setLoadingOffices(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token not found');
          return;
        }

        const response = await fetch('/api/admin/offices', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch offices');
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data.offices)) {
          setOffices(data.data.offices);
        } else {
          throw new Error('Invalid office data received');
        }
      } catch (error) {
        console.error('Error fetching offices:', error);
        toast.error('Failed to load offices');
      } finally {
        setLoadingOffices(false);
      }
    };

    if (mounted) {
      fetchOffices();
    }
  }, [mounted]);

  // Set the date after component mounts
  useEffect(() => {
    setMounted(true);
    setFormData(prev => ({
      ...prev,
      caseDate: format(new Date(), 'yyyy-MM-dd')
    }));
  }, []);

  if (!mounted) {
    return null; // or a loading skeleton
  }

  const steps = [
    { number: 1, title: 'Client Information' },
    { number: 2, title: 'Location Details' },
    { number: 3, title: 'Kebele Information' },
    { number: 4, title: 'Case Details' },
    { number: 5, title: 'Request & Response' },
    { number: 6, title: 'Documents & Tags' },
    { number: 7, title: 'Assignments' },
    { number: 8, title: 'Review & Submit' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps before showing preview
    for (let step = 1; step <= steps.length; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    // Show preview instead of submitting directly
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/admin/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title || formData.caseDescription?.substring(0, 100) || 'New Case',
          description: formData.caseDescription || '',
          category: formData.category,
          priority: formData.priority,
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          clientAddress: formData.clientAddress,
          region: formData.region,
          zone: formData.zone,
          wereda: formData.wereda,
          kebele: formData.kebele,
          houseNumber: formData.houseNumber,
          clientRequest: formData.clientRequest || formData.caseDescription || 'New case request',
          requestDetails: {
            kebeleManager: formData.kebeleDetails.manager,
            kebeleNumber: formData.kebeleDetails.kebeleNumber,
            kebeleName: formData.kebeleDetails.kebeleName
          },
          tags: formData.tags || []
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create case');
        } else {
          const text = await response.text();
          throw new Error(`Server error: ${response.status} - ${text}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setCreatedCaseId(data.data.case.id);
        setShowSuccess(true);
      } else {
        throw new Error(data.error || 'Failed to create case');
      }
    } catch (error) {
      console.error('Error submitting case:', error);
      setError(error instanceof Error ? error.message : 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.clientName || !formData.clientPhone) {
          toast.error('Please fill in all required client information');
          return false;
        }
        return true;

      case 2:
        if (!formData.wereda || !formData.kebele) {
          toast.error('Please fill in all required location details');
          return false;
        }
        return true;

      case 3:
        if (!formData.kebeleDetails?.kebeleNumber || 
            !formData.kebeleDetails?.kebeleName || 
            !formData.kebeleDetails?.manager?.fullName || 
            !formData.kebeleDetails?.manager?.phone) {
          toast.error('Please fill in all required kebele information');
          return false;
        }
        return true;

      case 4:
        if (!formData.category || !formData.caseType || !formData.caseDescription || !formData.priority) {
          toast.error('Please fill in all required case details');
          return false;
        }
        return true;

      case 5:
        if (!formData.clientRequest) {
          toast.error('Please fill in the client request');
          return false;
        }
        return true;

      case 6:
        // Documents are optional, but tags might be required
        return true;

      case 7:
        // Assignment details might be optional at this stage
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Client Name"
                required
                icon={HiOutlineUser}
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Enter client's full name"
              />

              <FormField
                label="Phone Number"
                required
                icon={HiOutlinePhone}
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="+251 (91) 234-5678"
              />

              <div className="col-span-2">
                <FormField
                  label="Address"
                  icon={HiOutlineLocationMarker}
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  placeholder="Enter client's address"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select
                  value={formData.region || ''}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Region</option>
                  <option value="OROMIA">Oromia</option>
                  <option value="AMHARA">Amhara</option>
                  <option value="SNNPR">SNNPR</option>
                  {/* Add other regions */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Zone</label>
                <input
                  type="text"
                  value={formData.zone || ''}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter zone"
                />
              </div>

              <FormField
                label="Wereda"
                required
                value={formData.wereda || ''}
                onChange={(e) => setFormData({ ...formData, wereda: e.target.value })}
                placeholder="Enter wereda"
              />

              <FormField
                label="Kebele"
                required
                value={formData.kebele || ''}
                onChange={(e) => setFormData({ ...formData, kebele: e.target.value })}
                placeholder="Enter kebele"
              />

              <FormField
                label="House Number"
                value={formData.houseNumber || ''}
                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                placeholder="Enter house number (optional)"
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Kebele Number"
                required
                value={formData.kebeleDetails?.kebeleNumber || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  kebeleDetails: {
                    ...formData.kebeleDetails,
                    kebeleNumber: e.target.value
                  }
                })}
                placeholder="Enter kebele number"
              />

              <FormField
                label="Kebele Name"
                required
                value={formData.kebeleDetails?.kebeleName || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  kebeleDetails: {
                    ...formData.kebeleDetails,
                    kebeleName: e.target.value
                  }
                })}
                placeholder="Enter kebele name"
              />

              <FormField
                label="Main Office"
                value={formData.kebeleDetails?.mainOffice || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  kebeleDetails: {
                    ...formData.kebeleDetails,
                    mainOffice: e.target.value
                  }
                })}
                placeholder="Enter main office location"
              />

              <FormField
                label="Population"
                type="number"
                value={formData.kebeleDetails?.population?.toString() || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  kebeleDetails: {
                    ...formData.kebeleDetails,
                    population: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="Enter kebele population"
              />

              <div className="col-span-2">
                <h3 className="text-lg font-medium mb-4">Kebele Manager Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Manager Name"
                    required
                    icon={HiOutlineUser}
                    value={formData.kebeleDetails?.manager?.fullName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      kebeleDetails: {
                        ...formData.kebeleDetails,
                        manager: {
                          ...formData.kebeleDetails?.manager,
                          fullName: e.target.value
                        }
                      }
                    })}
                    placeholder="Enter manager's name"
                  />

                  <FormField
                    label="Manager Phone"
                    required
                    icon={HiOutlinePhone}
                    value={formData.kebeleDetails?.manager?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      kebeleDetails: {
                        ...formData.kebeleDetails,
                        manager: {
                          ...formData.kebeleDetails?.manager,
                          phone: e.target.value
                        }
                      }
                    })}
                    placeholder="Enter manager's phone"
                  />

                  <FormField
                    label="Manager Email"
                    icon={HiOutlineMail}
                    type="email"
                    value={formData.kebeleDetails?.manager?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      kebeleDetails: {
                        ...formData.kebeleDetails,
                        manager: {
                          ...formData.kebeleDetails?.manager,
                          email: e.target.value
                        }
                      }
                    })}
                    placeholder="Enter manager's email (optional)"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold">Case Information</h2>

            {/* Case Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    category: newCategory,
                    caseType: '' // Reset case type when category changes
                  }));
                }}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="">Select Category</option>
                {Object.entries(caseCategories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Type Selection - Shows only when category is selected */}
            {formData.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Type
                </label>
                <select
                  value={formData.caseType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    caseType: e.target.value
                  }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Type</option>
                  {caseCategories[formData.category].types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Case Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Description
              </label>
              <textarea
                value={formData.caseDescription}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  caseDescription: e.target.value
                }))}
                rows={4}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Provide a detailed description of the case..."
                required
              />
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  priority: e.target.value as CaseFormData['priority']
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="">Select Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Expected Resolution Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Resolution Date
              </label>
              <input
                type="date"
                value={formData.expectedResolutionDate || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expectedResolutionDate: e.target.value
                }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Client's Request</label>
                <textarea
                  value={formData.clientRequest || ''}
                  onChange={(e) => setFormData({ ...formData, clientRequest: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the client's main request..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Questions & Answers</label>
                <div className="space-y-4">
                  {(formData.requestDetails?.questions || []).map((qa, index) => (
                    <div key={index} className="grid grid-cols-1 gap-3 p-4 border rounded-lg">
                      <div>
                        <label className="block text-xs font-medium mb-1">Question {index + 1}</label>
                        <input
                          type="text"
                          value={qa.question}
                          onChange={(e) => {
                            const newQuestions = [...(formData.requestDetails?.questions || [])];
                            newQuestions[index].question = e.target.value;
                            setFormData({
                              ...formData,
                              requestDetails: {
                                ...formData.requestDetails,
                                questions: newQuestions
                              }
                            });
                          }}
                          className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter question"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Answer</label>
                        <textarea
                          value={qa.answer}
                          onChange={(e) => {
                            const newQuestions = [...(formData.requestDetails?.questions || [])];
                            newQuestions[index].answer = e.target.value;
                            setFormData({
                              ...formData,
                              requestDetails: {
                                ...formData.requestDetails,
                                questions: newQuestions
                              }
                            });
                          }}
                          rows={2}
                          className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter answer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newQuestions = [...(formData.requestDetails?.questions || [])];
                          newQuestions.splice(index, 1);
                          setFormData({
                            ...formData,
                            requestDetails: {
                              ...formData.requestDetails,
                              questions: newQuestions
                            }
                          });
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        requestDetails: {
                          ...formData.requestDetails,
                          questions: [
                            ...(formData.requestDetails?.questions || []),
                            { question: '', answer: '' }
                          ]
                        }
                      });
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Add Question & Answer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional Notes</label>
                <textarea
                  value={formData.requestDetails?.additionalNotes || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    requestDetails: {
                      ...formData.requestDetails,
                      additionalNotes: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any additional notes about the request..."
                />
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Document Upload</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload relevant documents for the case. Supported formats: PDF, DOC, DOCX, JPG, PNG
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documentCategories.map((category) => (
                  <div 
                    key={category.value}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 
                      transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{category.label}</h4>
                      <span className="text-sm text-gray-500">
                        {formData.documents.filter(doc => 
                          doc.category === category.value
                        ).length} files
                      </span>
                    </div>

                    <label className="relative flex flex-col items-center p-4 bg-gray-50 
                      border-2 border-dashed border-gray-300 rounded-lg cursor-pointer 
                      hover:bg-gray-100 transition-colors">
                      <HiOutlineDocumentText className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Drop files here or click to upload</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const newDocuments = files.map(file => ({
                            file,
                            category: 'GENERAL',
                            uploadDate: new Date().toISOString(),
                            status: 'PENDING' as const
                          }));
                          setFormData(prev => ({
                            ...prev,
                            documents: [...prev.documents, ...newDocuments]
                          }));
                        }}
                      />
                    </label>

                    <div className="mt-4 space-y-2">
                      {formData.documents
                        .filter(doc => doc.category === category.value)
                        .map((doc, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 bg-white 
                              border border-gray-200 rounded-md"
                          >
                            <div className="flex items-center space-x-3">
                              <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {doc.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  documents: prev.documents.filter((_, i) => i !== index)
                                }));
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <HiOutlineX className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Document Notes
                </label>
                <textarea
                  value={formData.documentNotes || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    documentNotes: e.target.value
                  }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                    focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Add any notes about the uploaded documents..."
                />
              </div>
    
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Document Requirements</h4>
                <div className="space-y-3">
                  {[
                    'Valid identification document',
                    'Proof of residence',
                    'Case-related evidence',
                    'Witness statements (if applicable)',
                    'Previous case documents (if any)',
                    'Power of attorney (if applicable)'
                  ].map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.documentChecklist?.[index] || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            documentChecklist: {
                              ...prev.documentChecklist,
                              [index]: e.target.checked
                            }
                          }));
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 
                          border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              {renderOfficeSelection()}
              
              {/* Rest of your assignment form fields */}
              {/* ... */}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderOfficeSelection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Assign to Office
        </label>
        {loadingOffices ? (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded-lg" />
        ) : (
          <select
            value={formData.assignmentDetails?.officeId || ''}
            onChange={(e) => setFormData({
              ...formData,
              assignmentDetails: {
                ...formData.assignmentDetails,
                officeId: e.target.value
              }
            })}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              focus:ring-primary-500 dark:focus:ring-primary-400
              focus:border-primary-500 dark:focus:border-primary-400"
          >
            <option value="">Select Office</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name} {office.location ? `(${office.location})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Assignment Date
        </label>
        <input
          type="date"
          value={formData.assignmentDetails?.assignmentDate || ''}
          onChange={(e) => setFormData({
            ...formData,
            assignmentDetails: {
              ...formData.assignmentDetails,
              assignmentDate: e.target.value
            }
          })}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            focus:ring-primary-500 dark:focus:ring-primary-400
            focus:border-primary-500 dark:focus:border-primary-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Assignment Notes
        </label>
        <textarea
          value={formData.assignmentDetails?.assignmentNotes || ''}
          onChange={(e) => setFormData({
            ...formData,
            assignmentDetails: {
              ...formData.assignmentDetails,
              assignmentNotes: e.target.value
            }
          })}
          rows={4}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            focus:ring-primary-500 dark:focus:ring-primary-400
            focus:border-primary-500 dark:focus:border-primary-400"
          placeholder="Add any notes about the assignment..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Assignment Priority
        </label>
        <select
          value={formData.assignmentDetails?.priority || ''}
          onChange={(e) => setFormData({
            ...formData,
            assignmentDetails: {
              ...formData.assignmentDetails,
              priority: e.target.value as Priority
            }
          })}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            focus:ring-primary-500 dark:focus:ring-primary-400
            focus:border-primary-500 dark:focus:border-primary-400"
        >
          <option value="">Select Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
    </div>
  );

  const getStepHelp = (step: number): { title: string; content: React.ReactNode } => {
    switch (step) {
      case 1:
        return {
          title: "Client Information Help",
          content: (
            <div className="space-y-4">
              <p>Fill in the client's basic contact information:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Full Name: Enter the client's complete legal name</li>
                <li>Phone Number: Primary contact number in international format</li>
                <li>Address: Current residential address (optional)</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip: Make sure to verify the phone number as this will be the primary means of contact.
                </p>
              </div>
            </div>
          )
        };
      case 2:
        return {
          title: "Location Details Help",
          content: (
            <div className="space-y-4">
              <p>Specify the client's location details:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Region: Select from available administrative regions</li>
                <li>Zone: Specific zone within the region</li>
                <li>Wereda: Required administrative district</li>
                <li>Kebele: Required local district</li>
                <li>House Number: Optional for precise location</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip: Wereda and Kebele are required for proper case jurisdiction.
                </p>
      </div>
            </div>
          )
        };
      case 3:
        return {
          title: "Kebele Information Help",
          content: (
            <div className="space-y-4">
              <p>Enter the kebele information:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Kebele Number: Enter the unique kebele identification number</li>
                <li>Kebele Name: Enter the official name of the kebele</li>
                <li>Main Office: Enter the main office location</li>
                <li>Population: Enter the approximate population of the kebele</li>
                <li>Manager Information: Enter the kebele manager's contact details</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip: Make sure to fill in all required fields marked with an asterisk (*).
                </p>
              </div>
            </div>
          )
        };
      case 4:
        return {
          title: "Case Details Help",
          content: (
            <div className="space-y-4">
              <p>Enter the case specifics:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Category: Main legal area of the case</li>
                <li>Type: Specific type within the category</li>
                <li>Description: Detailed explanation of the case</li>
                <li>Priority: Urgency level of the case</li>
                <li>Expected Resolution: Target date for resolution</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip: Be specific in the description and choose priority carefully.
                </p>
              </div>
            </div>
          )
        };
      case 5:
        return {
          title: "Request & Response Help",
          content: (
            <div className="space-y-4">
              <p>Document the client's request and related information:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Client Request: Main legal assistance needed</li>
                <li>Q&A: Important questions and their answers</li>
                <li>Additional Notes: Any relevant extra information</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip: Use the Q&A section to document important case details systematically.
                </p>
              </div>
            </div>
          )
        };
      case 6:
        return {
          title: "Documents & Tags Help",
          content: (
            <div className="space-y-4">
              <p>Upload and organize case documents:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Documents: Upload relevant files by category</li>
                <li>Document Notes: Add context to uploads</li>
                <li>Requirements Checklist: Track required documents</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip: Use the checklist to ensure all required documents are included.
                </p>
              </div>
            </div>
          )
        };
      case 7:
        return {
          title: "Assignments Help",
          content: (
            <div className="space-y-4">
              <p>Assign the case to a lawyer and office:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Assign to Lawyer: Select a lawyer to handle the case</li>
                <li>Assign to Office: Select an office to handle the case</li>
                <li>Assignment Date: Select the date the case is assigned</li>
                <li>Assignment Notes: Add any notes about the assignment</li>
                <li>Assignment Priority: Select the priority of the assignment</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip: Make sure to assign the case to a lawyer and office.
                </p>
              </div>
            </div>
          )
        };
      default:
        return {
          title: "Review Help",
          content: (
            <div className="space-y-4">
              <p>Review all information before submission:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Check all entered information for accuracy</li>
                <li>Verify document uploads are complete</li>
                <li>Ensure all required fields are filled</li>
              </ul>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip: Take time to review everything as this will create an official case record.
                </p>
              </div>
            </div>
          )
        };
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <CheckIcon className="h-10 w-10 text-green-600 dark:text-green-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Case Created Successfully!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              The case has been registered in the system. What would you like to do next?
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p>Case ID: <span className="font-mono">{createdCaseId}</span></p>
              <p>Make sure to note down this case ID for future reference.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-8">
            {successOptions.map((option) => (
              <button
                key={option.title}
                onClick={() => router.push(option.href)}
                className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      {/* Replace with actual icon component based on option.icon */}
                      <span className="text-blue-600 dark:text-blue-300 text-2xl">
                        {option.icon === 'UserGroupIcon' && '👥'}
                        {option.icon === 'BriefcaseIcon' && '💼'}
                        {option.icon === 'FolderOpenIcon' && '📂'}
                        {option.icon === 'PlusCircleIcon' && '➕'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                      {option.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-900 dark:to-primary-700 py-8 mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">New Case Registration</h1>
          <p className="text-primary-100">Create a new legal case with detailed information and documentation</p>
          
          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex justify-between relative">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 relative">
                  {/* Progress Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-5 left-7 right-7 h-0.5 
                      ${step.number <= currentStep ? 'bg-primary-300' : 'bg-gray-600'}`} />
                  )}
                  
                  {/* Step Circle */}
                  <div className="relative flex flex-col items-center group">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center 
                        transition-all duration-200 ${
                        step.number < currentStep
                          ? 'bg-green-500'
                          : step.number === currentStep
                          ? 'bg-white'
                          : darkMode ? 'bg-gray-600' : 'bg-primary-300'
                      }`}
                    >
                      {step.number < currentStep ? (
                        <HiOutlineCheck className="w-6 h-6 text-white" />
                      ) : (
                        <span className={`text-sm font-medium ${
                          step.number === currentStep ? 'text-primary-600' : 'text-white'
                        }`}>
                          {step.number}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{step.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {showPreview ? (
          <PreviewCase
            data={formData}
            onConfirm={handleConfirmSubmit}
            onBack={() => setShowPreview(false)}
            loading={loading}
            darkMode={darkMode}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {steps[currentStep - 1].title}
              </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getStepDescription(currentStep)}
              </p>
                </div>
                <button
                  onClick={() => setShowStepHelp(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                    dark:hover:text-gray-200 transition-colors"
                >
                  <HiOutlineQuestionMarkCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowHelpGuide(true)}
                    className="inline-flex items-center px-3 py-2 text-sm text-gray-600 
                      dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                      transition-colors"
                  >
                    <HiOutlineQuestionMarkCircle className="w-5 h-5 mr-1" />
                    Help Guide
                  </button>
                </div>

                <div className="flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium 
                        text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 
                        border border-gray-300 dark:border-gray-600 rounded-md 
                        hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <HiOutlineChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </button>
                )}
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium 
                        text-white bg-primary-600 border border-transparent rounded-md 
                        hover:bg-primary-700 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Next
                    <HiOutlineChevronRight className="w-5 h-5 ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium 
                        text-white bg-primary-600 border border-transparent rounded-md 
                        hover:bg-primary-700 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                          fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" 
                            stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Case...
                      </>
                    ) : (
                      <>
                        Create Case
                        <HiOutlineCheck className="w-5 h-5 ml-1" />
                      </>
                    )}
                  </button>
                )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Help Guide Modal */}
      <AnimatePresence>
        {showHelpGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowHelpGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl 
                max-w-lg mx-4 border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                How to Use This Form
              </h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>This form guides you through the process of creating a new legal case.</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Fill in the client's basic information</li>
                  <li>Provide detailed location information</li>
                  <li>Select case type and provide description</li>
                  <li>Document the client's request and relevant Q&A</li>
                  <li>Upload necessary documents and add tags</li>
                  <li>Review all information before submission</li>
                </ol>
                <p>Required fields are marked with a red asterisk (*)</p>
              </div>
              <button
                className="mt-6 px-4 py-2 text-sm font-medium text-gray-700 
                  dark:text-gray-200 bg-white dark:bg-gray-700 border 
                  border-gray-300 dark:border-gray-600 rounded-md 
                  hover:bg-gray-50 dark:hover:bg-gray-600"
                onClick={() => setShowHelpGuide(false)}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}

        {showStepHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowStepHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl 
                max-w-lg mx-4 border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getStepHelp(currentStep).title}
                </h3>
                <button
                  onClick={() => setShowStepHelp(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {getStepHelp(currentStep).content}
              </div>
              <button
                className="mt-6 px-4 py-2 text-sm font-medium text-gray-700 
                  dark:text-gray-200 bg-white dark:bg-gray-700 border 
                  border-gray-300 dark:border-gray-600 rounded-md 
                  hover:bg-gray-50 dark:hover:bg-gray-600"
                onClick={() => setShowStepHelp(false)}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStepDescription(step: number): string {
  switch (step) {
    case 1:
      return "Enter the client's basic information and contact details";
    case 2:
      return "Specify the location details including region, zone, wereda, and kebele";
    case 3:
      return "Provide information about the case type, description, and priority";
    case 4:
      return "Document the client's request and relevant questions & answers";
    case 5:
      return "Upload and organize case documents and add tags";
    case 6:
      return "Review all information before creating the case";
    case 7:
      return "Assign the case to a lawyer and office";
    default:
      return "";
  }
}