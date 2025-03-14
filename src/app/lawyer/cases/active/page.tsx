import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CaseStatus, Priority, UserRoleEnum } from '@prisma/client';
import CaseFilters from '@/components/lawyer/cases/CaseFilters';
import CaseTable from '@/components/lawyer/cases/CaseTable';
import CaseStats from '@/components/lawyer/cases/CaseStats';

async function getActiveLawyerCases(lawyerId: string) {
  return await prisma.case.findMany({
    where: {
      lawyerId,
      status: CaseStatus.ACTIVE
    },
    include: {
      client: true,
      activities: {
        take: 1,
        orderBy: [{ createdAt: 'desc' }]
      },
      documents: {
        take: 1,
        orderBy: [{ uploadedAt: 'desc' }]
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
}

export default async function ActiveCasesPage() {
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
    const cases = await getActiveLawyerCases(userId);

    const caseStats = {
      total: cases.length,
      active: cases.length,
      pending: 0, // No pending cases in active view
      urgent: cases.filter(c => c.priority === Priority.URGENT).length,
    };

    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Active Cases</h1>
          <button className="btn btn-primary">
            Request New Case
          </button>
        </div>

        <CaseStats stats={caseStats} />
        
        <CaseFilters initialStatus={CaseStatus.ACTIVE} />
        
        <CaseTable cases={cases} />
      </div>
    );
  } catch (error) {
    console.error('Error loading active cases:', error);
    return <div>Error: Something went wrong</div>;
  }
} 