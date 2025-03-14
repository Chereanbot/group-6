'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Clock, FileText, MapPin, AlertCircle } from 'lucide-react';

interface TimeEntryFormProps {
  cases: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
}

const SERVICE_TYPES = [
  'CONSULTATION',
  'DOCUMENT_PREPARATION',
  'COURT_APPEARANCE',
  'RESEARCH',
  'COMMUNITY_OUTREACH',
  'MEDIATION',
  'CLIENT_MEETING',
  'CASE_REVIEW'
] as const;

export function TimeEntryForm({ cases }: TimeEntryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    caseId: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    description: '',
    serviceType: 'CONSULTATION',
    needsFollowUp: false,
    followUpNotes: '',
    outreachLocation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const duration = formData.endTime 
        ? Math.floor((new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / 1000)
        : 0;

      const response = await fetch('/api/lawyer/time-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create time entry');
      }

      toast({
        title: 'Success',
        description: 'Legal aid activity recorded successfully',
      });

      // Reset form
      setFormData({
        caseId: '',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: '',
        description: '',
        serviceType: 'CONSULTATION',
        needsFollowUp: false,
        followUpNotes: '',
        outreachLocation: '',
      });

      // Refresh the page to show new entry
      router.refresh();
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to record legal aid activity',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="case" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Beneficiary Case
            </label>
            <Select
              value={formData.caseId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, caseId: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="serviceType" className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Service Type
            </label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, serviceType: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.serviceType === 'COMMUNITY_OUTREACH' && (
            <div className="space-y-2">
              <label htmlFor="outreachLocation" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Outreach Location
              </label>
              <Input
                type="text"
                id="outreachLocation"
                value={formData.outreachLocation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, outreachLocation: e.target.value }))
                }
                placeholder="Enter location of outreach activity"
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="startTime" className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Start Time
            </label>
            <Input
              type="datetime-local"
              id="startTime"
              value={formData.startTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startTime: e.target.value }))
              }
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="endTime" className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              End Time
            </label>
            <Input
              type="datetime-local"
              id="endTime"
              value={formData.endTime}
              min={formData.startTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endTime: e.target.value }))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Description of Services Provided
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          required
          placeholder="Describe the legal aid services provided..."
          className="h-32"
        />
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="needsFollowUp"
              checked={formData.needsFollowUp}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, needsFollowUp: checked as boolean }))
              }
            />
            <label htmlFor="needsFollowUp" className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Needs Follow-up
            </label>
          </div>

          {formData.needsFollowUp && (
            <Textarea
              value={formData.followUpNotes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, followUpNotes: e.target.value }))
              }
              placeholder="Enter follow-up notes and required actions..."
              className="mt-2"
            />
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Recording...
            </>
          ) : (
            'Record Activity'
          )}
        </Button>
      </div>
    </form>
  );
} 