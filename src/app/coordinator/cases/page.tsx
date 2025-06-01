"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseStatus, Priority, CaseCategory } from '@prisma/client';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  FileText, Search, Filter, Download, 
  MoreVertical, Edit, Eye, RefreshCw,
  FileSpreadsheet, CheckCircle, XCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Case {
  id: string;
  title: string;
  clientName: string;
  status: CaseStatus;
  priority: Priority;
  category: CaseCategory;
  createdAt: string;
  clientId: string;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  assignedLawyer?: {
    id: string;
    fullName: string;
    email: string;
  };
  assignedOffice: {
    id: string;
    name: string;
    location: string;
  };
  _count: {
    activities: number;
    documents: number;
  };
}

export default function CoordinatorCasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<CaseCategory | 'ALL'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [statusFilter, priorityFilter, categoryFilter, searchTerm]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      let url = '/api/coordinator/cases?';
      if (statusFilter && statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (priorityFilter && priorityFilter !== 'ALL') url += `priority=${priorityFilter}&`;
      if (categoryFilter && categoryFilter !== 'ALL') url += `category=${categoryFilter}&`;
      if (searchTerm) url += `search=${searchTerm}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCases(data.data.cases);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch cases');
        toast.error(data.error || 'Failed to fetch cases');
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError('An error occurred while fetching cases');
      toast.error('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const csvData = [
        ['Title', 'Client', 'Status', 'Priority', 'Category', 'Office', 'Created Date', 'Documents', 'Activities'],
        ...cases.map(case_ => [
          case_.title,
          case_.clientName,
          case_.status,
          case_.priority,
          case_.category,
          case_.assignedOffice.name,
          format(new Date(case_.createdAt), 'MMM dd, yyyy'),
          case_._count.documents,
          case_._count.activities
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `cases_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      toast.success('Cases data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export cases data');
    }
  };

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_);
    setShowViewModal(true);
  };

  const handleEditCase = (case_: Case) => {
    setSelectedCase(case_);
    setShowEditModal(true);
  };

  const handleStatusUpdate = async (caseId: string, newStatus: CaseStatus) => {
    try {
      const response = await fetch(`/api/coordinator/cases/${caseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      toast.success('Case status updated successfully');

      // Refresh the cases list
      fetchCases();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const getPriorityBadgeColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'bg-red-500';
      case Priority.MEDIUM:
        return 'bg-yellow-500';
      case Priority.LOW:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.ACTIVE:
        return 'bg-blue-500';
      case CaseStatus.PENDING:
        return 'bg-yellow-500';
      case CaseStatus.CANCELLED:
        return 'bg-gray-500';
      case CaseStatus.RESOLVED:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cases Management</CardTitle>
              <CardDescription>Manage and track all legal cases</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportData}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => router.push('/coordinator/cases/new')}>
                <FileText className="w-4 h-4 mr-2" />
                Create New Case
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as CaseStatus | 'ALL')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value={CaseStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={CaseStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={CaseStatus.CANCELLED}>Cancelled</SelectItem>
                <SelectItem value={CaseStatus.RESOLVED}>Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as Priority | 'ALL')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value={Priority.HIGH}>High</SelectItem>
                <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={Priority.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as CaseCategory | 'ALL')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {Object.values(CaseCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((case_) => (
                <TableRow 
                  key={case_.id} 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => router.push(`/coordinator/cases/${case_.id}`)}
                >
                  <TableCell className="font-medium">{case_.title}</TableCell>
                  <TableCell>
                    <div>
                      <div>{case_.clientName}</div>
                      <div className="text-sm text-gray-500">{case_.client.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{case_.assignedOffice?.name}</div>
                      <div className="text-sm text-gray-500">{case_.assignedOffice?.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(case_.status)}>
                      {case_.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadgeColor(case_.priority)}>
                      {case_.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{case_.category}</TableCell>
                  <TableCell>{format(new Date(case_.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleViewCase(case_);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditCase(case_);
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Case
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Update Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {Object.values(CaseStatus).map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(case_.id, status);
                                }}
                                className="flex items-center"
                              >
                                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusBadgeColor(status)}`} />
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/coordinator/cases/${case_.id}/documents`);
                        }}>
                          <FileText className="w-4 h-4 mr-2" />
                          Documents ({case_._count.documents})
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/coordinator/cases/${case_.id}/activities`);
                        }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Activities ({case_._count.activities})
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {cases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No cases found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Case Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Case Details</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <div className="font-medium">{selectedCase.title}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusBadgeColor(selectedCase.status)}>
                    {selectedCase.status}
                  </Badge>
                </div>
                <div>
                  <Label>Client</Label>
                  <div className="font-medium">{selectedCase.clientName}</div>
                  <div className="text-sm text-gray-500">{selectedCase.client.phone}</div>
                </div>
                <div>
                  <Label>Office</Label>
                  <div className="font-medium">{selectedCase.assignedOffice.name}</div>
                  <div className="text-sm text-gray-500">{selectedCase.assignedOffice.location}</div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityBadgeColor(selectedCase.priority)}>
                    {selectedCase.priority}
                  </Badge>
                </div>
                <div>
                  <Label>Category</Label>
                  <div className="font-medium">{selectedCase.category}</div>
                </div>
                <div>
                  <Label>Created</Label>
                  <div className="font-medium">
                    {format(new Date(selectedCase.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <Label>Documents</Label>
                  <div className="font-medium">{selectedCase._count.documents}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Case Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Case</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input defaultValue={selectedCase.title} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue={selectedCase.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CaseStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select defaultValue={selectedCase.priority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Priority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select defaultValue={selectedCase.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CaseCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 