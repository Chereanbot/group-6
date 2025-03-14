import { prisma } from '@/lib/prisma';
import { 
  SERVICE_TYPE_WEIGHTS, 
  REQUIRED_SERVICES_BY_CASE_TYPE,
  CaseProgress,
  CaseType,
  TimelineTraffic,
  TimelineStatus,
  TimelineEvent,
  TimelineBranch
} from '@/types/case-progress';
import { ServiceType, TimeEntryStatus } from '@/types/time-entry';

const inferServiceType = (description: string): ServiceType => {
  const keywords: Record<ServiceType, string[]> = {
    'CONSULTATION': ['consult', 'advice', 'discuss', 'meeting'],
    'DOCUMENT_PREPARATION': ['draft', 'prepare', 'document', 'file'],
    'COURT_APPEARANCE': ['court', 'hearing', 'trial', 'appear'],
    'RESEARCH': ['research', 'analyze', 'review', 'study'],
    'COMMUNITY_OUTREACH': ['community', 'outreach', 'workshop', 'education'],
    'MEDIATION': ['mediate', 'negotiate', 'settle', 'resolve'],
    'CLIENT_MEETING': ['client', 'meet', 'interview', 'conference'],
    'CASE_REVIEW': ['review', 'assess', 'evaluate', 'examine']
  };

  for (const [serviceType, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(keyword => description.toLowerCase().includes(keyword))) {
      return serviceType as ServiceType;
    }
  }
  return 'CASE_REVIEW';
};

const generateTimelineData = async (
  caseId: string,
  caseType: CaseType,
  completedServices: ServiceType[],
  remainingServices: ServiceType[]
): Promise<TimelineTraffic> => {
  // Fetch time entries for the case
  const timeEntries = await prisma.timeEntry.findMany({
    where: { caseId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      description: true,
      status: true,
      createdAt: true,
      startTime: true,
      endTime: true,
      duration: true,
      serviceType: true,
      needsFollowUp: true,
      followUpNotes: true,
      outreachLocation: true
    }
  });

  // Create events from completed time entries
  const completedEvents: TimelineEvent[] = timeEntries
    .filter(entry => entry.status === TimeEntryStatus.COMPLETED)
    .map(entry => ({
      id: entry.id,
      title: `Service: ${entry.serviceType || inferServiceType(entry.description)}`,
      description: entry.description,
      status: 'completed' as TimelineStatus,
      date: entry.createdAt,
      serviceType: entry.serviceType || inferServiceType(entry.description),
      duration: entry.duration
    }));

  // Create events for remaining required services
  const pendingEvents: TimelineEvent[] = remainingServices.map((service, index) => ({
    id: `pending-${index}`,
    title: `Pending ${service.toLowerCase().replace('_', ' ')}`,
    description: `Required service that needs to be completed`,
    status: 'pending' as TimelineStatus,
    date: new Date(),
    serviceType: service
  }));

  // Create main branch for required services
  const mainBranch: TimelineBranch = {
    id: 'main',
    title: 'Required Services',
    events: [...completedEvents.filter(e => 
      REQUIRED_SERVICES_BY_CASE_TYPE[caseType].required.includes(e.serviceType)
    ), ...pendingEvents],
    status: pendingEvents.length === 0 ? 'completed' : 'in-progress',
    progress: (completedEvents.length / (completedEvents.length + pendingEvents.length)) * 100
  };

  // Create parallel branch for optional services
  const optionalBranch: TimelineBranch = {
    id: 'optional',
    title: 'Optional Services',
    events: completedEvents.filter(e => 
      REQUIRED_SERVICES_BY_CASE_TYPE[caseType].optional.includes(e.serviceType)
    ),
    status: 'in-progress',
    progress: (completedEvents.filter(e => 
      REQUIRED_SERVICES_BY_CASE_TYPE[caseType].optional.includes(e.serviceType)
    ).length / REQUIRED_SERVICES_BY_CASE_TYPE[caseType].optional.length) * 100
  };

  return {
    mainBranch,
    parallelBranches: [optionalBranch],
    mergePoints: []
  };
};

export async function calculateCaseProgress(caseId: string): Promise<CaseProgress | null> {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      timeEntries: {
        where: { status: TimeEntryStatus.COMPLETED },
        select: {
          id: true,
          description: true,
          serviceType: true,
          status: true,
          startTime: true,
          endTime: true,
          duration: true,
          needsFollowUp: true,
          followUpNotes: true,
          outreachLocation: true
        }
      }
    }
  });

  if (!caseData) return null;

  const caseType = caseData.category as CaseType;
  const { required: requiredServices, optional: optionalServices } = REQUIRED_SERVICES_BY_CASE_TYPE[caseType];

  // Get completed services from time entries
  const completedServices: ServiceType[] = Array.from(new Set(
    caseData.timeEntries.map(entry => entry.serviceType || inferServiceType(entry.description))
  ));

  // Calculate remaining required services
  const remainingServices = requiredServices.filter(
    service => !completedServices.includes(service)
  );

  // Calculate completed optional services
  const optionalServicesCompleted = completedServices.filter(
    service => optionalServices.includes(service)
  );

  // Calculate total progress
  const requiredProgress = requiredServices.reduce((total, service) => {
    return total + (completedServices.includes(service) ? SERVICE_TYPE_WEIGHTS[service] : 0);
  }, 0);

  const optionalProgress = optionalServicesCompleted.reduce((total, service) => {
    return total + (SERVICE_TYPE_WEIGHTS[service] * 0.5); // Optional services count for half their weight
  }, 0);

  const totalProgress = Math.min(100, requiredProgress + optionalProgress);

  // Generate timeline data
  const timelineData = await generateTimelineData(caseId, caseType, completedServices, remainingServices);

  return {
    totalProgress,
    completedServices,
    remainingServices,
    optionalServicesCompleted,
    timelineData
  };
} 