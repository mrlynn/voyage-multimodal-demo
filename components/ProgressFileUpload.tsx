'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { ProcessingProgress, ProgressStep } from '@/types/progress';

interface ProgressFileUploadProps {
  onUploadComplete: (documentId: string) => void;
}

export default function ProgressFileUpload({ onUploadComplete }: ProgressFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [error, setError] = useState<string>('');
  const [completed, setCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setCompleted(false);
      setProgress(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setProgress(null);
    setCompleted(false);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/upload-progress', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                setError(data.error);
                setUploading(false);
                return;
              }
              
              if (data.complete) {
                setCompleted(true);
                setUploading(false);
                setTimeout(() => {
                  onUploadComplete(data.documentId);
                  setFile(null);
                  setProgress(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }, 2000);
                return;
              }
              
              if (data.steps) {
                setProgress(data as ProcessingProgress);
              }
            } catch (parseError) {
              console.error('Failed to parse progress data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to upload PDF. Please try again.');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
      setCompleted(false);
      setProgress(null);
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* File Drop Zone */}
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
          disabled={uploading}
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
            <p className="text-xs text-gray-500">PDF files only</p>
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
            {!uploading && !completed && (
              <button
                onClick={() => {
                  setFile(null);
                  setError('');
                  setProgress(null);
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

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Progress Section */}
      {(uploading || completed) && progress && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {completed ? 'Processing Complete!' : 'Processing PDF...'}
            </h3>
            <span className="text-sm font-medium text-gray-600">
              {progress.overallProgress}%
            </span>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                completed ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress.overallProgress}%` }}
            />
          </div>
          
          {/* Step Details */}
          <div className="space-y-3">
            {progress.steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3">
                {getStepIcon(step)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {step.title}
                    </p>
                    {step.progress !== undefined && (
                      <span className="text-xs text-gray-500">
                        {step.progress}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {step.description}
                  </p>
                  {step.details && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.details}
                    </p>
                  )}
                  {step.progress !== undefined && step.status === 'in_progress' && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div
                        className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && !uploading && !completed && (
        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Process PDF
        </button>
      )}

      {/* Success Message */}
      {completed && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">
              PDF processed successfully! You can now ask questions in the Chat tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}