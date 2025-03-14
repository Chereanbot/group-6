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
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
  Info
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface AppointmentListProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: string, newStatus: AppointmentStatus) => Promise<void>;
}

export function AppointmentList({ appointments, onStatusChange }: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const isToday = (date: Date) => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Appointments</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {appointments.filter(a => isToday(a.scheduledTime)).length} Today
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {appointments.filter(a => isUpcoming(a.scheduledTime)).length} Upcoming
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id} className={cn(
                    isToday(appointment.scheduledTime) && "bg-blue-50/50"
                  )}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(appointment.scheduledTime), 'MMM d, yyyy')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(appointment.scheduledTime), 'h:mm a')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{appointment.client.fullName}</div>
                        <div className="flex space-x-2 text-sm text-gray-500">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.location.href = `tel:${appointment.client.phone}`}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.location.href = `mailto:${appointment.client.email}`}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {/* Implement SMS/messaging */}}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {appointment.purpose || 'No purpose specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {appointment.venue || 'No venue specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                                    <p className="text-sm text-gray-500">
                                      {selectedAppointment.client.phone}
                                    </p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusChange(appointment.id, 'COMPLETED')}
                          disabled={appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED'}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusChange(appointment.id, 'CANCELLED')}
                          disabled={appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED'}
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 