"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineIdentification,
  HiOutlineLocationMarker,
  HiOutlineGlobe,
  HiOutlinePhone as HiOutlinePhoneIcon,
  HiOutlineUserGroup,
  HiOutlineCheck,
  HiOutlineClock
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';

interface ClientFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  emergencyContact: string;
  preferredLanguage: string;
}

const languages = [
  { value: 'AMHARIC', label: 'Amharic' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'OROMIFFA', label: 'Oromiffa' },
  { value: 'TIGRIGNA', label: 'Tigrigna' },
  { value: 'OTHER', label: 'Other' }
];

export default function ClientRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    emergencyContact: '',
    preferredLanguage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/coordinator/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Client registered successfully!');
        router.push('/coordinator/clients/directory');
      } else {
        toast.error(result.error || 'Failed to register client');
      }
    } catch (error) {
      console.error('Error registering client:', error);
      toast.error('An error occurred while registering the client');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Client Registration
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Register a new client in the system
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                All fields marked with * are required
              </span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700"
        >
          {/* Personal Information */}
          <div className="p-6 space-y-6">
            <div className="flex items-center">
              <HiOutlineUser className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                    shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700
                    dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID Number *
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                    shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700
                    dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                    shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700
                    dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                    shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700
                    dark:text-white sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="p-6 space-y-6">
            <div className="flex items-center">
              <HiOutlineUserGroup className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Additional Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                    shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700
                    dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                    shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700
                    dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preferred Language
                </label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                    shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700
                    dark:text-white sm:text-sm"
                >
                  <option value="">Select Language</option>
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                  hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 
                  hover:bg-primary-700 rounded-md shadow-sm focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center"
              >
                {loading ? (
                  <>
                    <HiOutlineClock className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <HiOutlineCheck className="h-4 w-4 mr-2" />
                    Register Client
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
} 