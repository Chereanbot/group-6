"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Upload, Trash2, Download, FileText, RefreshCw, User, Briefcase, FilePlus2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from '@/components/ui/modal';

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: string;
  uploadedBy: string;
  user?: { fullName: string };
  serviceRequest?: { title: string };
}

interface DocumentDetail extends Document {
  description?: string;
  user?: { fullName: string; email: string; phone: string };
  serviceRequest?: { title: string };
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reuploadId, setReuploadId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<DocumentDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const reuploadInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/client/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Fetch document details for view modal
  useEffect(() => {
    if (!viewId) return;
    setViewLoading(true);
    setViewError(null);
    setViewDoc(null);
    fetch(`/api/client/documents/${viewId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch document');
        setViewDoc(data.data);
      })
      .catch((err) => setViewError(err.message))
      .finally(() => setViewLoading(false));
  }, [viewId]);

  // Upload new document
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setUploading(true);
    try {
      const res = await fetch("/api/client/documents", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Upload failed");
      toast({ title: "Document uploaded" });
      form.reset();
      fetchDocuments();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Re-upload document
  const handleReupload = async (e: React.FormEvent<HTMLFormElement>, docId: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setUploading(true);
    try {
      // For demo: just delete and re-upload (replace with PATCH in real app)
      await fetch(`/api/client/documents?id=${docId}`, { method: "DELETE" });
      const res = await fetch("/api/client/documents", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Re-upload failed");
      toast({ title: "Document re-uploaded" });
      setReuploadId(null);
      fetchDocuments();
    } catch (err: any) {
      toast({ title: "Re-upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setUploading(true);
    try {
      const res = await fetch(`/api/client/documents?id=${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Document deleted" });
      fetchDocuments();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Download/View document
  const handleDownload = (doc: Document) => {
    window.open(doc.path, "_blank");
  };

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="w-6 h-6 text-primary" /> Client Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-4 items-end mb-6" onSubmit={handleUpload}>
            <Input name="title" placeholder="Document Title" required className="w-48" />
            <Input name="type" placeholder="Type (e.g. IDENTIFICATION)" required className="w-48" />
            <Input name="file" type="file" required className="w-64" ref={fileInputRef} />
            <Button type="submit" disabled={uploading} className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload
            </Button>
          </form>
          <div className="overflow-x-auto rounded-lg border dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded Date</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Case Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-red-500">{error}</TableCell>
                    </TableRow>
                  ) : documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No documents found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="border-b dark:border-gray-800"
                      >
                        <TableCell>{doc.title}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{format(new Date(doc.createdAt), 'yyyy-MM-dd')}</TableCell>
                        <TableCell><User className="inline w-4 h-4 mr-1" /> {doc.user?.fullName || "Me"}</TableCell>
                        <TableCell><Briefcase className="inline w-4 h-4 mr-1" /> {doc.serviceRequest?.title || "-"}</TableCell>
                        <TableCell>{doc.status}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleDownload(doc)} title="Download/View">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setViewId(doc.id)} title="View">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setReuploadId(doc.id)} title="Re-upload">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(doc.id)} title="Delete">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
        </div>
                          {/* View Modal */}
                          {viewId === doc.id && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Document Details</h3>
                                {viewLoading ? (
                                  <div className="flex flex-col items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                                    <div>Loading...</div>
            </div>
                                ) : viewError ? (
                                  <div className="text-red-500">{viewError}</div>
                                ) : viewDoc ? (
                                  <div className="space-y-3">
                                    <div><span className="font-semibold">Title:</span> {viewDoc.title}</div>
                                    <div><span className="font-semibold">Type:</span> {viewDoc.type}</div>
                                    <div><span className="font-semibold">Status:</span> {viewDoc.status}</div>
                                    <div><span className="font-semibold">Uploaded:</span> {format(new Date(viewDoc.createdAt), 'yyyy-MM-dd')}</div>
                                    {viewDoc.description && <div><span className="font-semibold">Description:</span> {viewDoc.description}</div>}
                                    <div><span className="font-semibold">Client:</span> {viewDoc.user?.fullName} ({viewDoc.user?.email}, {viewDoc.user?.phone})</div>
                                    <div><span className="font-semibold">Case:</span> {viewDoc.serviceRequest?.title || '-'}</div>
                                    <div className="flex gap-2 mt-2">
                                      <Button asChild variant="outline">
                                        <a href={viewDoc.path} target="_blank" rel="noopener noreferrer"><Download className="w-4 h-4" /> Download</a>
                                      </Button>
                                      <Button variant="outline" onClick={() => setViewId(null)}>Close</Button>
          </div>
        </div>
                                ) : null}
                              </motion.div>
        </div>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
        </div>
        </CardContent>
      </Card>
      </div>
  );
} 