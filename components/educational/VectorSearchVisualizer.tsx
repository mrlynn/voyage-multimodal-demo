'use client';

import React, { useState, useEffect } from 'react';
import { Search, Image, FileText, Brain, Sparkles, Eye, Layers } from 'lucide-react';

interface SearchResult {
  page: number;
  score: number;
  type: 'text' | 'image' | 'multimodal';
  snippet?: string;
  embedding?: number[];
}

interface VectorSearchVisualizerProps {
  query?: string;
  results?: SearchResult[];
  isSearching?: boolean;
}

export default function VectorSearchVisualizer({ 
  query = "Show me diagrams about neural networks", 
  results = [
    { page: 3, score: 0.92, type: 'multimodal', snippet: 'Neural network architecture...' },
    { page: 7, score: 0.85, type: 'image', snippet: 'Diagram showing layers...' },
    { page: 12, score: 0.78, type: 'text', snippet: 'Description of neural nets...' }
  ],
  isSearching = false 
}: VectorSearchVisualizerProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [showEmbeddings, setShowEmbeddings] = useState(false);
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [selectedStepDetail, setSelectedStepDetail] = useState<number | null>(null);

  // Simulate the vector search process steps
  const steps = [
    { id: 1, name: 'Query Analysis', icon: Brain, description: 'Analyze query intent and modality' },
    { id: 2, name: 'Embedding Generation', icon: Sparkles, description: 'Convert to high-dimensional vectors' },
    { id: 3, name: 'Vector Search', icon: Search, description: 'Find similar embeddings in database' },
    { id: 4, name: 'Multimodal Fusion', icon: Layers, description: 'Combine text and image similarities' }
  ];

  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isSearching, steps.length]);

  // Generate fake embedding visualization
  const generateEmbeddingViz = (seed: number = 1) => {
    return Array.from({ length: 20 }, (_, i) => 
      Math.sin(i * 0.5 + seed) * 0.5 + 0.5
    );
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Multimodal Vector Search Process
        </h2>
        <p className="text-gray-600">
          See how Voyage AI embeddings work with both text and images
        </p>
      </div>

      {/* Query Display */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">User Query</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-800 font-medium">{query}</p>
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <span className="flex items-center space-x-1 text-green-700">
              <FileText className="w-4 h-4" />
              <span>Text: "diagrams", "neural networks"</span>
            </span>
            <span className="flex items-center space-x-1 text-purple-600">
              <Image className="w-4 h-4" />
              <span>Visual: seeking images/diagrams</span>
            </span>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Processing Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isComplete = index < activeStep;
            
            return (
              <div
                key={step.id}
                onClick={() => setSelectedStepDetail(selectedStepDetail === index ? null : index)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-500 cursor-pointer hover:shadow-md
                  ${isActive 
                    ? 'border-green-600 bg-green-50 scale-105 shadow-lg' 
                    : isComplete 
                    ? 'border-green-500 bg-green-50' 
                    : selectedStepDetail === index
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-green-300'
                  }
                `}
              >
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300 z-0" />
                )}
                
                <div className="relative z-10">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-3
                    ${isActive 
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600' 
                      : isComplete
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                    }
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{step.name}</h4>
                  <p className="text-xs text-gray-600">{step.description}</p>
                  
                  {selectedStepDetail !== index && (
                    <div className="text-xs text-green-600 mt-2 font-medium">
                      Click to learn more →
                    </div>
                  )}
                  
                 
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Detailed Step Information */}
        {selectedStepDetail !== null && (
          <div className="mt-6 bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {steps[selectedStepDetail].name} - Deep Dive
              </h4>
              <button
                onClick={() => setSelectedStepDetail(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {selectedStepDetail === 0 && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">Query Intent Analysis</h5>
                  <p className="text-sm text-blue-800 mb-3">
                    The system analyzes your query to understand both textual and visual intent:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Keyword extraction:</strong> "diagrams", "neural networks"</li>
                    <li>• <strong>Intent detection:</strong> User wants visual content (diagrams/charts)</li>
                    <li>• <strong>Context understanding:</strong> Technical/educational content sought</li>
                    <li>• <strong>Modality prioritization:</strong> Emphasize image matching</li>
                  </ul>
                </div>
                <div className="text-xs text-gray-600">
                  💡 <strong>Technical insight:</strong> Unlike traditional search, this step prepares the query 
                  for multimodal understanding, setting weights for text vs. visual content matching.
                </div>
              </div>
            )}
            
            {selectedStepDetail === 1 && (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-900 mb-2">Voyage AI Embedding Generation</h5>
                  <p className="text-sm text-purple-800 mb-3">
                    Converting your query into a 1024-dimensional vector using voyage-multimodal-3:
                  </p>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• <strong>Unified architecture:</strong> Text + visual processing in single model</li>
                    <li>• <strong>Layout awareness:</strong> Understands document structure, fonts, spacing</li>
                    <li>• <strong>Semantic encoding:</strong> Captures meaning, not just keywords</li>
                    <li>• <strong>Visual intent embedding:</strong> Encodes desire for diagrams/charts</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-3">
                  <p className="text-xs font-mono text-center text-purple-800">
                    Output: [0.23, -0.15, 0.67, ...] (1024 dimensions)
                  </p>
                </div>
                <div className="text-xs text-gray-600">
                  💡 <strong>Why it's better:</strong> Unlike CLIP's separate text/image towers, 
                  Voyage's unified transformer eliminates modality gaps for 41% better performance.
                </div>
              </div>
            )}
            
            {selectedStepDetail === 2 && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2">MongoDB Atlas Vector Search</h5>
                  <p className="text-sm text-green-800 mb-3">
                    Finding similar embeddings in the vector database:
                  </p>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• <strong>HNSW indexing:</strong> Hierarchical navigable small world algorithm</li>
                    <li>• <strong>Cosine similarity:</strong> Measures angle between vectors (0-1 score)</li>
                    <li>• <strong>Approximate search:</strong> Fast retrieval from millions of vectors</li>
                    <li>• <strong>Score ranking:</strong> Returns top-k most similar documents</li>
                  </ul>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-green-600">~2ms</div>
                    <div className="text-gray-600">Search time</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-green-600">1024</div>
                    <div className="text-gray-600">Vector size</div>
                  </div>
                  <div className="bg-white rounded p-2 text-center">
                    <div className="font-bold text-green-600">95%+</div>
                    <div className="text-gray-600">Recall accuracy</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  💡 <strong>MongoDB advantage:</strong> Native vector search eliminates need for 
                  separate vector databases, keeping everything in one platform.
                </div>
              </div>
            )}
            
            {selectedStepDetail === 3 && (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h5 className="font-semibold text-indigo-900 mb-2">Multimodal Fusion & Ranking</h5>
                  <p className="text-sm text-indigo-800 mb-3">
                    Combining text and image similarities for final scoring:
                  </p>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• <strong>Learned weights:</strong> α (text) + β (image) = final_score</li>
                    <li>• <strong>Context-aware fusion:</strong> Query type influences weighting</li>
                    <li>• <strong>Layout understanding:</strong> Document structure affects relevance</li>
                    <li>• <strong>Result ranking:</strong> Top matches returned to user</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3">
                  <p className="text-xs text-center text-indigo-800">
                    <span className="font-mono">final_score = 0.3 × text_sim + 0.7 × image_sim</span>
                    <br />
                    <span className="text-indigo-600">(weights optimized for "diagram" queries)</span>
                  </p>
                </div>
                <div className="text-xs text-gray-600">
                  💡 <strong>Smart fusion:</strong> The model learns optimal combinations for different 
                  query types, not just simple averaging like traditional systems.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedding Visualization */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Embedding Space Visualization</h3>
          <button
            onClick={() => setShowEmbeddings(!showEmbeddings)}
            className="flex items-center space-x-2 text-sm text-green-700 hover:text-green-900"
          >
            <Eye className="w-4 h-4" />
            <span>{showEmbeddings ? 'Hide' : 'Show'} Embeddings</span>
          </button>
        </div>
        
        {showEmbeddings && (
          <div className="space-y-4">
            {/* Query Embedding */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Query Embedding (1024 dimensions)</span>
                <span className="text-xs text-gray-500">Voyage-3</span>
              </div>
              <div className="flex space-x-0.5 h-8">
                {generateEmbeddingViz(0).map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-green-600 to-emerald-600 rounded-sm"
                    style={{ height: `${val * 100}%` }}
                  />
                ))}
              </div>
            </div>
            
            {/* Document Embeddings */}
            <div className="text-sm font-medium text-gray-700 mt-4">Document Embeddings</div>
            {results.slice(0, 3).map((result, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Page {result.page}</span>
                  <div className="flex items-center space-x-2">
                    {result.type === 'multimodal' && (
                      <>
                        <FileText className="w-3 h-3 text-blue-500" />
                        <Image className="w-3 h-3 text-purple-500" />
                      </>
                    )}
                    {result.type === 'image' && <Image className="w-3 h-3 text-purple-500" />}
                    {result.type === 'text' && <FileText className="w-3 h-3 text-blue-500" />}
                  </div>
                </div>
                <div className="flex space-x-0.5 h-6">
                  {generateEmbeddingViz(idx + 1).map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gray-400 rounded-sm"
                      style={{ height: `${val * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Results with Similarity Scores */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
        <div className="grid gap-3">
          {results.map((result, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedResult(idx)}
              className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedResult === idx 
                  ? 'border-green-600 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-medium">Page {result.page}</span>
                    <div className="flex items-center space-x-1">
                      {result.type === 'multimodal' && (
                        <>
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-600">+</span>
                          <Image className="w-4 h-4 text-purple-500" />
                        </>
                      )}
                      {result.type === 'image' && <Image className="w-4 h-4 text-purple-500" />}
                      {result.type === 'text' && <FileText className="w-4 h-4 text-blue-500" />}
                    </div>
                    <span className="text-xs text-gray-500">
                      {result.type === 'multimodal' ? 'Text + Image Match' : 
                       result.type === 'image' ? 'Visual Match' : 'Text Match'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{result.snippet}</p>
                </div>
                
                {/* Similarity Score Visualization */}
                <div className="ml-4 text-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28 * result.score} ${2 * Math.PI * 28}`}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Similarity</span>
                </div>
              </div>
              
              {selectedResult === idx && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <p className="font-medium mb-1">Why this match?</p>
                  <ul className="space-y-1 text-xs">
                    {result.type === 'multimodal' && (
                      <>
                        <li>• Text contains keyword matches</li>
                        <li>• Image shows relevant diagram</li>
                        <li>• Combined score from both modalities</li>
                      </>
                    )}
                    {result.type === 'image' && (
                      <>
                        <li>• Visual features match query intent</li>
                        <li>• Diagram/chart detected in image</li>
                      </>
                    )}
                    {result.type === 'text' && (
                      <>
                        <li>• High semantic similarity to query</li>
                        <li>• Contains relevant terminology</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}