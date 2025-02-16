"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  User, Mail, Phone, Building, Award, 
  Star, Briefcase, Languages, Scale,
  Save, X
} from 'lucide-react';
import { showToast } from '@/utils/toast';

interface LawyerProfileFormData {
  // Basic Information
  fullName: string;
  email: string;
  phone: string;
  
  // Professional Details
  specializations: string[];
  experience: number;
  barNumber: string;
  languages: string[];
  expertise: string[];
  
  // Profile Settings
  availability: boolean;
  acceptingCases: boolean;
  
  // Office Details
  officeId: string;
  preferredLocation: string;
  
  // Additional Information
  bio: string;
  education: string[];
  certifications: string[];
}

export default function EditLawyerProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LawyerProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    specializations: [],
    experience: 0,
    barNumber: '',
    languages: [],
    expertise: [],
    availability: true,
    acceptingCases: true,
    officeId: '',
    preferredLocation: '',
    bio: '',
    education: [],
    certifications: []
  });

  // Handle form input changes
  const handleChange = (field: keyof LawyerProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array fields (specializations, languages, etc.)
  const handleArrayInput = (field: keyof LawyerProfileFormData, value: string) => {
    const array = value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/lawyer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      showToast('Profile updated successfully', 'success');
      router.push('/lawyer/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bar Number</label>
              <Input
                value={formData.barNumber}
                onChange={(e) => handleChange('barNumber', e.target.value)}
                placeholder="Enter your bar number"
                required
              />
            </div>
          </div>
        </Card>

        {/* Professional Details */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Professional Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Specializations</label>
              <Input
                value={formData.specializations.join(', ')}
                onChange={(e) => handleArrayInput('specializations', e.target.value)}
                placeholder="Enter specializations (comma-separated)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience (Years)</label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', parseInt(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Languages</label>
              <Input
                value={formData.languages.join(', ')}
                onChange={(e) => handleArrayInput('languages', e.target.value)}
                placeholder="Enter languages (comma-separated)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Areas of Expertise</label>
              <Input
                value={formData.expertise.join(', ')}
                onChange={(e) => handleArrayInput('expertise', e.target.value)}
                placeholder="Enter areas of expertise (comma-separated)"
              />
            </div>
          </div>
        </Card>

        {/* Availability Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Availability Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Available for New Cases</p>
                <p className="text-sm text-gray-500">Show that you're available to take new cases</p>
              </div>
              <Switch
                checked={formData.availability}
                onCheckedChange={(checked) => handleChange('availability', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Accepting Cases</p>
                <p className="text-sm text-gray-500">Allow new case assignments</p>
              </div>
              <Switch
                checked={formData.acceptingCases}
                onCheckedChange={(checked) => handleChange('acceptingCases', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Professional Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Enter your professional biography"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Education</label>
              <Input
                value={formData.education.join(', ')}
                onChange={(e) => handleArrayInput('education', e.target.value)}
                placeholder="Enter education history (comma-separated)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Certifications</label>
              <Input
                value={formData.certifications.join(', ')}
                onChange={(e) => handleArrayInput('certifications', e.target.value)}
                placeholder="Enter certifications (comma-separated)"
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
} 