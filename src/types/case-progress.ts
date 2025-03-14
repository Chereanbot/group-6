import { ServiceType } from './time-entry';
import { CaseCategory } from '@prisma/client';

export type CaseType = CaseCategory;

export type TimelineStatus = 'completed' | 'in-progress' | 'pending' | 'blocked';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  status: TimelineStatus;
  date: Date;
  serviceType: ServiceType;
  duration?: number;
  dependencies?: string[];
}

export interface TimelineBranch {
  id: string;
  title: string;
  events: TimelineEvent[];
  status: TimelineStatus;
  progress: number;
}

export interface TimelineTraffic {
  mainBranch: TimelineBranch;
  parallelBranches: TimelineBranch[];
  mergePoints: {
    eventId: string;
    branchIds: string[];
  }[];
}

export interface CaseProgress {
  totalProgress: number;
  completedServices: ServiceType[];
  remainingServices: ServiceType[];
  optionalServicesCompleted: ServiceType[];
  timelineData: TimelineTraffic;
}

export const SERVICE_TYPE_WEIGHTS: Record<ServiceType, number> = {
  'CONSULTATION': 15,
  'DOCUMENT_PREPARATION': 20,
  'COURT_APPEARANCE': 25,
  'RESEARCH': 10,
  'COMMUNITY_OUTREACH': 10,
  'MEDIATION': 20,
  'CLIENT_MEETING': 15,
  'CASE_REVIEW': 15
};

export const REQUIRED_SERVICES_BY_CASE_TYPE: Record<CaseCategory, {
  required: ServiceType[];
  optional: ServiceType[];
}> = {
  'FAMILY': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION', 'MEDIATION'],
    optional: ['COURT_APPEARANCE', 'RESEARCH', 'COMMUNITY_OUTREACH']
  },
  'CRIMINAL': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION', 'COURT_APPEARANCE', 'RESEARCH'],
    optional: ['CLIENT_MEETING', 'CASE_REVIEW']
  },
  'CIVIL': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION', 'MEDIATION'],
    optional: ['COURT_APPEARANCE', 'RESEARCH', 'CLIENT_MEETING']
  },
  'PROPERTY': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION', 'RESEARCH'],
    optional: ['MEDIATION', 'COURT_APPEARANCE', 'CLIENT_MEETING']
  },
  'LABOR': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION', 'MEDIATION'],
    optional: ['RESEARCH', 'COURT_APPEARANCE', 'COMMUNITY_OUTREACH']
  },
  'COMMERCIAL': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION', 'RESEARCH', 'MEDIATION'],
    optional: ['COURT_APPEARANCE', 'CLIENT_MEETING', 'CASE_REVIEW']
  },
  'ADMINISTRATIVE': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION', 'RESEARCH'],
    optional: ['MEDIATION', 'COMMUNITY_OUTREACH', 'CLIENT_MEETING']
  },
  'CONSTITUTIONAL': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION', 'RESEARCH'],
    optional: ['COURT_APPEARANCE', 'MEDIATION', 'CASE_REVIEW']
  },
  'OTHER': {
    required: ['CONSULTATION', 'DOCUMENT_PREPARATION'],
    optional: ['RESEARCH', 'MEDIATION', 'CLIENT_MEETING', 'CASE_REVIEW']
  }
}; 