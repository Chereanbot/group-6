"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { AppointmentType, AppointmentPriority } from "@/app/lawyer/communications/appointments/interfaces";
import { ClientSelector } from "./ClientSelector";
import { CaseSelector } from "./CaseSelector";

interface AppointmentDialogProps {
  onSubmit: (data: any) => Promise<void>;
}

export function AppointmentDialog({ onSubmit }: AppointmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVirtual, setIsVirtual] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Add form submission logic
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Appointment title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTATION">Consultation</SelectItem>
                  <SelectItem value="CASE_REVIEW">Case Review</SelectItem>
                  <SelectItem value="COURT_PREPARATION">Court Preparation</SelectItem>
                  <SelectItem value="CLIENT_MEETING">Client Meeting</SelectItem>
                  <SelectItem value="DEPOSITION">Deposition</SelectItem>
                  <SelectItem value="MEDIATION">Mediation</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="flex gap-2">
                <Input type="date" className="flex-1" required />
                <Input type="time" className="w-32" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <div className="flex gap-2">
                <Input type="date" className="flex-1" required />
                <Input type="time" className="w-32" required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <ClientSelector />
          </div>

          <div className="space-y-2">
            <Label>Related Case (Optional)</Label>
            <CaseSelector />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="virtual"
                checked={isVirtual}
                onCheckedChange={setIsVirtual}
              />
              <Label htmlFor="virtual">Virtual Meeting</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isVirtual && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Meeting location" />
            </div>
          )}

          {isVirtual && (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input id="meetingLink" placeholder="Virtual meeting link" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Additional details about the appointment"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 