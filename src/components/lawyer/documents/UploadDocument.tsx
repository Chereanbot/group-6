"use client";

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { showToast } from '@/utils/toast';

export default function UploadDocument() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [caseId, setCaseId] = useState('');

  const handleUpload = async () => {
    if (!file || !documentType) {
      showToast('Please select a file and document type', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);
      if (caseId) formData.append('caseId', caseId);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      showToast('Document uploaded successfully', 'success');
      setIsOpen(false);
      setFile(null);
      setDocumentType('');
      setCaseId('');
    } catch (error) {
      showToast('Failed to upload document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Document Type</label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
            >
              <option value="">Select Type</option>
              <option value="CASE_DOCUMENT">Case Document</option>
              <option value="TEMPLATE">Template</option>
              <option value="LEGAL_RESEARCH">Legal Research</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File</label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.txt"
            />
          </div>

          {documentType === 'CASE_DOCUMENT' && (
            <div>
              <label className="block text-sm font-medium mb-1">Related Case</label>
              <Select
                value={caseId}
                onValueChange={setCaseId}
              >
                <option value="">Select Case</option>
                {/* Add case options here */}
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 