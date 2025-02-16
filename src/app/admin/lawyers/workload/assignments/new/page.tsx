"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import { WorkType, ComplexityLevel } from '@/app/admin/lawyers/workload/page';

interface Lawyer {
  id: string;
  name: string;
  specializations: string;
  office: string;
  experience: number;
  yearsOfPractice: number;
  rating: number;
  caseLoad: number;
  barAdmissionDate: string | null;
  primaryJurisdiction: string | null;
  languages: string;
  certifications: string;
}

interface Case {
  id: string;
  title: string;
  clientName: string;
}

const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: 'CASE_WORK', label: 'Case Work' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'DOCUMENT_REVIEW', label: 'Document Review' },
  { value: 'CLIENT_MEETING', label: 'Client Meeting' },
  { value: 'COURT_APPEARANCE', label: 'Court Appearance' },
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
  { value: 'TRAINING', label: 'Training' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const COMPLEXITY_LEVELS: { value: ComplexityLevel; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'VERY_HIGH', label: 'Very High' },
];

export default function NewAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lawyerId: '',
    caseId: '',
    type: 'CASE_WORK' as WorkType,
    priority: 'MEDIUM',
    complexity: 'MEDIUM' as ComplexityLevel,
    estimatedHours: 0,
    actualHours: 0,
    progress: 0,
    startDate: '',
    dueDate: '',
    completedDate: '',
    notes: '',
    blockers: '',
  });

  // Fetch lawyers and cases when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lawyersRes, casesRes] = await Promise.all([
          fetch('/api/admin/lawyers'),
          fetch('/api/admin/cases'),
        ]);

        if (!lawyersRes.ok || !casesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [lawyersData, casesData] = await Promise.all([
          lawyersRes.json(),
          casesRes.json(),
        ]);

        setLawyers(lawyersData);
        setCases(casesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/lawyers/workload/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      toast.success('Assignment created successfully');
      router.push('/admin/lawyers/workload');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
            New Assignment
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
            Create a new work assignment for a lawyer
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lawyer</label>
              <Select
                value={formData.lawyerId}
                onValueChange={(value) => handleChange('lawyerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Lawyer" />
                </SelectTrigger>
                <SelectContent>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id} className="flex flex-col items-start py-2">
                      <div className="font-medium">{lawyer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {lawyer.specializations} • {lawyer.office}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lawyer.yearsOfPractice} years practice • {lawyer.experience} years exp. • {lawyer.caseLoad} cases
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rating: {lawyer.rating.toFixed(1)} • {lawyer.primaryJurisdiction}
                      </div>
                      {lawyer.languages && (
                        <div className="text-xs text-muted-foreground">
                          Languages: {lawyer.languages}
                        </div>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Case</label>
              <Select
                value={formData.caseId}
                onValueChange={(value) => handleChange('caseId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((case_) => (
                    <SelectItem key={case_.id} value={case_.id}>
                      {case_.title} - {case_.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Complexity</label>
              <Select
                value={formData.complexity}
                onValueChange={(value) => handleChange('complexity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Complexity" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLEXITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={(e) => handleChange('estimatedHours', Number(e.target.value))}
                min={0}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actual Hours</label>
              <Input
                type="number"
                name="actualHours"
                value={formData.actualHours}
                onChange={(e) => handleChange('actualHours', Number(e.target.value))}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Progress (%)</label>
              <Input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={(e) => handleChange('progress', Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Completed Date</label>
              <Input
                type="date"
                name="completedDate"
                value={formData.completedDate}
                onChange={(e) => handleChange('completedDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Blockers</label>
            <Textarea
              name="blockers"
              value={formData.blockers}
              onChange={(e) => handleChange('blockers', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 