"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineDocumentText,
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
  status: 'pending' | 'approved' | 'rejected';
  dateSubmitted: string;
  size: string;
  comments?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Case Evidence Statement',
    category: 'Evidence',
    status: 'pending',
    dateSubmitted: '2024-03-10',
    size: '2.4 MB',
    comments: 'Awaiting review by legal team'
  },
  {
    id: '2',
    title: 'Witness Testimony',
    category: 'Testimony',
    status: 'approved',
    dateSubmitted: '2024-03-08',
    size: '1.8 MB'
  }
];

const DocumentSubmission = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = ['Evidence', 'Testimony', 'Legal Forms', 'Court Orders'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Document Submission</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit and manage your case-related documents
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                focus:ring-2 focus:ring-primary-500"
            />
            <HiOutlineSearch className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg
            hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span>Upload Document</span>
        </motion.button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents
          .filter(doc => 
            (selectedCategory === 'all' || doc.category === selectedCategory) &&
            doc.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm
                border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <HiOutlineDocumentText className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {doc.category}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <HiOutlineClock className="w-4 h-4" />
                  <span>Submitted: {doc.dateSubmitted}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HiOutlineDocumentText className="w-4 h-4" />
                  <span>Size: {doc.size}</span>
                </div>
                {doc.comments && (
                  <div className="flex items-start space-x-2">
                    <HiOutlineExclamation className="w-4 h-4 mt-0.5" />
                    <span>{doc.comments}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <HiOutlineDownload className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg
                  text-gray-600 dark:text-gray-400 hover:text-red-500">
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upload Document</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400
                    dark:hover:text-gray-200"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Document Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200
                      dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter document title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-200
                    dark:border-gray-700 focus:ring-2 focus:ring-primary-500">
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600
                  rounded-lg p-8">
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
                    className="px-4 py-2 text-gray-600 dark:text-gray-400
                      hover:text-gray-800 dark:hover:text-gray-200"
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
      </AnimatePresence>
    </div>
  );
};

export default DocumentSubmission; 