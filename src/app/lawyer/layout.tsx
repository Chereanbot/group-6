import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import LawyerSidebar from '@/components/lawyer/Sidebar';
import LawyerHeader from '@/components/lawyer/Header';
import { TawkChatWidget } from '@/components/lawyer/TawkChatWidget';
import { WelcomeWrapper } from '@/components/lawyer/WelcomeWrapper';

async function getLawyerWithProfile(token: string) {
  try {
    const session = await prisma.session.findFirst({
      where: {
        token,
        active: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userRole: true,
            fullName: true,
            phone: true,
            emailVerified: true,
            createdAt: true,
            lawyerProfile: {
              include: {
                office: true
              }
            }
          }
        }
      }
    });

    if (!session?.user) return null;
    return session.user;
  } catch (error) {
    console.error('Error getting lawyer data:', error);
    return null;
  }
}

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token');

  if (!authToken?.value) {
    redirect('/login?callbackUrl=/lawyer/dashboard');
  }

  const lawyer = await getLawyerWithProfile(authToken.value);

  if (!lawyer || lawyer.userRole !== UserRoleEnum.LAWYER || !lawyer.lawyerProfile) {
    redirect('/unauthorized');
  }

  // Create headers object for server components
  const headers = new Headers();
  headers.set('x-lawyer-id', lawyer.id);
  headers.set('x-lawyer-office-id', lawyer.lawyerProfile.office.id);
  headers.set('x-lawyer-profile-id', lawyer.lawyerProfile.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <WelcomeWrapper lawyerName={lawyer.fullName} />
      <LawyerHeader 
        user={lawyer} 
        office={lawyer.lawyerProfile.office}
      />
      <LawyerSidebar 
        lawyerId={lawyer.id}
        officeId={lawyer.lawyerProfile.office.id}
      />
      <main className="main-content p-6 pt-24 ml-64">
        {children}
      </main>

      <TawkChatWidget 
        lawyer={{
          id: lawyer.id,
          fullName: lawyer.fullName,
          email: lawyer.email
        }}
      />

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg">
          <p>Lawyer ID: {lawyer.id}</p>
          <p>Office ID: {lawyer.lawyerProfile.office.id}</p>
          <p>Profile ID: {lawyer.lawyerProfile.id}</p>
        </div>
      )}
    </div>
  );
}