import { Suspense } from 'react';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { MessagesPageClient } from '@/components/communications/MessagesPageClient';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';

async function getContacts(userId: string) {
  try {
    // Get all lawyers and coordinators assigned to the client's cases
    const contacts = await prisma.user.findMany({
      where: {
        OR: [
          {
            userRole: 'LAWYER',
            assignedCases: {
              some: {
                clientId: userId,
                status: 'ACTIVE'
              }
            }
          },
          {
            userRole: 'COORDINATOR',
            coordinatorProfile: {
              office: {
                cases: {
                  some: {
                    clientId: userId,
                    status: 'ACTIVE'
                  }
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userRole: true,
        status: true,
        lastSeen: true,
        isOnline: true
      }
    });

    // Format the lastSeen date to string
    return contacts.map(contact => ({
      ...contact,
      lastSeen: contact.lastSeen?.toISOString() || ''
    }));
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export default async function MessagesPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id') || '';

  if (!userId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Please log in to access messages</p>
      </div>
    );
  }

  const contacts = await getContacts(userId);

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
        </div>
      }
    >
      <MessagesPageClient contacts={contacts} userId={userId} />
    </Suspense>
  );
}