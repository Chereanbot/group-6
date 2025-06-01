'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentCalendarView } from '@/components/appointments/AppointmentCalendarView';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Bell } from 'lucide-react';
import { NewAppointmentModal } from '@/components/appointments/NewAppointmentModal';

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface Appointment {
  id: string;
  clientId: string;
  coordinatorId: string;
  scheduledTime: Date;
  duration: number;
  purpose: string;
  priority: string;
  caseType: string;
  caseDetails: string | null;
  venue: string | null;
  requiredDocuments: string[];
  status: AppointmentStatus;
  notes: string | null;
  reminderType: string[];
  reminderTiming: number[];
  createdAt: Date;
  updatedAt: Date;
  serviceRequestId: string | null;
  cancellationReason: string | null;
  completionNotes: string | null;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  coordinator: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
}

interface Client {
  id: string;
  fullName: string;
}

interface AppointmentsClientProps {
  appointments: Appointment[];
  clients: Client[];
}

export function AppointmentsClient({ appointments: initialAppointments, clients }: AppointmentsClientProps) {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate some stats
  const upcomingAppointments = appointments.filter(
    app => app.status === 'SCHEDULED' && new Date(app.scheduledTime) > new Date()
  );
  const todayAppointments = appointments.filter(
    app => app.status === 'SCHEDULED' && 
    new Date(app.scheduledTime).toDateString() === new Date().toDateString()
  );

  const handleCreateAppointment = async (data: {
    scheduledTime: Date;
    clientId: string;
    purpose: string;
    venue: string;
    duration: number;
    priority: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/lawyer/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session?.user?.id || '',
          'x-user-role': 'LAWYER'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      const newAppointment = await response.json();
      setAppointments(prev => [...prev, newAppointment]);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      const response = await fetch(`/api/lawyer/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session?.user?.id || '',
          'x-user-role': 'LAWYER'
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      setAppointments(prev =>
        prev.map(app =>
          app.id === id ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage your appointments and court dates</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsModalOpen(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule New
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Appointments</p>
              <h3 className="text-2xl font-bold">{todayAppointments.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Appointments</p>
              <h3 className="text-2xl font-bold">{upcomingAppointments.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Bell className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Appointments</p>
              <h3 className="text-2xl font-bold">{appointments.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card className="p-6">
            <AppointmentList 
              appointments={appointments}
              onStatusChange={handleStatusChange}
            />
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card className="p-6">
            <AppointmentCalendarView 
              appointments={appointments}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAppointment}
        clients={clients}
      />
    </div>
  );
} 