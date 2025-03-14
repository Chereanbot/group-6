import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SMSPageClient } from './SMSPageClient';

async function getLawyerSMSData(userId: string) {
  try {
    const contacts = await prisma.user.findMany({
      where: {
        OR: [
          { userRole: 'CLIENT' },
          { userRole: 'COORDINATOR' }
        ],
        NOT: {
          id: userId
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userRole: true,
        status: true,
        lastSeen: true,
        isOnline: true,
        clientProfile: {
          select: {
            cases: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    });

    const smsHistory = await prisma.sMS.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            userRole: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            userRole: true
          }
        }
      }
    });

    return {
      contacts: contacts.map(contact => ({
        ...contact,
        lastSeen: contact.lastSeen?.toISOString(),
        clientProfile: contact.clientProfile ? {
          ...contact.clientProfile,
          cases: contact.clientProfile.cases.map(c => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString()
          }))
        } : null
      })),
      smsHistory: smsHistory.map(sms => ({
        ...sms,
        createdAt: sms.createdAt.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error fetching SMS data:', error);
    throw error;
  }
}

export default async function SMSPage() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/lawyer/communications/sms');
  }

  const data = await getLawyerSMSData(session.user.id);

  return (
    <div className="container mx-auto py-6">
      <SMSPageClient 
        contacts={data.contacts}
        smsHistory={data.smsHistory}
        userId={session.user.id}
      />
    </div>
  );
} 