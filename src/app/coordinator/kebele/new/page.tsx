"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { HiCheck, HiOfficeBuilding, HiUser, HiClock } from 'react-icons/hi';

enum FormStep {
  BASIC_INFO = 0,
  CONTACT_INFO = 1,
  MANAGER_INFO = 2,
  REVIEW = 3
}

export default function NewKebelePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);
  const [formData, setFormData] = useState({
    kebeleNumber: '',
    kebeleName: '',
    population: '',
    subCity: '',
    district: '',
    mainOffice: '',
    contactPhone: '',
    contactEmail: '',
    workingHours: '',
    services: [],
    manager: {
      fullName: '',
      phone: '',
      email: '',
      position: ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('manager.')) {
      const managerField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        manager: {
          ...prev.manager,
          [managerField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/coordinator/kebeles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create kebele');
      }

      toast.success('Kebele created successfully!');
      if (data.managerPassword) {
        toast.success(
          <div className="space-y-2">
            <p className="font-bold">Manager Credentials:</p>
            <p>Phone: {formData.manager.phone}</p>
            <p>Password: {data.managerPassword}</p>
            <p className="text-sm text-yellow-600">Please save these credentials!</p>
          </div>,
          {
            duration: 15000,
            style: {
              background: '#f8f9fa',
              color: '#1a1a1a',
              border: '1px solid #ddd',
              padding: '16px',
            },
          }
        );
      }

      setTimeout(() => {
        router.push('/coordinator/kebele/directory');
      }, 2000);
    } catch (error) {
      console.error('Error creating kebele:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create kebele', {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (step: FormStep): boolean => {
    switch (step) {
      case FormStep.BASIC_INFO:
        return !!(formData.kebeleNumber && formData.kebeleName && formData.population && formData.subCity && formData.district);
      case FormStep.CONTACT_INFO:
        return !!(formData.mainOffice && formData.contactPhone && formData.contactEmail && formData.workingHours);
      case FormStep.MANAGER_INFO:
        return !!(formData.manager.fullName && formData.manager.phone && formData.manager.email && formData.manager.position);
      default:
        return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  const renderStepContent = () => {
    switch (currentStep) {
      case FormStep.BASIC_INFO:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kebele Number</label>
                <input
                  type="text"
                  name="kebeleNumber"
                  value={formData.kebeleNumber}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kebele Name</label>
                <input
                  type="text"
                  name="kebeleName"
                  value={formData.kebeleName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Population</label>
                <input
                  type="number"
                  name="population"
                  value={formData.population}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sub City</label>
                <input
                  type="text"
                  name="subCity"
                  value={formData.subCity}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        );

      case FormStep.CONTACT_INFO:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Main Office</label>
                <input
                  type="text"
                  name="mainOffice"
                  value={formData.mainOffice}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Working Hours</label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Mon-Fri 9:00-17:00"
                />
              </div>
            </div>
          </div>
        );

      case FormStep.MANAGER_INFO:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="manager.fullName"
                  value={formData.manager.fullName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  name="manager.phone"
                  value={formData.manager.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="manager.email"
                  value={formData.manager.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input
                  type="text"
                  name="manager.position"
                  value={formData.manager.position}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        );

      case FormStep.REVIEW:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">Kebele Number:</span> {formData.kebeleNumber}</p>
                <p><span className="font-medium">Kebele Name:</span> {formData.kebeleName}</p>
                <p><span className="font-medium">Population:</span> {formData.population}</p>
                <p><span className="font-medium">Sub City:</span> {formData.subCity}</p>
                <p><span className="font-medium">District:</span> {formData.district}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">Main Office:</span> {formData.mainOffice}</p>
                <p><span className="font-medium">Contact Phone:</span> {formData.contactPhone}</p>
                <p><span className="font-medium">Contact Email:</span> {formData.contactEmail}</p>
                <p><span className="font-medium">Working Hours:</span> {formData.workingHours}</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Manager Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">Full Name:</span> {formData.manager.fullName}</p>
                <p><span className="font-medium">Phone:</span> {formData.manager.phone}</p>
                <p><span className="font-medium">Email:</span> {formData.manager.email}</p>
                <p><span className="font-medium">Position:</span> {formData.manager.position}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Kebele</h1>

      {/* Timeline Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="w-full absolute top-1/2 transform -translate-y-1/2">
            <div className="h-1 bg-gray-200">
              <div 
                className="h-1 bg-primary-500 transition-all duration-300"
                style={{ width: `${(currentStep / (Object.keys(FormStep).length/2 - 1)) * 100}%` }}
              />
            </div>
          </div>
          
          {[
            { step: FormStep.BASIC_INFO, icon: HiOfficeBuilding, label: "Basic Info" },
            { step: FormStep.CONTACT_INFO, icon: HiClock, label: "Contact Info" },
            { step: FormStep.MANAGER_INFO, icon: HiUser, label: "Manager Info" },
            { step: FormStep.REVIEW, icon: HiCheck, label: "Review" }
          ].map(({ step, icon: Icon, label }) => (
            <div
              key={step}
              className={`relative flex flex-col items-center ${
                step <= currentStep ? 'text-primary-500' : 'text-gray-400'
              }`}
              onClick={() => {
                if (step < currentStep) {
                  setCurrentStep(step);
                }
              }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step <= currentStep
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-2 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {renderStepContent()}
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          
          <div className="space-x-4">
            {currentStep > FormStep.BASIC_INFO && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >
                Previous
              </button>
            )}
            
            {currentStep < FormStep.REVIEW ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed}
                className={`px-4 py-2 text-white rounded ${
                  canProceed
                    ? 'bg-primary-500 hover:bg-primary-600'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white bg-primary-500 rounded hover:bg-primary-600 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Kebele'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 