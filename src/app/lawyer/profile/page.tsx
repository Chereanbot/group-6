"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  User, Mail, Phone, Building, Award, 
  Star, Briefcase, Scale, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface LawyerProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  status: string;
  createdAt: string;
  lawyerProfile: {
    id: string;
    experience: number;
    rating: number;
    caseLoad: number;
    availability: boolean;
    office: {
      id: string;
      name: string;
      location: string;
      contactEmail: string;
      contactPhone: string;
    };
  };
}

export default function LawyerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    experience: 0,
    availability: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lawyer/profile');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        experience: data.lawyerProfile.experience || 0,
        availability: data.lawyerProfile.availability || false
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch profile');
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/lawyer/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p>Loading profile...</p>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-red-500">Error: Profile not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lawyer Profile</h1>
        <Button 
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Basic Information */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {profile.status}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{profile.fullName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="font-medium">{profile.phone || 'Not provided'}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Professional Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Professional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Award className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Experience</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                  placeholder="Years of experience"
                />
              ) : (
                <p className="font-medium">{profile.lawyerProfile.experience} Years</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Star className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="font-medium">
                {profile.lawyerProfile.rating?.toFixed(1) || 'Not rated'} / 5.0
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Case Load</p>
              <p className="font-medium">{profile.lawyerProfile.caseLoad} cases</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Scale className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Availability</p>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.availability}
                    onCheckedChange={(checked) => setFormData({ ...formData, availability: checked })}
                  />
                  <Label>{formData.availability ? 'Available' : 'Not Available'}</Label>
                </div>
              ) : (
                <p className="font-medium">
                  {profile.lawyerProfile.availability ? 'Available' : 'Not Available'}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Office Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Office Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Building className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Office</p>
              <p className="font-medium">{profile.lawyerProfile.office.name}</p>
              <p className="text-sm text-gray-500">{profile.lawyerProfile.office.location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">{profile.lawyerProfile.office.contactEmail || 'No email provided'}</p>
              <p className="text-sm text-gray-500">{profile.lawyerProfile.office.contactPhone || 'No phone provided'}</p>
            </div>
          </div>
        </div>
      </Card>

      {isEditing && (
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
} 