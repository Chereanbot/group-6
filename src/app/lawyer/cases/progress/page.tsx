import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { TimelineTrafficView } from '@/components/lawyer/case-progress/TimelineTrafficView';
import { calculateCaseProgress } from '@/lib/case-progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaseType } from '@/types/case-progress';
import { CaseStatus, Priority, CaseCategory } from '@prisma/client';

interface CaseWithProgress {
  id: string;
  title: string;
  category: CaseCategory;
  status: CaseStatus;
  priority: Priority;
  progress: number;
}

async function getLawyerCaseProgress(lawyerId: string): Promise<CaseWithProgress[]> {
  const cases = await prisma.case.findMany({
    where: {
      lawyerId,
      status: {
        in: [CaseStatus.ACTIVE, CaseStatus.PENDING]
      }
    },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      priority: true,
      timeEntries: {
        where: {
          status: 'COMPLETED'
        },
        select: {
          id: true,
          description: true
        }
      }
    }
  });

  // Calculate progress for each case
  const casesWithProgress = await Promise.all(
    cases.map(async (caseData) => {
      const progress = await calculateCaseProgress(caseData.id);
      return {
        ...caseData,
        progress: progress?.totalProgress || 0
      };
    })
  );

  return casesWithProgress;
}

export default async function CaseProgressPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    redirect('/auth/login?error=unauthorized&message=Please_login_first');
  }

  if (userRole !== 'LAWYER') {
    redirect('/unauthorized?message=Only_lawyers_can_access_this_page');
  }

  const cases = await getLawyerCaseProgress(userId);

  // Calculate summary statistics
  const totalCases = cases.length;
  const averageProgress = Math.round(
    cases.reduce((sum, c) => sum + c.progress, 0) / totalCases
  );
  const highPriorityCases = cases.filter(c => c.priority === Priority.HIGH || c.priority === Priority.URGENT).length;
  const completedCases = cases.filter(c => c.progress === 100).length;

  // Sort cases by different criteria
  const sortByProgress = [...cases].sort((a, b) => b.progress - a.progress);
  const needsAttention = [...cases].filter(c => c.progress < 50).sort((a, b) => a.progress - b.progress);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Case Progress Overview</h1>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Active Cases</h3>
          <p className="text-2xl font-bold">{totalCases}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Progress</h3>
          <p className="text-2xl font-bold">{averageProgress}%</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">High Priority Cases</h3>
          <p className="text-2xl font-bold">{highPriorityCases}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Completed Cases</h3>
          <p className="text-2xl font-bold">{completedCases}</p>
        </Card>
      </div>

      {/* Case Progress List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Cases</TabsTrigger>
          <TabsTrigger value="top">Top Performing</TabsTrigger>
          <TabsTrigger value="attention">Needs Attention</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {cases.map(async (caseData) => {
            const progress = await calculateCaseProgress(caseData.id);
            if (!progress) return null;
            return (
              <Card key={caseData.id} className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{caseData.title}</h3>
                  <p className="text-sm text-gray-500">
                    {caseData.category} - {caseData.status}
                  </p>
                </div>
                <TimelineTrafficView timeline={progress.timelineData} />
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          {sortByProgress.slice(0, 5).map(async (caseData) => {
            const progress = await calculateCaseProgress(caseData.id);
            if (!progress) return null;
            return (
              <Card key={caseData.id} className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{caseData.title}</h3>
                  <p className="text-sm text-gray-500">
                    {caseData.category} - Progress: {caseData.progress}%
                  </p>
                </div>
                <TimelineTrafficView timeline={progress.timelineData} />
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="attention" className="space-y-4">
          {needsAttention.map(async (caseData) => {
            const progress = await calculateCaseProgress(caseData.id);
            if (!progress) return null;
            return (
              <Card key={caseData.id} className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{caseData.title}</h3>
                  <p className="text-sm text-gray-500">
                    {caseData.category} - Progress: {caseData.progress}%
                  </p>
                </div>
                <TimelineTrafficView timeline={progress.timelineData} />
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
} 