'use client';

import React from 'react';
import { X, BookOpen, Zap, Database, MessageSquare, ArrowRight, Sparkles, Play } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-green-600/10 to-emerald-500/10 border border-green-200/50">
              <Sparkles className="w-4 h-4 text-green-700 mr-2" />
              <span className="text-sm font-medium text-green-800">MongoDB AI Workshop</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Welcome to the</span>
              <br />
              <span className="text-gray-900">Multimodal AI Agent Demo</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience the power of AI-driven document understanding using 
              <span className="font-semibold text-green-700"> MongoDB Atlas Vector Search</span>, 
              <span className="font-semibold text-blue-700"> Voyage AI embeddings</span>, and 
              <span className="font-semibold text-purple-700"> Google Gemini</span>.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* What This Demo Does */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Play className="w-6 h-6 text-green-600 mr-2" />
              What This Demo Does
            </h2>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                This demo showcases a complete <strong>multimodal AI pipeline</strong> that transforms static PDFs 
                into interactive, searchable knowledge bases. Upload any PDF and ask natural language questions 
                about its content - the AI understands both text and visual elements like charts, diagrams, and tables.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800">Smart Document Analysis</h4>
                    <p className="text-sm text-green-700">AI reads and understands both text and visual content</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800">Natural Conversation</h4>
                    <p className="text-sm text-green-700">Ask questions in plain English, get detailed answers</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="w-6 h-6 text-blue-600 mr-2" />
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <h3 className="font-semibold text-blue-800 mb-2 mt-2">PDF Processing</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Your PDF is converted to high-resolution images (450 DPI) using pdf-poppler for optimal text clarity.
                </p>
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  <strong>Tech:</strong> pdf-poppler conversion
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <h3 className="font-semibold text-purple-800 mb-2 mt-2">Multimodal Embeddings</h3>
                <p className="text-sm text-purple-700 mb-3">
                  Voyage AI's voyage-3 creates 1024-dimensional embeddings that understand both text and visual layout.
                </p>
                <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                  <strong>Tech:</strong> Voyage AI voyage-2
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200 relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <h3 className="font-semibold text-green-800 mb-2 mt-2">Vector Search</h3>
                <p className="text-sm text-green-700 mb-3">
                  MongoDB Atlas stores embeddings and performs lightning-fast similarity searches using HNSW indexing.
                </p>
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  <strong>Tech:</strong> MongoDB Atlas Vector Search
                </div>
              </div>
            </div>
          </section>

          {/* Key Technologies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 text-gray-600 mr-2" />
              Key Technologies
            </h2>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">MongoDB Atlas</h4>
                <p className="text-xs text-gray-600 mt-1">Native vector search with HNSW indexing</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Voyage AI</h4>
                <p className="text-xs text-gray-600 mt-1">Unified multimodal embeddings</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Google Gemini</h4>
                <p className="text-xs text-gray-600 mt-1">2.0 Flash for multimodal analysis</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Next.js 15</h4>
                <p className="text-xs text-gray-600 mt-1">Modern React with App Router</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-orange-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Python + Jupyter</h4>
                <p className="text-xs text-gray-600 mt-1">Workshop notebooks and analysis</p>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <ArrowRight className="w-6 h-6 text-green-600 mr-2" />
              Getting Started
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Quick Start Options:</h3>
                  <ul className="space-y-2 text-green-700">
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                      Try the <strong> Learn tab </strong> with our example PDF
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                      <strong>Upload your own PDF</strong> and analyze it
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                      Explore the <strong>educational components</strong>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-3">Best Results With:</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Research papers and technical documents</li>
                    <li>• PDFs with charts, tables, and diagrams</li>
                    <li>• Reports with mixed text and visual content</li>
                    <li>• Educational materials and presentations</li>
                    <li>• Files under 4MB for optimal performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Built for MongoDB AI Workshop</span> • Showcasing vector search capabilities
            </div>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transform transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}