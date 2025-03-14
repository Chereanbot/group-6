'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Clock, User, MapPin, Phone, Mail, FileText, Activity, AlertCircle, Info, Check } from 'lucide-react';
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

  if (error || !caseData) {
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
            <h3 className="text-lg font-semibold mb-2">Error Loading Case Details</h3>
            <p className="text-gray-500 text-center mb-4">{error}</p>
            <div className="flex gap-4">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={fetchCaseDetails}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => router.back()} variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{caseData?.title}</h1>
            <p className="text-sm text-gray-500">
              Created on {caseData ? new Date(caseData.createdAt).toLocaleDateString() : ''}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Case Overview Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Case Overview</h2>
                <p className="text-sm text-gray-500">
                  Comprehensive case information and status
                </p>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={getStatusColor(caseData?.status || '')}>
                        {caseData?.status}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Current case status</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={getPriorityColor(caseData?.priority || '')}>
                        {caseData?.priority}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Case priority level</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Badge>{caseData?.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {/* Description */}
                {caseData?.description && (
                  <motion.div
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-400" />
                      Description
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {caseData.description}
                    </p>
                  </motion.div>
                )}

                {/* Client Information */}
                <motion.div
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{caseData?.clientName}</span>
                    </div>
                    {caseData?.clientPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{caseData.clientPhone}</span>
                      </div>
                    )}
                    {caseData?.clientAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{caseData.clientAddress}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Location Details */}
                <motion.div
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    {caseData?.region && (
                      <div>
                        <span className="text-gray-500">Region:</span>
                        <span className="ml-2 font-medium">{caseData.region}</span>
                      </div>
                    )}
                    {caseData?.zone && (
                      <div>
                        <span className="text-gray-500">Zone:</span>
                        <span className="ml-2 font-medium">{caseData.zone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Wereda:</span>
                      <span className="ml-2 font-medium">{caseData?.wereda}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Kebele:</span>
                      <span className="ml-2 font-medium">{caseData?.kebele}</span>
                    </div>
                    {caseData?.houseNumber && (
                      <div>
                        <span className="text-gray-500">House Number:</span>
                        <span className="ml-2 font-medium">{caseData.houseNumber}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Assignment Information */}
                <motion.div
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    Assignment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <span className="text-gray-500">Assigned Lawyer:</span>
                      <span className="ml-2 font-medium">
                        {caseData?.assignedLawyer?.fullName || 'Not Assigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Office:</span>
                      <span className="ml-2 font-medium">{caseData?.assignedOffice?.name || 'N/A'}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  variants={slideIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-4 mt-4"
                >
                  <Button onClick={handleAssignLawyer} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assign Lawyer
                  </Button>
                  <Button onClick={handleUpdateStatus} className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Update Status
                  </Button>
                  <Button onClick={handleUpdatePriority} className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Change Priority
                  </Button>
                  <Button onClick={handleAddNote} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Add Note
                  </Button>
                  {caseData?.status === 'PENDING' && (
                    <>
                      <Button 
                        onClick={handleApproveCase}
                        disabled={submitting}
                        className="flex items-center gap-2"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Approve Case
                      </Button>
                      <Button 
                        onClick={handleRejectCase}
                        variant="destructive"
                        disabled={submitting}
                        className="flex items-center gap-2"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        Reject Case
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Notes and Activities */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="notes" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="flex-1">
                    <Activity className="h-4 w-4 mr-2" />
                    Activities
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="notes">
                  <div className="pt-4">
                    {caseData?.notes && caseData.notes.length > 0 ? (
                      <div className="space-y-4">
                        {caseData.notes.map((note) => (
                          <motion.div
                            key={note.id}
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{note.creator.fullName}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(note.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <p className="text-gray-600">{note.content}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No notes have been added yet
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="activities">
                  <div className="pt-4">
                    {caseData?.activities && caseData.activities.length > 0 ? (
                      <div className="space-y-4">
                        {caseData.activities.map((activity) => (
                          <motion.div
                            key={activity.id}
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{activity.title}</div>
                                <div className="text-sm text-gray-500">
                                  by {activity.user.fullName}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(activity.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <p className="text-gray-600">{activity.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No activities recorded yet
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </motion.div>

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