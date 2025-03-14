'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Coordinator, EditCoordinatorRequest } from '@/types/coordinator';
import { CoordinatorStatus, CoordinatorType } from '@prisma/client';
import { adminStyles } from '@/styles/admin';

interface Office {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentCount: number;
}

export function EditCoordinatorForm({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [formData, setFormData] = useState<EditCoordinatorRequest>({
    fullName: '',
    email: '',
    phone: '',
    type: CoordinatorType.FULL_TIME,
    officeId: '',
    startDate: new Date().toISOString().split('T')[0],
    specialties: [],
    status: CoordinatorStatus.ACTIVE,
    qualifications: []
  });

  const loadOffices = async () => {
    try {
      const response = await fetch('/api/admin/offices');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load offices');
      }

      setOffices(result.data.offices);
    } catch (error) {
      console.error('Failed to load offices:', error);
      toast.error('Failed to load offices');
    }
  };

  const loadCoordinator = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/coordinators/${id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load coordinator');
      }

      const coordinator = result.data;
      if (!coordinator || !coordinator.user) {
        throw new Error('Invalid coordinator data received');
      }

      setUserId(coordinator.user.id);
      setFormData({
        fullName: coordinator.user.fullName || '',
        email: coordinator.user.email || '',
        phone: coordinator.user.phone || '',
        type: coordinator.type || CoordinatorType.FULL_TIME,
        officeId: coordinator.officeId || '',
        startDate: coordinator.startDate ? new Date(coordinator.startDate).toISOString().split('T')[0] : '',
        endDate: coordinator.endDate ? new Date(coordinator.endDate).toISOString().split('T')[0] : undefined,
        specialties: coordinator.specialties || [],
        status: coordinator.status || CoordinatorStatus.ACTIVE,
        qualifications: (coordinator.qualifications || []).map((q: any) => ({
          type: q.type || '',
          title: q.title || '',
          institution: q.institution || '',
          dateObtained: q.dateObtained ? new Date(q.dateObtained).toISOString().split('T')[0] : '',
          expiryDate: q.expiryDate ? new Date(q.expiryDate).toISOString().split('T')[0] : undefined,
          score: q.score || undefined
        }))
      });
    } catch (error) {
      console.error('Failed to load coordinator:', error);
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
      const response = await fetch(`/api/admin/coordinators/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update coordinator');
      }

      toast.success('Coordinator updated successfully');
      router.push('/admin/coordinators');
    } catch (error) {
      console.error('Failed to update coordinator:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update coordinator');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadOffices();
    loadCoordinator();
  }, [id]);

  if (loading) {
    return (
      <div className={adminStyles.loading.container}>
        <div className={adminStyles.loading.spinner}></div>
      </div>
    );
  }

  return (
    <div className={adminStyles.container}>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Edit Coordinator</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <section className={adminStyles.card}>
          <h2 className={adminStyles.sectionHeader}>Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={adminStyles.form.label}>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className={adminStyles.form.input}
                required
              />
            </div>
            <div>
              <label className={adminStyles.form.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                className={adminStyles.form.input}
                disabled
              />
            </div>
            <div>
              <label className={adminStyles.form.label}>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={adminStyles.form.input}
              />
            </div>
          </div>
        </section>

        {/* Employment Details */}
        <section className={adminStyles.card}>
          <h2 className={adminStyles.sectionHeader}>Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={adminStyles.form.label}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CoordinatorType }))}
                className={adminStyles.form.select}
                required
              >
                {Object.values(CoordinatorType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={adminStyles.form.label}>Office</label>
              <select
                value={formData.officeId}
                onChange={(e) => setFormData(prev => ({ ...prev, officeId: e.target.value }))}
                className={adminStyles.form.select}
                required
              >
                <option value="">Select Office</option>
                {offices.map(office => (
                  <option key={office.id} value={office.id}>
                    {office.name} ({office.currentCount}/{office.capacity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={adminStyles.form.label}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CoordinatorStatus }))}
                className={adminStyles.form.select}
                required
              >
                {Object.values(CoordinatorStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={adminStyles.form.label}>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={adminStyles.form.input}
                required
              />
            </div>
            <div>
              <label className={adminStyles.form.label}>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={adminStyles.form.input}
              />
            </div>
          </div>
        </section>

        {/* Specialties */}
        <section className={adminStyles.card}>
          <h2 className={adminStyles.sectionHeader}>Specialties</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
                  <span>{specialty}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      specialties: prev.specialties.filter((_, i) => i !== index)
                    }))}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add specialty"
                className={adminStyles.form.input}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      setFormData(prev => ({
                        ...prev,
                        specialties: [...prev.specialties, value]
                      }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Qualifications */}
        <section className={adminStyles.card}>
          <h2 className={adminStyles.sectionHeader}>Qualifications</h2>
          <div className="space-y-4">
            {formData.qualifications.map((qualification, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div>
                  <label className={adminStyles.form.label}>Type</label>
                  <input
                    type="text"
                    value={qualification.type}
                    onChange={(e) => {
                      const newQualifications = [...formData.qualifications];
                      newQualifications[index] = { ...qualification, type: e.target.value };
                      setFormData(prev => ({ ...prev, qualifications: newQualifications }));
                    }}
                    className={adminStyles.form.input}
                    required
                  />
                </div>
                <div>
                  <label className={adminStyles.form.label}>Title</label>
                  <input
                    type="text"
                    value={qualification.title}
                    onChange={(e) => {
                      const newQualifications = [...formData.qualifications];
                      newQualifications[index] = { ...qualification, title: e.target.value };
                      setFormData(prev => ({ ...prev, qualifications: newQualifications }));
                    }}
                    className={adminStyles.form.input}
                    required
                  />
                </div>
                <div>
                  <label className={adminStyles.form.label}>Institution</label>
                  <input
                    type="text"
                    value={qualification.institution}
                    onChange={(e) => {
                      const newQualifications = [...formData.qualifications];
                      newQualifications[index] = { ...qualification, institution: e.target.value };
                      setFormData(prev => ({ ...prev, qualifications: newQualifications }));
                    }}
                    className={adminStyles.form.input}
                    required
                  />
                </div>
                <div>
                  <label className={adminStyles.form.label}>Date Obtained</label>
                  <input
                    type="date"
                    value={qualification.dateObtained}
                    onChange={(e) => {
                      const newQualifications = [...formData.qualifications];
                      newQualifications[index] = { ...qualification, dateObtained: e.target.value };
                      setFormData(prev => ({ ...prev, qualifications: newQualifications }));
                    }}
                    className={adminStyles.form.input}
                    required
                  />
                </div>
                <div>
                  <label className={adminStyles.form.label}>Expiry Date</label>
                  <input
                    type="date"
                    value={qualification.expiryDate}
                    onChange={(e) => {
                      const newQualifications = [...formData.qualifications];
                      newQualifications[index] = { ...qualification, expiryDate: e.target.value };
                      setFormData(prev => ({ ...prev, qualifications: newQualifications }));
                    }}
                    className={adminStyles.form.input}
                  />
                </div>
                <div>
                  <label className={adminStyles.form.label}>Score</label>
                  <input
                    type="number"
                    value={qualification.score || ''}
                    onChange={(e) => {
                      const newQualifications = [...formData.qualifications];
                      newQualifications[index] = { ...qualification, score: parseFloat(e.target.value) || undefined };
                      setFormData(prev => ({ ...prev, qualifications: newQualifications }));
                    }}
                    className={adminStyles.form.input}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newQualifications = formData.qualifications.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, qualifications: newQualifications }));
                  }}
                  className={`${adminStyles.button.base} ${adminStyles.button.danger} mt-auto`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  qualifications: [...prev.qualifications, {
                    type: '',
                    title: '',
                    institution: '',
                    dateObtained: new Date().toISOString().split('T')[0],
                    expiryDate: '',
                    score: undefined
                  }]
                }));
              }}
              className={`${adminStyles.button.base} ${adminStyles.button.secondary}`}
            >
              Add Qualification
            </button>
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className={`${adminStyles.button.base} ${adminStyles.button.secondary}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${adminStyles.button.base} ${adminStyles.button.primary}`}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 