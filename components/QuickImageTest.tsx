'use client';

import React, { useState } from 'react';

export default function QuickImageTest() {
  const [pageNum, setPageNum] = useState(1);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  const imagePath = `/uploads/pdf-pages/page-${pageNum.toString().padStart(2, '0')}.png`;
  
  return (
    <div className="p-4 border rounded-lg max-w-sm">
      <h3 className="font-semibold mb-3">Quick Image Test</h3>
      
      <div className="flex items-center space-x-2 mb-3">
        <label htmlFor="pageNum" className="text-sm">Page:</label>
        <input
          id="pageNum"
          type="number"
          min="1"
          max="22"
          value={pageNum}
          onChange={(e) => {
            setPageNum(parseInt(e.target.value) || 1);
            setLoadStatus('loading');
          }}
          className="w-16 px-2 py-1 border rounded text-sm"
        />
      </div>
      
      <div className="mb-2 text-xs font-mono text-gray-600">
        Path: {imagePath}
      </div>
      
      <div className="mb-2 text-sm">
        Status: <span className={`font-medium ${
          loadStatus === 'success' ? 'text-green-600' : 
          loadStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {loadStatus}
        </span>
      </div>
      
      <div className="w-20 h-28 border rounded overflow-hidden bg-gray-50">
        {loadStatus !== 'error' && (
          <img
            src={imagePath}
            alt={`Page ${pageNum}`}
            className="w-full h-full object-cover"
            onLoad={() => setLoadStatus('success')}
            onError={() => setLoadStatus('error')}
            key={imagePath} // Force reload when path changes
          />
        )}
        {loadStatus === 'error' && (
          <div className="w-full h-full flex items-center justify-center text-xs text-red-500">
            Not found
          </div>
        )}
      </div>
    </div>
  );
}