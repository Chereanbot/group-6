"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlinePlus
} from 'react-icons/hi';

const mockEvidence = [
  {
    id: '1',
    title: 'Property Deed',
    type: 'document',
    format: 'PDF',
    size: '2.5 MB',
    uploadDate: '2024-03-05',
    status: 'approved',
    thumbnail: '/document-thumb.png'
  },
  {
    id: '2',
    title: 'Site Photos',
    type: 'image',
    format: 'JPG',
    size: '1.8 MB',
    uploadDate: '2024-03-06',
    status: 'pending',
    thumbnail: '/image-thumb.png'
  }
];

const EvidenceManager = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  const handleUpload = () => {
    // Handle file upload
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Evidence Manager</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and organize case evidence and documents
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg ${
              view === 'grid' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg ${
              view === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            List
          </button>
        </div>

        <button
          onClick={handleUpload}
          className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg
            hover:bg-primary-600 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span>Add Evidence</span>
        </button>
      </div>

      {/* Evidence Grid/List */}
      {view === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvidence.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs
                  ${item.status === 'approved' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                  {item.status}
                </span>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Type: {item.type}</p>
                  <p>Format: {item.format}</p>
                  <p>Size: {item.size}</p>
                  <p>Uploaded: {item.uploadDate}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-between">
                  <button className="text-primary-500 hover:text-primary-600">
                    <HiOutlineEye className="w-5 h-5" />
                  </button>
                  <button className="text-primary-500 hover:text-primary-600">
                    <HiOutlineDownload className="w-5 h-5" />
                  </button>
                  <button className="text-red-500 hover:text-red-600">
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Format</th>
                <th className="text-left p-4">Size</th>
                <th className="text-left p-4">Upload Date</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockEvidence.map((item) => (
                <tr key={item.id} className="border-b dark:border-gray-700">
                  <td className="p-4">{item.title}</td>
                  <td className="p-4">{item.type}</td>
                  <td className="p-4">{item.format}</td>
                  <td className="p-4">{item.size}</td>
                  <td className="p-4">{item.uploadDate}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs
                      ${item.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="text-primary-500 hover:text-primary-600">
                        <HiOutlineEye className="w-5 h-5" />
                      </button>
                      <button className="text-primary-500 hover:text-primary-600">
                        <HiOutlineDownload className="w-5 h-5" />
                      </button>
                      <button className="text-red-500 hover:text-red-600">
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EvidenceManager; 