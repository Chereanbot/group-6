"use client";

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Calendar as CalendarIcon,
  List,
  Clock,
  MapPin,
  Video,
  AlertCircle,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { AppointmentCalendarView } from "@/components/appointments/AppointmentCalendarView";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";

type ViewMode = "calendar" | "list";
type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

interface Appointment {
  id: string;
  scheduledTime: Date;
  status: AppointmentStatus;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  coordinator: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  venue?: string;
  purpose?: string;
  notes?: string;
  priority: string;
  duration: number;
}

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/lawyer/appointments');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch appointments');
      }

      setAppointments(data.appointments.map((apt: any) => ({
        ...apt,
        scheduledTime: new Date(apt.scheduledTime)
      })));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const response = await fetch(`/api/lawyer/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update appointment status');
      }

      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ));

      toast.success('Appointment status updated');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
          
          <div className="space-y-2">
            <h3 className="font-medium">Upcoming Today</h3>
            <ScrollArea className="h-[300px]">
              {appointments
                .filter(apt => format(apt.scheduledTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                .map(apt => (
                  <div key={apt.id} className="p-3 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(apt.scheduledTime, 'h:mm a')}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {apt.client.fullName}
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          {viewMode === "calendar" ? (
            <AppointmentCalendarView 
              appointments={appointments}
            />
          ) : (
            <AppointmentList 
              appointments={appointments}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
} 