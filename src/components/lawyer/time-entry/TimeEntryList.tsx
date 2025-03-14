'use client';

import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Calendar, MapPin, FileText } from 'lucide-react';
import { TimeEntry, ServiceType, TimeEntryStatus } from '@/types/time-entry';

interface TimeEntryListProps {
  entries: TimeEntry[];
}

export function TimeEntryList({ entries }: TimeEntryListProps) {
  const formatServiceType = (type?: string) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'PAUSED':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const getServiceTypeColor = (type: ServiceType) => {
    const colors = {
      CONSULTATION: 'bg-purple-100 text-purple-800',
      DOCUMENT_PREPARATION: 'bg-indigo-100 text-indigo-800',
      COURT_APPEARANCE: 'bg-red-100 text-red-800',
      RESEARCH: 'bg-blue-100 text-blue-800',
      COMMUNITY_OUTREACH: 'bg-green-100 text-green-800',
      MEDIATION: 'bg-yellow-100 text-yellow-800',
      CLIENT_MEETING: 'bg-orange-100 text-orange-800',
      CASE_REVIEW: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <HoverCard key={entry.id}>
          <HoverCardTrigger asChild>
            <div className={`p-4 rounded-lg cursor-pointer transition-colors ${getStatusColor(entry.status)}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{entry.case?.title || 'No Case Assigned'}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="capitalize">
                      {formatServiceType(entry.serviceType)}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.startTime), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {entry.status.toLowerCase().replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Activity Details</h4>
                <p className="text-sm flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  {entry.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start Time</p>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(entry.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatDuration(entry.duration)}
                  </p>
                </div>
              </div>

              {entry.outreachLocation && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {entry.outreachLocation}
                  </p>
                </div>
              )}

              {entry.needsFollowUp && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Follow-up Required
                  </p>
                  {entry.followUpNotes && (
                    <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      {entry.followUpNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
} 