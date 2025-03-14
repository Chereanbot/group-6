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
        title: "Error",
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
          <h3 className="text-lg font-semibold text-red-600">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Appointments</TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <HiOutlineBell className="h-5 w-5" />
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Case Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Coordinator</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
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
                            <div>
                              <p className="font-medium">{appointment.coordinator.name}</p>
                              <p className="text-sm text-gray-500">
                                {appointment.coordinator.office?.name || 'No office assigned'}
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
                              View Details
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
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Appointment Information</h3>
                <p><span className="font-medium">Date & Time:</span> {format(new Date(selectedAppointment.scheduledTime), 'PPp')}</p>
                <p><span className="font-medium">Duration:</span> {selectedAppointment.duration} minutes</p>
                <p><span className="font-medium">Purpose:</span> {selectedAppointment.purpose}</p>
                <p><span className="font-medium">Case Type:</span> {selectedAppointment.caseType}</p>
                <p><span className="font-medium">Status:</span> {selectedAppointment.status}</p>
                <p><span className="font-medium">Priority:</span> {selectedAppointment.priority}</p>
                <p><span className="font-medium">Venue:</span> {selectedAppointment.venue || 'N/A'}</p>
                {selectedAppointment.notes && (
                  <p><span className="font-medium">Notes:</span> {selectedAppointment.notes}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Coordinator Information</h3>
                <p><span className="font-medium">Name:</span> {selectedAppointment.coordinator.name}</p>
                <p><span className="font-medium">Email:</span> {selectedAppointment.coordinator.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedAppointment.coordinator.phone}</p>
                {selectedAppointment.coordinator.office && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Office Details</h4>
                    <p><span className="font-medium">Name:</span> {selectedAppointment.coordinator.office.name}</p>
                    <p><span className="font-medium">Location:</span> {selectedAppointment.coordinator.office.location}</p>
                    <p><span className="font-medium">Address:</span> {selectedAppointment.coordinator.office.address}</p>
                    <p><span className="font-medium">Phone:</span> {selectedAppointment.coordinator.office.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedAppointment.coordinator.office.email}</p>
                  </div>
                )}
              </div>
              {selectedAppointment.requiredDocuments.length > 0 && (
                <div className="col-span-2">
                  <h3 className="font-semibold mb-2">Required Documents</h3>
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