'use client';

import React from 'react';
import { Search, Brain, Layers, TrendingUp, Eye } from 'lucide-react';

interface SearchInsight {
  sources?: Array<{ page: number; score: number }>;
  queryLength?: number;
  searchTime?: number;
}

export default function VectorSearchInsights({ insights }: { insights: SearchInsight }) {
  if (!insights.sources || insights.sources.length === 0) return null;

  // Calculate average similarity score
  const avgScore = insights.sources.reduce((acc, s) => acc + s.score, 0) / insights.sources.length;
  
  // Determine search quality
  const searchQuality = avgScore > 0.8 ? 'Excellent' : avgScore > 0.6 ? 'Good' : 'Moderate';
  const qualityColor = avgScore > 0.8 ? 'green' : avgScore > 0.6 ? 'blue' : 'yellow';

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <Brain className="w-4 h-4 mr-2 text-green-700" />
          Vector Search Insights
        </h4>
        <button className="text-xs text-green-700 hover:text-green-900 flex items-center">
          <Eye className="w-3 h-3 mr-1" />
          Learn More
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-xs">
        {/* Search Quality */}
        <div className="bg-white/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-600">Match Quality</span>
            <TrendingUp className={`w-3 h-3 text-${qualityColor === 'blue' ? 'green' : qualityColor}-500`} />
          </div>
          <div className={`text-lg font-bold text-${qualityColor === 'blue' ? 'green' : qualityColor}-600`}>
            {searchQuality}
          </div>
          <div className="text-gray-500">
            Avg: {(avgScore * 100).toFixed(0)}%
          </div>
        </div>
        
        {/* Modality Mix */}
        <div className="bg-white/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-600">Modality</span>
            <Layers className="w-3 h-3 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700">
            Mixed
          </div>
          <div className="text-gray-500">
            Text + Visual
          </div>
        </div>
        
        {/* Search Stats */}
        <div className="bg-white/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-600">Searched</span>
            <Search className="w-3 h-3 text-green-600" />
          </div>
          <div className="text-lg font-bold text-green-700">
            {insights.sources.length}
          </div>
          <div className="text-gray-500">
            Pages found
          </div>
        </div>
      </div>
      
      {/* Technical Details */}
      <div className="mt-3 pt-3 border-t border-green-200/50">
        <div className="mb-2">
          <p className="text-xs text-green-800 font-semibold mb-1">🔬 Technical Details:</p>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Using voyage-multimodal-3 unified transformer architecture</li>
            <li>• 1024-dimensional embeddings optimized for MongoDB Atlas</li>
            <li>• Layout-aware processing captures font size, spacing, structure</li>
            <li>• 41% better performance vs CLIP on table/figure retrieval</li>
          </ul>
        </div>
        <p className="text-xs text-green-800">
          💡 <strong>Why it works:</strong> Unlike CLIP's dual towers, Voyage's unified encoder 
          processes text and images together, eliminating modality gaps for superior accuracy.
        </p>
      </div>
    </div>
  );
}