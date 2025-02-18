"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Loader2, Download, Filter, RefreshCw, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { ChartBarIcon, TableCellsIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ClientReport {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  caseTitle: string;
  caseCategory: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  expectedResolutionDate?: string;
  documentCount: number;
  assignedCoordinator: string;
  assignedOffice: string;
  officeAddress?: string;
  complexity: {
    score: number;
    riskLevel: number;
  };
  metrics: {
    billableHours: number;
    documentCount: number;
  };
  recentEvents: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    type: string;
  }>;
  recentActivities: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    user: {
      name: string;
      role: string;
    };
  }>;
  tags: string[];
}

interface Statistics {
  total: number;
  byStatus: {
    active: number;
    pending: number;
    resolved: number;
    cancelled: number;
  };
  averageComplexity: number;
  averageRiskLevel: number;
  totalBillableHours: number;
  totalDocuments: number;
}

export default function ReportsGeneratorPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCaseType, setFilterCaseType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ClientReport | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/coordinator/reports');
      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
        setStatistics(data.statistics);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      (report.clientName?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (report.assignedCoordinator?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (report.assignedOffice?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (report.caseTitle?.toLowerCase() ?? '').includes(searchQuery.toLowerCase());
    const matchesCaseType = filterCaseType === 'all' || report.caseCategory === filterCaseType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority;
    return matchesSearch && matchesCaseType && matchesStatus && matchesPriority;
  });

  const exportToCSV = () => {
    const headers = [
      'Client Name',
      'Case Title',
      'Category',
      'Priority',
      'Status',
      'Created Date',
      'Coordinator',
      'Office',
      'Documents',
      'Billable Hours'
    ].join(',');

    const rows = filteredReports.map(report => [
      report.clientName ?? '',
      report.caseTitle ?? '',
      report.caseCategory ?? '',
      report.priority ?? '',
      report.status ?? '',
      formatDate(report.createdAt),
      report.assignedCoordinator ?? '',
      report.assignedOffice ?? '',
      report.documentCount ?? 0,
      report.metrics?.billableHours ?? 0
    ].join(','));

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-500';
    
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'bg-gray-500';
    
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Add safe date formatting function
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : 'Invalid Date';
  };

  const formatDateTime = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid Date';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports Generator</h1>
          <p className="text-gray-500 mt-2">
            Generate and view detailed reports about cases and their statistics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analytics Dashboard Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/coordinator/reports/analytics')}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              View comprehensive analytics and statistics about cases, including charts and trends.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Case status distribution
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Priority analysis
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Performance metrics
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Detailed Reports Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/coordinator/reports/detailed')}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TableCellsIcon className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Detailed Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Access detailed case reports with advanced filtering and export capabilities.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Advanced filtering
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Export to CSV
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Detailed case views
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Custom Report Builder Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Custom Report Builder</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Build custom reports by selecting specific fields and criteria.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Field selection
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Custom filters
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Multiple formats
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common report generation tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/coordinator/reports/detailed?filter=active')}>
              Active Cases Report
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/coordinator/reports/detailed?filter=priority=high')}>
              High Priority Cases
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/coordinator/reports/detailed?filter=status=pending')}>
              Pending Cases
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/coordinator/reports/analytics')}>
              Monthly Statistics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your recently generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Active Cases Summary</h3>
                <p className="text-sm text-gray-500">Generated on {formatDate(new Date().toISOString())}</p>
              </div>
              <Button variant="ghost">View Report</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Monthly Performance Report</h3>
                <p className="text-sm text-gray-500">Generated on {formatDate(new Date().toISOString())}</p>
              </div>
              <Button variant="ghost">View Report</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Case Resolution Statistics</h3>
                <p className="text-sm text-gray-500">Generated on {formatDate(new Date().toISOString())}</p>
              </div>
              <Button variant="ghost">View Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active</span>
                  <span>{statistics.byStatus.active}</span>
                </div>
                <Progress 
                  value={statistics ? (statistics.byStatus.active / statistics.total) * 100 : 0} 
                  className="bg-green-100" 
                />
                <div className="flex justify-between text-sm">
                  <span>Pending</span>
                  <span>{statistics.byStatus.pending}</span>
                </div>
                <Progress 
                  value={statistics ? (statistics.byStatus.pending / statistics.total) * 100 : 0} 
                  className="bg-yellow-100" 
                />
                <div className="flex justify-between text-sm">
                  <span>Resolved</span>
                  <span>{statistics.byStatus.resolved}</span>
                </div>
                <Progress 
                  value={statistics ? (statistics.byStatus.resolved / statistics.total) * 100 : 0} 
                  className="bg-blue-100" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Case Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Average Complexity</div>
                  <div className="text-2xl font-bold">
                    {(statistics?.averageComplexity ?? 0).toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Average Risk Level</div>
                  <div className="text-2xl font-bold">
                    {(statistics?.averageRiskLevel ?? 0).toFixed(1)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(statistics?.totalBillableHours ?? 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Billable Hours</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.totalDocuments ?? 0}</div>
              <div className="text-sm text-gray-500">Total Documents</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Client Reports Generator</CardTitle>
              <CardDescription>
                Comprehensive view of all case reports and client information
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={fetchReports}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by client name, case title, coordinator, or office..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCaseType} onValueChange={setFilterCaseType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Case Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="CIVIL">Civil</SelectItem>
                  <SelectItem value="CRIMINAL">Criminal</SelectItem>
                  <SelectItem value="FAMILY">Family</SelectItem>
                  <SelectItem value="PROPERTY">Property</SelectItem>
                  <SelectItem value="LABOR">Labor</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Case Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Coordinator</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <TableRow key={report.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell>{report.clientName}</TableCell>
                        <TableCell>{report.caseTitle}</TableCell>
                        <TableCell>{report.caseCategory}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                        <TableCell>{report.assignedCoordinator}</TableCell>
                        <TableCell>{report.assignedOffice}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowDetailsDialog(true);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No reports found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReport.caseTitle}</DialogTitle>
                <DialogDescription>
                  Case Details and History
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Client Information</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {selectedReport.clientName}</p>
                        <p><span className="font-medium">Phone:</span> {selectedReport.clientPhone}</p>
                        <p><span className="font-medium">Email:</span> {selectedReport.clientEmail}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Case Information</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Category:</span> {selectedReport.caseCategory}</p>
                        <p><span className="font-medium">Priority:</span> {selectedReport.priority}</p>
                        <p><span className="font-medium">Status:</span> {selectedReport.status}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Case Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Complexity Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedReport?.complexity?.score ?? 0}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Risk Level</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedReport?.complexity?.riskLevel ?? 0}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Billable Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedReport?.metrics?.billableHours ?? 0}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-2">
                          <CardTitle className="text-sm">Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedReport?.metrics?.documentCount ?? 0}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport?.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      )) ?? []}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="events">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {selectedReport?.recentEvents?.map((event) => (
                        <Card key={event.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{event.title}</CardTitle>
                                <CardDescription>{event.description}</CardDescription>
                              </div>
                              <Badge>{event.type}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(event.date)}
                            </p>
                          </CardContent>
                        </Card>
                      )) ?? []}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="activities">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {selectedReport?.recentActivities?.map((activity) => (
                        <Card key={activity.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{activity.title}</CardTitle>
                                <CardDescription>{activity.description}</CardDescription>
                              </div>
                              <Badge>{activity.user.role}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>{activity.user.name}</span>
                              <span>{formatDateTime(activity.date)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )) ?? []}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 