import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, Phone, Mail, Calendar, FileText, 
  MessageSquare, Clock, DollarSign, AlertCircle,
  MapPin, Shield, Star, Timer, Activity,
  Scale, Briefcase, CheckCircle, XCircle,
  FileSignature, Users, Paperclip, Download, RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { CaseStatus, Priority } from '@prisma/client';

async function getCaseDetails(caseId: string, lawyerId: string) {
  const caseDetails = await prisma.case.findUnique({
    where: {
      id: caseId,
      lawyerId
    },
    include: {
      client: true,
      assignedLawyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          lawyerProfile: true
        }
      },
      activities: {
        include: {
          user: true
        }
      },
      documents: {
        include: {
          uploader: true
        }
      },
      notes: {
        include: {
          creator: true
        }
      },
      appeals: {
        include: {
          filer: true,
          documents: true,
          hearings: true
        }
      },
      timeEntries: true,
      assignedOffice: true
    }
  });

  if (!caseDetails) {
    throw new Error('Case not found or not authorized');
  }

  return caseDetails;
}

// Helper functions for badge colors
const getStatusColor = (status: CaseStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'secondary';
    case 'PENDING':
      return 'outline';
    case 'RESOLVED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'HIGH':
    case 'URGENT':
      return 'destructive';
    case 'MEDIUM':
      return 'secondary';
    case 'LOW':
      return 'default';
    default:
      return 'default';
  }
};

// Activity icon component
const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'UPDATE':
      return <Activity className="h-4 w-4 text-blue-600" />;
    case 'DOCUMENT_ADDED':
      return <FileText className="h-4 w-4 text-green-600" />;
    case 'STATUS_CHANGE':
      return <RefreshCw className="h-4 w-4 text-yellow-600" />;
    default:
      return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

export default async function CaseDetailsPage({
  params
}: {
  params: { id: string }
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
    const caseDetails = await getCaseDetails(params.id, userId);

    return (
      <div className="space-y-6 p-6">
        {/* Case Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">{caseDetails.title}</h1>
                <Badge variant={getStatusColor(caseDetails.status)}>{caseDetails.status}</Badge>
                <Badge variant={getPriorityColor(caseDetails.priority)}>{caseDetails.priority}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Case #{caseDetails.id}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <FileSignature className="w-4 h-4" />
                Edit Case
              </Button>
              <Button className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message Client
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{caseDetails.client?.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Filed Date</p>
                <p className="font-medium">
                  {format(new Date(caseDetails.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Case Type</p>
                <p className="font-medium">{caseDetails.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Timer className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Logged</p>
                <p className="font-medium">
                  {caseDetails.timeEntries?.reduce((acc, entry) => acc + entry.duration, 0)} mins
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p>{caseDetails.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Category</h3>
                    <p>{caseDetails.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p>
                      {caseDetails.region && `${caseDetails.region}, `}
                      {caseDetails.zone && `${caseDetails.zone}, `}
                      {caseDetails.wereda}, {caseDetails.kebele}
                      {caseDetails.houseNumber && `, ${caseDetails.houseNumber}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseDetails.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="mt-1">
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div>
                        <p className="font-semibold">{activity.title}</p>
                        <p>{activity.description}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(activity.createdAt), 'PPP')}
                          {' by '}
                          {activity.user.fullName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseDetails.documents.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{doc.title}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded by {doc.uploader.fullName} on{' '}
                          {format(new Date(doc.uploadedAt), 'PPP')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Name</h3>
                    <p>{caseDetails.client?.fullName || caseDetails.clientName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p>{caseDetails.client?.phone || caseDetails.clientPhone}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p>
                      {caseDetails.region && `${caseDetails.region}, `}
                      {caseDetails.zone && `${caseDetails.zone}, `}
                      {caseDetails.wereda}, {caseDetails.kebele}
                      {caseDetails.houseNumber && `, ${caseDetails.houseNumber}`}
                    </p>
                  </div>
                  {caseDetails.clientAddress && (
                    <div>
                      <h3 className="font-semibold">Additional Address</h3>
                      <p>{caseDetails.clientAddress}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Hearings */}
            {caseDetails.appeals?.some(appeal => appeal.hearings.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Hearings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {caseDetails.appeals.flatMap(appeal => 
                      appeal.hearings.map(hearing => (
                        <div key={hearing.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">
                              {format(new Date(hearing.scheduledDate), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <Badge className={
                            hearing.status === 'SCHEDULED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {hearing.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseDetails.timeEntries.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{entry.description}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(entry.startTime), 'PPP')}
                        </p>
                      </div>
                      <Badge>{entry.duration} hours</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Case Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Case Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseDetails.notes.map((note) => (
                    <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                      <p>{note.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        By {note.creator.fullName} on{' '}
                        {format(new Date(note.createdAt), 'PPP')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading case details:', error);
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error Loading Case</h2>
          <p className="text-gray-500">
            The case could not be found or you don't have permission to view it.
          </p>
          <Link
            href="/lawyer/cases"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to Cases
          </Link>
        </Card>
      </div>
    );
  }
} 