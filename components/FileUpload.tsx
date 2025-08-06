'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import FileSizeHelper from './ui/FileSizeHelper';

interface FileUploadProps {
  onUploadComplete: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showSizeHelper, setShowSizeHelper] = useState<{ show: boolean; currentSizeMB: number }>({ show: false, currentSizeMB: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File size limits (matching server-side limits)
  // Conservative limit for Vercel deployment compatibility
  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (Vercel hobby limit is ~4.5MB)
  const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      // Check file size before setting
      if (selectedFile.size > MAX_FILE_SIZE) {
        const currentSizeMB = Math.round(selectedFile.size / (1024 * 1024) * 10) / 10;
        setError(`File too large! Maximum size is ${MAX_FILE_SIZE_MB}MB, but your file is ${currentSizeMB}MB.`);
        setShowSizeHelper({ show: true, currentSizeMB });
        return;
      }
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus('Uploading PDF...');
    setError('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus(`Success! Processed ${data.pageCount} pages.`);
        setTimeout(() => {
          onUploadComplete();
          setFile(null);
          setUploadStatus('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000);
      } else {
        // Handle specific error codes
        if (response.status === 413 || data.code === 'FILE_TOO_LARGE') {
          setError(data.error || `File too large! Please choose a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
        } else {
          setError(data.error || 'Upload failed');
        }
      }
    } catch (err) {
      setError('Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      // Check file size before setting
      if (droppedFile.size > MAX_FILE_SIZE) {
        const currentSizeMB = Math.round(droppedFile.size / (1024 * 1024) * 10) / 10;
        setError(`File too large! Maximum size is ${MAX_FILE_SIZE_MB}MB, but your file is ${currentSizeMB}MB.`);
        setShowSizeHelper({ show: true, currentSizeMB });
        return;
      }
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        
        {!file ? (
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF files only (max {MAX_FILE_SIZE_MB}MB)</p>
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={() => {
                  setFile(null);
                  setError('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {showSizeHelper.show && (
        <FileSizeHelper
          maxSizeMB={MAX_FILE_SIZE_MB}
          currentSizeMB={showSizeHelper.currentSizeMB}
          onClose={() => setShowSizeHelper({ show: false, currentSizeMB: 0 })}
        />
      )}

      {uploadStatus && !error && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600">{uploadStatus}</p>
        </div>
      )}

      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Process PDF
        </button>
      )}

      {uploading && (
        <div className="mt-4 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Processing...</span>
        </div>
      )}
    </div>
  );
}