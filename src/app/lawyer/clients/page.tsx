import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Phone, Mail, Calendar, FileText, 
  MessageSquare, Clock, DollarSign, AlertCircle 
} from 'lucide-react';
import ClientList from '@/components/lawyer/clients/ClientList';
import ClientStats from '@/components/lawyer/clients/ClientStats';
import ClientFilters from '@/components/lawyer/clients/ClientFilters';

async function getLawyerClients(lawyerId: string) {
  return await prisma.user.findMany({
    where: {
      clientCases: {
        some: {
          lawyerId
        }
      }
    },
    include: {
      clientProfile: true,
      clientCases: {
        where: {
          lawyerId
        },
        include: {
          activities: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          documents: {
            orderBy: {
              uploadedAt: 'desc'
            },
            take: 1
          },
          timeEntries: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          assignedLawyer: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          notes: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          }
        }
      },
      serviceRequests: {
        where: {
          assignedLawyerId: lawyerId
        },
        include: {
          ServicePayment: true,
          Appointment: true
        }
      }
    },
    orderBy: {
      fullName: 'asc'
    }
  });
}

async function getClientStats(lawyerId: string) {
  const totalClients = await prisma.user.count({
    where: {
      clientCases: {
        some: {
          lawyerId
        }
      }
    }
  });

  const activeClients = await prisma.user.count({
    where: {
      clientCases: {
        some: {
          lawyerId,
          status: 'ACTIVE'
        }
      }
    }
  });

  const pendingPayments = await prisma.serviceRequest.count({
    where: {
      assignedLawyerId: lawyerId,
      ServicePayment: {
        status: 'PENDING'
      }
    }
  });

  const upcomingAppointments = await prisma.appointment.count({
    where: {
      serviceRequest: {
        assignedLawyerId: lawyerId
      },
      scheduledTime: {
        gte: new Date()
      }
    }
  });

  return {
    totalClients,
    activeClients,
    pendingPayments,
    upcomingAppointments
  };
}

export default async function ClientsPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    console.error('No user ID found in headers');
    redirect('/auth/login?error=unauthorized&message=Please_login_first');
  }

  if (userRole !== 'LAWYER') {
    console.error('User is not a lawyer');
    redirect('/unauthorized?message=Only_lawyers_can_access_this_page');
  }

  try {
    const [clients, stats] = await Promise.all([
      getLawyerClients(userId),
      getClientStats(userId)
    ]);

    return (
      <div className="space-y-6 p-6">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Client Management</h1>
              <p className="text-muted-foreground">Manage and track all your client relationships</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-primary inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                <Users className="w-4 h-4" />
                Get Guide
              </button>
            </div>
          </div>
        </Card>

        <ClientStats stats={stats} />
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 gap-4 bg-muted p-1">
            <TabsTrigger value="all">All Clients</TabsTrigger>
            <TabsTrigger value="active">Active Clients</TabsTrigger>
            <TabsTrigger value="pending">Pending Payments</TabsTrigger>
            <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
          </TabsList>
        </Tabs>

        <ClientFilters />
        
        <ClientList clients={clients} />
      </div>
    );
  } catch (error) {
    console.error('Error loading clients:', error);
    return <div>Error: Something went wrong</div>;
  }
} 