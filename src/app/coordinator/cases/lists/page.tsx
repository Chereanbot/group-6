'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Filter, RefreshCcw, ChevronDown, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Case {
  id: string;
  title: string;
  clientName: string;
  clientPhone?: string;
  status: 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CANCELLED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'FAMILY' | 'CRIMINAL' | 'CIVIL' | 'PROPERTY' | 'LABOR' | 'COMMERCIAL' | 'ADMINISTRATIVE' | 'OTHER';
  assignedLawyer?: {
    fullName: string;
  };
  office?: {
    name: string;
  };
  createdAt: string;
  description?: string;
}

interface LawyerOption {
  id: string;
  fullName: string;
  email: string;
  specializations?: string[];
}

interface ActionModalState {
  type: 'assign-lawyer' | 'update-status' | 'change-priority' | 'add-note' | 'reject-case' | null;
  caseId: string | null;
}

export default function CasesList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const { toast } = useToast();
  const [actionModal, setActionModal] = useState<ActionModalState>({ type: null, caseId: null });
  const [lawyers, setLawyers] = useState<LawyerOption[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/coordinator/cases');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch cases');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch cases');
      }
      
      setCases(data.cases || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load cases';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCases();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'resolved':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      FAMILY: 'bg-purple-500 hover:bg-purple-600',
      CRIMINAL: 'bg-red-500 hover:bg-red-600',
      CIVIL: 'bg-blue-500 hover:bg-blue-600',
      PROPERTY: 'bg-green-500 hover:bg-green-600',
      LABOR: 'bg-orange-500 hover:bg-orange-600',
      COMMERCIAL: 'bg-indigo-500 hover:bg-indigo-600',
      ADMINISTRATIVE: 'bg-teal-500 hover:bg-teal-600',
      OTHER: 'bg-gray-500 hover:bg-gray-600'
    };
    return colors[category] || colors.OTHER;
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = 
      case_.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || case_.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || case_.priority === filterPriority;
    const matchesCategory = filterCategory === 'ALL' || case_.category === filterCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const fetchLawyers = async () => {
    try {
      const response = await fetch('/api/coordinator/lawyers');
      if (!response.ok) {
        throw new Error('Failed to fetch lawyers');
      }
      const data = await response.json();
      setLawyers(data.lawyers);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch lawyers',
        variant: 'destructive',
      });
    }
  };

  const handleAssignLawyer = (caseId: string) => {
    setActionModal({ type: 'assign-lawyer', caseId });
    fetchLawyers();
  };

  const handleUpdateStatus = (caseId: string) => {
    setActionModal({ type: 'update-status', caseId });
  };

  const handleUpdatePriority = (caseId: string) => {
    setActionModal({ type: 'change-priority', caseId });
  };

  const handleAddNote = (caseId: string) => {
    setActionModal({ type: 'add-note', caseId });
  };

  const handleRejectCase = (caseId: string) => {
    setActionModal({ type: 'reject-case', caseId });
  };

  const handleApproveCase = async (caseId: string) => {
    try {
      const response = await fetch(`/api/coordinator/cases/${caseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve case');
      }

      toast({
        title: 'Success',
        description: 'Case approved successfully',
      });
      
      fetchCases();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCloseModal = () => {
    setActionModal({ type: null, caseId: null });
    setSelectedLawyer('');
    setSelectedStatus('');
    setSelectedPriority('');
    setNote('');
    setRejectionReason('');
  };

  const handleSubmitAction = async () => {
    if (!actionModal.caseId) return;

    setLoading(true);
    try {
      let response;
      switch (actionModal.type) {
        case 'assign-lawyer':
          response = await fetch(`/api/coordinator/cases/${actionModal.caseId}/assign-lawyer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lawyerId: selectedLawyer }),
          });
          break;
        case 'update-status':
          response = await fetch(`/api/coordinator/cases/${actionModal.caseId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: selectedStatus }),
          });
          break;
        case 'change-priority':
          response = await fetch(`/api/coordinator/cases/${actionModal.caseId}/priority`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority: selectedPriority }),
          });
          break;
        case 'add-note':
          response = await fetch(`/api/coordinator/cases/${actionModal.caseId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note }),
          });
          break;
        case 'reject-case':
          response = await fetch(`/api/coordinator/cases/${actionModal.caseId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: rejectionReason }),
          });
          break;
        default:
          return;
      }

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }

      toast({
        title: 'Success',
        description: 'Action completed successfully',
      });

      handleCloseModal();
      fetchCases();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-red-500 mb-4">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Cases</h3>
            <p className="text-gray-500 text-center mb-4">{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Cases List</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="hover:bg-gray-100"
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </div>
            <Link href="/coordinator/cases/new">
              <Button>Add New Case</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Search by title, client name, phone or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Priorities</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="FAMILY">Family</SelectItem>
                    <SelectItem value="CRIMINAL">Criminal</SelectItem>
                    <SelectItem value="CIVIL">Civil</SelectItem>
                    <SelectItem value="PROPERTY">Property</SelectItem>
                    <SelectItem value="LABOR">Labor</SelectItem>
                    <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                    <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredCases.length} of {cases.length} cases
              </div>
            </div>

            {cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cases Found</h3>
                <p className="text-gray-500 mb-4">There are no cases assigned to your office yet.</p>
                <Link href="/coordinator/cases/new">
                  <Button>Create Your First Case</Button>
                </Link>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Matching Cases</h3>
                <p className="text-gray-500 mb-4">No cases match your current filters.</p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                  setFilterPriority('ALL');
                  setFilterCategory('ALL');
                }}>Clear Filters</Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((case_) => (
                      <TableRow key={case_.id}>
                        <TableCell className="font-medium">{case_.title}</TableCell>
                        <TableCell>
                          <div>
                            <div>{case_.clientName}</div>
                            {case_.clientPhone && (
                              <div className="text-sm text-gray-500">{case_.clientPhone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(case_.priority)}>
                            {case_.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(case_.category)}>
                            {case_.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {case_.assignedLawyer?.fullName || 'Not Assigned'}
                        </TableCell>
                        <TableCell>{case_.office?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(case_.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/coordinator/cases/${case_.id}`}>
                                  <FolderOpen className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignLawyer(case_.id)}>
                                Assign Lawyer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(case_.id)}>
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdatePriority(case_.id)}>
                                Change Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddNote(case_.id)}>
                                Add Note
                              </DropdownMenuItem>
                              {case_.status === 'PENDING' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApproveCase(case_.id)}>
                                    Approve Case
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRejectCase(case_.id)} className="text-red-600">
                                    Reject Case
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionModal.type === 'assign-lawyer'} onOpenChange={() => handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lawyer</DialogTitle>
            <DialogDescription>
              Select a lawyer to assign to this case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedLawyer} onValueChange={setSelectedLawyer}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lawyer" />
              </SelectTrigger>
              <SelectContent>
                {lawyers.map((lawyer) => (
                  <SelectItem key={lawyer.id} value={lawyer.id}>
                    {lawyer.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSubmitAction} disabled={!selectedLawyer || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionModal.type === 'update-status'} onOpenChange={() => handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Select a new status for this case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSubmitAction} disabled={!selectedStatus || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionModal.type === 'change-priority'} onOpenChange={() => handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Priority</DialogTitle>
            <DialogDescription>
              Select a new priority for this case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
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
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSubmitAction} disabled={!selectedPriority || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionModal.type === 'add-note'} onOpenChange={() => handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note to this case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSubmitAction} disabled={!note.trim() || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionModal.type === 'reject-case'} onOpenChange={() => handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Case</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this case
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleSubmitAction} 
              disabled={!rejectionReason.trim() || loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 