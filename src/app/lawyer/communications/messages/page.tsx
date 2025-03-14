import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactList } from '@/components/communications/ContactList';
import { ChatArea } from '@/components/communications/ChatArea';
import { UserRoleEnum } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { MessagesPageClient } from './MessagesPageClient';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  userRole: string;
  status: string;
  lastSeen?: Date;
  office?: {
    id: string;
    name: string;
    location: string;
  };
  clientCases?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: Date;
    status: 'SENT' | 'DELIVERED' | 'READ';
  };
}

interface MessagesPageProps {
  contacts: {
    office: any;
    superAdmins: Contact[];
    coordinators: Contact[];
    clients: Contact[];
  };
  userId: string;
}

async function getContacts(lawyerId: string) {
  // First get the lawyer's office
  const lawyerOffice = await prisma.lawyerProfile.findFirst({
    where: { userId: lawyerId },
    include: {
      office: true
    }
  });

  if (!lawyerOffice) {
    throw new Error('Lawyer office not found');
  }

  // Get super admins
  const superAdmins = await prisma.user.findMany({
    where: {
      userRole: UserRoleEnum.SUPER_ADMIN,
      status: 'ACTIVE'
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

  // Get office coordinators for the lawyer's specific office
  const officeCoordinators = await prisma.user.findMany({
    where: {
      userRole: UserRoleEnum.COORDINATOR,
      status: 'ACTIVE',
      coordinatorProfile: {
        officeId: lawyerOffice.officeId
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
      coordinatorProfile: {
        select: {
          office: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      }
    }
  });

  // Get active clients for the lawyer
  const clients = await prisma.user.findMany({
    where: {
      userRole: UserRoleEnum.CLIENT,
      status: 'ACTIVE',
      clientCases: {
        some: {
          lawyerId,
          status: 'ACTIVE'
        }
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
      clientCases: {
        where: {
          lawyerId,
          status: 'ACTIVE'
        },
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
  });

  // Format the results to match the Contact interface
  const formatContact = (user: any, type: 'admin' | 'coordinator' | 'client') => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatar: null,
    userRole: user.userRole,
    status: user.isOnline ? 'ONLINE' : 'OFFLINE',
    lastSeen: user.lastSeen,
    office: type === 'coordinator' ? {
      id: user.coordinatorProfile?.office?.id,
      name: user.coordinatorProfile?.office?.name,
      location: user.coordinatorProfile?.office?.location
    } : null,
    clientCases: type === 'client' ? user.clientCases.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      priority: c.priority,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    })) : null,
    unreadCount: 0,
    lastMessage: null
  });

  return {
    office: lawyerOffice.office,
    superAdmins: superAdmins.map(user => formatContact(user, 'admin')),
    coordinators: officeCoordinators.map(user => formatContact(user, 'coordinator')),
    clients: clients.map(user => formatContact(user, 'client'))
  };
}

export default async function MessagesPage() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    redirect('/auth/login?error=unauthorized&message=Please_login_first');
  }

  if (userRole !== 'LAWYER') {
    redirect('/unauthorized?message=Only_lawyers_can_access_this_page');
  }

  const contacts = await getContacts(userId);

  return <MessagesPageClient contacts={contacts} userId={userId} />;
} 