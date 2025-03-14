import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Phone, Mail, Calendar, FileText, 
  MessageSquare, Clock, DollarSign, AlertCircle,
  MapPin, Shield, Star, Timer, Activity
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

async function getClientDetails(clientId: string, lawyerId: string) {
  const client = await prisma.user.findUnique({
    where: {
      id: clientId,
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
            take: 5
          },
          documents: {
            orderBy: {
              uploadedAt: 'desc'
            },
            take: 5
          },
          timeEntries: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
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
          Appointment: true,
          communications: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          }
        }
      }
    }
  });

  if (!client) {
    throw new Error('Client not found or not authorized');
  }

  return client;
}

export default async function ClientDetailsPage({
  params
}: {
  params: { id: Promise<string> }
}) {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    redirect('/auth/login?error=unauthorized&message=Please_login_first');
  }

  if (userRole !== 'LAWYER') {
    redirect('/unauthorized?message=Only_lawyers_can_access_this_page');
  }

  try {
    const clientId = await params.id;
    const client = await getClientDetails(clientId, userId);

    return (
      <div className="space-y-6 p-6">
        {/* Client Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {client.fullName}
                  {client.clientProfile?.healthStatus === 'HEALTHY' && (
                    <Badge className="bg-blue-100 text-blue-800">Healthy</Badge>
                  )}
                </h1>
                <div className="space-y-1 mt-1">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </p>
                  {client.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/lawyer/clients/${client.id}/messages`}
                className="btn btn-outline flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                <MessageSquare className="w-4 h-4" />
                Send Message
              </Link>
              <Link
                href={`/lawyer/clients/${client.id}/appointments`}
                className="btn btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Calendar className="w-4 h-4" />
                Schedule Meeting
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cases Section */}
          <Card className="col-span-2 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Active Cases
            </h2>
            <div className="space-y-4">
              {client.clientCases.map((caseItem) => (
                <div key={caseItem.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <Link
                      href={`/lawyer/cases/${caseItem.id}`}
                      className="font-medium hover:text-blue-600 hover:underline"
                    >
                      {caseItem.title}
                    </Link>
                    <Badge className={
                      caseItem.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {caseItem.status}
                    </Badge>
                  </div>
                  {caseItem.activities[0] && (
                    <p className="text-sm text-gray-500 mt-2">
                      Latest activity: {caseItem.activities[0].description}
                      <span className="block text-xs text-gray-400">
                        {formatDistanceToNow(new Date(caseItem.activities[0].createdAt), { addSuffix: true })}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info Card */}
            <Card className="p-6">
              <h3 className="text-sm font-medium mb-4">Client Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm">
                    {format(new Date(client.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    {client.status}
                  </Badge>
                </div>
                {client.clientProfile && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="text-sm">
                      {client.clientProfile.region}, {client.clientProfile.zone}, {client.clientProfile.wereda}
                      {client.clientProfile.houseNumber && `, ${client.clientProfile.houseNumber}`}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Upcoming Appointments */}
            {client.serviceRequests.some(req => req.Appointment) && (
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4">Upcoming Appointments</h3>
                <div className="space-y-3">
                  {client.serviceRequests
                    .filter(req => req.Appointment)
                    .map(req => (
                      <div key={req.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            {format(new Date(req.Appointment[0].scheduledTime), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <Badge className={
                          req.Appointment[0].status === 'SCHEDULED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {req.Appointment[0].status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {/* Payment Status */}
            {client.serviceRequests.some(req => req.ServicePayment) && (
              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4">Payment Status</h3>
                <div className="space-y-3">
                  {client.serviceRequests
                    .filter(req => req.ServicePayment)
                    .map(req => (
                      <div key={req.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            ${req.ServicePayment.amount}
                          </span>
                        </div>
                        <Badge className={
                          req.ServicePayment.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {req.ServicePayment.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activities
          </h2>
          <div className="space-y-4">
            {client.clientCases.flatMap(caseItem => 
              caseItem.activities.map(activity => ({
                ...activity,
                caseTitle: caseItem.title,
                caseId: caseItem.id
              }))
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map(activity => (
              <div key={activity.id} className="flex items-start gap-4 border-b pb-4">
                <div className="mt-1">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <Link
                    href={`/lawyer/cases/${activity.caseId}`}
                    className="text-sm font-medium hover:text-blue-600 hover:underline"
                  >
                    {activity.caseTitle}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading client details:', error);
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error Loading Client</h2>
          <p className="text-gray-500">
            The client could not be found or you don't have permission to view their details.
          </p>
          <Link
            href="/lawyer/clients"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to Clients List
          </Link>
        </Card>
      </div>
    );
  }
} 