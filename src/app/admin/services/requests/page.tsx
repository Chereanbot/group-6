"use client";

import { useState, useEffect } from 'react';
import { ServiceRequestList } from '@/components/admin/services/ServiceRequestList';
import { ServiceRequestStats } from '@/components/admin/services/ServiceRequestStats';
import { ServiceRequestFilters } from '@/components/admin/services/ServiceRequestFilters';
import { serviceService } from '@/services/service.service';
import { ServiceRequest, ServiceStats } from '@/types/service.types';
import { toast } from 'react-hot-toast';

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [requestsResponse, statsResponse] = await Promise.allSettled([
        serviceService.getServiceRequests(filters),
        serviceService.getServiceStats()
      ]);

      if (requestsResponse.status === 'fulfilled') {
        setRequests(requestsResponse.value);
      } else {
        console.error('Failed to load service requests:', requestsResponse.reason);
        toast.error('Failed to load service requests');
        setRequests([]);
      }

      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value);
      } else {
        console.error('Failed to load service stats:', statsResponse.reason);
        toast.error('Failed to load service statistics');
        setStats(null);
      }

    } catch (error) {
      console.error('Error loading service data:', error);
      toast.error('Failed to load service data');
      setRequests([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await serviceService.updateServiceRequest(requestId, { status });
      await loadData();
      toast.success('Service request updated successfully');
    } catch (error) {
      console.error('Error updating service request:', error);
      toast.error('Failed to update service request');
    }
  };

  const handleAssignLawyer = async (requestId: string, lawyerId: string) => {
    try {
      await serviceService.assignLawyer(requestId, lawyerId);
      await loadData();
      toast.success('Lawyer assigned successfully');
    } catch (error) {
      console.error('Error assigning lawyer:', error);
      toast.error('Failed to assign lawyer');
    }
  };

  const handleVerifyEligibility = async (requestId: string, isEligible: boolean) => {
    try {
      await serviceService.verifyLegalAidEligibility(requestId, isEligible);
      await loadData();
      toast.success('Eligibility verification completed');
    } catch (error) {
      console.error('Error verifying eligibility:', error);
      toast.error('Failed to verify eligibility');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Service Requests</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, type: 'LEGAL_AID' }))}
            className={`px-4 py-2 rounded-lg ${
              filters.type === 'LEGAL_AID' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Legal Aid
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, type: 'PAID' }))}
            className={`px-4 py-2 rounded-lg ${
              filters.type === 'PAID' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Paid Services
          </button>
        </div>
      </div>

      {stats && <ServiceRequestStats stats={stats} />}

      <ServiceRequestFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      <ServiceRequestList
        requests={requests}
        loading={loading}
        onStatusUpdate={handleStatusUpdate}
        onAssignLawyer={handleAssignLawyer}
        onVerifyEligibility={handleVerifyEligibility}
        onRefresh={loadData}
      />
    </div>
  );
} 