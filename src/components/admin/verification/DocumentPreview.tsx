"use client";

import { useState } from 'react';
import { HiOutlineX, HiOutlineDownload } from 'react-icons/hi';

interface DocumentPreviewProps {
  documentUrl: string;
  documentType: string;
  documentNumber: string;
  onClose: () => void;
}

export default function DocumentPreview({
  documentUrl,
  documentType,
  documentNumber,
  onClose
}: DocumentPreviewProps) {
  const [loading, setLoading] = useState(true);

  const handleDownload = async () => {
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentType}-${documentNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Document Preview
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {documentType} - {documentNumber}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <HiOutlineDownload className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg" style={{ height: '70vh' }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
              </div>
            )}
            <iframe
              src={documentUrl}
              className="w-full h-full rounded-lg"
              onLoad={() => setLoading(false)}
              title="Document Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 