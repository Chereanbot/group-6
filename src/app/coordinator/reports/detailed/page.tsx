"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Filter, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Report {
  id: string;
  clientInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  caseDetails: {
    title: string;
    category: string;
    priority: string;
    status: string;
    description: string;
    createdAt: string;
    resolvedAt?: string;
    expectedResolutionDate?: string;
    documentCount: number;
    complexity: number;
    riskLevel: number;
    billableHours: number;
  };
  office: {
    name: string;
    location: string;
    type: string;
    status: string;
  };
  assignments: Array<{
    id: string;
    assignedTo: {
      name: string;
      role: string;
      email: string;
    };
    assignedBy: {
      name: string;
      role: string;
    };
    status: string;
    createdAt: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    location: string;
    start: string;
    end: string;
    status: string;
    participants: Array<{
      id: string;
      role: string;
      status: string;
    }>;
    documents: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
    }>;
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    createdAt: string;
    user: {
      name: string;
      role: string;
      email: string;
    };
  }>;
  documents: Array<{
    id: string;
    title: string;
    type: string;
    path: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
    uploader: {
      name: string;
      role: string;
    };
  }>;
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    creator: {
      name: string;
      role: string;
    };
    isPrivate: boolean;
  }>;
  tags: string[];
}

export default function DetailedReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterOffice, setFilterOffice] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/coordinator/reports');
      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.caseDetails.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.office.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || report.caseDetails.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || report.caseDetails.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || report.caseDetails.priority === filterPriority;
    const matchesOffice = filterOffice === 'all' || report.office.name === filterOffice;
    
    const createdDate = new Date(report.caseDetails.createdAt);
    const matchesDateRange = 
      (!dateRange.start || createdDate >= new Date(dateRange.start)) &&
      (!dateRange.end || createdDate <= new Date(dateRange.end));

    return matchesSearch && matchesCategory && matchesStatus && 
           matchesPriority && matchesOffice && matchesDateRange;
  });

  const exportToCSV = () => {
    const headers = [
      'Client Name',
      'Case Title',
      'Category',
      'Priority',
      'Status',
      'Created Date',
      'Office',
      'Complexity',
      'Risk Level',
      'Billable Hours',
      'Documents'
    ].join(',');

    const rows = filteredReports.map(report => [
      report.clientInfo.name,
      report.caseDetails.title,
      report.caseDetails.category,
      report.caseDetails.priority,
      report.caseDetails.status,
      new Date(report.caseDetails.createdAt).toLocaleDateString(),
      report.office.name,
      report.caseDetails.complexity,
      report.caseDetails.riskLevel,
      report.caseDetails.billableHours,
      report.caseDetails.documentCount
    ].join(','));

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-reports-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detailed Reports</h1>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your search using the filters below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              placeholder="Search by client, case title, or office..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
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
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterOffice} onValueChange={setFilterOffice}>
              <SelectTrigger>
                <SelectValue placeholder="Office" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offices</SelectItem>
                {Array.from(new Set(reports.map(r => r.office.name))).map(office => (
                  <SelectItem key={office} value={office}>{office}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                placeholder="End Date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Case Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.clientInfo.name}</TableCell>
                    <TableCell>{report.caseDetails.title}</TableCell>
                    <TableCell>{report.caseDetails.category}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(report.caseDetails.priority)}>
                        {report.caseDetails.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.caseDetails.status)}>
                        {report.caseDetails.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.office.name}</TableCell>
                    <TableCell>
                      {new Date(report.caseDetails.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
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
                  <TableCell colSpan={8} className="text-center py-4">
                    No reports found matching the filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedReport.caseDetails.title}</DialogTitle>
                <DialogDescription>
                  Detailed case information and history
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div>
                            <dt className="font-medium">Name</dt>
                            <dd>{selectedReport.clientInfo.name}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Phone</dt>
                            <dd>{selectedReport.clientInfo.phone}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Email</dt>
                            <dd>{selectedReport.clientInfo.email}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Address</dt>
                            <dd>{selectedReport.clientInfo.address}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Case Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div>
                            <dt className="font-medium">Category</dt>
                            <dd>{selectedReport.caseDetails.category}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Priority</dt>
                            <dd>
                              <Badge className={getPriorityColor(selectedReport.caseDetails.priority)}>
                                {selectedReport.caseDetails.priority}
                              </Badge>
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium">Status</dt>
                            <dd>
                              <Badge className={getStatusColor(selectedReport.caseDetails.status)}>
                                {selectedReport.caseDetails.status}
                              </Badge>
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium">Description</dt>
                            <dd>{selectedReport.caseDetails.description}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Office Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div>
                            <dt className="font-medium">Name</dt>
                            <dd>{selectedReport.office.name}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Location</dt>
                            <dd>{selectedReport.office.location}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Type</dt>
                            <dd>{selectedReport.office.type}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Status</dt>
                            <dd>{selectedReport.office.status}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div>
                            <dt className="font-medium">Complexity Score</dt>
                            <dd>{selectedReport.caseDetails.complexity}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Risk Level</dt>
                            <dd>{selectedReport.caseDetails.riskLevel}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Billable Hours</dt>
                            <dd>{selectedReport.caseDetails.billableHours}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Document Count</dt>
                            <dd>{selectedReport.caseDetails.documentCount}</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="events">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {selectedReport.events.map((event) => (
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
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Location: {event.location}</span>
                                <span>Status: {event.status}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Start: {new Date(event.start).toLocaleString()}</span>
                                <span>End: {new Date(event.end).toLocaleString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="activities">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {selectedReport.activities.map((activity) => (
                        <Card key={activity.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{activity.title}</CardTitle>
                                <CardDescription>{activity.description}</CardDescription>
                              </div>
                              <Badge>{activity.type}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{activity.user.name} ({activity.user.role})</span>
                              <span>{new Date(activity.createdAt).toLocaleString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="documents">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {selectedReport.documents.map((doc) => (
                        <Card key={doc.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{doc.title}</CardTitle>
                                <CardDescription>{doc.type}</CardDescription>
                              </div>
                              <Badge>{(doc.size / 1024 / 1024).toFixed(2)} MB</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>
                                Uploaded by: {doc.uploader.name} ({doc.uploader.role})
                              </span>
                              <span>{new Date(doc.uploadedAt).toLocaleString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {selectedReport.notes.map((note) => (
                        <Card key={note.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">
                                Note by {note.creator.name}
                              </CardTitle>
                              {note.isPrivate && <Badge variant="secondary">Private</Badge>}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="whitespace-pre-wrap">{note.content}</p>
                            <div className="mt-2 text-sm text-gray-500">
                              Created: {new Date(note.createdAt).toLocaleString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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