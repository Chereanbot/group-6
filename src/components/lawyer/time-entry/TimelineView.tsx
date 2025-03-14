'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addDays, format, startOfWeek, eachDayOfInterval } from 'date-fns';
import { TimeEntry } from '@/types/time-entry';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Clock, MapPin, AlertCircle, FileText, Calendar } from 'lucide-react';

interface TimelineViewProps {
  entries: TimeEntry[];
}

export function TimelineView({ entries }: TimelineViewProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  const getTimelinePosition = (time: Date) => {
    const hours = time.getHours() + time.getMinutes() / 60;
    return (hours / 24) * 100;
  };

  const getDuration = (entry: TimeEntry) => {
    if (!entry.endTime) return 0;
    return (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
  };

  const getEntryWidth = (entry: TimeEntry) => {
    const duration = getDuration(entry);
    return (duration / 24) * 100;
  };

  const getEntryColor = (entry: TimeEntry) => {
    if (!entry.case) return 'bg-gray-200';
    switch (entry.case.priority) {
      case 'HIGH':
        return 'bg-red-200';
      case 'MEDIUM':
        return 'bg-yellow-200';
      case 'LOW':
        return 'bg-green-200';
      default:
        return 'bg-blue-200';
    }
  };

  const filterEntriesByDate = (date: Date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getFullYear() === date.getFullYear() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getDate() === date.getDate()
      );
    });
  };

  const formatServiceType = (type?: string) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'PAUSED':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        Timeline View
      </h2>
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-8">
          {entries.map((entry) => (
            <div key={entry.id} className="relative pl-16">
              <div className={`absolute left-6 w-4 h-4 rounded-full ${getStatusColor(entry.status)} ring-4 ring-background`} />
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{entry.case?.title || 'No Case Assigned'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.startTime), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {formatServiceType(entry.serviceType)}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {entry.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="text-sm space-y-2">
                  <p className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {entry.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {entry.duration ? `${Math.round(entry.duration / 3600)} hours` : 'In Progress'}
                    </span>
                    {entry.outreachLocation && (
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {entry.outreachLocation}
                      </span>
                    )}
                  </div>
                  {entry.needsFollowUp && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                      <p className="text-yellow-600 dark:text-yellow-400">{entry.followUpNotes || 'Follow-up required'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
} 