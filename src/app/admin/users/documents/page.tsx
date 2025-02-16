"use client";

import { useState } from 'react';
import { 
  HiOutlineFolder, 
  HiOutlineDocument, 
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineUpload
} from 'react-icons/hi';
import DocumentList from '@/components/admin/documents/DocumentList';
import FolderList from '@/components/admin/documents/FolderList';
import DocumentUpload from '@/components/admin/documents/DocumentUpload';
import DocumentFilters from '@/components/admin/documents/DocumentFilters';

export default function DocumentsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Document Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <HiOutlineUpload className="w-5 h-5 mr-2" />
            Upload Documents
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1">
          <FolderList 
            selectedFolder={selectedFolder}
            onFolderSelect={setSelectedFolder}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <DocumentFilters />
          </div>

          <DocumentList 
            folderId={selectedFolder}
            view={view}
          />
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUpload
          folderId={selectedFolder}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
} 