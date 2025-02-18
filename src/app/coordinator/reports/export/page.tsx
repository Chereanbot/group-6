"use client";

import { useState, useEffect } from 'react';
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
import { Download, FileType, Settings, Calendar, Share2, Users, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  userRole: string;
}

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
  notes?: string;
  description?: string;
}

export default function ExportReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('/api/coordinator/users/admins');
      if (!response.ok) throw new Error('Failed to fetch admin users');
      
      const data = await response.json();
      if (data.success) {
        setAdminUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch admin users',
        variant: "destructive",
      });
    }
  };

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

  const handleShare = async () => {
    if (selectedAdmins.length === 0) {
      toast({
        title: "Error",
        description: 'Please select at least one admin to share with',
        variant: "destructive",
      });
      return;
    }

    try {
      setSharing(true);
      const response = await fetch('/api/coordinator/reports/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sharedWithIds: selectedAdmins,
          permissions: ['VIEW', 'EXPORT'],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          notes: options.notes,
          description: options.description,
          exportOptions: options // Include all export options
        }),
      });

      if (!response.ok) {
        throw new Error('Share failed');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: 'Report shared successfully with selected administrators',
        });
        setShareDialogOpen(false);
        setSelectedAdmins([]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Error",
        description: 'Failed to share report. Please try again.',
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Export Reports</h1>
        <div className="flex space-x-4">
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Report</DialogTitle>
                <DialogDescription>
                  Select administrators to share this report with.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Administrators</Label>
                  <ScrollArea className="h-[200px] w-full border rounded-md p-2">
                    {adminUsers.map((admin) => (
                      <div key={admin.id} className="flex items-center space-x-2 p-2">
                        <Checkbox
                          checked={selectedAdmins.includes(admin.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAdmins([...selectedAdmins, admin.id]);
                            } else {
                              setSelectedAdmins(selectedAdmins.filter(id => id !== admin.id));
                            }
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{admin.fullName}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {admin.userRole}
                        </Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShareDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleShare}
                    disabled={sharing || selectedAdmins.length === 0}
                  >
                    {sharing ? 'Sharing...' : 'Share Report'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
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
              <TabsTrigger value="notes">
                <FileText className="w-4 h-4 mr-2" />
                Notes
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

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Report Notes & Description</CardTitle>
                  <CardDescription>
                    Add notes and description for this report export
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Report Description</Label>
                      <textarea
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        placeholder="Enter a description for this report..."
                        value={options.description || ''}
                        onChange={(e) => setOptions({
                          ...options,
                          description: e.target.value
                        })}
                      />
                      <p className="text-sm text-gray-500">
                        Provide a brief description of what this report contains and its purpose.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <textarea
                        className="w-full min-h-[150px] p-2 border rounded-md"
                        placeholder="Enter any additional notes or comments..."
                        value={options.notes || ''}
                        onChange={(e) => setOptions({
                          ...options,
                          notes: e.target.value
                        })}
                      />
                      <p className="text-sm text-gray-500">
                        Add any relevant notes, methodology explanations, or context for the data included.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md space-y-2">
                      <h4 className="font-medium">Report Summary</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Format: {options.format.toUpperCase()}</p>
                        <p>Date Range: {options.dateRange.start ? `${options.dateRange.start} to ${options.dateRange.end}` : 'Not specified'}</p>
                        <p>Selected Columns: {options.columns.length}</p>
                        <p>Applied Filters: {
                          [
                            ...options.filters.status,
                            ...options.filters.priority,
                            ...options.filters.category
                          ].join(', ') || 'None'
                        }</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 