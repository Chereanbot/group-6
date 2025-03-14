import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientCaseProgress } from '@/components/client/case-progress/ClientCaseProgress';
import { ClientCaseTimeline } from '@/components/client/case-progress/ClientCaseTimeline';
import { ClientCaseDocuments } from '@/components/client/case-progress/ClientCaseDocuments';
import { ClientCaseActivities } from '@/components/client/case-progress/ClientCaseActivities';
import { calculateCaseProgress } from '@/lib/case-progress';
import { 
  Briefcase, Clock, AlertTriangle, CheckCircle, 
  Calendar, FileText, Scale, Users 
} from 'lucide-react';

async function getClientCases(clientId: string) {
  const cases = await prisma.case.findMany({
    where: {
      clientId,
    },
    include: {
      assignedLawyer: {
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
          lawyerProfile: {
            select: {
              rating: true
            }
          }
        }
      },
      timeEntries: {
        where: {
          status: 'COMPLETED'
        },
        select: {
          id: true,
          description: true,
          serviceType: true,
          startTime: true,
          endTime: true,
          duration: true,
          status: true
        },
        orderBy: {
          startTime: 'desc'
        }
      },
      activities: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      },
      documents: {
        orderBy: {
          uploadedAt: 'desc'
        },
        take: 5
      }
    }
  });

  // Calculate progress for each case
  const casesWithProgress = await Promise.all(
    cases.map(async (caseData) => {
      const progress = await calculateCaseProgress(caseData.id);
      return {
        ...caseData,
        lawyer: caseData.assignedLawyer ? {
          id: caseData.assignedLawyer.id,
          name: caseData.assignedLawyer.fullName || caseData.assignedLawyer.username,
          email: caseData.assignedLawyer.email,
          phone: caseData.assignedLawyer.phone,
          rating: caseData.assignedLawyer.lawyerProfile?.rating || null
        } : null,
        progress
      };
    })
  );

  return casesWithProgress;
}

export default async function ClientCaseProgressPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    redirect('/auth/login?error=unauthorized&message=Please_login_first');
  }

  if (userRole !== 'CLIENT') {
    redirect('/unauthorized?message=Only_clients_can_access_this_page');
  }

  try {
    const cases = await getClientCases(userId);

    // Calculate summary statistics
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'ACTIVE').length;
    const completedCases = cases.filter(c => c.status === 'RESOLVED').length;
    const pendingCases = cases.filter(c => c.status === 'PENDING').length;
    const averageProgress = Math.round(
      cases.reduce((sum, c) => sum + (c.progress?.totalProgress || 0), 0) / totalCases
    );

    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Case Progress</h1>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cases</p>
                <h3 className="text-2xl font-bold">{totalCases}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Cases</p>
                <h3 className="text-2xl font-bold">{completedCases}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Cases</p>
                <h3 className="text-2xl font-bold">{pendingCases}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Progress</p>
                <h3 className="text-2xl font-bold">{averageProgress}%</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Case List with Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Cases</TabsTrigger>
            <TabsTrigger value="active">Active Cases</TabsTrigger>
            <TabsTrigger value="completed">Completed Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {cases.map(caseData => (
              <ClientCaseProgress key={caseData.id} caseData={caseData} />
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {cases
              .filter(c => c.status === 'ACTIVE')
              .map(caseData => (
                <ClientCaseProgress key={caseData.id} caseData={caseData} />
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {cases
              .filter(c => c.status === 'RESOLVED')
              .map(caseData => (
                <ClientCaseProgress key={caseData.id} caseData={caseData} />
              ))}
          </TabsContent>
        </Tabs>

        {/* Recent Activities and Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recent Activities
            </h2>
            <ClientCaseActivities 
              activities={cases.flatMap(c => c.activities).slice(0, 5)} 
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Documents
            </h2>
            <ClientCaseDocuments 
              documents={cases.flatMap(c => c.documents).slice(0, 5)} 
            />
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading client case progress:', error);
    return <div>Error: Something went wrong</div>;
  }
} 