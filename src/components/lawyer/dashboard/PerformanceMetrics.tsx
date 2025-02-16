"use client";

import { Performance } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { TrendingUp, Award, Star } from 'lucide-react';

interface PerformanceMetricsProps {
  performance: Performance[];
}

export default function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const averageRating = performance.length > 0
    ? (performance.reduce((acc, p) => acc + p.value, 0) / performance.length).toFixed(1)
    : '0.0';

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Overall Rating</span>
          </div>
          <p className="text-2xl font-bold">{averageRating}</p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="h-5 w-5 text-green-500" />
            <span className="font-medium">Total Cases</span>
          </div>
          <p className="text-2xl font-bold">{performance.length}</p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Recent Rating</span>
          </div>
          <p className="text-2xl font-bold">
            {performance[0]?.value.toFixed(1) || '0.0'}
          </p>
        </div>
      </div>

      {/* Performance History */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-500">Recent Performance</h4>
        {performance.slice(0, 5).map((perf, index) => (
          <div key={perf.id || index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm">{perf.period}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${(perf.value / 5) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{perf.value.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 