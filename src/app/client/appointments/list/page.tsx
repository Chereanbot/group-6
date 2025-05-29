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
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HiOutlineBell } from "react-icons/hi";
import NotificationSettings from '@/components/NotificationSettings';
import { useLanguage } from "@/providers/LanguageProvider";

interface Appointment {
  id: string;
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: string;
  notes?: string;
  caseType: string;
  venue?: string;
  priority: string;
  requiredDocuments: string[];
  coordinator: {
    id: string;
    name: string;
    email: string;
    phone: string;
    office?: {
      name: string;
      location: string;
      address: string;
      phone: string;
      email: string;
    } | null;
  };
}

export default function ClientAppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [clientId, setClientId] = useState<string>(''); // You'll need to get this from your auth context
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/appointments', {
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
      toast({
        variant: "destructive",
        title: t('appointments.error.title', 'Error'),
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // Get client ID from your auth context
    // setClientId(authContext.user.id);
  }, []);

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
          <h3 className="text-lg font-semibold text-red-600">{t('appointments.error.title', 'Error')}</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">{t('appointments.tabs.list', 'Appointments List')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('appointments.tabs.notifications', 'Notification Settings')}</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>{t('appointments.list.title', 'My Appointments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('appointments.list.dateTime', 'Date & Time')}</TableHead>
                      <TableHead>{t('appointments.list.duration', 'Duration')}</TableHead>
                      <TableHead>{t('appointments.list.purpose', 'Purpose')}</TableHead>
                      <TableHead>{t('appointments.list.caseType', 'Case Type')}</TableHead>
                      <TableHead>{t('appointments.list.priority', 'Priority')}</TableHead>
                      <TableHead>{t('appointments.list.status', 'Status')}</TableHead>
                      <TableHead>{t('appointments.list.venue', 'Venue')}</TableHead>
                      <TableHead>{t('appointments.list.coordinator', 'Coordinator')}</TableHead>
                      <TableHead>{t('appointments.list.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          {t('appointments.list.noAppointments', 'No appointments found')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {format(new Date(appointment.scheduledTime), 'PPp')}
                          </TableCell>
                          <TableCell>{appointment.duration} {t('appointments.list.minutes', 'minutes')}</TableCell>
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
                          <TableCell>{appointment.venue || t('appointments.list.na', 'N/A')}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{appointment.coordinator.name}</p>
                              <p className="text-sm text-gray-500">
                                {appointment.coordinator.office?.name || t('appointments.list.noOffice', 'No office assigned')}
                                {appointment.coordinator.office?.location && 
                                  ` - ${appointment.coordinator.office.location}`
                                }
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              {t('appointments.actions.viewDetails', 'View Details')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="flex justify-center">
            <NotificationSettings userId={clientId} userType="client" />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('appointments.details.title', 'Appointment Details')}</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">{t('appointments.details.info', 'Appointment Information')}</h3>
                <p><span className="font-medium">{t('appointments.details.dateTime', 'Date & Time')}:</span> {format(new Date(selectedAppointment.scheduledTime), 'PPp')}</p>
                <p><span className="font-medium">{t('appointments.details.duration', 'Duration')}:</span> {selectedAppointment.duration} {t('appointments.details.minutes', 'minutes')}</p>
                <p><span className="font-medium">{t('appointments.details.purpose', 'Purpose')}:</span> {selectedAppointment.purpose}</p>
                <p><span className="font-medium">{t('appointments.details.caseType', 'Case Type')}:</span> {selectedAppointment.caseType}</p>
                <p><span className="font-medium">{t('appointments.details.status', 'Status')}:</span> {selectedAppointment.status}</p>
                <p><span className="font-medium">{t('appointments.details.priority', 'Priority')}:</span> {selectedAppointment.priority}</p>
                <p><span className="font-medium">{t('appointments.details.venue', 'Venue')}:</span> {selectedAppointment.venue || t('appointments.details.na', 'N/A')}</p>
                {selectedAppointment.notes && (
                  <p><span className="font-medium">{t('appointments.details.notes', 'Notes')}:</span> {selectedAppointment.notes}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('appointments.details.coordinator', 'Coordinator Information')}</h3>
                <p><span className="font-medium">{t('appointments.details.name', 'Name')}:</span> {selectedAppointment.coordinator.name}</p>
                <p><span className="font-medium">{t('appointments.details.email', 'Email')}:</span> {selectedAppointment.coordinator.email}</p>
                <p><span className="font-medium">{t('appointments.details.phone', 'Phone')}:</span> {selectedAppointment.coordinator.phone}</p>
                {selectedAppointment.coordinator.office && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">{t('appointments.details.office', 'Office Details')}</h4>
                    <p><span className="font-medium">{t('appointments.details.name', 'Name')}:</span> {selectedAppointment.coordinator.office.name}</p>
                    <p><span className="font-medium">{t('appointments.details.location', 'Location')}:</span> {selectedAppointment.coordinator.office.location}</p>
                    <p><span className="font-medium">{t('appointments.details.address', 'Address')}:</span> {selectedAppointment.coordinator.office.address}</p>
                    <p><span className="font-medium">{t('appointments.details.phone', 'Phone')}:</span> {selectedAppointment.coordinator.office.phone}</p>
                    <p><span className="font-medium">{t('appointments.details.email', 'Email')}:</span> {selectedAppointment.coordinator.office.email}</p>
                  </div>
                )}
              </div>
              {selectedAppointment.requiredDocuments.length > 0 && (
                <div className="col-span-2">
                  <h3 className="font-semibold mb-2">{t('appointments.details.documents', 'Required Documents')}</h3>
                  <ul className="list-disc list-inside">
                    {selectedAppointment.requiredDocuments.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 