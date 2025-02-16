'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

interface SuspendLawyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: any; // Replace with proper type
  onSuspend: () => void;
}

export default function SuspendLawyerModal({
  isOpen,
  onClose,
  lawyer,
  onSuspend
}: SuspendLawyerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    duration: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/lawyers/${lawyer.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to suspend lawyer');
      }

      toast.success('Lawyer suspended successfully');
      onSuspend();
      onClose();
    } catch (error) {
      console.error('Error suspending lawyer:', error);
      toast.error('Failed to suspend lawyer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Suspend Lawyer
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-800">
            Warning: Suspending a lawyer will:
          </p>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            <li>Temporarily disable their account access</li>
            <li>Reassign their active cases</li>
            <li>Remove them from case assignment pool</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Suspension Reason</Label>
            <Select
              id="reason"
              value={formData.reason}
              onValueChange={(value) => setFormData({ ...formData, reason: value })}
              required
            >
              <option value="">Select Reason</option>
              <option value="misconduct">Professional Misconduct</option>
              <option value="performance">Poor Performance</option>
              <option value="attendance">Attendance Issues</option>
              <option value="investigation">Under Investigation</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Suspension Duration</Label>
            <Select
              id="duration"
              value={formData.duration}
              onValueChange={(value) => setFormData({ ...formData, duration: value })}
              required
            >
              <option value="">Select Duration</option>
              <option value="1week">1 Week</option>
              <option value="2weeks">2 Weeks</option>
              <option value="1month">1 Month</option>
              <option value="3months">3 Months</option>
              <option value="indefinite">Indefinite</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Provide additional details about the suspension..."
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              variant="destructive"
            >
              {loading ? 'Suspending...' : 'Confirm Suspension'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 