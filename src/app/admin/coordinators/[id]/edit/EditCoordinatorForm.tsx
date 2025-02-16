'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CoordinatorFormService } from '@/services/coordinator/CoordinatorFormService';
import { toast } from 'react-hot-toast';
import { Coordinator, CoordinatorStatus, CoordinatorType } from '@/types/coordinator';

interface EditFormData {
  fullName: string;
  email: string;
  phone: string;
  type: CoordinatorType;
  officeId: string;
  startDate: string;
  endDate?: string;
  specialties: string[];
  status: CoordinatorStatus;
  qualifications: Array<{
    type: string;
    title: string;
    institution: string;
    dateObtained: string;
    expiryDate?: string;
    score?: number;
  }>;
}

export function EditCoordinatorForm({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    fullName: '',
    email: '',
    phone: '',
    type: CoordinatorType.PERMANENT,
    officeId: '',
    startDate: '',
    endDate: '',
    specialties: [],
    status: CoordinatorStatus.ACTIVE,
    qualifications: []
  });

  const service = new CoordinatorFormService();

  const loadCoordinator = async () => {
    try {
      const data = await service.getCoordinator(id);
      setCoordinator(data);
      setFormData({
        fullName: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone || '',
        type: data.type,
        officeId: data.officeId,
        startDate: new Date(data.startDate).toISOString().split('T')[0],
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        specialties: data.specialties,
        status: data.status,
        qualifications: data.qualifications.map(q => ({
          type: q.type,
          title: q.title,
          institution: q.institution,
          dateObtained: new Date(q.dateObtained).toISOString().split('T')[0],
          expiryDate: q.expiryDate ? new Date(q.expiryDate).toISOString().split('T')[0] : '',
          score: q.score || undefined
        }))
      });
    } catch (error) {
      toast.error('Failed to load coordinator');
      router.push('/admin/coordinators');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await service.updateCoordinator(id, formData);
      if (response.success) {
        toast.success('Coordinator updated successfully');
        router.push('/admin/coordinators');
      } else {
        toast.error(response.error || 'Failed to update coordinator');
      }
    } catch (error) {
      toast.error('Failed to update coordinator');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadCoordinator();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Coordinator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
        </section>

        {/* Employment Details */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CoordinatorType }))}
                className="w-full border rounded-lg p-2"
                required
              >
                {Object.values(CoordinatorType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CoordinatorStatus }))}
                className="w-full border rounded-lg p-2"
                required
              >
                {Object.values(CoordinatorStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            {formData.type === CoordinatorType.PROJECT_BASED && (
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 