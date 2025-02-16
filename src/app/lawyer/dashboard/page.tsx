import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { 
  Briefcase, Clock, AlertTriangle, CheckCircle, 
  Calendar, MessageSquare, Star, TrendingUp, Users,
  FileText, DollarSign, Bell, Scale, BookOpen,
  Timer, GitPullRequest
} from 'lucide-react';
import { DashboardAlerts } from '@/components/lawyer/dashboard/DashboardAlerts';

async function getLawyerDashboardData(lawyerId: string) {
  return await prisma.user.findUnique({
    where: {
      id: lawyerId,
    },
    include: {
      lawyerProfile: {
        include: {
          office: true,
          performance: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      },
      assignedCases: {
        where: {
          OR: [
            { status: 'ACTIVE' },
            { status: 'PENDING' }
          ]
        },
        include: {
          client: true,
          activities: {
            orderBy: { creat vedAt: 'desc' },
            take: 1
          },
          documents: {
            orderBy: { uploadedAt: 'desc' },
            take: 5
          },
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      },
      appeals: {
        where: { status: 'PENDING' },
        include: {
          case: true,
          hearings: {
            where: {
              scheduledDate: {
                gte: new Date()
              }
            },
            orderBy: { scheduledDate: 'asc' }
          }
        }
      },
      assignedServices: {
        include: {
          client: true,
          Appointment: {
            where: {
              scheduledFor: { gte: new Date() }
            },
            orderBy: { scheduledFor: 'asc' },
            take: 5
          },
          communications: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      },
      notifications: {
        where: { status: 'UNREAD' },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
        take: 5
      }
    }
  });
}

export default async function LawyerDashboard() {
  const headersList = await headers();
  const lawyerId = headersList.get('x-lawyer-id');

  if (!lawyerId) {
    console.error('No lawyer ID found in headers');
    return <div>Error: Unable to load lawyer data</div>;
  }

  try {
    const dashboardData = await getLawyerDashboardData(lawyerId);

    if (!dashboardData || !dashboardData.lawyerProfile) {
      console.error('No lawyer data found for ID:', lawyerId);
      return <div>Error: Unable to load lawyer profile</div>;
    }

    const activeCases = dashboardData.assignedCases.filter(c => c.status === 'ACTIVE');
    const pendingCases = dashboardData.assignedCases.filter(c => c.status === 'PENDING');
    const upcomingHearings = dashboardData.appeals.flatMap(a => a.hearings);
    const pendingAppeals = dashboardData.appeals.length;
    const totalDocuments = dashboardData.documents.length;
    const unreadMessages = dashboardData.assignedServices
      .flatMap(s => s.communications)
      .filter(c => c.status === 'UNREAD');
    const upcomingAppointments = dashboardData.assignedServices
      .flatMap(s => s.Appointment)
      .filter(a => a && new Date(a.scheduledFor) > new Date());
    const recentPayments = dashboardData.assignedServices
      .flatMap(s => s.payments)
      .filter(p => p.status === 'COMPLETED');

    return (
      <div className="space-y-6 p-6">
        <DashboardAlerts 
          lawyerCreatedAt={dashboardData.lawyerProfile.createdAt}
          appointments={upcomingAppointments}
          messages={unreadMessages}
          notifications={dashboardData.notifications}
        />
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lawyer Dashboard</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="dashboard-stats">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Cases</p>
                <h3 className="text-2xl font-bold">{activeCases.length}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <Scale className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Appeals</p>
                <h3 className="text-2xl font-bold">{pendingAppeals}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Performance Rating</p>
                <h3 className="text-2xl font-bold">
                  {dashboardData.lawyerProfile.rating?.toFixed(1) || 'N/A'}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Timer className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Case Load</p>
                <h3 className="text-2xl font-bold">{dashboardData.lawyerProfile.caseLoad}</h3>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="p-6 col-span-1" data-tour="dashboard-activities">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <GitPullRequest className="mr-2 h-5 w-5" />
              Recent Case Activities
            </h2>
            <div className="space-y-4">
              {dashboardData.activities.map(activity => (
                <div key={activity.id} className="border-b pb-2">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                  {activity.details && (
                    <p className="text-sm mt-1">{JSON.stringify(activity.details)}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 col-span-1" data-tour="dashboard-calendar">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Hearings
            </h2>
            <div className="space-y-4">
              {upcomingHearings.map(hearing => (
                <div key={hearing.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{hearing.location}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(hearing.scheduledDate).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    hearing.status === 'SCHEDULED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hearing.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 col-span-1" data-tour="dashboard-cases">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Documents
            </h2>
            <div className="space-y-4">
              {dashboardData.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{doc.type}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 col-span-1 xl:col-span-2" data-tour="dashboard-performance">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Financial Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPayments.map(payment => (
                <div key={payment.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">${payment.amount}</p>
                    <span className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{payment.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 col-span-1">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Legal Research
            </h2>
            <div className="space-y-4">
              <p className="text-gray-500">Recent legal research and resources will appear here</p>
            </div>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return <div>Error: Something went wrong</div>;
  }
}