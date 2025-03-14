'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface ClientFiltersProps {
  onFiltersChange?: (filters: ClientFilters) => void;
}

interface ClientFilters {
  search: string;
  status: string;
  paymentStatus: string;
  appointmentStatus: string;
}

export default function ClientFilters({ onFiltersChange }: ClientFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<ClientFilters>({
    search: '',
    status: '',
    paymentStatus: '',
    appointmentStatus: ''
  });

  const handleFilterChange = (newFilters: ClientFilters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      status: '',
      paymentStatus: '',
      appointmentStatus: ''
    };
    setFilters(resetFilters);
    onFiltersChange?.(resetFilters);
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
              placeholder="Search clients by name, email, or phone..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
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
          {(filters.status || filters.paymentStatus || filters.appointmentStatus) && (
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange({ ...filters, status: value })}
            >
              <option value="">All Client Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </Select>

            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => handleFilterChange({ ...filters, paymentStatus: value })}
            >
              <option value="">All Payment Status</option>
              <option value="PENDING">Pending Payments</option>
              <option value="PAID">Fully Paid</option>
              <option value="OVERDUE">Overdue</option>
            </Select>

            <Select
              value={filters.appointmentStatus}
              onValueChange={(value) => handleFilterChange({ ...filters, appointmentStatus: value })}
            >
              <option value="">All Appointment Status</option>
              <option value="UPCOMING">Has Upcoming</option>
              <option value="NONE">No Appointments</option>
              <option value="PAST">Past Appointments</option>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
} 