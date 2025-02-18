"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Download, Filter, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomReport {
  id: string;
  name: string;
  description: string;
  filters: ReportFilters;
  columns: string[];
  createdAt: string;
}

interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  priority: string[];
  category: string[];
}

export default function CustomReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'clientName',
    'caseTitle',
    'status',
    'priority',
    'createdAt'
  ]);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: '',
      end: ''
    },
    status: [],
    priority: [],
    category: []
  });

  const availableColumns = [
    { id: 'clientName', label: 'Client Name' },
    { id: 'caseTitle', label: 'Case Title' },
    { id: 'status', label: 'Status' },
    { id: 'priority', label: 'Priority' },
    { id: 'category', label: 'Category' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'resolvedAt', label: 'Resolved Date' },
    { id: 'assignedCoordinator', label: 'Assigned Coordinator' },
    { id: 'billableHours', label: 'Billable Hours' },
    { id: 'documentCount', label: 'Document Count' }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coordinator/reports/custom', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to fetch reports',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: 'An error occurred while fetching reports',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/coordinator/reports/custom/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          columns: selectedColumns,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: 'Report exported successfully',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: 'Failed to export report',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label>Date Range</Label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                  />
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label>Status</Label>
                <Select
                  onValueChange={(value) => setFilters({
                    ...filters,
                    status: [...filters.status, value]
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Priority</Label>
                <Select
                  onValueChange={(value) => setFilters({
                    ...filters,
                    priority: [...filters.priority, value]
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Label>Columns</Label>
              <ScrollArea className="h-20 w-full border rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                  {availableColumns.map((column) => (
                    <div key={column.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.id}
                        checked={selectedColumns.includes(column.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedColumns([...selectedColumns, column.id]);
                          } else {
                            setSelectedColumns(selectedColumns.filter(id => id !== column.id));
                          }
                        }}
                      />
                      <label htmlFor={column.id}>{column.label}</label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    dateRange: { start: '', end: '' },
                    status: [],
                    priority: [],
                    category: []
                  });
                  setSelectedColumns(['clientName', 'caseTitle', 'status', 'priority', 'createdAt']);
                }}
              >
                Reset
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedColumns.map((column) => (
                    <TableHead key={column}>
                      {availableColumns.find(c => c.id === column)?.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={selectedColumns.length} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={selectedColumns.length} className="text-center">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      {selectedColumns.map((column) => (
                        <TableCell key={column}>
                          {/* Add proper data mapping here */}
                          {report[column as keyof CustomReport]?.toString() || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 