'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  AlertTriangle,
  Box,
  Users,
  Clock,
  BarChart2
} from 'lucide-react';

interface CaseProgressDetailsProps {
  case: {
    id: string;
    title: string;
    status: string;
    priority: string;
    complexityScore: number;
    riskLevel: number;
    resourceIntensity: number;
    stakeholderImpact: number;
    createdAt: Date;
    expectedResolutionDate?: Date;
  };
}

export function CaseProgressDetails({ case: c }: CaseProgressDetailsProps) {
  // Calculate individual progress components
  const complexityProgress = (c.complexityScore / 10) * 20;
  const riskProgress = (c.riskLevel / 10) * 20;
  const resourceProgress = (c.resourceIntensity / 10) * 20;
  const stakeholderProgress = (c.stakeholderImpact / 10) * 20;
  
  // Calculate time progress
  let timeProgress = 0;
  if (c.expectedResolutionDate) {
    const totalDuration = new Date(c.expectedResolutionDate).getTime() - new Date(c.createdAt).getTime();
    const elapsed = Date.now() - new Date(c.createdAt).getTime();
    timeProgress = Math.min((elapsed / totalDuration) * 20, 20);
  }

  // Calculate total progress
  const totalProgress = Math.min(
    Math.round(complexityProgress + riskProgress + resourceProgress + stakeholderProgress + timeProgress),
    100
  );

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{c.title}</h3>
          <p className="text-sm text-muted-foreground">Case Progress Breakdown</p>
        </div>
        <Badge variant={c.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {c.status}
        </Badge>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-medium">{totalProgress}%</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Complexity</span>
              </div>
              <span className="text-sm">{complexityProgress.toFixed(1)}%</span>
            </div>
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${complexityProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Risk Level</span>
              </div>
              <span className="text-sm">{riskProgress.toFixed(1)}%</span>
            </div>
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${riskProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Resource Intensity</span>
              </div>
              <span className="text-sm">{resourceProgress.toFixed(1)}%</span>
            </div>
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${resourceProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm">Stakeholder Impact</span>
              </div>
              <span className="text-sm">{stakeholderProgress.toFixed(1)}%</span>
            </div>
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${stakeholderProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Time Progress</span>
              </div>
              <span className="text-sm">{timeProgress.toFixed(1)}%</span>
            </div>
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${timeProgress}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <BarChart2 className="h-4 w-4" />
              <span className="font-medium">Progress Factors</span>
            </div>
            <ul className="mt-2 text-xs space-y-1 text-muted-foreground">
              <li>• Each metric contributes up to 20% of total progress</li>
              <li>• Time progress is based on expected resolution date</li>
              <li>• Total progress is capped at 100%</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
} 