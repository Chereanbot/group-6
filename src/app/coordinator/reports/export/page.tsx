"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { format } from 'date-fns';
import { Download, FileType, Settings, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    status: string[];
    priority: string[];
    category: string[];
  };
  columns: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function ExportReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: '',
      end: ''
    },
    filters: {
      status: [],
      priority: [],
      category: []
    },
    columns: [
      'clientName',
      'caseTitle',
      'status',
      'priority',
      'createdAt'
    ]
  });

  const availableColumns = [
    { id: 'clientName', label: 'Client Name', category: 'Client Info' },
    { id: 'clientPhone', label: 'Client Phone', category: 'Client Info' },
    { id: 'clientEmail', label: 'Client Email', category: 'Client Info' },
    { id: 'caseTitle', label: 'Case Title', category: 'Case Details' },
    { id: 'caseCategory', label: 'Category', category: 'Case Details' },
    { id: 'status', label: 'Status', category: 'Case Details' },
    { id: 'priority', label: 'Priority', category: 'Case Details' },
    { id: 'createdAt', label: 'Created Date', category: 'Dates' },
    { id: 'resolvedAt', label: 'Resolved Date', category: 'Dates' },
    { id: 'expectedResolutionDate', label: 'Expected Resolution', category: 'Dates' },
    { id: 'assignedCoordinator', label: 'Assigned Coordinator', category: 'Assignment' },
    { id: 'assignedOffice', label: 'Assigned Office', category: 'Assignment' },
    { id: 'billableHours', label: 'Billable Hours', category: 'Metrics' },
    { id: 'documentCount', label: 'Document Count', category: 'Metrics' },
    { id: 'complexity', label: 'Complexity Score', category: 'Metrics' },
    { id: 'riskLevel', label: 'Risk Level', category: 'Metrics' }
  ];

  const columnCategories = [...new Set(availableColumns.map(col => col.category))];

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coordinator/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case-report-${format(new Date(), 'yyyy-MM-dd')}.${options.format}`;
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
          <CardDescription>
            Configure and export case reports in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="format" className="space-y-4">
            <TabsList>
              <TabsTrigger value="format">
                <FileType className="w-4 h-4 mr-2" />
                Format
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Settings className="w-4 h-4 mr-2" />
                Filters
              </TabsTrigger>
              <TabsTrigger value="columns">
                <FileType className="w-4 h-4 mr-2" />
                Columns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="format" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Export Format</Label>
                  <Select
                    value={options.format}
                    onValueChange={(value: 'csv' | 'excel' | 'pdf') => 
                      setOptions({ ...options, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <Select
                    value={options.sortBy}
                    onValueChange={(value) => 
                      setOptions({ ...options, sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date Range</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={options.dateRange.start}
                      onChange={(e) => setOptions({
                        ...options,
                        dateRange: { ...options.dateRange, start: e.target.value }
                      })}
                    />
                    <Input
                      type="date"
                      value={options.dateRange.end}
                      onChange={(e) => setOptions({
                        ...options,
                        dateRange: { ...options.dateRange, end: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={options.filters.status[0]}
                    onValueChange={(value) => setOptions({
                      ...options,
                      filters: {
                        ...options.filters,
                        status: [value]
                      }
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

                <div>
                  <Label>Priority</Label>
                  <Select
                    value={options.filters.priority[0]}
                    onValueChange={(value) => setOptions({
                      ...options,
                      filters: {
                        ...options.filters,
                        priority: [value]
                      }
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
            </TabsContent>

            <TabsContent value="columns" className="space-y-4">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {columnCategories.map((category) => (
                  <div key={category} className="mb-6">
                    <h3 className="font-medium mb-2">{category}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {availableColumns
                        .filter(col => col.category === category)
                        .map((column) => (
                          <div key={column.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={column.id}
                              checked={options.columns.includes(column.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setOptions({
                                    ...options,
                                    columns: [...options.columns, column.id]
                                  });
                                } else {
                                  setOptions({
                                    ...options,
                                    columns: options.columns.filter(id => id !== column.id)
                                  });
                                }
                              }}
                            />
                            <label
                              htmlFor={column.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {column.label}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-between items-center">
            <div className="flex space-x-2">
              {options.columns.length > 0 && (
                <Badge variant="secondary">
                  {options.columns.length} columns selected
                </Badge>
              )}
              {options.filters.status.length > 0 && (
                <Badge variant="secondary">
                  Status filtered
                </Badge>
              )}
              {options.filters.priority.length > 0 && (
                <Badge variant="secondary">
                  Priority filtered
                </Badge>
              )}
              {(options.dateRange.start || options.dateRange.end) && (
                <Badge variant="secondary">
                  Date filtered
                </Badge>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOptions({
                    format: 'csv',
                    dateRange: { start: '', end: '' },
                    filters: {
                      status: [],
                      priority: [],
                      category: []
                    },
                    columns: ['clientName', 'caseTitle', 'status', 'priority', 'createdAt']
                  });
                }}
              >
                Reset
              </Button>
              <Button onClick={handleExport} disabled={loading}>
                {loading ? (
                  <>Exporting...</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 