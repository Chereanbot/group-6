"use client";

import { useState, useEffect } from 'react';
import { 
  HiOutlineDocument,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye
} from 'react-icons/hi';
import { format } from 'date-fns';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string;
  };
  tags: string[];
}

interface DocumentListProps {
  folderId: string | null;
  view: 'grid' | 'list';
}

export default function DocumentList({ folderId, view }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [folderId]);

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/admin/documents${folderId ? `?folderId=${folderId}` : ''}`);
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return view === 'grid' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <HiOutlineDocument className="w-8 h-8 text-primary-500" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <HiOutlineDownload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <HiOutlinePencil className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Updated {format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
              </div>
              {doc.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {/* Table implementation */}
      </table>
    </div>
  );
} 