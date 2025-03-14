"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock,
  MapPin,
  Video,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
}

export function AppointmentCalendarView({ appointments }: AppointmentCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Function to get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      format(new Date(appointment.scheduledTime), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Function to check if a date has appointments
  const hasAppointments = (date: Date) => {
    return getAppointmentsForDate(date).length > 0;
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'RESCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-4">
        <CardHeader className="px-2">
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasAppointment: (date) => hasAppointments(date),
            }}
            modifiersStyles={{
              hasAppointment: {
                fontWeight: 'bold',
                backgroundColor: '#e0f2fe',
                color: '#1e40af',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>
            Appointments for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {selectedDate && getAppointmentsForDate(selectedDate).map((appointment) => (
                <Card key={appointment.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="font-medium">
                          {format(new Date(appointment.scheduledTime), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          {appointment.client.fullName}
                        </p>
                      </div>
                      {appointment.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-600">{appointment.venue}</p>
                        </div>
                      )}
                      {appointment.purpose && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-600">{appointment.purpose}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-600">Duration: {appointment.duration} minutes</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusBadgeColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Appointment Details</DialogTitle>
                            <DialogDescription>
                              Complete information about the appointment
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAppointment && (
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Date & Time</h4>
                                  <p className="text-sm text-gray-500">
                                    {format(new Date(selectedAppointment.scheduledTime), 'PPP p')}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Status</h4>
                                  <Badge className={getStatusBadgeColor(selectedAppointment.status)}>
                                    {selectedAppointment.status}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-medium">Client</h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedAppointment.client.fullName}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Contact</h4>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => window.location.href = `tel:${selectedAppointment.client.phone}`}
                                    >
                                      <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => window.location.href = `mailto:${selectedAppointment.client.email}`}
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">Purpose</h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedAppointment.purpose || 'Not specified'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Venue</h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedAppointment.venue || 'Not specified'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Duration</h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedAppointment.duration} minutes
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Priority</h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedAppointment.priority}
                                  </p>
                                </div>
                              </div>
                              {selectedAppointment.notes && (
                                <div>
                                  <h4 className="font-medium">Notes</h4>
                                  <p className="text-sm text-gray-500">
                                    {selectedAppointment.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))}
              {selectedDate && getAppointmentsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments for this date</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 