"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentText,
  HiOutlineDocumentDuplicate,
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePlus
} from 'react-icons/hi';

interface Document {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  dateSubmitted: string;
  lastModified: string;
  size: string;
  version: number;
  comments?: string;
}

const mockDocuments: Document[] = [
  {
    id: 'doc1',
    title: 'Affidavit of Support',
    category: 'Legal Forms',
    status: 'approved',
    dateSubmitted: '2024-03-01',
    lastModified: '2024-03-05',
    size: '1.2 MB',
    version: 2
  },
  {
    id: 'doc2',
    title: 'Evidence Statement',
    category: 'Evidence',
    status: 'pending',
    dateSubmitted: '2024-03-07',
    lastModified: '2024-03-07',
    size: '2.5 MB',
    version: 1,
    comments: 'Awaiting review by legal team'
  }
];

const DocumentManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = ['Legal Forms', 'Evidence', 'Court Orders', 'Correspondence'];
  const statuses = ['all', 'pending', 'approved', 'rejected', 'expired'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Document Manager</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and track your case-related documents
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg
              hover:bg-primary-600 transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left p-4">Document</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date Submitted</th>
                <th className="text-left p-4">Version</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockDocuments.map((doc) => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <HiOutlineDocumentText className="w-6 h-6 text-primary-500" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{doc.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p>{doc.dateSubmitted}</p>
                      <p className="text-sm text-gray-500">
                        Last modified: {doc.lastModified}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      v{doc.version}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Download">
                        <HiOutlineDownload className="w-5 h-5 text-primary-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Version History">
                        <HiOutlineDocumentDuplicate className="w-5 h-5 text-primary-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Delete">
                        <HiOutlineTrash className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Document Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500">
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                <div className="text-center">
                  <HiOutlineUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-primary-500 hover:text-primary-600">
                        Upload a file
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg
                    hover:bg-primary-600 transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager; 