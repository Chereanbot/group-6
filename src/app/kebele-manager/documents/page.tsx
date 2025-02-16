"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineFolder,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineTag
} from 'react-icons/hi';

interface Document {
  id: string;
  title: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  status: 'ACTIVE' | 'ARCHIVED';
  tags: string[];
  description: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Resident Registration Form Template',
    type: 'PDF',
    category: 'Templates',
    uploadedBy: 'Admin',
    uploadDate: '2024-02-15',
    fileSize: '245 KB',
    status: 'ACTIVE',
    tags: ['template', 'registration', 'form'],
    description: 'Standard template for new resident registration'
  },
  {
    id: '2',
    title: 'Monthly Report - January 2024',
    type: 'XLSX',
    category: 'Reports',
    uploadedBy: 'Manager',
    uploadDate: '2024-02-01',
    fileSize: '1.2 MB',
    status: 'ACTIVE',
    tags: ['report', 'monthly', 'statistics'],
    description: 'Monthly activity and statistics report'
  },
  {
    id: '3',
    title: 'ID Card Design Guidelines',
    type: 'PDF',
    category: 'Guidelines',
    uploadedBy: 'Admin',
    uploadDate: '2024-01-20',
    fileSize: '500 KB',
    status: 'ARCHIVED',
    tags: ['guidelines', 'id-card', 'design'],
    description: 'Official guidelines for ID card design and issuance'
  }
];

const categories = [
  'All Documents',
  'Templates',
  'Reports',
  'Guidelines',
  'Forms',
  'Certificates'
];

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Documents');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Implement category filter logic here
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'text-red-500';
      case 'xlsx':
        return 'text-green-500';
      case 'docx':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Document Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and organize all kebele documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
            transition-colors duration-200 flex items-center gap-2"
        >
          <HiOutlineUpload className="h-5 w-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search and Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap
              ${selectedCategory === category
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <HiOutlineFolder className="inline-block h-4 w-4 mr-2" />
            {category}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${getFileIcon(doc.type)}`}>
                  <HiOutlineDocumentText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {doc.title}
                  </h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <HiOutlineCalendar className="h-4 w-4 mr-1" />
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <HiOutlineUser className="h-4 w-4 mr-1" />
                      {doc.uploadedBy}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs
                          bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        <HiOutlineTag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedDocument(doc)}
                className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 
                  dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HiOutlineEye className="h-5 w-5" />
              </button>
              <button className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 
                dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <HiOutlineDownload className="h-5 w-5" />
              </button>
              <button className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 
                dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <HiOutlineTrash className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Document Details
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  View complete information about the document
                </p>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedDocument.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedDocument.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedDocument.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">File Type</h3>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedDocument.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Upload Date</h3>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">File Size</h3>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedDocument.fileSize}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs
                        bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      <HiOutlineTag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 
                  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                transition-colors duration-200 flex items-center gap-2">
                <HiOutlineDownload className="h-5 w-5" />
                Download
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 