import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AppointmentsClient } from './AppointmentsClient';

async function getAppointments(lawyerId: string) {
  const appointments = await prisma.appointment.findMany({
    where: {
      coordinatorId: lawyerId,
    },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      coordinator: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      scheduledTime: 'desc',
    },
  });

  return appointments;
}

async function getClients(lawyerId: string) {
  const clients = await prisma.user.findMany({
    where: {
      userRole: 'CLIENT',
      // Temporarily removed serviceRequests filter for debugging
      // serviceRequests: {
      //   some: {
      //     assignedLawyerId: lawyerId
      //   }
      // }
    },
    select: {
      id: true,
      fullName: true,
    },
  });

  return clients;
}

export default async function LawyerAppointmentsPage() {
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

  const [appointments, clients] = await Promise.all([
    getAppointments(userId),
    getClients(userId),
  ]);

  return <AppointmentsClient appointments={appointments} clients={clients} />;
}

