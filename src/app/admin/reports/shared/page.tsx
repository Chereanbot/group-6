"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import {
  Download,
  MoreVertical,
  Eye,
  Share2,
  Trash2,
  Clock,
  Users,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SharedReport {
  id: string;
  title: string;
  description: string;
  sharedBy: {
    id: string;
    name: string;
    role: string;
  };
  sharedWith: Array<{
    id: string;
    name: string;
    role: string;
    status: 'PENDING' | 'VIEWED' | 'DOWNLOADED';
  }>;
  type: string;
  createdAt: string;
  expiresAt: string;
  hasNotes: boolean;
  notes?: string;
  exportOptions: any;
}

export default function SharedReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<SharedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SharedReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'shared' | 'received'>('all');

  useEffect(() => {
    fetchSharedReports();
  }, [filter]);

  const fetchSharedReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reports/shared?' + new URLSearchParams({
        filter: filter
      }));

      if (!response.ok) {
        throw new Error('Failed to fetch shared reports');
      }

      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching shared reports:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch shared reports',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/shared/${reportId}/download`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: 'Report downloaded successfully',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: 'Failed to download report',
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/shared/${reportId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      const data = await response.json();
      if (data.success) {
        setReports(reports.filter(report => report.id !== reportId));
        toast({
          title: "Success",
          description: 'Report deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: 'Failed to delete report',
        variant: "destructive",
      });
    }
  };

  const handleView = (report: SharedReport) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.sharedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'VIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'DOWNLOADED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shared Reports</h1>
        <div className="flex space-x-4">
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="shared">Shared by Me</TabsTrigger>
              <TabsTrigger value="received">Shared with Me</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shared Reports Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Shared By</TableHead>
                  <TableHead>Shared With</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>{report.title}</span>
                          {report.hasNotes && (
                            <Badge variant="outline">Has Notes</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{report.sharedBy.name}</span>
                          <Badge>{report.sharedBy.role}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{report.sharedWith.length} users</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(report.expiresAt), 'MMM d, yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.sharedWith.map(user => (
                          <Badge
                            key={user.id}
                            className={getStatusColor(user.status)}
                          >
                            {user.status}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(report)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(report.id)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(report.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              View detailed information about the shared report
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Report Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Title:</span> {selectedReport.title}</p>
                    <p><span className="font-medium">Type:</span> {selectedReport.type}</p>
                    <p><span className="font-medium">Created:</span> {format(new Date(selectedReport.createdAt), 'PPP')}</p>
                    <p><span className="font-medium">Expires:</span> {format(new Date(selectedReport.expiresAt), 'PPP')}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Sharing Details</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Shared By:</span> {selectedReport.sharedBy.name}</p>
                    <p><span className="font-medium">Role:</span> {selectedReport.sharedBy.role}</p>
                    <p><span className="font-medium">Total Recipients:</span> {selectedReport.sharedWith.length}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Description</h3>
                <p className="mt-2">{selectedReport.description}</p>
              </div>

              {selectedReport.hasNotes && (
                <div>
                  <h3 className="font-medium">Notes</h3>
                  <p className="mt-2">{selectedReport.notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium">Recipients</h3>
                <ScrollArea className="h-[200px] mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReport.sharedWith.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownload(selectedReport.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 