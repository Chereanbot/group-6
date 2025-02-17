"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';
import {
  Search,
  FileText,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Calendar,
  MapPin,
  User,
  FileType,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
  description?: string;
  client: {
    fullName: string;
    clientProfile: {
      region: string;
      zone: string;
      wereda: string;
      kebele: string;
    };
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

    const fetchDocuments = async () => {
      try {
      const response = await fetch('/api/coordinator/documents', {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.data);
        } else {
        throw new Error(data.message);
        }
      } catch (error) {
      console.error('Error fetching documents:', error);
        toast({
          title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(document.path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.title;
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
        variant: "default",
        className: "bg-green-500 text-white"
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return null;
    }
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.client.clientProfile.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || doc.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === 'all' || doc.type.toLowerCase() === typeFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'desc'
        ? b[sortBy].localeCompare(a[sortBy])
        : a[sortBy].localeCompare(b[sortBy]);
    });

  const handleStatusUpdate = async (document: Document, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch('/api/coordinator/documents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: document.id,
          status: newStatus,
          notes: statusNotes
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the document in the local state
        setDocuments(docs => docs.map(doc => 
          doc.id === document.id ? { ...doc, status: newStatus, description: statusNotes } : doc
        ));
        setEditingStatus(false);
        setStatusNotes('');
        toast({
          title: "Success",
          description: "Document status updated successfully",
          variant: "default",
          className: "bg-green-500 text-white"
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="w-32 h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-6 transition-colors duration-300">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Document Center
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage and view all uploaded documents
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <Input
                type="search"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 
                  transition-colors duration-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw size={20} className={`transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Document Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredDocuments.map((document) => (
                        <motion.div
                key={document.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden border-indigo-100 dark:border-indigo-800/50 hover:border-indigo-200 
                  dark:hover:border-indigo-700/50 transition-all duration-300 hover:shadow-lg group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
                          <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{document.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{document.type}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(document.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(document.status)}
                          {document.status}
                        </span>
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <span>{document.client.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <span>
                          {document.client.clientProfile.region}, {document.client.clientProfile.zone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <span>Uploaded {formatDate(document.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileType size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {(document.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                            <Button
                          variant="ghost"
                              size="sm"
                          onClick={() => {
                            setSelectedDocument(document);
                            setShowPreview(true);
                          }}
                          className="hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye size={16} className="mr-1" />
                          Preview
                            </Button>
                            <Button
                          variant="ghost"
                              size="sm"
                          onClick={() => handleDownload(document)}
                          className="hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                          <Download size={16} className="mr-1" />
                              Download
                            </Button>
                          </div>
                    </div>
          </CardContent>
        </Card>
      </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Document Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="sticky top-0 z-10 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                Document Preview
              </DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <div className="p-6 space-y-6">
                <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <div className="aspect-[16/9] md:aspect-[21/9]">
                    {selectedDocument.mimeType.startsWith('image/') ? (
                      <img
                        src={selectedDocument.path}
                        alt={selectedDocument.title}
                        className="w-full h-full object-contain"
                      />
                    ) : selectedDocument.mimeType.startsWith('application/pdf') ? (
                      <iframe
                        src={selectedDocument.path}
                        className="w-full h-full"
                        title={selectedDocument.title}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <FileText className="h-16 w-16 text-slate-400" />
                        <p className="mt-2 text-slate-500">Preview not available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{selectedDocument.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{selectedDocument.type}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Client</p>
                          <p className="text-slate-900 dark:text-slate-100 mt-1">{selectedDocument.client.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Location</p>
                          <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {selectedDocument.client.clientProfile.region}, {selectedDocument.client.clientProfile.zone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</p>
                        {!editingStatus ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingStatus(true)}
                            className="text-indigo-600 dark:text-indigo-400"
                          >
                            Edit Status
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStatus(false);
                              setStatusNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      {editingStatus ? (
                        <div className="space-y-4">
                          <Select
                            defaultValue={selectedDocument.status}
                            onValueChange={(value) => handleStatusUpdate(selectedDocument, value)}
                            disabled={updatingStatus}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="APPROVED">Approved</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="space-y-2">
                            <Label htmlFor="statusNotes">Notes</Label>
                            <Textarea
                              id="statusNotes"
                              placeholder="Add notes about the status change..."
                              value={statusNotes}
                              onChange={(e) => setStatusNotes(e.target.value)}
                              className="h-24 resize-none"
                              disabled={updatingStatus}
                            />
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className={`${getStatusColor(selectedDocument.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(selectedDocument.status)}
                            {selectedDocument.status}
                          </span>
                        </Badge>
                      )}
                    </div>
                    {selectedDocument.description && (
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Notes</p>
                        <p className="text-slate-900 dark:text-slate-100 mt-2">{selectedDocument.description}</p>
                      </div>
                    )}
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">File Details</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileType size={16} className="text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Size: {(selectedDocument.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Type: {selectedDocument.mimeType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Uploaded: {formatDate(selectedDocument.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 flex justify-end gap-2 pt-4 mt-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(selectedDocument)}
                    className="gap-2"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setShowPreview(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 