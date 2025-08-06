'use client';

import React, { useState } from 'react';
import { FileText, Image, Layers, ArrowRight, Zap, Target, Brain, Cpu } from 'lucide-react';

export default function TechnicalComparison() {
  const [activeComparison, setActiveComparison] = useState<'architecture' | 'performance' | 'features'>('architecture');

  const architectureComparison = {
    clip: {
      name: 'CLIP-based Models (OpenAI, etc.)',
      architecture: 'Dual Tower Architecture',
      details: [
        'Separate vision encoder (ViT/ResNet)',
        'Separate text encoder (Transformer)', 
        'Contrastive learning alignment',
        'Fixed modality representations'
      ],
      limitations: [
        'Modality gap between vision/text',
        'Requires complex alignment mechanisms',
        'Struggles with interleaved content',
        'Layout information often lost'
      ]
    },
    voyage: {
      name: 'Voyage Multimodal-3',
      architecture: 'Unified Transformer Encoder',
      details: [
        'Single transformer processes both modalities',
        'Integrated attention mechanisms',
        'Semantic relationship preservation',
        'End-to-end optimization'
      ],
      advantages: [
        'No modality gap issues',
        'Natural cross-modal understanding',
        'Captures visual layout features',
        'Handles interleaved content seamlessly'
      ]
    }
  };

  const performanceMetrics = [
    {
      task: 'Document Screenshot Retrieval',
      voyage: 78.9,
      clip: 62.3,
      titan: 48.7,
      description: 'Finding relevant document screenshots based on text queries'
    },
    {
      task: 'Table/Figure Extraction',
      voyage: 85.2,
      clip: 60.8,
      titan: 52.3,
      description: 'Locating specific tables and figures within documents'
    },
    {
      task: 'Cross-modal Semantic Search',
      voyage: 73.1,
      clip: 68.6,
      titan: 65.2,
      description: 'Finding images that match textual descriptions'
    },
    {
      task: 'Layout Understanding',
      voyage: 82.4,
      clip: 45.2,
      titan: 38.9,
      description: 'Understanding document structure and spatial relationships'
    }
  ];

  const technicalFeatures = {
    voyage: [
      {
        feature: 'Font Size Recognition',
        description: 'Distinguishes between headers, body text, captions based on typography',
        impact: 'Better document hierarchy understanding'
      },
      {
        feature: 'Spatial Layout Processing',
        description: 'Captures whitespace, positioning, and document structure',
        impact: 'Superior table and figure detection'
      },
      {
        feature: 'Interleaved Content Handling',
        description: 'Processes mixed text-image content without preprocessing',
        impact: 'Seamless PDF and slide processing'
      },
      {
        feature: 'Semantic Relationship Modeling',
        description: 'Understands connections between visual and textual elements',
        impact: 'Better figure-caption matching'
      }
    ],
    traditional: [
      {
        feature: 'Separate Modality Processing',
        description: 'Images and text processed independently',
        impact: 'Limited cross-modal understanding'
      },
      {
        feature: 'Contrastive Alignment',
        description: 'Learning through positive/negative example pairs',
        impact: 'Modality gap issues persist'
      },
      {
        feature: 'Fixed Resolution Processing',
        description: 'Images resized to standard dimensions',
        impact: 'Loss of layout and typography information'
      },
      {
        feature: 'Post-hoc Integration',
        description: 'Modalities combined after separate encoding',
        impact: 'Weaker semantic relationships'
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Technical Architecture Deep Dive
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Compare Voyage's unified approach with traditional CLIP-based multimodal models
        </p>
      </div>

      {/* Comparison Selector */}
      <div className="flex justify-center">
        <div className="inline-grid grid-cols-3 gap-2 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'architecture', name: 'Architecture', icon: Cpu },
            { id: 'performance', name: 'Performance', icon: Target },
            { id: 'features', name: 'Features', icon: Zap }
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveComparison(id as any)}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300
                ${activeComparison === id
                  ? 'bg-white shadow-md text-green-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Architecture Comparison */}
      {activeComparison === 'architecture' && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional CLIP */}
              <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {architectureComparison.clip.name}
                </h3>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">{architectureComparison.clip.architecture}</h4>
                  <div className="space-y-2">
                    {architectureComparison.clip.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-2" />
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-red-700 mb-2">Limitations</h5>
                  <div className="space-y-2">
                    {architectureComparison.clip.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <span className="text-red-500 mt-1">⚠</span>
                        <span className="text-gray-600">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture Diagram */}
                <div className="bg-white rounded-lg p-4 mt-4">
                  <div className="text-center space-y-3">
                    <div className="bg-blue-100 rounded p-2 text-xs">Vision Encoder</div>
                    <div className="bg-purple-100 rounded p-2 text-xs">Text Encoder</div>
                    <ArrowRight className="w-4 h-4 mx-auto text-gray-400" />
                    <div className="bg-gray-100 rounded p-2 text-xs">Contrastive Alignment</div>
                  </div>
                </div>
              </div>

              {/* Voyage Multimodal */}
              <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {architectureComparison.voyage.name}
                </h3>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">{architectureComparison.voyage.architecture}</h4>
                  <div className="space-y-2">
                    {architectureComparison.voyage.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-green-700 mb-2">Advantages</h5>
                  <div className="space-y-2">
                    {architectureComparison.voyage.advantages.map((advantage, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-600">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture Diagram */}
                <div className="bg-white rounded-lg p-4 mt-4">
                  <div className="text-center space-y-3">
                    <div className="bg-green-100 rounded p-2 text-xs">Unified Transformer</div>
                    <div className="text-xs text-gray-600">Text + Images</div>
                    <ArrowRight className="w-4 h-4 mx-auto text-gray-400" />
                    <div className="bg-green-200 rounded p-2 text-xs">Joint Embeddings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Comparison */}
      {activeComparison === 'performance' && (
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Benchmark Performance</h3>
            <p className="text-gray-600">NDCG@10 scores across multimodal retrieval tasks</p>
          </div>

          <div className="grid gap-6">
            {performanceMetrics.map((metric, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{metric.task}</h4>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{metric.voyage}%</div>
                    <div className="text-sm text-gray-500">Voyage Score</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Voyage Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-green-700">Voyage Multimodal-3</span>
                      <span>{metric.voyage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  {/* CLIP Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">OpenAI CLIP</span>
                      <span>{metric.clip}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-400 rounded-full"
                        style={{ width: `${(metric.clip / metric.voyage) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Titan Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Amazon Titan</span>
                      <span>{metric.titan}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-orange-400 rounded-full"
                        style={{ width: `${(metric.titan / metric.voyage) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                    +{Math.round(((metric.voyage - metric.clip) / metric.clip) * 100)}% vs CLIP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Comparison */}
      {activeComparison === 'features' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Voyage Features */}
            <div className="bg-green-50/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-6">Voyage Multimodal-3 Capabilities</h3>
              <div className="space-y-4">
                {technicalFeatures.voyage.map((feature, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.feature}</h4>
                    <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                    <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
                      {feature.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traditional Features */}
            <div className="bg-gray-50/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Traditional CLIP Models</h3>
              <div className="space-y-4">
                {technicalFeatures.traditional.map((feature, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.feature}</h4>
                    <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                    <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                      {feature.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Implementation Notes */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🔧 Implementation Insights for MongoDB Atlas
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Why This Matters for Your App</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Unified embeddings eliminate the need for separate text/image vectors</li>
              <li>• Better search accuracy means happier users and fewer failed queries</li>
              <li>• Layout understanding enables search in complex documents like reports</li>
              <li>• Consistent performance regardless of document content mix</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">MongoDB Atlas Benefits</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Vector indexing optimized for high-dimensional embeddings</li>
              <li>• Scalable storage for millions of document embeddings</li>
              <li>• Fast similarity search with sub-second response times</li>
              <li>• Perfect for RAG applications and knowledge bases</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}