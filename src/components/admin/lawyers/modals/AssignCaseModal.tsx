'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface AssignCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyerId: string;
  lawyerName: string;
}

export default function AssignCaseModal({
  isOpen,
  onClose,
  lawyerId,
  lawyerName
}: AssignCaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    caseTitle: '',
    caseType: '',
    clientName: '',
    clientEmail: '',
    priority: '',
    description: '',
    estimatedDuration: '',
    complexity: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/cases/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lawyerId,
          ...formData,
          dueDate: date
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign case');
      }

      onClose();
      // You might want to refresh the cases list or show a success message
    } catch (error) {
      console.error('Error assigning case:', error);
      // Handle error (show error message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign New Case to {lawyerName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseTitle">Case Title</Label>
              <Input
                id="caseTitle"
                value={formData.caseTitle}
                onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseType">Case Type</Label>
              <Select
                id="caseType"
                value={formData.caseType}
                onValueChange={(value) => setFormData({ ...formData, caseType: value })}
                required
              >
                <option value="">Select Type</option>
                <option value="criminal">Criminal Defense</option>
                <option value="civil">Civil Litigation</option>
                <option value="family">Family Law</option>
                <option value="corporate">Corporate Law</option>
              </Select>
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Case Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                id="priority"
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                required
              >
                <option value="">Select Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Case Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Case'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 