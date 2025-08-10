'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

export default function CleanupButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCleanup = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/cleanup', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(`Cleaned up ${data.deletedCount} old PDF images`);
      } else {
        setResult('Cleanup failed: ' + (data.error || 'Unknown error'));
      }
      
      // Clear the result after 3 seconds
      setTimeout(() => setResult(null), 3000);
      
    } catch (error) {
      setResult('Failed to cleanup PDF pages');
      setTimeout(() => setResult(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleCleanup}
        disabled={loading}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
        <span>Clean Old Images</span>
      </button>
      
      {result && (
        <span className={`text-sm ${result.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
          {result}
        </span>
      )}
    </div>
  );
}