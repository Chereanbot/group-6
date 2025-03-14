'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ClientCaseTimeline } from './ClientCaseTimeline';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChevronDown, ChevronUp, User, Phone, Mail, Star,
  Clock, CheckCircle, AlertTriangle, FileText
} from 'lucide-react';
import { useState } from 'react';

interface ClientCaseProgressProps {
  caseData: any; // TODO: Add proper typing
}

export function ClientCaseProgress({ caseData }: ClientCaseProgressProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'RESOLVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Case Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{caseData.title}</h3>
            <p className="text-sm text-muted-foreground">
              Opened {formatDistanceToNow(new Date(caseData.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className={getStatusColor(caseData.status)}>
              {caseData.status}
            </Badge>
            <Badge variant="secondary" className={getPriorityColor(caseData.priority)}>
              {caseData.priority} Priority
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Case Progress</span>
            <span className="text-sm font-medium">
              {caseData.progress?.totalProgress || 0}%
            </span>
          </div>
          <Progress value={caseData.progress?.totalProgress || 0} className="h-2" />
        </div>

        {/* Assigned Lawyer */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Assigned Legal Aid Lawyer</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{caseData.lawyer.name}</span>
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{caseData.lawyer.email}</span>
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{caseData.lawyer.phone}</span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{caseData.lawyer.rating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Collapsible Details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>View Details</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Service Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Completed Services</p>
                    <p className="text-2xl font-bold">
                      {caseData.progress?.completedServices.length || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Remaining Services</p>
                    <p className="text-2xl font-bold">
                      {caseData.progress?.remainingServices.length || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Optional Services</p>
                    <p className="text-2xl font-bold">
                      {caseData.progress?.optionalServicesCompleted.length || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Timeline */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-4">Case Timeline</h4>
              <ClientCaseTimeline timeline={caseData.progress?.timelineData} />
            </div>

            {/* Recent Documents */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-4">Recent Documents</h4>
              <div className="space-y-2">
                {caseData.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{doc.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
} 