import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CaseStatus, Priority, UserRoleEnum } from '@prisma/client';
import CaseFilters from '@/components/lawyer/cases/CaseFilters';
import CaseTable from '@/components/lawyer/cases/CaseTable';
import CaseStats from '@/components/lawyer/cases/CaseStats';

async function getLawyerCases(lawyerId: string) {
  return await prisma.case.findMany({
    where: {
      lawyerId,
    },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true
        }
      },
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

export default async function CasesPage() {
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
    const cases = await getLawyerCases(userId);

    const caseStats = {
      total: cases.length,
      active: cases.filter(c => c.status === CaseStatus.ACTIVE).length,
      pending: cases.filter(c => c.status === CaseStatus.PENDING).length,
      urgent: cases.filter(c => c.priority === Priority.URGENT).length,
    };

    return (
      <div className="space-y-6">
        <CaseStats stats={caseStats} />
        <CaseFilters />
        <CaseTable cases={cases} />
      </div>
    );
  } catch (error) {
    console.error('Error loading cases:', error);
    return <div>Error: Something went wrong</div>;
  }
}