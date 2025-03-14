import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentCalendarView } from '@/components/appointments/AppointmentCalendarView';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Bell } from 'lucide-react';

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

async function getAppointments(lawyerId: string): Promise<Appointment[]> {
  // Fetch all appointments through service requests
  const appointments = await prisma.appointment.findMany({
    where: {
      serviceRequest: {
        assignedLawyerId: lawyerId
      }
    },
    include: {
      serviceRequest: {
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          assignedLawyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          }
        }
      }
    },
    orderBy: {
      scheduledTime: 'asc'
    }
  });

  // Format and return appointments
  return appointments.map(appointment => ({
    id: appointment.id,
    scheduledTime: appointment.scheduledTime,
    status: appointment.status as AppointmentStatus,
    client: appointment.serviceRequest.client,
    coordinator: appointment.serviceRequest.assignedLawyer,
    venue: appointment.venue || undefined,
    purpose: appointment.purpose || undefined,
    notes: appointment.notes || undefined,
    priority: appointment.priority || 'MEDIUM',
    duration: appointment.duration || 60
  }));
}

export default async function LawyerAppointmentsPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    redirect('/auth/login?error=unauthorized&message=Please_login_first');
  }

  if (userRole !== 'LAWYER') {
    redirect('/unauthorized?message=Only_lawyers_can_access_this_page');
  }

  const appointments = await getAppointments(userId);

  // Calculate some stats
  const upcomingAppointments = appointments.filter(
    app => app.status === 'SCHEDULED' && new Date(app.scheduledTime) > new Date()
  );
  const todayAppointments = appointments.filter(
    app => app.status === 'SCHEDULED' && 
    new Date(app.scheduledTime).toDateString() === new Date().toDateString()
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage your appointments and court dates</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
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
              onStatusChange={async (id: string, status: AppointmentStatus) => {
                'use server';
                await prisma.appointment.update({
                  where: { id },
                  data: { status }
                });
              }}
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
    </div>
  );
} 