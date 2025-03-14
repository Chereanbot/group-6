"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiOutlineDocumentDownload, HiOutlineDocumentSearch, HiOutlineFilter } from 'react-icons/hi';
import { adminStyles } from '@/styles/admin';
import { DocumentStatus } from '@prisma/client';

interface Document {
  id: string;
  title: string;
  type: string;
  status: DocumentStatus;
  uploadedBy: {
    id: string;
    fullName: string;
    email: string;
  };
  verifiedBy?: {
    id: string;
    fullName: string;
  };
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  category: string;
  size: number;
  mimeType: string;
}

interface DocumentFilter {
  status?: DocumentStatus[];
  type?: string[];
  category?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DocumentFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status?.length) {
        filters.status.forEach(status => queryParams.append('status', status));
      }
      if (filters.type?.length) {
        filters.type.forEach(type => queryParams.append('type', type));
      }
      if (filters.category?.length) {
        filters.category.forEach(category => queryParams.append('category', category));
      }
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.start.toISOString());
        queryParams.append('endDate', filters.dateRange.end.toISOString());
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const response = await fetch(`/api/admin/documents?${queryParams}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load documents');
      }

      setDocuments(data.data.documents);
      setStats(data.data.stats);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (documentId: string, status: DocumentStatus, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${documentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to verify document');
      }

      toast.success('Document status updated successfully');
      loadDocuments();
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to update document status');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(`/api/admin/documents/${document.id}/download`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [filters]);

  if (loading) {
    return (
      <div className={adminStyles.loading.container}>
        <div className={adminStyles.loading.spinner} />
      </div>
    );
  }

  return (
    <div className={adminStyles.container}>
      {/* Header */}
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Document Management</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${adminStyles.button.base} ${adminStyles.button.secondary}`}
        >
          <HiOutlineFilter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={adminStyles.stats.card}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <HiOutlineDocumentSearch className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className={adminStyles.stats.title}>Total Documents</p>
              <p className={adminStyles.stats.value}>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className={adminStyles.stats.card}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-500 text-white">
              <HiOutlineDocumentSearch className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className={adminStyles.stats.title}>Pending Review</p>
              <p className={adminStyles.stats.value}>{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className={adminStyles.stats.card}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <HiOutlineDocumentSearch className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className={adminStyles.stats.title}>Verified</p>
              <p className={adminStyles.stats.value}>{stats.verified}</p>
            </div>
          </div>
        </div>
        <div className={adminStyles.stats.card}>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500 text-white">
              <HiOutlineDocumentSearch className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className={adminStyles.stats.title}>Rejected</p>
              <p className={adminStyles.stats.value}>{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`${adminStyles.card} mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={adminStyles.form.label}>Status</label>
              <select
                className={adminStyles.form.select}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value ? [e.target.value as DocumentStatus] : undefined
                }))}
              >
                <option value="">All Status</option>
                {Object.values(DocumentStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={adminStyles.form.label}>Search</label>
              <input
                type="text"
                className={adminStyles.form.input}
                placeholder="Search by title, uploader..."
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  search: e.target.value || undefined
                }))}
              />
            </div>
            <div>
              <label className={adminStyles.form.label}>Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className={adminStyles.form.input}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: new Date(e.target.value),
                      end: prev.dateRange?.end || new Date()
                    }
                  }))}
                />
                <input
                  type="date"
                  className={adminStyles.form.input}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: prev.dateRange?.start || new Date(),
                      end: new Date(e.target.value)
                    }
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className={adminStyles.table.container}>
        <table className={adminStyles.table.table}>
          <thead className={adminStyles.table.header}>
            <tr>
              <th className={adminStyles.table.headerCell}>Document</th>
              <th className={adminStyles.table.headerCell}>Uploaded By</th>
              <th className={adminStyles.table.headerCell}>Status</th>
              <th className={adminStyles.table.headerCell}>Date</th>
              <th className={adminStyles.table.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={adminStyles.table.body}>
            {documents.map((document) => (
              <tr key={document.id} className={adminStyles.table.row}>
                <td className={adminStyles.table.cell}>
                  <div className="flex items-center">
                    <HiOutlineDocumentDownload className="w-5 h-5 mr-2 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {document.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {document.type} • {(document.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                </td>
                <td className={adminStyles.table.cell}>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {document.uploadedBy.fullName}
                    </div>
                    <div className="text-gray-500">{document.uploadedBy.email}</div>
                  </div>
                </td>
                <td className={adminStyles.table.cell}>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                    ${document.status === DocumentStatus.PENDING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    document.status === DocumentStatus.APPROVED ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {document.status}
                  </span>
                </td>
                <td className={adminStyles.table.cell}>
                  <div className="text-sm text-gray-500">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className={adminStyles.table.cell}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(document)}
                      className={`${adminStyles.button.base} ${adminStyles.button.secondary}`}
                    >
                      Download
                    </button>
                    {document.status === DocumentStatus.PENDING && (
                      <>
                        <button
                          onClick={() => handleVerify(document.id, DocumentStatus.APPROVED)}
                          className={`${adminStyles.button.base} ${adminStyles.button.primary}`}
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleVerify(document.id, DocumentStatus.REJECTED)}
                          className={`${adminStyles.button.base} ${adminStyles.button.danger}`}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 