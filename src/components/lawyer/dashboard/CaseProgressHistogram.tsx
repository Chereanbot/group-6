'use client';

import { Card } from '@/components/ui/card';
import { ServiceType } from '@/types/time-entry';
import { CaseType } from '@/types/case-progress';

interface CaseProgressData {
  id: string;
  title: string;
  caseType: CaseType;
  status: string;
  complexityScore: number;
  priority: string;
  progress: number;
  completedServices: ServiceType[];
  remainingServices: ServiceType[];
  optionalServicesCompleted: ServiceType[];
}

interface CaseProgressHistogramProps {
  cases: CaseProgressData[];
}

export function CaseProgressHistogram({ cases }: CaseProgressHistogramProps) {
  // Group cases by progress ranges (0-20%, 21-40%, etc.)
  const progressRanges = [
    { min: 0, max: 20, label: '0-20%' },
    { min: 21, max: 40, label: '21-40%' },
    { min: 41, max: 60, label: '41-60%' },
    { min: 61, max: 80, label: '61-80%' },
    { min: 81, max: 100, label: '81-100%' }
  ];

  const distribution = progressRanges.map(range => ({
    ...range,
    count: cases.filter(c => c.progress >= range.min && c.progress <= range.max).length
  }));

  const maxCount = Math.max(...distribution.map(d => d.count));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Case Progress Distribution</h3>
      <div className="space-y-2">
        {distribution.map(({ label, count }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span>{count} cases</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${(count / maxCount) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 