import { Search, Filter, Calendar, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { HistoryFilters as HistoryFiltersType } from '../types';
import { CoordinatorHistoryAction } from '@prisma/client';

interface DateRange {
  from: Date;
  to?: Date;
}

interface HistoryFiltersProps {
  filters: HistoryFiltersType;
  onFiltersChange: (filters: HistoryFiltersType) => void;
  onReset: () => void;
  onExport?: () => void;
}

export function HistoryFilters({
  filters,
  onFiltersChange,
  onReset,
  onExport
}: HistoryFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search history..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="max-w-sm"
        />

        <Select
          value={filters.action}
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            action: value === 'all' ? undefined : value as CoordinatorHistoryAction 
          })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CLIENT_ASSIGNED">Client Assigned</SelectItem>
            <SelectItem value="CASE_ASSIGNED">Case Assigned</SelectItem>
            <SelectItem value="DOCUMENT_UPLOADED">Document Uploaded</SelectItem>
            <SelectItem value="APPOINTMENT_SCHEDULED">Appointment Scheduled</SelectItem>
            <SelectItem value="CLIENT_STATUS_CHANGED">Client Status Changed</SelectItem>
            <SelectItem value="CASE_STATUS_CHANGED">Case Status Changed</SelectItem>
            <SelectItem value="LAWYER_ASSIGNED">Lawyer Assigned</SelectItem>
            <SelectItem value="SERVICE_REQUEST_CREATED">Service Request Created</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.entityType}
          onValueChange={(value) => onFiltersChange({ ...filters, entityType: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="case">Cases</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="appointment">Appointments</SelectItem>
            <SelectItem value="service">Service Requests</SelectItem>
          </SelectContent>
        </Select>

        {filters.entityType !== 'all' && (
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        )}

        <DatePicker
          selected={filters.startDate ? new Date(filters.startDate) : null}
          onChange={(date) => onFiltersChange({ 
            ...filters, 
            startDate: date ? date.toISOString() : undefined 
          })}
          placeholderText="Start date"
        />

        <DatePicker
          selected={filters.endDate ? new Date(filters.endDate) : null}
          onChange={(date) => onFiltersChange({ 
            ...filters, 
            endDate: date ? date.toISOString() : undefined 
          })}
          placeholderText="End date"
        />

        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>

        {onExport && (
          <Button variant="outline" onClick={onExport}>
            Export
          </Button>
        )}
      </div>
    </div>
  );
} 