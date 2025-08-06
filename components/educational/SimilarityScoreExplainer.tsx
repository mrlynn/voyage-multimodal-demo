'use client';

import React, { useState } from 'react';
import { Calculator, Info, TrendingUp, ArrowUpDown } from 'lucide-react';

interface ComparisonExample {
  query: string;
  document: string;
  textScore: number;
  imageScore: number;
  multimodalScore: number;
  explanation: string;
}

export default function SimilarityScoreExplainer() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [showFormula, setShowFormula] = useState(false);

  const examples: ComparisonExample[] = [
    {
      query: "neural network architecture diagram",
      document: "Page containing a flowchart of CNN layers with accompanying text",
      textScore: 0.75,
      imageScore: 0.92,
      multimodalScore: 0.88,
      explanation: "Image score is high due to diagram detection. Text provides context, resulting in strong multimodal match."
    },
    {
      query: "transformer attention mechanism",
      document: "Page with detailed text explanation but no visuals",
      textScore: 0.91,
      imageScore: 0.15,
      multimodalScore: 0.73,
      explanation: "Text-heavy match. Low image score pulls down the multimodal score, but text relevance keeps it strong."
    },
    {
      query: "show me the results table",
      document: "Page with a data table showing experimental results",
      textScore: 0.45,
      imageScore: 0.88,
      multimodalScore: 0.78,
      explanation: "Visual elements (table structure) drive the match. Text score is moderate due to 'results' keyword."
    }
  ];

  const currentExample = examples[selectedExample];

  // Calculate cosine similarity visualization
  const renderCosineSimilarity = (score: number) => {
    const angle = Math.acos(score) * (180 / Math.PI);
    const x = 100 * Math.cos((angle * Math.PI) / 180);
    const y = 100 * Math.sin((angle * Math.PI) / 180);

    return (
      <svg width="120" height="120" viewBox="-10 -10 140 140">
        {/* Grid */}
        <line x1="0" y1="60" x2="120" y2="60" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="60" y1="0" x2="60" y2="120" stroke="#e5e7eb" strokeWidth="1" />
        
        {/* Vectors */}
        <line x1="60" y1="60" x2="120" y2="60" stroke="#6366f1" strokeWidth="3" />
        <line x1="60" y1="60" x2={60 + x * 0.6} y2={60 - y * 0.6} stroke="#a855f7" strokeWidth="3" />
        
        {/* Arc showing angle */}
        <path
          d={`M 90 60 A 30 30 0 0 0 ${60 + x * 0.3} ${60 - y * 0.3}`}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
        />
        
        {/* Labels */}
        <text x="115" y="55" fontSize="10" fill="#6366f1">Query</text>
        <text x={60 + x * 0.7} y={60 - y * 0.7 - 5} fontSize="10" fill="#a855f7">Doc</text>
        <text x="75" y="45" fontSize="10" fill="#f59e0b">{angle.toFixed(0)}°</text>
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Understanding Similarity Scores
        </h2>
        <p className="text-gray-600">
          How cosine similarity measures embedding closeness
        </p>
      </div>

      {/* Example Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select an example:
        </label>
        <div className="grid gap-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedExample(idx)}
              className={`
                p-3 rounded-lg text-left transition-all
                ${selectedExample === idx 
                  ? 'bg-indigo-50 border-2 border-indigo-500' 
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <p className="font-medium text-sm">{example.query}</p>
              <p className="text-xs text-gray-600 mt-1">
                Multimodal score: {example.multimodalScore.toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Text Similarity */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Text Similarity</h3>
          <div className="flex justify-center mb-4">
            {renderCosineSimilarity(currentExample.textScore)}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {(currentExample.textScore * 100).toFixed(0)}%
            </div>
            <p className="text-sm text-blue-700 mt-1">Semantic match</p>
          </div>
        </div>

        {/* Image Similarity */}
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="font-semibold text-purple-900 mb-4">Image Similarity</h3>
          <div className="flex justify-center mb-4">
            {renderCosineSimilarity(currentExample.imageScore)}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {(currentExample.imageScore * 100).toFixed(0)}%
            </div>
            <p className="text-sm text-purple-700 mt-1">Visual match</p>
          </div>
        </div>

        {/* Multimodal Fusion */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Multimodal Fusion</h3>
          <div className="flex justify-center mb-4">
            {renderCosineSimilarity(currentExample.multimodalScore)}
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {(currentExample.multimodalScore * 100).toFixed(0)}%
            </div>
            <p className="text-sm text-gray-700 mt-1">Combined score</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-gray-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Why this score?</h4>
            <p className="text-sm text-gray-700">{currentExample.explanation}</p>
          </div>
        </div>
      </div>

      {/* Formula Section */}
      <div className="border-t pt-6">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Calculator className="w-5 h-5" />
          <span>{showFormula ? 'Hide' : 'Show'} the Math</span>
          <ArrowUpDown className="w-4 h-4" />
        </button>
        
        {showFormula && (
          <div className="mt-4 bg-gray-900 text-white rounded-xl p-6 font-mono text-sm">
            <h4 className="text-lg font-bold mb-4">Cosine Similarity Formula</h4>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-2">Basic formula:</p>
                <p className="text-green-400">
                  similarity = cos(θ) = (A · B) / (||A|| × ||B||)
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 mb-2">For embeddings:</p>
                <p className="text-blue-400">
                  similarity = Σ(query[i] × doc[i]) / (√Σ(query[i]²) × √Σ(doc[i]²))
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 mb-2">Multimodal fusion (Voyage AI):</p>
                <p className="text-purple-400">
                  final_score = α × text_similarity + β × image_similarity
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  where α and β are learned weights optimized for best retrieval
                </p>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <p className="text-yellow-400">Range: 0 (orthogonal) to 1 (identical)</p>
                <ul className="mt-2 space-y-1 text-gray-300">
                  <li>• 0.9+ = Excellent match</li>
                  <li>• 0.7-0.9 = Good match</li>
                  <li>• 0.5-0.7 = Moderate match</li>
                  <li>• &lt;0.5 = Weak match</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Demo */}
      <div className="bg-indigo-50 rounded-xl p-6">
        <h4 className="font-semibold text-indigo-900 mb-4">
          <TrendingUp className="inline w-5 h-5 mr-2" />
          Key Insights for Workshop
        </h4>
        <ul className="space-y-2 text-sm text-indigo-800">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            Multimodal embeddings don't just average scores - they learn optimal combinations
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            High image similarity can compensate for lower text matches (and vice versa)
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            The 1024-dimensional space captures nuanced relationships between concepts
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            MongoDB Atlas indexes these vectors for millisecond-speed searches
          </li>
        </ul>
      </div>
    </div>
  );
}