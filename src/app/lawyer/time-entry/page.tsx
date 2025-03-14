import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { TimeEntry } from '@/types/time-entry';
import { TimeEntryForm } from '@/components/lawyer/time-entry/TimeEntryForm';
import { TimeEntryList } from '@/components/lawyer/time-entry/TimeEntryList';
import { TimelineView } from '@/components/lawyer/time-entry/TimelineView';
import { TimeEntryHelp } from '@/components/lawyer/time-entry/TimeEntryHelp';
import { Card } from '@/components/ui/card';
import { Clock, Users, Scale } from 'lucide-react';

async function getLawyerTimeEntries(lawyerId: string): Promise<TimeEntry[]> {
  try {
    const entries = await prisma.timeEntry.findMany({
      where: {
        lawyerId,
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          }
        }
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return entries as unknown as TimeEntry[];
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return [];
  }
}

async function getLawyerCases(lawyerId: string) {
  return await prisma.case.findMany({
    where: {
      lawyerId,
      OR: [
        { status: 'ACTIVE' },
        { status: 'PENDING' }
      ]
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
    }
  });
}

export default async function TimeEntryPage() {
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
    const [timeEntries, activeCases] = await Promise.all([
      getLawyerTimeEntries(userId),
      getLawyerCases(userId)
    ]);

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalHoursThisWeek = timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= weekStart;
      })
      .reduce((sum, entry) => sum + (entry.duration / 3600), 0);

    const totalHoursThisMonth = timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= monthStart;
      })
      .reduce((sum, entry) => sum + (entry.duration / 3600), 0);

    const activeBeneficiaries = new Set(
      timeEntries
        .filter(entry => entry.case?.status === 'ACTIVE')
        .map(entry => entry.case?.id)
    ).size;

    return (
      <div className="space-y-6 p-6 relative">
        <TimeEntryHelp />
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Legal Aid Time Management</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours This Week</p>
                <h3 className="text-2xl font-bold">{totalHoursThisWeek.toFixed(1)}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Beneficiaries</p>
                <h3 className="text-2xl font-bold">{activeBeneficiaries}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Hours</p>
                <h3 className="text-2xl font-bold">{totalHoursThisMonth.toFixed(1)}</h3>
              </div>
            </div>
          </Card>
        </div>

        <TimelineView entries={timeEntries} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">New Time Entry</h2>
            <TimeEntryForm cases={activeCases} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
            <TimeEntryList entries={timeEntries} />
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading time entries:', error);
    return <div>Error: Something went wrong</div>;
  }
} 