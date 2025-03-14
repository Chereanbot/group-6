import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TimelineBranch, TimelineTraffic } from '@/types/case-progress';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TimelineTrafficViewProps {
  timeline: TimelineTraffic;
}

function renderBranch(branch: TimelineBranch, isMerged: boolean = false) {
  return (
    <Card key={branch.id} className={`p-4 ${isMerged ? 'border-blue-200' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">{branch.title}</h4>
        <Badge variant={branch.status === 'completed' ? 'default' : 'secondary'}>
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
            <div className={`absolute left-[-5px] w-2 h-2 rounded-full ${
              event.status === 'completed' ? 'bg-green-500' :
              event.status === 'in-progress' ? 'bg-blue-500' :
              event.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            
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
  );
}

export function TimelineTrafficView({ timeline }: TimelineTrafficViewProps) {
  return (
    <div className="space-y-6">
      {/* Main Branch */}
      {renderBranch(timeline.mainBranch)}

      {/* Parallel Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timeline.parallelBranches.map(branch => renderBranch(branch))}
      </div>

      {/* Merge Points */}
      {timeline.mergePoints.map(mergePoint => {
        const mergedBranches = timeline.parallelBranches.filter(
          branch => mergePoint.branchIds.includes(branch.id)
        );
        return (
          <div key={mergePoint.eventId} className="relative">
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 -z-10" />
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Merge Point: {mergePoint.eventId}</h3>
              <div className="space-y-4">
                {mergedBranches.map(branch => renderBranch(branch, true))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 