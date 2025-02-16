"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineTrash,
  HiOutlineUpload
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
    gender: string;
    nationalId: string;
  phone: string;
  email: string;
  address: string;

  // Legal Information
    caseType: string;
  caseDescription: string;
  opposingParty: string;
  courtInvolved: boolean;
  courtDetails?: string;
    previousLegalAid: boolean;
  urgencyLevel: 'low' | 'medium' | 'high';

  // Financial Information
  monthlyIncome: string;
  employmentStatus: string;
  dependents: number;
  assets: string;
  
  // Consent
  consentToVerification: boolean;
  consentToShare: boolean;
  declarationOfTruth: boolean;

  // Additional Information
  preferredLanguage: string;
  interpreterNeeded: boolean;
  documentationAttached: boolean;
  documents: File[];
  preferredContactMethod: 'email' | 'phone' | 'both';
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  previousCaseReference?: string;
  hearAboutUs: string;
}

// Add validation interface
interface ValidationErrors {
  [key: string]: string;
}

// Add language options
const languages = [
  { code: 'am', name: 'Amharic' },
  { code: 'or', name: 'Oromiffa' },
  { code: 'en', name: 'English' },
  { code: 'ti', name: 'Tigrinya' }
];

export default function LegalAidRegistration() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [documents, setDocuments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
      gender: '',
      nationalId: '',
    phone: '',
    email: '',
    address: '',
    caseType: '',
    caseDescription: '',
    opposingParty: '',
    courtInvolved: false,
    previousLegalAid: false,
    urgencyLevel: 'medium',
    monthlyIncome: '',
      employmentStatus: '',
      dependents: 0,
    assets: '',
    consentToVerification: false,
    consentToShare: false,
    declarationOfTruth: false,
    preferredLanguage: '',
    interpreterNeeded: false,
    documentationAttached: false,
    documents: [],
    preferredContactMethod: 'email',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    previousCaseReference: '',
    hearAboutUs: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Add form validation
  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Personal Info Validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.nationalId) newErrors.nationalId = 'National ID is required';

    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    if (formData.phone && !/^(\+251|0)[1-9][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid Ethiopian phone number';
    }

    // Case Information Validation
    if (!formData.caseType) newErrors.caseType = 'Case type is required';
    if (!formData.caseDescription) newErrors.caseDescription = 'Case description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValid) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
      }
      return isValid;
    });
    setDocuments([...documents, ...validFiles]);
  };

  // Enhanced submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSubmit.append(key, value.toString());
      });
      
      documents.forEach(file => {
        formDataToSubmit.append('documents', file);
      });

      // Add API call here
      const response = await fetch('/api/legal-aid/register', {
        method: 'POST',
        body: formDataToSubmit
      });

      if (!response.ok) throw new Error('Submission failed');

      toast.success('Application submitted successfully');
      router.push('/client/dashboard');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add document preview component
  const DocumentPreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => (
    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
      <div className="flex items-center">
        <HiOutlineDocumentText className="w-5 h-5 text-primary-500 mr-2" />
        <span className="text-sm truncate">{file.name}</span>
      </div>
      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-600"
      >
        <HiOutlineTrash className="w-5 h-5" />
      </button>
    </div>
  );

  const renderProgressBar = () => (
          <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center
              ${index + 1 <= currentStep 
                      ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700'}`} 
          >
            {index + 1}
                </div>
              ))}
            </div>
      <div className="flex justify-between text-sm">
        <span>Personal Info</span>
        <span>Legal Details</span>
        <span>Financial Info</span>
        <span>Review & Submit</span>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
            </div>
          </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

                  <div>
        <label className="block text-sm font-medium mb-2">National ID</label>
                      <input
                        type="text"
          value={formData.nationalId}
          onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

      <div>
        <label className="block text-sm font-medium mb-2">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={3}
        />
      </div>
                </div>
  );

  const renderLegalInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Type of Legal Issue</label>
        <select
          value={formData.caseType}
          onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select case type</option>
          <option value="family">Family Law</option>
          <option value="criminal">Criminal Defense</option>
          <option value="civil">Civil Litigation</option>
          <option value="property">Property Dispute</option>
          <option value="employment">Employment Law</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Case Description</label>
        <textarea
          value={formData.caseDescription}
          onChange={(e) => setFormData({ ...formData, caseDescription: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={4}
          placeholder="Please provide details about your legal issue..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Opposing Party</label>
        <input
          type="text"
          value={formData.opposingParty}
          onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Name of person or organization"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.courtInvolved}
            onChange={(e) => setFormData({ ...formData, courtInvolved: e.target.checked })}
            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <label>Is there any court involvement?</label>
        </div>

        {formData.courtInvolved && (
          <textarea
            value={formData.courtDetails}
            onChange={(e) => setFormData({ ...formData, courtDetails: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Please provide court details..."
            rows={3}
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Urgency Level</label>
        <div className="flex space-x-4">
          {['low', 'medium', 'high'].map((level) => (
            <label key={level} className="flex items-center space-x-2">
              <input
                type="radio"
                value={level}
                checked={formData.urgencyLevel === level}
                onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value as any })}
                className="text-primary-500 focus:ring-primary-500"
              />
              <span className="capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinancialInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Monthly Income (ETB)</label>
        <input
          type="number"
          value={formData.monthlyIncome}
          onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Employment Status</label>
        <select
          value={formData.employmentStatus}
          onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select status</option>
          <option value="employed">Employed</option>
          <option value="self-employed">Self-employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="student">Student</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Number of Dependents</label>
        <input
          type="number"
          value={formData.dependents}
          onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Assets (Optional)</label>
        <textarea
          value={formData.assets}
          onChange={(e) => setFormData({ ...formData, assets: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="List any significant assets..."
        />
      </div>
    </div>
  );

  const renderReviewAndConsent = () => (
    <div className="space-y-6">
      {/* Summary of provided information */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h3 className="font-medium mb-4">Application Summary</h3>
        {/* Add summary sections here */}
      </div>

      {/* Consent checkboxes */}
      <div className="space-y-4">
        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={formData.consentToVerification}
            onChange={(e) => setFormData({ ...formData, consentToVerification: e.target.checked })}
            className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm">
            I consent to the verification of the information provided in this application.
          </span>
        </label>

        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={formData.consentToShare}
            onChange={(e) => setFormData({ ...formData, consentToShare: e.target.checked })}
            className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm">
            I agree that my information may be shared with relevant legal aid providers.
          </span>
        </label>

        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={formData.declarationOfTruth}
            onChange={(e) => setFormData({ ...formData, declarationOfTruth: e.target.checked })}
            className="mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm">
            I declare that all information provided is true and accurate to the best of my knowledge.
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Legal Aid Application</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Please complete all required information to apply for legal aid assistance.
      </p>

      {renderProgressBar()}

      <form onSubmit={handleSubmit} className="space-y-8">
        {currentStep === 1 && renderPersonalInfo()}
        {currentStep === 2 && renderLegalInfo()}
        {currentStep === 3 && renderFinancialInfo()}
        {currentStep === 4 && renderReviewAndConsent()}

        <div className="flex justify-between">
          {currentStep > 1 && (
                <button
                  type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
              )}
          
          {currentStep < totalSteps ? (
                <button
                  type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg
                    hover:bg-primary-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white rounded-lg
                    hover:bg-primary-600 transition-colors"
            >
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 