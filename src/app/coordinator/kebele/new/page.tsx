"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import { motion } from 'framer-motion';

interface KebeleFormData {
  kebeleNumber: string;
  kebeleName: string;
  population: string;
  subCity: string;
  district: string;
  mainOffice: string;
  contactPhone: string;
  contactEmail: string;
  workingHours: string;
  services: string[];
  manager: {
    fullName: string;
    phone: string;
    email: string;
    position: string;
    username: string;
    password: string;
  };
}

export default function AddNewKebele() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newService, setNewService] = useState('');
  const [createdKebele, setCreatedKebele] = useState<any>(null);

  const [formData, setFormData] = useState<KebeleFormData>({
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
      position: '',
      username: '',
      password: ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const addService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coordinator/kebeles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          population: parseInt(formData.population)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create kebele');
      }

      setCreatedKebele(data);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/coordinator/kebele/directory');
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {success && createdKebele ? (
          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">
              Kebele Created Successfully!
            </h2>
            <div className="space-y-4">
              <p className="text-green-600 dark:text-green-300">
                The kebele has been created successfully. Here are the login details for the manager:
              </p>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="mb-2"><strong>Login URL:</strong> {window.location.origin}/kebele-manager/login</p>
                <p className="mb-2"><strong>Username:</strong> {formData.manager.username}</p>
                <p className="mb-2"><strong>Password:</strong> {formData.manager.password}</p>
                <p className="mb-2"><strong>Kebele ID:</strong> {createdKebele.id}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please save this information. You will be redirected to the kebele directory in 5 seconds...
              </p>
            </div>
          </div>
        ) : null}
        
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Add New Kebele
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Register a new kebele and its manager in the system
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Kebele Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Kebele Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kebele Number
                </label>
                <input
                  type="text"
                  name="kebeleNumber"
                  required
                  value={formData.kebeleNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kebele Name
                </label>
                <input
                  type="text"
                  name="kebeleName"
                  required
                  value={formData.kebeleName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Population
                </label>
                <input
                  type="number"
                  name="population"
                  value={formData.population}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sub City
                </label>
                <input
                  type="text"
                  name="subCity"
                  value={formData.subCity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Main Office
                </label>
                <input
                  type="text"
                  name="mainOffice"
                  required
                  value={formData.mainOffice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  name="workingHours"
                  placeholder="e.g., Mon-Fri 8:00 AM - 5:00 PM"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Services
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Add a service..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={addService}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600
                    transition-colors duration-200 flex items-center"
                >
                  <HiOutlinePlus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900
                      text-primary-600 dark:text-primary-400 rounded-full"
                  >
                    <span>{service}</span>
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="hover:text-primary-800 dark:hover:text-primary-200"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manager Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Manager Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="manager.fullName"
                  required
                  value={formData.manager.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="manager.username"
                  required
                  value={formData.manager.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="manager.password"
                  required
                  value={formData.manager.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="manager.position"
                  required
                  value={formData.manager.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="manager.phone"
                  required
                  value={formData.manager.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="manager.email"
                  value={formData.manager.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-200 dark:border-gray-700 text-gray-600
                dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600
                transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <HiOutlinePlus className="w-5 h-5" />
                  <span>Create Kebele</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Success/Error Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 