"use client";

import { useState, useRef } from 'react';
import { HiOutlineUpload, HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface UploadProps {
  folderId: string | null;
  onClose: () => void;
}

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

export default function DocumentUpload({ folderId, onClose }: UploadProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newUploads = files.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setUploads([...uploads, ...newUploads]);
  };

  const handleUpload = async () => {
    for (const upload of uploads) {
      if (upload.status !== 'pending') continue;

      try {
        const formData = new FormData();
        formData.append('file', upload.file);
        formData.append('folderId', folderId || '');
        formData.append('tags', JSON.stringify(tags));

        const response = await fetch('/api/admin/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file
              ? { ...u, status: 'complete', progress: 100 }
              : u
          )
        );

        toast.success(`${upload.file.name} uploaded successfully`);
      } catch (error) {
        console.error('Upload error:', error);
        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file
              ? { ...u, status: 'error', progress: 0 }
              : u
          )
        );
        toast.error(`Failed to upload ${upload.file.name}`);
      }
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload Documents
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400"
          >
            <HiOutlineUpload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Click to upload or drag and drop files here
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Tags Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tags (press Enter)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          {/* Upload List */}
          {uploads.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploads.map((upload, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <span className="text-sm truncate">{upload.file.name}</span>
                  <span className="text-xs">
                    {upload.status === 'complete'
                      ? '✓'
                      : upload.status === 'error'
                      ? '✗'
                      : `${upload.progress}%`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploads.length === 0}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 