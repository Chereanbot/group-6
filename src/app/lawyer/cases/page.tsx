import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CaseStatus, Priority } from '@prisma/client';
import CaseFilters from '@/components/lawyer/cases/CaseFilters';
import CaseTable from '@/components/lawyer/cases/CaseTable';
import CaseStats from '@/components/lawyer/cases/CaseStats';

async function getLawyerCases(lawyerId: string) {
  return await prisma.case.findMany({
    where: {
      lawyerId,
    },
    include: {
      client: true,
      activities: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      },
      documents: {
        take: 1,
        orderBy: { uploadedAt: 'desc' }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
}

export default async function CasesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const cases = await getLawyerCases(session.user.id);

  const caseStats = {
    total: cases.length,
    active: cases.filter(c => c.status === CaseStatus.ACTIVE).length,
    pending: cases.filter(c => c.status === CaseStatus.PENDING).length,
    urgent: cases.filter(c => c.priority === Priority.URGENT).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Case Management</h1>
        <button className="btn btn-primary">
          Request New Case
        </button>
      </div>

      <CaseStats stats={caseStats} />
      
      <CaseFilters />
      
      <CaseTable cases={cases} />
    </div>
  );
}