import { Card } from '@/components/ui/card';
import { Briefcase, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface CaseStatsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    urgent: number;
  };
}

export default function CaseStats({ stats }: CaseStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Cases</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Cases</p>
            <h3 className="text-2xl font-bold">{stats.active}</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Cases</p>
            <h3 className="text-2xl font-bold">{stats.pending}</h3>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Urgent Cases</p>
            <h3 className="text-2xl font-bold">{stats.urgent}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
} 