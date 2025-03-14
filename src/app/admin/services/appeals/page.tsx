"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Loader2, 
  FileText, 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarPlus,
  Gavel
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Appeal {
  id: string;
  title: string;
  description: string;
  status: string;
  filedDate: string;
  hearingDate: string | null;
  decidedAt: string | null;
  decision: string | null;
  notes: string | null;
  case: {
    title: string;
    status: string;
    lawyer: {
      name: string;
      email: string;
    };
  };
  documentCount: number;
  documents: Array<{
    title: string;
    path: string;
  }>;
  nextHearing: {
    scheduledDate: string;
    location: string;
    status: string;
  } | null;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [decision, setDecision] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }
    fetchAppeals();
  }, [filter, page]);

  async function fetchAppeals() {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      if (filter !== "ALL") queryParams.append("status", filter);

      const response = await fetch(`/api/admin/appeals?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch appeals");

      const data = await response.json();
      setAppeals(data.appeals);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appeals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(appeal: Appeal, newStatus: 'SCHEDULED' | 'HEARD' | 'DECIDED' | 'WITHDRAWN') {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/appeals?id=${appeal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          decision: newStatus === 'DECIDED' ? 'Appeal has been reviewed and decided.' : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appeal status');
      }

      toast({
        title: 'Success',
        description: 'Appeal status updated successfully',
      });

      // Refresh the appeals list
      fetchAppeals();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appeal status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleNotesUpdate(appealId: string, notes: string) {
    try {
      setIsUpdatingNotes(true);
      const response = await fetch(`/api/admin/appeals?id=${appealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appeal notes');
      }

      toast({
        title: 'Success',
        description: 'Appeal notes updated successfully',
      });

      fetchAppeals();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appeal notes',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingNotes(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'HEARD':
        return 'bg-purple-100 text-purple-800';
      case 'DECIDED':
        return 'bg-green-100 text-green-800';
      case 'WITHDRAWN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appeals Management</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Appeals</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="HEARD">Heard</SelectItem>
            <SelectItem value="DECIDED">Decided</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Lawyer</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Filed Date</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appeals.map((appeal) => (
              <TableRow key={appeal.id}>
                <TableCell className="font-medium">
                  {appeal.title}
                  <p className="text-sm text-muted-foreground">
                    {appeal.description}
                  </p>
                </TableCell>
                <TableCell>
                  <p>{appeal.case.lawyer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {appeal.case.lawyer.email}
                  </p>
                </TableCell>
                <TableCell>
                  {appeal.case.title}
                  <Badge variant="outline" className="ml-2">
                    {appeal.case.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(appeal.status)}>
                      {appeal.status}
                    </Badge>
                    {appeal.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(appeal, 'SCHEDULED')}
                          disabled={isUpdating}
                        >
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(appeal, 'WITHDRAWN')}
                          disabled={isUpdating}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Withdraw
                        </Button>
                      </div>
                    )}
                    {appeal.status === 'SCHEDULED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(appeal, 'HEARD')}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Heard
                      </Button>
                    )}
                    {appeal.status === 'HEARD' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(appeal, 'DECIDED')}
                        disabled={isUpdating}
                      >
                        <Gavel className="h-4 w-4 mr-2" />
                        Make Decision
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(appeal.filedDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    {appeal.documentCount} docs
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Appeal Details</DialogTitle>
                        <DialogDescription>
                          Comprehensive view of the appeal and its current status
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl">{appeal.title}</CardTitle>
                            <CardDescription>
                              Filed on {format(new Date(appeal.filedDate), "PPP")}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Status Information</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(appeal.status)}>
                                      {appeal.status}
                                    </Badge>
                                  </div>
                                  {appeal.decidedAt && (
                                    <p className="text-sm text-muted-foreground">
                                      Decided on: {format(new Date(appeal.decidedAt), "PPP")}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Lawyer Information</h4>
                                <div className="space-y-1">
                                  <p className="text-sm">{appeal.case.lawyer.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {appeal.case.lawyer.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Case Details</h4>
                              <p className="text-sm">{appeal.description}</p>
                            </div>

                            {appeal.nextHearing && (
                              <div>
                                <h4 className="font-semibold mb-2">Next Hearing</h4>
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    Date: {format(new Date(appeal.nextHearing.scheduledDate), "PPP")}
                                  </p>
                                  <p className="text-sm">Location: {appeal.nextHearing.location}</p>
                                  <Badge variant="outline">{appeal.nextHearing.status}</Badge>
                                </div>
                              </div>
                            )}

                            {appeal.decision && (
                              <div>
                                <h4 className="font-semibold mb-2">Decision</h4>
                                <p className="text-sm">{appeal.decision}</p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-semibold mb-2">Documents</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {appeal.documents.map((doc) => (
                                  <a
                                    key={doc.title}
                                    href={doc.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted transition-colors"
                                  >
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm truncate">{doc.title}</span>
                                  </a>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Notes</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNotesUpdate(appeal.id, notes)}
                                  disabled={isUpdatingNotes}
                                >
                                  Save Notes
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Add notes about this appeal..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {appeal.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleStatusUpdate(appeal, 'SCHEDULED')}
                              disabled={isUpdating}
                            >
                              <CalendarPlus className="h-4 w-4 mr-2" />
                              Schedule Hearing
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleStatusUpdate(appeal, 'WITHDRAWN')}
                              disabled={isUpdating}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Withdraw Appeal
                            </Button>
                          </div>
                        )}

                        {appeal.status === 'SCHEDULED' && (
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              onClick={() => handleStatusUpdate(appeal, 'HEARD')}
                              disabled={isUpdating}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Heard
                            </Button>
                          </div>
                        )}

                        {appeal.status === 'HEARD' && (
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              onClick={() => handleStatusUpdate(appeal, 'DECIDED')}
                              disabled={isUpdating}
                            >
                              <Gavel className="h-4 w-4 mr-2" />
                              Make Decision
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {appeals.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No appeals found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {page} of {pagination.totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={page === pagination.totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 