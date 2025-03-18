'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';

interface Office {
  id: string;
  name: string;
}

interface Specialization {
  id: string;
  name: string;
  category: string;
}

const steps = [
  { id: 0, title: 'Personal Information', description: 'Basic details and credentials' },
  { id: 1, title: 'Professional Information', description: 'Legal experience and expertise' },
  { id: 2, title: 'Academic Information', description: 'Teaching and department details' }
];

export default function EditLawyerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [offices, setOffices] = useState<Office[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    yearsOfExperience: '',
    yearsOfPractice: '',
    specialization: '',
    languages: ['Amharic', 'English'],
    certifications: '',
    academicRank: '',
    department: '',
    teachingSchedule: {
      startTime: '',
      endTime: '',
    },
    bio: '',
    officeName: ''
  });

  // Fetch lawyer data
  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        setPageLoading(true);
        const response = await fetch(`/api/lawyers/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch lawyer data');
        const { data } = await response.json();
        
        if (!data) throw new Error('No data received');
        
        setFormData({
          fullName: data.user?.fullName || '',
          email: data.user?.email || '',
          phone: data.user?.phone || '',
          yearsOfExperience: data.experience?.toString() || '',
          yearsOfPractice: data.yearsOfPractice?.toString() || '',
          specialization: data.specializations?.[0]?.specialization?.name || '',
          languages: data.languages || ['Amharic', 'English'],
          certifications: data.certifications?.join(', ') || '',
          academicRank: data.academicRank || '',
          department: data.department || '',
          teachingSchedule: {
            startTime: data.teachingSchedule?.startTime || '',
            endTime: data.teachingSchedule?.endTime || '',
          },
          bio: data.bio || '',
          officeName: data.office?.name || ''
        });
      } catch (error) {
        console.error('Error fetching lawyer:', error);
        toast.error('Failed to fetch lawyer data');
        router.push('/admin/lawyers');
      } finally {
        setPageLoading(false);
      }
    };

    fetchLawyer();
  }, [params.id, router]);

  // Fetch offices
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await fetch('/api/offices');
        if (!response.ok) throw new Error('Failed to fetch offices');
        const { data } = await response.json();
        if (data && data.offices) {
          // Map the complex office data to the simple format we need
          const simpleOffices = data.offices.map((office: any) => ({
            id: office.id,
            name: office.name
          }));
          setOffices(simpleOffices);
        }
      } catch (error) {
        console.error('Error fetching offices:', error);
        toast.error('Failed to fetch offices');
      }
    };

    fetchOffices();
  }, []);

  // Fetch specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await fetch('/api/specializations');
        if (!response.ok) throw new Error('Failed to fetch specializations');
        const { data } = await response.json();
        if (Array.isArray(data)) {
          setSpecializations(data);
        }
      } catch (error) {
        console.error('Error fetching specializations:', error);
        toast.error('Failed to fetch specializations');
      }
    };

    fetchSpecializations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        toast.error('Please fill in all required personal information');
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.yearsOfExperience || !formData.specialization) {
        toast.error('Please fill in all required professional information');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.department || !formData.academicRank || !formData.teachingSchedule.startTime || !formData.teachingSchedule.endTime) {
        toast.error('Please fill in all required academic information');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        officeName: formData.officeName,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        specializations: [formData.specialization],
        languages: formData.languages,
        certifications: formData.certifications ? formData.certifications.split(',').map(cert => cert.trim()) : [],
        academicRank: formData.academicRank,
        department: formData.department,
        teachingSchedule: formData.teachingSchedule.startTime && formData.teachingSchedule.endTime ? {
          startTime: new Date(formData.teachingSchedule.startTime).toISOString(),
          endTime: new Date(formData.teachingSchedule.endTime).toISOString(),
          status: 'ACTIVE'
        } : undefined
      };

      const response = await fetch(`/api/lawyers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update lawyer profile');
      }

      toast.success('Lawyer profile updated successfully');
      router.push('/admin/lawyers');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update lawyer profile');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading lawyer profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Faculty Lawyer</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">Update faculty member information</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between mb-4 space-y-4 sm:space-y-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'text-primary dark:text-primary' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-24 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress 
            value={(currentStep / (steps.length - 1)) * 100} 
            className="h-2 bg-gray-200 dark:bg-gray-700" 
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-8 shadow-lg dark:shadow-gray-800">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                {steps[currentStep].description}
              </p>
            </div>

            {currentStep === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required 
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">University Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@du.edu.et"
                    required 
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+251 "
                    required
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officeName" className="text-gray-700 dark:text-gray-300">Office</Label>
                  <Select value={formData.officeName} onValueChange={(value) => handleSelectChange('officeName', value)}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white">
                      <SelectValue placeholder="Select Office" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-white">
                      {offices.map((office) => (
                        <SelectItem key={office.id} value={office.name}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience" className="text-gray-700 dark:text-gray-300">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    placeholder="Years of experience"
                    required
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-gray-700 dark:text-gray-300">Primary Specialization</Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleSelectChange('specialization', value)}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white">
                      <SelectValue placeholder="Select Specialization" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-white">
                      {specializations.map((spec) => (
                        <SelectItem key={spec.id} value={spec.name}>
                          {spec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications" className="text-gray-700 dark:text-gray-300">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    placeholder="List relevant certifications (comma separated)"
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Professional Biography</Label>
                  <Textarea 
                    id="bio" 
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Enter professional background"
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-gray-700 dark:text-gray-300">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-white">
                      <SelectItem value="law">School of Law</SelectItem>
                      <SelectItem value="criminal">Criminal Justice</SelectItem>
                      <SelectItem value="civil">Civil Law</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicRank" className="text-gray-700 dark:text-gray-300">Academic Rank</Label>
                  <Select value={formData.academicRank} onValueChange={(value) => handleSelectChange('academicRank', value)}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white">
                      <SelectValue placeholder="Select Rank" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-white">
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="associateProfessor">Associate Professor</SelectItem>
                      <SelectItem value="assistantProfessor">Assistant Professor</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teachingSchedule.startTime" className="text-gray-700 dark:text-gray-300">Teaching Schedule Start</Label>
                  <Input
                    id="teachingSchedule.startTime"
                    type="datetime-local"
                    value={formData.teachingSchedule.startTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      teachingSchedule: {
                        ...prev.teachingSchedule,
                        startTime: e.target.value
                      }
                    }))}
                    required
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teachingSchedule.endTime" className="text-gray-700 dark:text-gray-300">Teaching Schedule End</Label>
                  <Input
                    id="teachingSchedule.endTime"
                    type="datetime-local"
                    value={formData.teachingSchedule.endTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      teachingSchedule: {
                        ...prev.teachingSchedule,
                        endTime: e.target.value
                      }
                    }))}
                    required
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}
          </Card>

          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-reverse space-y-4 sm:space-y-0 sm:space-x-4">
            {currentStep > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={loading}
                className="w-full sm:w-auto px-6"
              >
                Previous
              </Button>
            )}
            {currentStep < 2 ? (
              <Button 
                type="button" 
                onClick={handleNext} 
                disabled={loading}
                className="w-full sm:w-auto px-6"
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto px-6"
              >
                {loading ? 'Updating...' : 'Update Faculty Lawyer'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 