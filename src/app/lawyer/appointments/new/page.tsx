import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import NewAppointmentForm from '@/components/appointments/NewAppointmentForm';
import { Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RequestStatus, UserStatus } from '@prisma/client';

async function getClientsAndCoordinators(lawyerId: string) {
  // Get clients from cases and service requests
  const clients = await prisma.user.findMany({
    where: {
      OR: [
        {
          clientCases: {
            some: {
              lawyerId
            }
          }
        },
        {
          serviceRequests: {
            some: {
              assignedLawyerId: lawyerId,
              status: 'IN_PROGRESS'
            }
          }
        }
      ]
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      serviceRequests: {
        where: {
          assignedLawyerId: lawyerId,
          status: 'IN_PROGRESS'
        },
        select: {
          id: true,
          title: true,
          status: true
        }
      }
    }
  });

  // Get available coordinators
  const coordinators = await prisma.user.findMany({
    where: {
      userRole: 'COORDINATOR',
      status: UserStatus.ACTIVE
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true
    }
  });

  return {
    clients: clients as Array<{
      id: string;
      fullName: string;
      email: string;
      phone: string;
      serviceRequests: Array<{
        id: string;
        title: string;
        status: string;
      }>;
    }>,
    coordinators
  };
}

export default async function NewAppointmentPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    redirect('/auth/login?error=unauthorized&message=Please_login_first');
  }

  if (userRole !== 'LAWYER') {
    redirect('/unauthorized?message=Only_lawyers_can_access_this_page');
  }

  const { clients, coordinators } = await getClientsAndCoordinators(userId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Schedule New Appointment</h1>
            <p className="text-muted-foreground">Create a new appointment with a client</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString()}
            </span>
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
              <p className="text-sm text-gray-500">Available Clients</p>
              <h3 className="text-2xl font-bold">{clients.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Coordinators</p>
              <h3 className="text-2xl font-bold">{coordinators.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Default Duration</p>
              <h3 className="text-2xl font-bold">60 min</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <NewAppointmentForm 
            clients={clients}
            coordinators={coordinators}
          />
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Scheduling Guidelines</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium">Business Hours</h3>
                  <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium">Duration Guidelines</h3>
                  <p className="text-sm text-gray-600">Initial Consultation: 60 minutes</p>
                  <p className="text-sm text-gray-600">Follow-up Meeting: 30 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-medium">Important Notes</h3>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    <li>Schedule at least 24 hours in advance</li>
                    <li>Include all relevant case details</li>
                    <li>Specify required documents</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Need to reschedule? Please contact the coordinator at least 24 hours before the appointment.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
} 