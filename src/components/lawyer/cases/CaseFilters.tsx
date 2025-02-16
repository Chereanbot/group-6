import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CaseStatus, Priority, CaseType } from '@prisma/client';

export default function CaseFilters() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    type: ''
  });

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search cases..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <option value="">All Statuses</option>
          {Object.values(CaseStatus).map((status) => (
            <option key={status} value={status}>
              {status}
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
              {priority}
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
              {type}
            </option>
          ))}
        </Select>
      </div>
    </Card>
  );
} 