'use client';

import React, { useState } from 'react';
import { Cpu, Target, Zap, Trophy, TrendingUp, BarChart3, Info, ChevronDown, ChevronRight } from 'lucide-react';

export default function VoyageDetailedSpecs() {
  const [expandedSection, setExpandedSection] = useState<string | null>('architecture');

  const benchmarkData = [
    {
      task: 'Table/Figure Retrieval',
      voyage: 85.2,
      openaiClip: 60.8,
      amazonTitan: 52.3,
      improvement: '+41.44%'
    },
    {
      task: 'Document Screenshot Retrieval', 
      voyage: 78.9,
      openaiClip: 62.3,
      amazonTitan: 48.7,
      improvement: '+26.54%'
    },
    {
      task: 'Text-to-Photo Retrieval',
      voyage: 73.1,
      openaiClip: 68.6,
      amazonTitan: 65.2,
      improvement: '+6.55%'
    }
  ];

  const technicalFeatures = [
    {
      name: 'Unified Transformer Encoder',
      description: 'Processes text and visual data within the same encoder, unlike CLIP-based models with separate towers',
      impact: 'Preserves semantic relationships across modalities'
    },
    {
      name: 'Modality Gap Resolution',
      description: 'Eliminates performance degradation when mixing text and image content',
      impact: 'Consistent retrieval regardless of content ratio'
    },
    {
      name: 'Visual Feature Capture',
      description: 'Captures font size, text location, whitespace, and layout elements',
      impact: 'Superior understanding of document structure'
    },
    {
      name: 'Interleaved Content Processing',
      description: 'Handles mixed text-image documents without complex parsing',
      impact: 'Seamless PDF and slide processing'
    }
  ];

  const useCases = [
    {
      scenario: 'Technical Documentation',
      challenge: 'PDFs with embedded diagrams and code snippets',
      solution: 'Voyage-3 captures both textual explanations and visual code structure',
      result: '41% better retrieval of relevant technical content'
    },
    {
      scenario: 'Financial Reports',
      challenge: 'Tables, charts, and narrative text combined',
      solution: 'Unified processing understands relationships between data visualizations and text',
      result: 'Improved accuracy in finding specific financial metrics'
    },
    {
      scenario: 'Research Papers',
      challenge: 'Complex figures with detailed captions',
      solution: 'Semantic understanding of figure-caption relationships',
      result: 'Better matching of visual concepts to queries'
    }
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
            <Cpu className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          voyage-multimodal-3 Deep Dive
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Technical specifications, benchmarks, and innovations behind the most advanced 
          multimodal embedding model
        </p>
      </div>

      {/* Architecture Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection('architecture')}
          className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Cpu className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Unified Architecture Innovation</h3>
          </div>
          {expandedSection === 'architecture' ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>
        
        {expandedSection === 'architecture' && (
          <div className="px-8 pb-8 space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h4 className="font-semibold text-green-900 mb-4">Revolutionary Design</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Traditional CLIP Models</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded mr-2" />
                      Separate vision and text encoders
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded mr-2" />
                      Modality gap issues
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded mr-2" />
                      Complex alignment mechanisms
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Voyage Multimodal-3</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                      Unified transformer encoder
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                      No modality gap
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                      Natural semantic relationships
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {technicalFeatures.map((feature, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-1">{feature.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                  <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
                    Impact: {feature.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Performance */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection('benchmarks')}
          className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Trophy className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Performance Benchmarks</h3>
          </div>
          {expandedSection === 'benchmarks' ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>
        
        {expandedSection === 'benchmarks' && (
          <div className="px-8 pb-8 space-y-6">
            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="font-semibold text-green-900 mb-4">Evaluation Methodology</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">20</div>
                  <div className="text-gray-600">Multimodal Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">34</div>
                  <div className="text-gray-600">Text Retrieval Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">NDCG@10</div>
                  <div className="text-gray-600">Primary Metric</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {benchmarkData.map((benchmark, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-gray-900">{benchmark.task}</h5>
                    <span className="text-lg font-bold text-green-600">{benchmark.improvement}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Voyage Multimodal-3</span>
                      <span className="text-sm font-medium">{benchmark.voyage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
                        style={{ width: `${benchmark.voyage}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                      <div>
                        <div className="flex justify-between">
                          <span>OpenAI CLIP Large</span>
                          <span>{benchmark.openaiClip}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                          <div
                            className="h-1 bg-gray-400 rounded-full"
                            style={{ width: `${(benchmark.openaiClip / benchmark.voyage) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <span>Amazon Titan</span>
                          <span>{benchmark.amazonTitan}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                          <div
                            className="h-1 bg-gray-400 rounded-full"
                            style={{ width: `${(benchmark.amazonTitan / benchmark.voyage) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Use Cases */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => toggleSection('usecases')}
          className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Real-World Applications</h3>
          </div>
          {expandedSection === 'usecases' ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </button>
        
        {expandedSection === 'usecases' && (
          <div className="px-8 pb-8 space-y-6">
            <div className="grid gap-6">
              {useCases.map((useCase, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">{useCase.scenario}</h5>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h6 className="text-sm font-medium text-red-700 mb-2">Challenge</h6>
                      <p className="text-sm text-gray-600">{useCase.challenge}</p>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-blue-700 mb-2">Voyage Solution</h6>
                      <p className="text-sm text-gray-600">{useCase.solution}</p>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-green-700 mb-2">Result</h6>
                      <p className="text-sm text-gray-600">{useCase.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Implementation Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h4 className="font-semibold text-green-900 mb-4">Implementation Details</h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Model Access</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Model ID: <code className="bg-gray-200 px-1 rounded">voyage-multimodal-3</code></li>
                    <li>• First 200M tokens free</li>
                    <li>• RESTful API integration</li>
                    <li>• Python SDK available</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Supported Content</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Interleaved text and images</li>
                    <li>• PDF documents</li>
                    <li>• Screenshots and slides</li>
                    <li>• Complex document layouts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workshop Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🎓 Workshop Key Takeaways
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Why Voyage-3 Excels</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Unified architecture eliminates modality gaps</li>
              <li>• Captures visual layout and structure</li>
              <li>• 41% better at finding tables and figures</li>
              <li>• Seamless PDF and document processing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Perfect for MongoDB Atlas</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Vector dimensions optimized for Atlas indexing</li>
              <li>• Consistent performance across content types</li>
              <li>• Ideal for knowledge base applications</li>
              <li>• Superior RAG pipeline performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}