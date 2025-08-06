'use client';

import React, { useState } from 'react';
import { BookOpen, Brain, Zap, Calculator, Play, FileText } from 'lucide-react';
import VectorSearchVisualizer from './VectorSearchVisualizer';
import EmbeddingComparison from './EmbeddingComparison';
import LiveEmbeddingDemo from './LiveEmbeddingDemo';
import SimilarityScoreExplainer from './SimilarityScoreExplainer';
import VoyageDetailedSpecs from './VoyageDetailedSpecs';
import TechnicalComparison from './TechnicalComparison';
import ExamplePDFDemo from './ExamplePDFDemo';

export default function LearnTab() {
  const [activeSection, setActiveSection] = useState<'example' | 'overview' | 'comparison' | 'technical' | 'specs' | 'live' | 'scores'>('example');

  const sections = [
    {
      id: 'example',
      name: 'Try Example PDF',
      icon: FileText,
      description: 'Test the system with a pre-loaded document'
    },
    {
      id: 'overview',
      name: 'Search Process',
      icon: Brain,
      description: 'See how multimodal vector search works'
    },
    {
      id: 'specs',
      name: 'Voyage AI Specs',
      icon: BookOpen,
      description: 'Deep dive into voyage-multimodal-3'
    },
    {
      id: 'technical',
      name: 'Architecture',
      icon: Zap,
      description: 'Compare technical approaches'
    },
    {
      id: 'comparison',
      name: 'Performance',
      icon: Calculator,
      description: 'Benchmarks and metrics'
    },
    {
      id: 'live',
      name: 'Live Demo',
      icon: Play,
      description: 'Watch embeddings in action'
    },
    {
      id: 'scores',
      name: 'Similarity Math',
      icon: Calculator,
      description: 'Understand the calculations'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Learn About Multimodal Embeddings
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore how Voyage AI's multimodal embeddings enable powerful PDF search
          by understanding both text and visual content
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex justify-center">
        <div className="inline-grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-300
                  ${isActive 
                    ? 'border-green-600 bg-green-50 shadow-lg scale-105' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${
                  isActive ? 'text-green-700' : 'text-gray-600'
                }`} />
                <h3 className={`font-semibold text-sm ${
                  isActive ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {section.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {section.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        {activeSection === 'example' && <ExamplePDFDemo />}
        {activeSection === 'overview' && <VectorSearchVisualizer />}
        {activeSection === 'specs' && <VoyageDetailedSpecs />}
        {activeSection === 'technical' && <TechnicalComparison />}
        {activeSection === 'comparison' && <EmbeddingComparison />}
        {activeSection === 'live' && <LiveEmbeddingDemo />}
        {activeSection === 'scores' && <SimilarityScoreExplainer />}
      </div>

      {/* Workshop Tips */}
      <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          🎓 Workshop Exercise Ideas
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Try Different Queries</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• "Show me all diagrams" - Tests visual understanding</li>
              <li>• "Explain transformers" - Tests semantic search</li>
              <li>• "Architecture on page 5" - Tests specific retrieval</li>
              <li>• "Tables with results" - Tests mixed modality</li>
            </ul>
          </div>
          
          <div className="bg-white/80 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Observe the Differences</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Notice how visual queries rank image-heavy pages higher</li>
              <li>• See how multimodal fusion improves accuracy</li>
              <li>• Compare speed vs traditional keyword search</li>
              <li>• Test edge cases like handwritten notes or charts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}