'use client';

import React, { useState } from 'react';
import { Database, Search, Loader2 } from 'lucide-react';

interface DatabaseDebugProps {
  documentId?: string;
}

interface DebugData {
  totalDocuments: number;
  filteredCount: number;
  uniqueDocumentIds: string[];
  sampleDocuments: Array<{
    documentId: string;
    pageNumber: number;
    key: string;
    hasEmbedding: boolean;
    embeddingLength: number;
    createdAt: string;
    storageType: string;
  }>;
  requestedDocumentId?: string;
}

export default function DatabaseDebug({ documentId }: DatabaseDebugProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DebugData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = documentId 
        ? `/api/debug-db?documentId=${encodeURIComponent(documentId)}`
        : '/api/debug-db';
        
      const response = await fetch(url);
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch debug data');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Database Debug</h3>
          {documentId && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Doc: {documentId.substring(0, 8)}...
            </span>
          )}
        </div>
        <button
          onClick={fetchDebugData}
          disabled={loading}
          className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>Check DB</span>
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-2">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Total Documents:</span> {data.totalDocuments}
            </div>
            <div>
              <span className="font-medium">Filtered Count:</span> {data.filteredCount}
            </div>
          </div>

          <div>
            <span className="font-medium">Unique Document IDs:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.uniqueDocumentIds.map((id, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                  {id ? `${id.substring(0, 8)}...` : 'undefined'}
                </span>
              ))}
            </div>
          </div>

          {data.sampleDocuments.length > 0 && (
            <div>
              <span className="font-medium">Sample Documents:</span>
              <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                {data.sampleDocuments.map((doc, idx) => (
                  <div key={idx} className="text-xs bg-white p-2 rounded border">
                    <div><strong>Page:</strong> {doc.pageNumber} | <strong>DocID:</strong> {doc.documentId ? `${doc.documentId.substring(0, 12)}...` : 'undefined'}</div>
                    <div><strong>Embedding:</strong> {doc.hasEmbedding ? `✅ ${doc.embeddingLength}D` : '❌ None'}</div>
                    <div><strong>Storage:</strong> {doc.storageType || 'unknown'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}