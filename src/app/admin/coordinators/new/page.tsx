"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CoordinatorType, CoordinatorStatus } from '@prisma/client';
import { 
  HiOutlineOfficeBuilding, 
  HiOutlineUser, 
  HiOutlineCalendar, 
  HiOutlineBriefcase, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineLockClosed,
  HiOutlineDocumentAdd,
  HiOutlineSave,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineX
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Add type definitions for the enums
type CoordinatorTypeEnum = keyof typeof CoordinatorType;
type CoordinatorStatusEnum = keyof typeof CoordinatorStatus;

interface FormData {
  // User Info
  fullName: string;
  email: string;
  phone: string;
  password: string;

  // Coordinator Info
  type: CoordinatorTypeEnum;
  officeId: string;
  startDate: string;
  endDate?: string;
  specialties: string[];
  status: CoordinatorStatusEnum;

  // Additional Fields
  qualifications: Array<{
    type: string;
    title: string;
    institution: string;
    dateObtained: string;
    expiryDate?: string;
    score?: number;
  }>;
}

interface Office {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentCount: number;
  available: boolean;
}

// DULAS Color Scheme
const dulasPalette = {
  primaryGreen: '#00572d',    // Primary Green for headers, navbar, highlights
  secondaryGreen: '#1f9345',  // Secondary Green for hover states, buttons
  accentYellowGold: '#f3c300', // Accent Yellow-Gold for highlights, hover effects
  textPrimary: '#333333',     // Text Primary
  background: '#ffffff',      // Background
  footerDark: '#1a1a1a'       // Footer Dark
};

const formStyles = {
  container: "max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg",
  header: "border-b border-[#00572d] pb-4",
  sectionHeader: "flex items-center text-lg font-semibold text-[#00572d] dark:text-gray-100 mb-4",
  formGrid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  inputGroup: "space-y-2",
  label: "block text-sm font-medium text-[#333333] dark:text-gray-300",
  input: "w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-[#1f9345] focus:ring-[#1f9345] transition-colors duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500",
  inputWithIcon: "w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm pl-10 focus:border-[#1f9345] focus:ring-[#1f9345] transition-colors duration-200",
  inputWrapper: "relative",
  inputIcon: "absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00572d] dark:text-gray-500",
  inputError: "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500",
  inputSuccess: "border-[#1f9345] dark:border-green-600 focus:border-[#1f9345] focus:ring-[#1f9345]",
  helperText: "text-xs mt-1",
  errorText: "text-red-500 dark:text-red-400",
  successText: "text-[#1f9345] dark:text-green-400",
  requiredStar: "text-red-500 dark:text-red-400 ml-1",
  select: "w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-[#1f9345] focus:ring-[#1f9345]",
  button: {
    primary: "px-4 py-2 bg-[#00572d] text-white rounded-lg hover:bg-[#1f9345] focus:outline-none focus:ring-2 focus:ring-[#1f9345] focus:ring-offset-2 transition-colors duration-200",
    secondary: "px-4 py-2 bg-gray-100 text-[#333333] rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200",
    danger: "px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
  },
  timeline: {
    container: "mb-8 relative",
    line: "absolute w-full h-1 bg-gray-200 top-1/2 transform -translate-y-1/2",
    steps: "relative z-10 flex justify-between",
    step: "flex flex-col items-center",
    circle: {
      active: "w-8 h-8 rounded-full bg-[#00572d] text-white flex items-center justify-center",
      inactive: "w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center",
      completed: "w-8 h-8 rounded-full bg-[#1f9345] text-white flex items-center justify-center"
    },
    label: {
      active: "mt-2 text-sm font-medium text-[#00572d]",
      inactive: "mt-2 text-sm font-medium text-gray-500",
      completed: "mt-2 text-sm font-medium text-[#1f9345]"
    }
  }
};

const InputWithIcon = ({ 
  icon: Icon, 
  label, 
  required, 
  error, 
  success, 
  helperText,
  ...props 
}: { 
  icon: any;
  label: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  helperText?: React.ReactNode;
  [key: string]: any;
}) => (
  <div className={formStyles.inputGroup}>
    <label className={formStyles.label}>
      {label}
      {required && <span className={formStyles.requiredStar}>*</span>}
    </label>
    <div className={formStyles.inputWrapper}>
      <Icon className={formStyles.inputIcon} />
      <input
        {...props}
        className={`${formStyles.inputWithIcon} 
          ${error ? formStyles.inputError : ''} 
          ${success ? formStyles.inputSuccess : ''}`}
      />
    </div>
    {typeof helperText === 'string' ? (
      <p className={`${formStyles.helperText} 
        ${error ? formStyles.errorText : 
          success ? formStyles.successText : 'text-gray-500'}`}>
        {helperText}
      </p>
    ) : (
      helperText
    )}
    {error && (
      <p className={`${formStyles.helperText} ${formStyles.errorText}`}>
        {error}
      </p>
    )}
  </div>
);

const AddCoordinatorPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [officeError, setOfficeError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    special: false,
    uppercase: false
  });

  // Animation variants for motion components
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    type: CoordinatorType.FULL_TIME,
    officeId: '',
    startDate: '',
    endDate: '',
    specialties: [],
    status: CoordinatorStatus.ACTIVE,
    qualifications: []
  });

  const fetchOffices = async () => {
    try {
      const response = await fetch('/api/offices');
      if (!response.ok) {
        throw new Error('Failed to fetch offices');
      }
      const result = await response.json();
      
      // Extract offices from the response data structure
      const officesData = result.data.offices || [];
      
      // Transform the data to include availability
      const officesWithAvailability = await Promise.all(
        officesData.map(async (office: any) => {
          try {
            const availabilityResponse = await fetch(`/api/offices/${office.id}/availability`);
            if (!availabilityResponse.ok) {
              throw new Error('Failed to check availability');
            }
            const availability = await availabilityResponse.json();
            return {
              ...office,
              capacity: availability.maxAllowed,
              currentCount: availability.currentCount,
              available: availability.available
            };
          } catch (error) {
            console.error(`Failed to check availability for office ${office.id}:`, error);
            return {
              ...office,
              capacity: 0,
              currentCount: 0,
              available: false
            };
          }
        })
      );
      
      // Filter out offices that are not active
      const activeOffices = officesWithAvailability.filter((office: any) => office.status === 'ACTIVE');
      setOffices(activeOffices);
    } catch (error) {
      console.error('Failed to fetch offices:', error);
      toast.error('Failed to fetch offices');
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const steps = [
    { number: 1, title: "Personal Info", icon: HiOutlineUser },
    { number: 2, title: "Employment", icon: HiOutlineBriefcase },
    { number: 3, title: "Qualifications", icon: HiOutlineCalendar }
  ];

  // Define timeline steps
  const timelineSteps = [
    { number: 1, title: "Personal Info", icon: HiOutlineUser },
    { number: 2, title: "Employment", icon: HiOutlineBriefcase },
    { number: 3, title: "Qualifications", icon: HiOutlineDocumentAdd }
  ];

  const Timeline = () => (
    <div className={formStyles.timeline.container}>
      <motion.div 
        className={formStyles.timeline.line}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      <div className={formStyles.timeline.steps}>
        {timelineSteps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const Icon = step.icon;
          
          return (
            <motion.div 
              key={step.number}
              className={formStyles.timeline.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <motion.div 
                className={
                  isCompleted ? formStyles.timeline.circle.completed :
                  isActive ? formStyles.timeline.circle.active :
                  formStyles.timeline.circle.inactive
                }
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                {isCompleted ? <HiOutlineCheck className="w-4 h-4" /> : 
                 isActive ? <Icon className="w-4 h-4" /> : step.number}
              </motion.div>
              <span 
                className={
                  isCompleted ? formStyles.timeline.label.completed :
                  isActive ? formStyles.timeline.label.active :
                  formStyles.timeline.label.inactive
                }
              >
                {step.title}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const validatePassword = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: /[A-Z]/.test(password)
    });
  };

  const validateForm = (): boolean => {
    // Required fields validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!Object.values(passwordStrength).every(v => v)) {
      toast.error('Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character');
      return false;
    }

    // Type and Office validation
    if (!formData.type || !formData.officeId) {
      toast.error('Please select both Type and Office');
      return false;
    }

    // Start date validation
    if (!formData.startDate) {
      toast.error('Please select a start date');
      return false;
    }

    // End date validation for part-time coordinators
    if (formData.type === CoordinatorType.PART_TIME && !formData.endDate) {
      toast.error('Please select an end date for part-time coordinator');
      return false;
    }

    // Specialties validation
    if (formData.specialties.length === 0) {
      toast.error('Please select at least one specialty');
      return false;
    }

    // Phone validation (if provided)
    if (formData.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error('Please enter a valid phone number (minimum 10 digits)');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const coordinatorData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        officeId: formData.officeId,
        phone: formData.phone,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        specialties: formData.specialties,
        status: formData.status,
        qualifications: formData.qualifications
      };

      const result = await fetch('/api/admin/coordinators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(coordinatorData)
      });

      const responseData = await result.json();
      
      if (result.ok) {
        toast.success('Coordinator created successfully');
        // Force a hard refresh to ensure data is reloaded
        window.location.href = '/admin/coordinators';
      } else {
        // Handle specific Prisma errors
        if (responseData.code === 'P2002') {
          // Unique constraint violation
          const field = responseData.meta?.target?.[0] || 'field';
          if (field === 'phone') {
            toast.error('This phone number is already registered. Please use a different phone number.');
          } else if (field === 'email') {
            toast.error('This email address is already registered. Please use a different email.');
          } else {
            toast.error(`This ${field} is already in use. Please try a different value.`);
          }
        } else if (responseData.error) {
          // Handle other server errors
          toast.error(responseData.error);
        } else if (responseData.errors) {
          // Handle multiple validation errors
          Object.entries(responseData.errors).forEach(([field, message]) => {
            toast.error(`${field}: ${message}`);
          });
        } else {
          toast.error('Failed to create coordinator. Please try again.');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        {
          type: '',
          title: '',
          institution: '',
          dateObtained: '',
          expiryDate: '',
          score: undefined
        }
      ]
    }));
  };

  const handleRemoveQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleQualificationChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOfficeChange = async (officeId: string) => {
    try {
      const selectedOffice = offices.find(office => office.id === officeId);
      if (!selectedOffice) {
        toast.error('Invalid office selected');
        return;
      }

      if (!selectedOffice.available) {
        toast.error(`This office has reached its maximum capacity of ${selectedOffice.capacity} coordinators (${selectedOffice.currentCount}/${selectedOffice.capacity})`);
        return;
      }

      setFormData(prev => ({ ...prev, officeId }));
    } catch (error) {
      console.error('Error checking office availability:', error);
      toast.error('Failed to check office availability. Please try again.');
    }
  };

  return (
    <div className={formStyles.container}>
      <div className={formStyles.header}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Add New Coordinator
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create a new coordinator account with their details and qualifications.
        </p>
      </div>

      <Timeline />

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#00572d]"
          >
            <h2 className={formStyles.sectionHeader}>
              <HiOutlineUser className="w-5 h-5 mr-2 text-[#00572d]" />
              Personal Information
            </h2>
            <div className={formStyles.formGrid}>
              <InputWithIcon
                icon={HiOutlineUser}
                label="Full Name"
                required
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))}
                placeholder="John Doe"
                helperText="Enter your legal full name"
              />

              <InputWithIcon
                icon={HiOutlineMail}
                label="Email"
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                placeholder="john.doe@example.com"
                helperText="Work email address"
              />

              <InputWithIcon
                icon={HiOutlinePhone}
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                placeholder="+251 (91) 234-5678"
                helperText="Optional phone number"
              />

              <InputWithIcon
                icon={HiOutlineLockClosed}
                label="Password"
                required
                type="password"
                value={formData.password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  validatePassword(newPassword);
                  setFormData(prev => ({
                    ...prev,
                    password: newPassword
                  }));
                }}
                placeholder="Enter password"
                helperText={
                  <div>
                    <p className="text-sm mb-2">Password requirements:</p>
                    <div className="text-xs space-y-1">
                      <div className={`flex items-center ${passwordStrength.length ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.length ? '✓' : '○'} At least 8 characters
                      </div>
                      <div className={`flex items-center ${passwordStrength.uppercase ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.uppercase ? '✓' : '○'} One uppercase letter
                      </div>
                      <div className={`flex items-center ${passwordStrength.number ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.number ? '✓' : '○'} One number
                      </div>
                      <div className={`flex items-center ${passwordStrength.special ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.special ? '✓' : '○'} One special character
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                className={formStyles.button.primary}
                onClick={() => setCurrentStep(2)}
              >
                Next Step
              </button>
            </div>
          </motion.section>
        )}

        {/* Step 2: Employment Details */}
        {currentStep === 2 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#00572d]"
          >
            <h2 className={formStyles.sectionHeader}>
              <HiOutlineBriefcase className="w-5 h-5 mr-2 text-[#00572d]" />
              Employment Details
            </h2>
            <div className={formStyles.formGrid}>
              <div className={formStyles.inputGroup}>
                <label className={formStyles.label}>Type</label>
                <select
                  required
                  className={formStyles.select}
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    type: e.target.value as CoordinatorTypeEnum
                  }))}
                >
                  <option value="">Select Type</option>
                  {Object.values(CoordinatorType).map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className={formStyles.inputGroup}>
                <label className={formStyles.label}>Office Location</label>
                <select
                  required
                  className={`${formStyles.select} ${officeError ? 'border-red-500' : ''}`}
                  value={formData.officeId}
                  onChange={(e) => handleOfficeChange(e.target.value)}
                >
                  <option value="">Select Office</option>
                  {offices.length === 0 ? (
                    <option disabled>No offices available</option>
                  ) : (
                    offices.map(office => {
                      const availableSlots = office.capacity - office.currentCount;
                      const isAvailable = office.available;
                      const displayName = `${office.name} (${office.location})`;
                      const capacityInfo = isAvailable 
                        ? `${office.currentCount}/${office.capacity} coordinators (${availableSlots} slots available)`
                        : `${office.currentCount}/${office.capacity} coordinators (Full)`;

                      return (
                        <option 
                          key={office.id} 
                          value={office.id}
                          disabled={!isAvailable}
                          className={!isAvailable ? 'text-gray-400' : ''}
                        >
                          {displayName} - {capacityInfo}
                        </option>
                      );
                    })
                  )}
                </select>
                {officeError && (
                  <p className="text-red-500 text-sm mt-1">{officeError}</p>
                )}
                {offices.length === 0 && (
                  <p className="text-amber-500 text-sm mt-1">No active offices found. Please contact an administrator.</p>
                )}
              </div>

              <div className={formStyles.inputGroup}>
                <label className={formStyles.label}>Specialties</label>
                <select
                  multiple
                  className={`${formStyles.select} h-32`}
                  value={formData.specialties}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({
                      ...prev,
                      specialties: values
                    }));
                  }}
                >
                  <option value="FAMILY_LAW">Family Law</option>
                  <option value="CORPORATE_LAW">Corporate Law</option>
                  <option value="CRIMINAL_LAW">Criminal Law</option>
                  <option value="CIVIL_LAW">Civil Law</option>
                  <option value="IMMIGRATION">Immigration</option>
                  <option value="REAL_ESTATE">Real Estate</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Hold Ctrl/Cmd to select multiple specialties
                </p>
              </div>

              <div className="space-y-4">
                <div className={formStyles.inputGroup}>
                  <label className={formStyles.label}>Start Date</label>
                  <input
                    type="date"
                    required
                    className={formStyles.input}
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))}
                  />
                </div>

                {formData.type === CoordinatorType.PART_TIME && (
                  <div className={formStyles.inputGroup}>
                    <label className={formStyles.label}>End Date</label>
                    <input
                      type="date"
                      required
                      className={formStyles.input}
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                className={formStyles.button.secondary}
                onClick={() => setCurrentStep(1)}
              >
                Previous Step
              </button>
              <button
                type="button"
                className={formStyles.button.primary}
                onClick={() => setCurrentStep(3)}
              >
                Next Step
              </button>
            </div>
          </motion.section>
        )}

        {/* Step 3: Qualifications */}
        {currentStep === 3 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#00572d]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={formStyles.sectionHeader}>
                <HiOutlineDocumentAdd className="w-5 h-5 mr-2 text-[#00572d]" />
                Qualifications
              </h2>
              <button
                type="button"
                onClick={handleAddQualification}
                className={formStyles.button.primary}
              >
                Add Qualification
              </button>
            </div>

            {formData.qualifications.map((qualification, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                <div className={formStyles.formGrid}>
                  <div className={formStyles.inputGroup}>
                    <label className={formStyles.label}>Type</label>
                    <select
                      className={formStyles.select}
                      value={qualification.type}
                      onChange={(e) => handleQualificationChange(index, 'type', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="EDUCATION">Education</option>
                      <option value="CERTIFICATION">Certification</option>
                      <option value="TRAINING">Training</option>
                    </select>
                  </div>

                  <div className={formStyles.inputGroup}>
                    <label className={formStyles.label}>Title</label>
                    <input
                      type="text"
                      className={formStyles.input}
                      value={qualification.title}
                      onChange={(e) => handleQualificationChange(index, 'title', e.target.value)}
                    />
                  </div>

                  <div className={formStyles.inputGroup}>
                    <label className={formStyles.label}>Institution</label>
                    <input
                      type="text"
                      className={formStyles.input}
                      value={qualification.institution}
                      onChange={(e) => handleQualificationChange(index, 'institution', e.target.value)}
                    />
                  </div>

                  <div className={formStyles.inputGroup}>
                    <label className={formStyles.label}>Date Obtained</label>
                    <input
                      type="date"
                      className={formStyles.input}
                      value={qualification.dateObtained}
                      onChange={(e) => handleQualificationChange(index, 'dateObtained', e.target.value)}
                    />
                  </div>

                  <div className={formStyles.inputGroup}>
                    <label className={formStyles.label}>Score (if applicable)</label>
                    <input
                      type="number"
                      step="0.01"
                      className={formStyles.input}
                      value={qualification.score || ''}
                      onChange={(e) => handleQualificationChange(index, 'score', parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="flex justify-end col-span-full">
                    <button
                      type="button"
                      onClick={() => handleRemoveQualification(index)}
                      className={formStyles.button.danger}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                className={formStyles.button.secondary}
                onClick={() => setCurrentStep(2)}
              >
                Previous Step
              </button>
              <button
                type="submit"
                className={`${formStyles.button.primary} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Coordinator'
                )}
              </button>
            </div>
          </motion.section>
        )}
      </form>
    </div>
  );
};

export default AddCoordinatorPage; 