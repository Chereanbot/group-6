import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DocumentStats from '@/components/lawyer/documents/DocumentStats';
import DocumentFilters from '@/components/lawyer/documents/DocumentFilters';
import DocumentList from '@/components/lawyer/documents/DocumentList';
import UploadDocument from '@/components/lawyer/documents/UploadDocument';

async function getLawyerDocuments(lawyerId: string) {
  return await prisma.caseDocument.findMany({
    where: {
      uploadedBy: lawyerId,
    },
    include: {
      case: {
        select: {
          title: true,
          status: true,
        }
      }
    },
    orderBy: {
      uploadedAt: 'desc'
    }
  });
}

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const documents = await getLawyerDocuments(session.user.id);

  const stats = {
    total: documents.length,
    recent: documents.filter(d => {
      const uploadDate = new Date(d.uploadedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return uploadDate > thirtyDaysAgo;
    }).length,
    caseRelated: documents.filter(d => d.case).length,
    templates: documents.filter(d => d.type === 'TEMPLATE').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <UploadDocument />
      </div>

      <DocumentStats stats={stats} />
      <DocumentFilters />
      <DocumentList documents={documents} />
    </div>
  );
} 