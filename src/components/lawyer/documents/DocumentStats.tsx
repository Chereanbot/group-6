import { Card } from '@/components/ui/card';
import { FileText, Clock, Briefcase, FileCode } from 'lucide-react';

interface DocumentStatsProps {
  stats: {
    total: number;
    recent: number;
    caseRelated: number;
    templates: number;
  };
}

export default function DocumentStats({ stats }: DocumentStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Documents</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Recent (30 days)</p>
            <h3 className="text-2xl font-bold">{stats.recent}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <Briefcase className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Case Related</p>
            <h3 className="text-2xl font-bold">{stats.caseRelated}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <FileCode className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Templates</p>
            <h3 className="text-2xl font-bold">{stats.templates}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
} 