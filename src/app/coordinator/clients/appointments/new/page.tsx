"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiArrowLeft,
} from 'react-icons/hi';
import { motion } from 'framer-motion';

interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface ServiceRequest {
  id: string;
  title: string;
  status: string;
}

export default function NewAppointment() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    scheduledTime: '',
    duration: 30,
    purpose: '',
    caseType: '',
    caseDetails: '',
    venue: '',
    requiredDocuments: '',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    notes: '',
    serviceRequestId: '',
    reminderType: ['EMAIL', 'SMS'],
    reminderTiming: [24, 1],
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/coordinator/clients');
      const data = await response.json();
      if (data.success) {
        setClients(data.data.clients);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const fetchClientServiceRequests = async (clientId: string) => {
    try {
      const response = await fetch(`/api/coordinator/clients/${clientId}/service-requests`);
      const data = await response.json();
      if (data.success) {
        setServiceRequests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setFormData(prev => ({ ...prev, clientId }));
    if (clientId) {
      fetchClientServiceRequests(clientId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/coordinator/clients/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Appointment created successfully');
        router.push('/coordinator/clients/appointments');
      } else {
        throw new Error(data.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <HiArrowLeft className="h-5 w-5 mr-2" />
            Back to Appointments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
            Schedule New Appointment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Fill in the details below to schedule a new appointment with a client
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6"
        >
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Client
            </label>
            <div className="relative">
              <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={formData.clientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Info Display */}
          {selectedClient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <HiOutlineMail className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{selectedClient.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HiOutlinePhone className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{selectedClient.phone}</span>
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date and Time
              </label>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <div className="relative">
                <HiOutlineClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  min="15"
                  step="15"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Purpose and Case Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purpose
              </label>
              <div className="relative">
                <HiOutlineDocumentText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Case Type
              </label>
              <div className="relative">
                <HiOutlineDocumentText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={formData.caseType}
                  onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select case type</option>
                  <option value="CONSULTATION">Consultation</option>
                  <option value="DOCUMENT_REVIEW">Document Review</option>
                  <option value="CASE_DISCUSSION">Case Discussion</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Venue and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue
              </label>
              <div className="relative">
                <HiOutlineLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter meeting venue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="relative">
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="block w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Documents
            </label>
            <div className="relative">
              <HiOutlineDocumentText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <textarea
                value={formData.requiredDocuments}
                onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="List any documents the client should bring"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <div className="relative">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="block w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Any additional notes or instructions"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600
                transition-colors duration-200 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Appointment</span>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
} 