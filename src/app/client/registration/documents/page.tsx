"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineX,
  HiOutlineInformationCircle,
  HiOutlineDownload,
  HiOutlineTrash
} from 'react-icons/hi';
import { toast } from '@/components/ui/use-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'required' | 'uploaded' | 'verified' | 'rejected';
  description: string;
  uploadedAt?: string;
  fileSize?: string;
  path?: string;
}

const DocumentUploadCard = ({ 
  document, 
  onUpload,
  onDelete 
}: { 
  document: Document; 
  onUpload: (id: string, file: File) => void;
  onDelete: (id: string) => void;
}) => {
  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'required':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
      case 'uploaded':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900';
      case 'verified':
        return 'text-green-500 bg-green-100 dark:bg-green-900';
      case 'rejected':
        return 'text-red-500 bg-red-100 dark:bg-red-900';
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'required':
        return <HiOutlineExclamation className="w-5 h-5" />;
      case 'uploaded':
        return <HiOutlineUpload className="w-5 h-5" />;
      case 'verified':
        return <HiOutlineCheck className="w-5 h-5" />;
      case 'rejected':
        return <HiOutlineX className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <HiOutlineDocumentText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{document.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{document.description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(document.status)}
            <span className="capitalize">{document.status}</span>
          </div>
        </div>
      </div>

      {document.uploadedAt && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
          <span>{document.fileSize}</span>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <label className="flex-1">
          <input
            type="file"
            className="hidden"
            accept={document.type}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(document.id, file);
            }}
          />
          <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed 
                        border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer
                        hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
            <HiOutlineUpload className="w-5 h-5 mr-2 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {document.status === 'required' ? 'Upload Document' : 'Replace Document'}
            </span>
          </div>
        </label>

        {document.status === 'uploaded' && (
          <>
            <button 
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
              onClick={() => window.open(document.path, '_blank')}
            >
              <HiOutlineDownload className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
              onClick={() => onDelete(document.id)}
            >
              <HiOutlineTrash className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Government-issued ID',
      type: 'image/*,.pdf',
      status: 'required',
      description: 'Valid passport, driver\'s license, or national ID card'
    },
    {
      id: '2',
      name: 'Proof of Address',
      type: '.pdf',
      status: 'uploaded',
      description: 'Utility bill or bank statement (not older than 3 months)',
      uploadedAt: '2024-01-15',
      fileSize: '2.4 MB'
    },
    {
      id: '3',
      name: 'Case Documentation',
      type: '.pdf,.doc,.docx',
      status: 'verified',
      description: 'Any relevant documents related to your case',
      uploadedAt: '2024-01-10',
      fileSize: '1.8 MB'
    },
    {
      id: '4',
      name: 'Power of Attorney',
      type: '.pdf',
      status: 'rejected',
      description: 'Signed power of attorney document',
      uploadedAt: '2024-01-05',
      fileSize: '1.2 MB'
    }
  ]);

  const handleUpload = async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('type', documents.find(d => d.id === id)?.type || 'OTHER');
      formData.append('description', documents.find(d => d.id === id)?.description || '');

      const response = await fetch('/api/client/documents', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload document');
      }

      const uploadedDoc = await response.json();

      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { 
          ...doc, 
          status: 'uploaded' as const,
          uploadedAt: new Date().toISOString(),
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          path: uploadedDoc.path
        } : doc
      ));

      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded and is pending verification.",
        duration: 3000
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/client/documents?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete document');
      }

      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { ...doc, status: 'required' as const } : doc
      ));

      toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted.",
        duration: 3000
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-0"
    >
      <div className="max-w-full space-y-6 px-4 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Required Documents</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please upload all required documents for your registration
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <HiOutlineInformationCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Document Requirements</h4>
              <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Files must be in PDF, DOC, DOCX, or image format</li>
                <li>• Maximum file size: 10MB per document</li>
                <li>• Documents must be clear and legible</li>
                <li>• All pages must be included in a single file</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {documents.map(document => (
            <DocumentUploadCard
              key={document.id}
              document={document}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 
                     dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                     rounded-lg transition-colors duration-200"
          >
            Back
          </button>
          <button
            onClick={() => {
              const allUploaded = documents.every(doc => doc.status !== 'required');
              if (allUploaded) {
                toast({
                  title: "Documents Submitted",
                  description: "All your documents have been submitted for review.",
                  duration: 3000
                });
              } else {
                toast({
                  title: "Missing Documents",
                  description: "Please upload all required documents before proceeding.",
                  variant: "destructive"
                });
              }
            }}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 
                     rounded-lg transition-colors duration-200"
          >
            Submit Documents
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentsPage; 