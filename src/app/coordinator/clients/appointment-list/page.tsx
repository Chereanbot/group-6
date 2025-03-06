"use client";

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bell } from "lucide-react";
import { AppointmentActions } from './AppointmentActions';
import { EditAppointmentForm } from './EditAppointmentForm';
import { Appointment } from './types';
import { useRouter } from 'next/navigation';
import { NotificationTemplate } from '@/components/ui/notification-template';
import { formatAppointmentMessage } from '@/lib/infobip';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NotificationStatus {
  appointmentId: string;
  status: 'sent' | 'failed' | 'sending';
  timestamp: Date;
  message: string;
  phone: string;
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationStatus[]>([]);
  const router = useRouter();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coordinator/clients/appointments', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleDelete = async (appointmentId: string) => {
    // Deletion is handled in the AppointmentActions component
    await fetchAppointments();
  };

  const handleScheduleNew = (client: Appointment['client']) => {
    // Navigate to the appointment creation page with client info
    router.push(`/coordinator/clients/appointments/new?clientId=${client.id}`);
  };

  const handleResendNotification = async (appointment: Appointment) => {
    try {
      setNotificationHistory(prev => [
        ...prev,
        {
          appointmentId: appointment.id,
          status: 'sending',
          timestamp: new Date(),
          message: formatAppointmentMessage({
            scheduledTime: appointment.scheduledTime,
            purpose: appointment.purpose,
            venue: appointment.venue,
            duration: appointment.duration,
          }),
          phone: appointment.client.phone,
        }
      ]);

      const response = await fetch(`/api/coordinator/clients/appointments/${appointment.id}/notify`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      setNotificationHistory(prev => 
        prev.map(n => 
          n.appointmentId === appointment.id && n.status === 'sending'
            ? { ...n, status: 'sent' }
            : n
        )
      );
    } catch (error) {
      setNotificationHistory(prev => 
        prev.map(n => 
          n.appointmentId === appointment.id && n.status === 'sending'
            ? { ...n, status: 'failed' }
            : n
        )
      );
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointment List</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification History
              {notificationHistory.length > 0 && (
                <Badge className="ml-2">{notificationHistory.length}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Notification History</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {notificationHistory.length === 0 ? (
                <p className="text-center text-gray-500">No notifications sent yet</p>
              ) : (
                notificationHistory.map((notification, index) => (
                  <NotificationTemplate
                    key={`${notification.appointmentId}-${index}`}
                    phone={notification.phone}
                    message={notification.message}
                    status={notification.status}
                    timestamp={notification.timestamp}
                    onResend={
                      notification.status === 'failed'
                        ? () => handleResendNotification(
                            appointments.find(a => a.id === notification.appointmentId)!
                          )
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Notification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => {
                    const latestNotification = notificationHistory
                      .filter(n => n.appointmentId === appointment.id)
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

                    return (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.client.fullName}
                          <div className="text-sm text-gray-500">
                            {appointment.client.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(appointment.scheduledTime), 'PPp')}
                        </TableCell>
                        <TableCell>{appointment.duration} minutes</TableCell>
                        <TableCell>{appointment.purpose}</TableCell>
                        <TableCell>{appointment.caseType}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeColor(appointment.priority)}>
                            {appointment.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{appointment.venue || 'N/A'}</TableCell>
                        <TableCell>
                          {latestNotification ? (
                            <Badge
                              className={
                                latestNotification.status === 'sent'
                                  ? 'bg-green-100 text-green-800'
                                  : latestNotification.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {latestNotification.status}
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendNotification(appointment)}
                            >
                              Send Notification
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <AppointmentActions
                            appointment={appointment}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onScheduleNew={handleScheduleNew}
                            onRefresh={fetchAppointments}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingAppointment && (
        <EditAppointmentForm
          appointment={editingAppointment}
          open={!!editingAppointment}
          onOpenChange={(open) => !open && setEditingAppointment(null)}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  );
} 