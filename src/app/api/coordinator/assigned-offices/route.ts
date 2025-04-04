import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRoleEnum, Coordinator, Office, Case, LawyerProfile, Resource, ClientProfile, OfficePerformance, PerformanceCategory } from '@prisma/client';
import prisma from '@/lib/prisma';

// Define types for the response
type OfficeWithRelations = Office & {
  cases: Case[];
  lawyers: (LawyerProfile & {
    user: {
      fullName: string;
      email: string;
      phone: string;
    };
  })[];
  resources: Resource[];
  performances: OfficePerformance[];
  clients: (ClientProfile & {
    user: {
      fullName: string;
      email: string;
      phone: string;
    };
  })[];
};

type CoordinatorWithOffice = Coordinator & {
  office: OfficeWithRelations;
};

export async function GET() {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    if (session.user.role !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    // Fetch only the logged-in coordinator's offices
    const coordinatorOffices = await prisma.coordinator.findMany({
      where: {
        userId: session.user.id,  // Only fetch offices for the logged-in coordinator
        status: 'ACTIVE'
      },
      include: {
        office: {
          include: {
            cases: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                category: true,
                createdAt: true
              }
            },
            lawyers: {
              select: {
                id: true,
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            },
            resources: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true
              }
            },
            performances: {
              where: {
                category: {
                  in: [
                    PerformanceCategory.STAFF_EFFICIENCY,
                    PerformanceCategory.RESPONSE_TIME,
                    PerformanceCategory.CLIENT_SATISFACTION
                  ]
                }
              },
              select: {
                id: true,
                value: true,
                period: true,
                date: true,
                category: true
              },
              orderBy: {
                date: 'desc'
              },
              take: 3
            },
            clients: {
              select: {
                id: true,
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    phone: true
                  }
                },
                caseType: true,
                caseCategory: true
              }
            }
          }
        }
      }
    }) as CoordinatorWithOffice[];

    // Transform the data for better frontend consumption
    const offices = coordinatorOffices.map(co => {
      // Get the latest performance metrics
      const staffEfficiency = co.office.performances.find(p => p.category === PerformanceCategory.STAFF_EFFICIENCY);
      const responseTime = co.office.performances.find(p => p.category === PerformanceCategory.RESPONSE_TIME);
      const clientSatisfaction = co.office.performances.find(p => p.category === PerformanceCategory.CLIENT_SATISFACTION);

      return {
        id: co.office.id,
        name: co.office.name,
        location: co.office.location,
        type: co.office.type,
        status: co.office.status,
        capacity: co.office.capacity,
        contactEmail: co.office.contactEmail,
        contactPhone: co.office.contactPhone,
        address: co.office.address,
        coordinatorDetails: {
          id: co.id,
          type: co.type,
          startDate: co.startDate,
          specialties: co.specialties
        },
        statistics: {
          totalCases: co.office.cases.length,
          activeCases: co.office.cases.filter(c => c.status === 'ACTIVE').length,
          totalLawyers: co.office.lawyers.length,
          totalClients: co.office.clients.length,
          totalResources: co.office.resources.length
        },
        performance: {
          efficiency: staffEfficiency?.value ?? 0,
          responseRate: responseTime?.value ?? 0,
          clientSatisfaction: clientSatisfaction?.value ?? 0
        },
        recentCases: co.office.cases
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5),
        lawyers: co.office.lawyers.map(lawyer => ({
          id: lawyer.id,
          name: lawyer.user.fullName,
          email: lawyer.user.email,
          phone: lawyer.user.phone
        })),
        resources: co.office.resources,
        clients: co.office.clients.map(client => ({
          id: client.id,
          name: client.user.fullName,
          email: client.user.email,
          phone: client.user.phone,
          caseType: client.caseType,
          caseCategory: client.caseCategory
        }))
      };
    });

    return NextResponse.json({
      success: true,
      offices
    });

  } catch (error) {
    console.error('Error fetching coordinator offices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assigned offices' },
      { status: 500 }
    );
  }
} 