"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { FileText, Download, Trash2, UploadCloud } from "lucide-react";

export default function CaseDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, [params.id]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coordinator/cases/${params.id}/documents`);
      const data = await res.json();
      if (data.success) setDocuments(data.data);
      else toast.error(data.error || "Failed to fetch documents");
    } catch (e) {
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/coordinator/cases/${params.id}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Document uploaded");
        fetchDocuments();
      } else {
        toast.error(data.error || "Failed to upload document");
      }
    } catch (e) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/coordinator/cases/${params.id}/documents?docId=${docId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Document deleted");
        setDocuments((docs) => docs.filter((d) => d.id !== docId));
      } else {
        toast.error(data.error || "Failed to delete document");
      }
    } catch (e) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Case Documents</CardTitle>
          <CardDescription>All documents related to this case</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 items-center">
            <Input type="file" ref={fileInputRef} onChange={handleUpload} disabled={uploading} className="max-w-xs" />
            <Button onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={uploading} variant="outline">
              <UploadCloud className="w-4 h-4 mr-2" /> Upload
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" /> {doc.name}
                  </TableCell>
                  <TableCell>{doc.uploadedBy?.fullName || "-"}</TableCell>
                  <TableCell>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "-"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button asChild variant="ghost" size="icon">
                      <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">No documents found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 