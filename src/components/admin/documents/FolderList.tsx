"use client";

import { useState, useEffect } from 'react';
import { HiOutlineFolder, HiOutlinePlus } from 'react-icons/hi';

interface Folder {
  id: string;
  name: string;
  documentsCount: number;
}

interface FolderListProps {
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

export default function FolderList({ selectedFolder, onFolderSelect }: FolderListProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/admin/documents/folders');
      const data = await response.json();
      setFolders(data.folders);
    } catch (error) {
      console.error('Failed to load folders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Folders</h2>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <HiOutlinePlus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <div className="p-2">
        <button
          onClick={() => onFolderSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-lg ${
            selectedFolder === null
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          All Documents
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderSelect(folder.id)}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
              selectedFolder === folder.id
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <HiOutlineFolder className="w-5 h-5 mr-2" />
              {folder.name}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {folder.documentsCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 