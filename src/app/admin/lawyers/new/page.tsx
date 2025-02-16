'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

export default function NewLawyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    specialization: '',
    office: '',
    bio: '',
    // Added new fields
    employeeId: '', // University employee ID
    department: '', // Academic department
    academicRank: '', // Professor, Associate Prof, etc
    maxCaseload: '', // Maximum cases they can handle
    availabilityHours: '', // Office hours for legal work
    expertise: [], // Detailed areas of legal expertise
    languages: [], // Languages they can work in
    certifications: '', // Additional legal certifications
    yearsOfExperience: '', // Years of legal practice
    teachingSchedule: '', // Current teaching commitments
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation checks
      if (!formData.employeeId || !formData.department) {
        throw new Error('Employee ID and Department are required');
      }

      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API delay
      toast.success('Faculty lawyer profile created successfully');
      router.push('/admin/lawyers');
    } catch (error) {
      toast.error('Failed to create lawyer profile: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Add New Faculty Lawyer</h1>
          <p className="text-muted-foreground mt-1">Register a new faculty member as legal counsel</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input 
                id="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="DU/FAC/123"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="name@du.edu.et"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+251 "
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="law">School of Law</SelectItem>
                  <SelectItem value="criminal">Criminal Justice</SelectItem>
                  <SelectItem value="civil">Civil Law</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicRank">Academic Rank</Label>
              <Select value={formData.academicRank} onValueChange={(value) => setFormData(prev => ({ ...prev, academicRank: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="associateProfessor">Associate Professor</SelectItem>
                  <SelectItem value="assistantProfessor">Assistant Professor</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teachingSchedule">Teaching Schedule</Label>
              <Textarea
                id="teachingSchedule"
                value={formData.teachingSchedule}
                onChange={handleChange}
                placeholder="Current teaching commitments and schedule"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCaseload">Maximum Case Capacity</Label>
              <Input
                id="maxCaseload"
                type="number"
                min="1"
                max="10"
                value={formData.maxCaseload}
                onChange={handleChange}
                placeholder="Number of cases"
                required
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Legal Qualifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">Law License Number</Label>
              <Input 
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Enter license number"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Legal Practice</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                placeholder="Years of experience"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Primary Specialization</Label>
              <Select value={formData.specialization} onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criminal">Criminal Law</SelectItem>
                  <SelectItem value="civil">Civil Law</SelectItem>
                  <SelectItem value="corporate">Corporate Law</SelectItem>
                  <SelectItem value="family">Family Law</SelectItem>
                  <SelectItem value="humanRights">Human Rights Law</SelectItem>
                  <SelectItem value="labor">Labor Law</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityHours">Legal Consultation Hours</Label>
              <Input
                id="availabilityHours"
                value={formData.availabilityHours}
                onChange={handleChange}
                placeholder="e.g., Mon-Wed 2-5PM"
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="certifications">Additional Certifications</Label>
              <Textarea
                id="certifications"
                value={formData.certifications}
                onChange={handleChange}
                placeholder="List any relevant legal certifications or specialized training"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="bio">Professional Biography</Label>
              <Textarea 
                id="bio" 
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Enter lawyer's professional background and achievements"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Register Faculty Lawyer'}
          </Button>
        </div>
      </form>
    </div>
  );
}