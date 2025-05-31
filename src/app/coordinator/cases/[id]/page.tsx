'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, ArrowLeft, Clock, User, MapPin, Phone, Mail, 
  FileText, Activity, AlertCircle, Info, Check, 
  Calendar, Building2, Briefcase, FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { CaseStatus, Priority, CaseCategory } from '@prisma/client';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CANCELLED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  region?: string;
  zone?: string;
  wereda: string;
  kebele: string;
  houseNumber?: string;
  assignedLawyer?: {
    id: string;
    fullName: string;
    email: string;
  };
  assignedOffice?: {
    name: string;
  };
  createdAt: string;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    createdAt: string;
    user: {
      fullName: string;
    };
  }>;
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
    creator: {
      fullName: string;
    };
  }>;
}

interface LawyerOption {
  id: string;
  fullName: string;
  email: string;
  specializations?: string[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function CaseDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: 'assign-lawyer' | 'update-status' | 'change-priority' | 'add-note' | 'reject-case' | null;
    open: boolean;
  }>({ type: null, open: false });
  const [lawyers, setLawyers] = useState<LawyerOption[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
  }, [params.id]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/coordinator/cases/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch case details');
      }
      
      setCaseData(data.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load case details';
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

  const handleAssignLawyer = () => {
    setActionModal({ type: 'assign-lawyer', open: true });
    fetchLawyers();
  };

  const handleUpdateStatus = () => {
    setActionModal({ type: 'update-status', open: true });
  };

  const handleUpdatePriority = () => {
    setActionModal({ type: 'change-priority', open: true });
  };

  const handleAddNote = () => {
    setActionModal({ type: 'add-note', open: true });
  };

  const handleRejectCase = () => {
    setActionModal({ type: 'reject-case', open: true });
  };

  const handleApproveCase = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/coordinator/cases/${params.id}/approve`, {
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
      
      fetchCaseDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve case',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setActionModal({ type: null, open: false });
    setSelectedLawyer('');
    setSelectedStatus('');
    setSelectedPriority('');
    setNote('');
    setRejectionReason('');
  };

  const handleSubmitAction = async () => {
    if (!caseData) return;

    setSubmitting(true);
    try {
      let response;
      switch (actionModal.type) {
        case 'assign-lawyer':
          response = await fetch(`/api/coordinator/cases/${caseData.id}/assign-lawyer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lawyerId: selectedLawyer }),
          });
          break;
        case 'update-status':
          response = await fetch(`/api/coordinator/cases/${caseData.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: selectedStatus }),
          });
          break;
        case 'change-priority':
          response = await fetch(`/api/coordinator/cases/${caseData.id}/priority`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority: selectedPriority }),
          });
          break;
        case 'add-note':
          response = await fetch(`/api/coordinator/cases/${caseData.id}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note }),
          });
          break;
        case 'reject-case':
          response = await fetch(`/api/coordinator/cases/${caseData.id}/reject`, {
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
      fetchCaseDetails();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to perform action',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Case not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
            <p className="text-muted-foreground">Case ID: {caseData.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/coordinator/cases/${caseData.id}/documents`)}>
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </Button>
          <Button variant="outline" onClick={() => router.push(`/coordinator/cases/${caseData.id}/activities`)}>
            <Activity className="w-4 h-4 mr-2" />
            Activities
          </Button>
          <Button onClick={handleAssignLawyer}>
            <User className="w-4 h-4 mr-2" />
            Assign Lawyer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Case Information</CardTitle>
            <CardDescription>Details about this legal case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge className={getStatusColor(caseData.status)}>
                  {caseData.status}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Priority</div>
                <Badge className={getPriorityColor(caseData.priority)}>
                  {caseData.priority}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Category</div>
                <div className="font-medium">{caseData.category}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Created</div>
                <div className="font-medium">
                  {format(new Date(caseData.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Description</div>
              <p className="text-sm">{caseData.description || 'No description provided'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Assigned Lawyer</div>
                {caseData.assignedLawyer ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{caseData.assignedLawyer.fullName}</div>
                      <div className="text-sm text-muted-foreground">{caseData.assignedLawyer.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No lawyer assigned</div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Assigned Office</div>
                {caseData.assignedOffice ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">{caseData.assignedOffice.name}</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No office assigned</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Details about the client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{caseData.clientName}</div>
                <div className="text-sm text-muted-foreground">Client</div>
              </div>
            </div>
            {caseData.clientPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">{caseData.clientPhone}</div>
              </div>
            )}
            {caseData.clientAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">{caseData.clientAddress}</div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                {[caseData.region, caseData.zone, caseData.wereda, caseData.kebele, caseData.houseNumber]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Timeline</CardTitle>
          <CardDescription>Recent activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caseData.activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="w-0.5 h-full bg-border" />
                </div>
                <div>
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-muted-foreground">{activity.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')} by {activity.user.fullName}
                  </div>
                </div>
              </div>
            ))}
            {caseData.activities.length === 0 && (
              <div className="text-sm text-muted-foreground">No activities recorded yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Modals */}
      <Dialog open={actionModal.open} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === 'assign-lawyer' && 'Assign Lawyer'}
              {actionModal.type === 'update-status' && 'Update Status'}
              {actionModal.type === 'change-priority' && 'Change Priority'}
              {actionModal.type === 'add-note' && 'Add Note'}
              {actionModal.type === 'reject-case' && 'Reject Case'}
            </DialogTitle>
            <DialogDescription>
              {actionModal.type === 'assign-lawyer' && 'Select a lawyer to assign to this case'}
              {actionModal.type === 'update-status' && 'Select a new status for this case'}
              {actionModal.type === 'change-priority' && 'Select a new priority for this case'}
              {actionModal.type === 'add-note' && 'Add a note to this case'}
              {actionModal.type === 'reject-case' && 'Please provide a reason for rejecting this case'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {actionModal.type === 'assign-lawyer' && (
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
            )}

            {actionModal.type === 'update-status' && (
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
            )}

            {actionModal.type === 'change-priority' && (
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
            )}

            {actionModal.type === 'add-note' && (
              <Textarea
                placeholder="Enter your note here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[100px]"
              />
            )}

            {actionModal.type === 'reject-case' && (
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={
                submitting ||
                (actionModal.type === 'assign-lawyer' && !selectedLawyer) ||
                (actionModal.type === 'update-status' && !selectedStatus) ||
                (actionModal.type === 'change-priority' && !selectedPriority) ||
                (actionModal.type === 'add-note' && !note.trim()) ||
                (actionModal.type === 'reject-case' && !rejectionReason.trim())
              }
              variant={actionModal.type === 'reject-case' ? 'destructive' : 'default'}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionModal.type === 'assign-lawyer' && 'Assign'}
              {actionModal.type === 'update-status' && 'Update'}
              {actionModal.type === 'change-priority' && 'Change'}
              {actionModal.type === 'add-note' && 'Add Note'}
              {actionModal.type === 'reject-case' && 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 