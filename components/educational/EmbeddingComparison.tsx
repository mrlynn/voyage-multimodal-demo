'use client';

import React, { useState } from 'react';
import { FileText, Image, Layers, ArrowRight, Zap, Target } from 'lucide-react';

export default function EmbeddingComparison() {
  const [activeMode, setActiveMode] = useState<'text' | 'image' | 'multimodal'>('multimodal');
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const modes = {
    text: {
      name: 'Text-Only Embeddings',
      icon: FileText,
      color: 'blue',
      features: [
        { name: 'Semantic meaning', strength: 90 },
        { name: 'Keywords & entities', strength: 95 },
        { name: 'Context understanding', strength: 85 },
        { name: 'Visual information', strength: 0 },
        { name: 'Spatial relationships', strength: 0 },
        { name: 'Color & style', strength: 0 }
      ],
      pros: ['Fast processing', 'Low memory usage', 'Great for pure text'],
      cons: ['Misses visual context', 'Cannot understand diagrams', 'Limited for PDFs with images']
    },
    image: {
      name: 'Image-Only Embeddings',
      icon: Image,
      color: 'purple',
      features: [
        { name: 'Semantic meaning', strength: 30 },
        { name: 'Keywords & entities', strength: 0 },
        { name: 'Context understanding', strength: 20 },
        { name: 'Visual information', strength: 95 },
        { name: 'Spatial relationships', strength: 90 },
        { name: 'Color & style', strength: 85 }
      ],
      pros: ['Captures visual elements', 'Understands layouts', 'Great for diagrams'],
      cons: ['Cannot read text', 'Misses written content', 'Higher computational cost']
    },
    multimodal: {
      name: 'Multimodal Embeddings',
      icon: Layers,
      color: 'gradient',
      features: [
        { name: 'Semantic meaning', strength: 85 },
        { name: 'Keywords & entities', strength: 90 },
        { name: 'Context understanding', strength: 95 },
        { name: 'Visual information', strength: 90 },
        { name: 'Spatial relationships', strength: 85 },
        { name: 'Color & style', strength: 80 }
      ],
      pros: ['Complete understanding', 'Best search accuracy', 'Handles all content types'],
      cons: ['Higher processing time', 'More complex implementation', 'Requires more resources']
    }
  };

  const currentMode = modes[activeMode];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Text vs Multimodal Embeddings
        </h2>
        <p className="text-gray-600">
          Understand why multimodal embeddings are powerful for PDF search
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          {Object.entries(modes).map(([key, mode]) => {
            const Icon = mode.icon;
            const isActive = activeMode === key;
            
            return (
              <button
                key={key}
                onClick={() => setActiveMode(key as any)}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300
                  ${isActive 
                    ? 'bg-white shadow-md text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${
                  isActive && mode.color === 'gradient' 
                    ? 'text-purple-600' 
                    : isActive
                    ? `text-${mode.color}-600`
                    : ''
                }`} />
                <span className="font-medium">{mode.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Comparison */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Example PDF Page</h3>
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
            <div className="space-y-4">
              {/* Text content */}
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Neural Network Architecture</h4>
                <p className="text-sm text-gray-600">
                  A neural network consists of interconnected layers of neurons...
                </p>
              </div>
              
              {/* Image placeholder */}
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-8 text-center">
                <Image className="w-16 h-16 mx-auto text-purple-600 mb-2" />
                <p className="text-sm text-purple-700">Diagram: Network Layers</p>
              </div>
              
              {/* More text */}
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  The diagram above shows how data flows through the network...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Embedding Output */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">What Gets Captured</h3>
          <div className="space-y-3">
            {currentMode.features.map((feature) => (
              <div
                key={feature.name}
                onMouseEnter={() => setHoveredFeature(feature.name)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {feature.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {feature.strength}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeMode === 'multimodal'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        : activeMode === 'text'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${feature.strength}%` }}
                  />
                </div>
                
                {hoveredFeature === feature.name && feature.strength > 0 && (
                  <div className="absolute z-10 mt-2 p-2 bg-gray-900 text-white text-xs rounded-lg">
                    {activeMode === 'multimodal' 
                      ? 'Captures from both text and visual analysis'
                      : activeMode === 'text'
                      ? 'Extracted from text content only'
                      : 'Derived from visual features only'
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pros and Cons */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-xl p-6">
          <h4 className="flex items-center space-x-2 text-green-800 font-semibold mb-3">
            <Target className="w-5 h-5" />
            <span>Strengths</span>
          </h4>
          <ul className="space-y-2">
            {currentMode.pros.map((pro, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-green-700">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6">
          <h4 className="flex items-center space-x-2 text-orange-800 font-semibold mb-3">
            <Zap className="w-5 h-5" />
            <span>Limitations</span>
          </h4>
          <ul className="space-y-2">
            {currentMode.cons.map((con, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-orange-700">
                <span className="text-orange-500 mt-0.5">!</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Use Case Examples */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Best Use Cases</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${activeMode === 'text' ? 'bg-white shadow-md' : 'bg-white/50'}`}>
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <h5 className="font-medium text-sm mb-1">Text-Heavy Documents</h5>
            <p className="text-xs text-gray-600">Research papers, contracts, articles</p>
          </div>
          
          <div className={`p-4 rounded-lg ${activeMode === 'image' ? 'bg-white shadow-md' : 'bg-white/50'}`}>
            <Image className="w-8 h-8 text-purple-600 mb-2" />
            <h5 className="font-medium text-sm mb-1">Visual Content</h5>
            <p className="text-xs text-gray-600">Presentations, infographics, diagrams</p>
          </div>
          
          <div className={`p-4 rounded-lg ${activeMode === 'multimodal' ? 'bg-white shadow-md' : 'bg-white/50'}`}>
            <Layers className="w-8 h-8 text-indigo-600 mb-2" />
            <h5 className="font-medium text-sm mb-1">Mixed Content</h5>
            <p className="text-xs text-gray-600">Technical docs, textbooks, reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}