"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { HiOutlineUpload, HiOutlineX, HiOutlineEye } from "react-icons/hi";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  selectedFile?: File | null;
  error?: string;
  progress?: number;
  showPreview?: boolean;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ 
    className,
    onFileSelect,
    onFileRemove,
    accept = "application/pdf,image/*",
    maxSize = 5,
    label = "Upload file",
    selectedFile,
    error,
    progress,
    showPreview = true,
    ...props
  }, ref) => {
    const [dragActive, setDragActive] = React.useState(false);
    const [preview, setPreview] = React.useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Generate preview when file is selected
    React.useEffect(() => {
      if (selectedFile && showPreview) {
        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else if (selectedFile.type === 'application/pdf') {
          setPreview('pdf');
        } else {
          setPreview('file');
        }
      } else {
        setPreview(null);
      }
    }, [selectedFile, showPreview]);

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    };

    const handleFile = (file: File) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size should not exceed ${maxSize}MB`);
        return;
      }
      onFileSelect?.(file);
    };

    return (
      <div className="space-y-2">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-gray-300",
            error && "border-destructive",
            className
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HiOutlineUpload className="w-6 h-6 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">{selectedFile.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {preview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <HiOutlineEye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onFileRemove?.();
                      if (inputRef.current) {
                        inputRef.current.value = '';
                      }
                      setPreview(null);
                    }}
                  >
                    <HiOutlineX className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              {typeof progress === 'number' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <input
                ref={ref}
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
                accept={accept}
                {...props}
              />
              <HiOutlineUpload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="text-sm text-gray-600">{label}</p>
              <p className="mt-1 text-xs text-gray-500">
                Drag & drop or click to upload
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Max size: {maxSize}MB
              </p>
            </>
          )}
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        {/* Preview Modal */}
        {showPreviewModal && preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">File Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviewModal(false)}
                >
                  <HiOutlineX className="w-5 h-5" />
                </Button>
              </div>
              <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                {preview === 'pdf' ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">PDF Preview not available</p>
                  </div>
                ) : preview === 'file' ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Preview not available</p>
                  </div>
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload"; 