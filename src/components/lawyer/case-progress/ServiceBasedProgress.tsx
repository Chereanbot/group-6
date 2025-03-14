'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ServiceType } from '@/types/time-entry';
import { CaseType } from '@/types/case-progress';

interface ServiceBasedProgressProps {
  caseType: CaseType;
  completedServices: ServiceType[];
  remainingServices: ServiceType[];
  optionalServicesCompleted: ServiceType[];
  totalProgress: number;
  title?: string;
}

export function ServiceBasedProgress({
  caseType,
  completedServices,
  remainingServices,
  optionalServicesCompleted,
  totalProgress,
  title
}: ServiceBasedProgressProps) {
  const formatServiceType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{title || 'Case Progress'}</h3>
          <p className="text-sm text-muted-foreground">Based on completed services</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {caseType.toLowerCase()}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-medium">{totalProgress}%</span>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Completed Services
          </h4>
          <div className="flex flex-wrap gap-2">
            {completedServices.map(service => (
              <Badge key={service} variant="default" className="capitalize">
                {formatServiceType(service)}
              </Badge>
            ))}
            {completedServices.length === 0 && (
              <p className="text-sm text-muted-foreground">No services completed yet</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            Remaining Required Services
          </h4>
          <div className="flex flex-wrap gap-2">
            {remainingServices.map(service => (
              <Badge key={service} variant="outline" className="capitalize">
                {formatServiceType(service)}
              </Badge>
            ))}
            {remainingServices.length === 0 && (
              <p className="text-sm text-green-600">All required services completed!</p>
            )}
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            Optional Services Completed
          </h4>
          <div className="flex flex-wrap gap-2">
            {optionalServicesCompleted.map(service => (
              <Badge key={service} variant="default" className="capitalize">
                {formatServiceType(service)}
              </Badge>
            ))}
            {optionalServicesCompleted.length === 0 && (
              <p className="text-sm text-muted-foreground">No optional services completed</p>
            )}
          </div>
        </div>
      </div>

      {totalProgress === 100 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            All required services have been completed for this case!
          </p>
        </div>
      )}
    </Card>
  );
} 