'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface ImageTestResult {
  filename: string;
  url: string;
  accessible: boolean;
  size?: number;
  error?: string;
}

interface TestResponse {
  directory: string;
  totalFiles: number;
  allFiles: string[];
  testResults: ImageTestResult[];
}

export default function ImageTest() {
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-images');
      const data = await response.json();
      setTestData(data);
      
      // Reset image load states
      const initialStates: Record<string, 'loading' | 'success' | 'error'> = {};
      data.testResults?.forEach((result: ImageTestResult) => {
        initialStates[result.filename] = 'loading';
      });
      setImageLoadStates(initialStates);
      
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const handleImageLoad = (filename: string) => {
    setImageLoadStates(prev => ({ ...prev, [filename]: 'success' }));
  };

  const handleImageError = (filename: string) => {
    setImageLoadStates(prev => ({ ...prev, [filename]: 'error' }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Image Loading Test</h2>
        <button
          onClick={runTest}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Run Test</span>
        </button>
      </div>

      {testData && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Results</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Directory:</strong> {testData.directory}</div>
              <div><strong>Total Files:</strong> {testData.totalFiles}</div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">All Files:</h4>
              <div className="text-xs font-mono bg-white p-2 rounded max-h-32 overflow-y-auto">
                {testData.allFiles.join(', ')}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="font-semibold">File Accessibility Test</h3>
            {testData.testResults.map((result) => (
              <div key={result.filename} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.filename}</span>
                  <div className="flex items-center space-x-2">
                    {result.accessible ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm">
                      {result.accessible ? 'Accessible' : 'Error'}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <div><strong>URL:</strong> {result.url}</div>
                  {result.size && <div><strong>Size:</strong> {result.size} bytes</div>}
                  {result.error && <div className="text-red-600"><strong>Error:</strong> {result.error}</div>}
                </div>

                {result.accessible && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">Browser Load Test:</span>
                      {imageLoadStates[result.filename] === 'loading' && (
                        <span className="text-yellow-600 text-sm">Loading...</span>
                      )}
                      {imageLoadStates[result.filename] === 'success' && (
                        <span className="text-green-600 text-sm flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Success
                        </span>
                      )}
                      {imageLoadStates[result.filename] === 'error' && (
                        <span className="text-red-600 text-sm flex items-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          Failed
                        </span>
                      )}
                    </div>
                    
                    <div className="w-20 h-28 border rounded overflow-hidden">
                      <img
                        src={result.url}
                        alt={result.filename}
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad(result.filename)}
                        onError={() => handleImageError(result.filename)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}