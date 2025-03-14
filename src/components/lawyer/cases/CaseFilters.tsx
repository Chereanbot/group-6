'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CaseStatus, Priority, CaseType } from '@prisma/client';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface CaseFiltersProps {
  initialStatus?: CaseStatus;
  onFiltersChange?: (filters: CaseFilters) => void;
}

interface CaseFilters {
  search: string;
  status: string;
  priority: string;
  type: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

export default function CaseFilters({ initialStatus, onFiltersChange }: CaseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<CaseFilters>({
    search: '',
    status: initialStatus || '',
    priority: '',
    type: '',
    dateRange: {
      from: null,
      to: null
    }
  });

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleReset = () => {
    setFilters({
      search: '',
      status: initialStatus || '',
      priority: '',
      type: '',
      dateRange: {
        from: null,
        to: null
      }
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Basic Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="pl-10"
              placeholder="Search cases by title, client name, or case number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </Button>
          {(filters.status || filters.priority || filters.type || filters.dateRange?.from) && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="flex items-center gap-2 text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <option value="">All Statuses</option>
              {Object.values(CaseStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters({ ...filters, priority: value })}
            >
              <option value="">All Priorities</option>
              {Object.values(Priority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0) + priority.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>

            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <option value="">All Types</option>
              {Object.values(CaseType).map((type) => (
                <option key={type} value={type}>
                  {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                </option>
              ))}
            </Select>

            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => setFilters({ ...filters, dateRange: range })}
              placeholder="Select date range"
            />
          </div>
        )}
      </div>
    </Card>
  );
} 