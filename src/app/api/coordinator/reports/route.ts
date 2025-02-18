import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { CaseStatus, UserRoleEnum } from '@prisma/client';

export async function GET() {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id },
      include: { office: true }
    });

    if (!coordinator || !coordinator.office) {
      return NextResponse.json(
        { success: false, message: 'Coordinator or office not found' },
        { status: 404 }
      );
    }

    // First check if any cases exist for this office
    const caseCount = await prisma.case.count({
      where: {
        OR: [
          { officeId: coordinator.officeId },
          { assignedOffice: { id: coordinator.officeId } }
        ]
      }
    });

    // Get all cases with their related information
    const cases = await prisma.case.findMany({
      where: {
        OR: [
          { officeId: coordinator.officeId },
          { assignedOffice: { id: coordinator.officeId } }
        ]
      },
      include: {
        client: true,
        assignedOffice: true,
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                userRole: true,
                email: true
              }
            }
          }
        },
        assignments: {
          include: {
            assignedTo: {
              select: {
                id: true,
                fullName: true,
                userRole: true,
                email: true
              }
            },
            assignedBy: {
              select: {
                id: true,
                fullName: true,
                userRole: true
              }
            }
          }
        },
        caseEvents: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          include: {
            participants: true,
            documents: true
          }
        },
        documents: {
          include: {
            uploader: {
              select: {
                fullName: true,
                userRole: true
              }
            }
          }
        },
        notes: {
          include: {
            creator: {
              select: {
                fullName: true,
                userRole: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data for the response
    const reports = cases.map((case_) => ({
      id: case_.id,
      clientInfo: {
        name: case_.clientName || 'Unknown',
        phone: case_.clientPhone || 'N/A',
        email: case_.client?.email || 'N/A',
        address: case_.clientAddress || 'N/A'
      },
      caseDetails: {
        title: case_.title,
        category: case_.category,
        priority: case_.priority,
        status: case_.status,
        description: case_.description || 'N/A',
        createdAt: case_.createdAt.toISOString(),
        resolvedAt: case_.resolvedAt?.toISOString(),
        expectedResolutionDate: case_.expectedResolutionDate?.toISOString(),
        documentCount: case_.documentCount || 0,
        complexity: case_.complexityScore || 0,
        riskLevel: case_.riskLevel || 0,
        billableHours: case_.totalBillableHours || 0
      },
      office: {
        name: case_.assignedOffice?.name || 'Unassigned',
        location: case_.assignedOffice?.location || 'N/A',
        type: case_.assignedOffice?.type || 'N/A',
        status: case_.assignedOffice?.status || 'N/A'
      },
      assignments: case_.assignments?.map(assignment => ({
        id: assignment.id,
        assignedTo: {
          name: assignment.assignedTo?.fullName || 'Unknown',
          role: assignment.assignedTo?.userRole || 'UNKNOWN',
          email: assignment.assignedTo?.email || 'N/A'
        },
        assignedBy: {
          name: assignment.assignedBy?.fullName || 'Unknown',
          role: assignment.assignedBy?.userRole || 'UNKNOWN'
        },
        status: assignment.status,
        createdAt: assignment.createdAt.toISOString()
      })) || [],
      events: case_.caseEvents?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        type: event.type,
        location: event.location,
        start: event.start?.toISOString(),
        end: event.end?.toISOString(),
        status: event.status,
        participants: event.participants?.map(p => ({
          id: p.id,
          role: p.role,
          status: p.status
        })) || [],
        documents: event.documents?.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type,
          url: d.url
        })) || []
      })) || [],
      activities: case_.activities?.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description || '',
        type: activity.type,
        createdAt: activity.createdAt.toISOString(),
        user: {
          name: activity.user?.fullName || 'Unknown',
          role: activity.user?.userRole || 'UNKNOWN',
          email: activity.user?.email || 'N/A'
        }
      })) || [],
      documents: case_.documents?.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        path: doc.path,
        size: doc.size,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt.toISOString(),
        uploader: {
          name: doc.uploader?.fullName || 'Unknown',
          role: doc.uploader?.userRole || 'UNKNOWN'
        }
      })) || [],
      notes: case_.notes?.map(note => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        creator: {
          name: note.creator?.fullName || 'Unknown',
          role: note.creator?.userRole || 'UNKNOWN'
        },
        isPrivate: note.isPrivate
      })) || [],
      tags: case_.tags || []
    }));

    // Enhanced statistics
    const statistics = {
      total: cases.length,
      byStatus: {
        active: cases.filter(c => c.status === CaseStatus.ACTIVE).length,
        pending: cases.filter(c => c.status === CaseStatus.PENDING).length,
        resolved: cases.filter(c => c.status === CaseStatus.RESOLVED).length,
        cancelled: cases.filter(c => c.status === CaseStatus.CANCELLED).length,
      },
      byCategory: Object.entries(
        cases.reduce((acc, c) => {
          acc[c.category] = (acc[c.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ),
      byPriority: {
        high: cases.filter(c => c.priority === 'HIGH').length,
        medium: cases.filter(c => c.priority === 'MEDIUM').length,
        low: cases.filter(c => c.priority === 'LOW').length,
      },
      metrics: {
        averageComplexity: cases.length > 0 ? cases.reduce((acc, c) => acc + (c.complexityScore || 0), 0) / cases.length : 0,
        averageRiskLevel: cases.length > 0 ? cases.reduce((acc, c) => acc + (c.riskLevel || 0), 0) / cases.length : 0,
        totalBillableHours: cases.reduce((acc, c) => acc + (c.totalBillableHours || 0), 0),
        totalDocuments: cases.reduce((acc, c) => acc + (c.documentCount || 0), 0),
      },
      timeline: {
        averageResolutionTime: cases.filter(c => c.resolvedAt).length > 0 
          ? cases.filter(c => c.resolvedAt).reduce((acc, c) => 
              acc + (c.resolvedAt!.getTime() - c.createdAt.getTime()), 0) / 
              cases.filter(c => c.resolvedAt).length / (1000 * 60 * 60 * 24) // in days
          : 0,
        oldestCase: cases.length > 0 ? Math.min(...cases.map(c => c.createdAt.getTime())) : 0,
        newestCase: cases.length > 0 ? Math.max(...cases.map(c => c.createdAt.getTime())) : 0,
      }
    };

    return NextResponse.json({
      success: true,
      reports,
      statistics,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 