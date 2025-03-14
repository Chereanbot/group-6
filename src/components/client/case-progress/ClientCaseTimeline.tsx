'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { TimelineTraffic } from '@/types/case-progress';

interface ClientCaseTimelineProps {
  timeline: TimelineTraffic;
}

export function ClientCaseTimeline({ timeline }: ClientCaseTimelineProps) {
  if (!timeline) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No timeline data available
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Branch */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">{timeline.mainBranch.title}</h4>
          <Badge variant="secondary" className={getStatusColor(timeline.mainBranch.status)}>
            {timeline.mainBranch.status}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{Math.round(timeline.mainBranch.progress)}%</span>
          </div>
          <Progress value={timeline.mainBranch.progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {timeline.mainBranch.events.map(event => (
            <div key={event.id} className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0">
              <div className="absolute left-[-5px] top-1">
                {getStatusIcon(event.status)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">{event.title}</h5>
                  <Badge variant="outline" className="text-xs">
                    {event.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{event.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(event.date, { addSuffix: true })}
                  </span>
                  {event.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(event.duration / 3600)}h
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Parallel Branches */}
      {timeline.parallelBranches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timeline.parallelBranches.map(branch => (
            <Card key={branch.id} className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">{branch.title}</h4>
                <Badge variant="secondary" className={getStatusColor(branch.status)}>
                  {branch.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{Math.round(branch.progress)}%</span>
                </div>
                <Progress value={branch.progress} className="h-2" />
              </div>

              <div className="space-y-4">
                {branch.events.map(event => (
                  <div key={event.id} className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0">
                    <div className="absolute left-[-5px] top-1">
                      {getStatusIcon(event.status)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">{event.title}</h5>
                        <Badge variant="outline" className="text-xs">
                          {event.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(event.date, { addSuffix: true })}
                        </span>
                        {event.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round(event.duration / 3600)}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 