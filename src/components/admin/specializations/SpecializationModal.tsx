"use client";

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface Specialization {
  id?: string;
  facultyName: string;
  title: string;
  department: string;
  specialization: string;
  description: string;
  yearsOfExperience: number;
  expertise: string[];
}

interface SpecializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Specialization | null;
}

export default function SpecializationModal({
  isOpen,
  onClose,
  initialData
}: SpecializationModalProps) {
  const [formData, setFormData] = useState<Specialization>({
    facultyName: '',
    title: '',
    department: '',
    specialization: '',
    description: '',
    yearsOfExperience: 0,
    expertise: []
  });

  const [loading, setLoading] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/specializations', {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save specialization');
      }

      toast.success(
        initialData 
          ? 'Specialization updated successfully' 
          : 'Specialization added successfully'
      );
      onClose();
    } catch (error) {
      console.error('Error saving specialization:', error);
      toast.error('Failed to save specialization');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim()) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertiseInput.trim()]
      }));
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {initialData ? 'Edit' : 'Add'} Faculty Specialization
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facultyName">Faculty Name</Label>
                  <Input
                    id="facultyName"
                    value={formData.facultyName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      facultyName: e.target.value
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">Academic Title</Label>
                  <Select
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    required
                  >
                    <option value="">Select Title</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      department: e.target.value
                    }))}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Civil Law">Civil Law</option>
                    <option value="Constitutional Law">Constitutional Law</option>
                    <option value="Commercial Law">Commercial Law</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      specialization: e.target.value
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      yearsOfExperience: parseInt(e.target.value)
                    }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Areas of Expertise</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    placeholder="Add area of expertise"
                  />
                  <Button 
                    type="button"
                    onClick={handleAddExpertise}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.expertise.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(index)}
                        className="text-primary-700 hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 