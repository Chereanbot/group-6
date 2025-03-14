"use client";

import { useState, useEffect } from "react";
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
  Download,
  Eye,
  Pencil,
  Trash,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

interface Appeal {
  id: string;
  title: string;
  description: string;
  status: string;
  filedDate: string;
  hearingDate: string | null;
  decidedAt: string | null;
  decision: string | null;
  case: {
    title: string;
    status: string;
  };
  documentCount: number;
  nextHearing: {
    scheduledDate: string;
    location: string;
    status: string;
  } | null;
  createdAt: string;
  documents?: { title: string; path: string }[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function AppealsList() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [additionalRequest, setAdditionalRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAppeals();
  }, [filter, pagination.page]);

  async function fetchAppeals() {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (filter !== "ALL") queryParams.append("status", filter);

      const response = await fetch(`/api/lawyer/cases/appeals?${queryParams.toString()}`);
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

  async function handleDelete(appealId: string) {
    try {
      const response = await fetch(`/api/lawyer/cases/appeals?id=${appealId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete appeal");
      }

      toast({
        title: "Success",
        description: "Appeal deleted successfully",
      });

      fetchAppeals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appeal",
        variant: "destructive",
      });
    }
  }

  function handleEdit(appealId: string) {
    router.push(`/lawyer/cases/appeals?id=${appealId}`);
  }

  async function handleAdditionalRequest(appealId: string) {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/lawyer/cases/appeals/${appealId}/additional-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          additionalRequest: additionalRequest.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit additional request');
      }

      toast({
        title: 'Success',
        description: 'Your additional request has been submitted successfully',
      });

      setAdditionalRequest("");
      setSelectedAppeal(null);
      fetchAppeals();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit additional request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "DECIDED":
        return "bg-green-100 text-green-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHearingStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "POSTPONED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Your appeal is being reviewed by the law school";
      case "SCHEDULED":
        return "Your appeal has been scheduled for hearing";
      case "HEARD":
        return "Your appeal has been heard and is awaiting decision";
      case "DECIDED":
        return "The law school has made a decision on your appeal";
      case "WITHDRAWN":
        return "This appeal has been withdrawn";
      default:
        return "";
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
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Appeals</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Filed Date</TableHead>
              <TableHead>Next Hearing</TableHead>
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
                  {appeal.case.title}
                  <Badge variant="outline" className="ml-2">
                    {appeal.case.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge className={getStatusColor(appeal.status)}>
                      {appeal.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {getStatusMessage(appeal.status)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(appeal.filedDate), "PPP")}
                </TableCell>
                <TableCell>
                  {appeal.nextHearing ? (
                    <div>
                      <p>{format(new Date(appeal.nextHearing.scheduledDate), "PPP")}</p>
                      <Badge className={getHearingStatusColor(appeal.nextHearing.status)}>
                        {appeal.nextHearing.status}
                      </Badge>
                    </div>
                  ) : (
                    "No hearing scheduled"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    {appeal.documentCount} docs
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Appeal Details</DialogTitle>
                          <DialogDescription>
                            View appeal details and submit additional requests if needed
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Status</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(appeal.status)}>
                                {appeal.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {getStatusMessage(appeal.status)}
                              </span>
                            </div>
                          </div>

                          {appeal.decision && (
                            <div>
                              <h4 className="font-semibold mb-2">Decision</h4>
                              <p className="text-sm">{appeal.decision}</p>
                            </div>
                          )}

                          {appeal.status === 'DECIDED' && (
                            <div className="space-y-2">
                              <h4 className="font-semibold">Submit Additional Request</h4>
                              <p className="text-sm text-muted-foreground">
                                You can submit an additional request for referral to other offices or request new court dates
                              </p>
                              <Textarea
                                placeholder="Enter your additional request here..."
                                value={additionalRequest}
                                onChange={(e) => setAdditionalRequest(e.target.value)}
                                className="min-h-[100px]"
                              />
                              <Button
                                onClick={() => handleAdditionalRequest(appeal.id)}
                                disabled={isSubmitting || !additionalRequest.trim()}
                              >
                                Submit Request
                              </Button>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold mb-2">Documents</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {appeal.documents?.map((doc) => (
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
                        </div>
                      </DialogContent>
                    </Dialog>

                    {appeal.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/lawyer/cases/appeals?id=${appeal.id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
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