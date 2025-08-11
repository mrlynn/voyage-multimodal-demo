'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, ArrowRight, Check, Loader2, BookOpen, MessageSquare } from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export default function ExamplePDFDemo() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedForExisting, setCheckedForExisting] = useState(false);
  
  const steps: DemoStep[] = [
    {
      id: 'create',
      title: 'Create Demo Document',
      description: 'Generate sample multimodal content for demonstration',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'in_progress' : 'pending'
    },
    {
      id: 'embeddings',
      title: 'Generate Embeddings',
      description: 'Create vector embeddings using Voyage AI multimodal model',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'in_progress' : 'pending'
    },
    {
      id: 'index',
      title: 'Store in MongoDB Atlas',
      description: 'Index embeddings for fast vector similarity search',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in_progress' : 'pending'
    },
    {
      id: 'ready',
      title: 'Ready for Questions',
      description: 'Ask about multimodal AI, vector search, or MongoDB Atlas',
      status: currentStep === 3 ? 'completed' : 'pending'
    }
  ];

  // Check for existing demo on component mount
  useEffect(() => {
    const checkExistingDemo = async () => {
      if (checkedForExisting) return;
      
      try {
        const DEMO_DOC_ID = 'simple-demo';
        
        // Check if demo already exists in MongoDB
        const response = await fetch('/api/health');
        if (response.ok) {
          const healthData = await response.json();
          if (healthData.mongodb?.connected) {
            // Check for existing demo data
            const checkResponse = await fetch('/api/check-demo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ documentId: DEMO_DOC_ID })
            });
            
            if (checkResponse.ok) {
              const checkData = await checkResponse.json();
              if (checkData.exists && checkData.pageCount > 0) {
                setCurrentStep(3);
                setDocumentId(DEMO_DOC_ID);
              }
            }
          }
        }
      } catch (error) {
        console.log('Could not check for existing demo:', error);
      } finally {
        setCheckedForExisting(true);
      }
    };
    
    checkExistingDemo();
  }, [checkedForExisting]);

  const createDemo = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const DEMO_DOC_ID = 'simple-demo';
      
      // Step 1: Create demo content
      setCurrentStep(1);
      console.log('📄 Creating demo document...');
      
      // Step 2: Generate embeddings
      setCurrentStep(2);
      console.log('🤖 Generating embeddings with Voyage AI...');
      
      // Initialize demo using the simple demo endpoint
      const response = await fetch('/api/init-simple-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create demo');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Step 3: Store in MongoDB
        setCurrentStep(3);
        setDocumentId(DEMO_DOC_ID);
        
        console.log('✅ Demo created successfully!');
      } else {
        throw new Error(result.error || 'Failed to create demo');
      }
      
    } catch (err) {
      console.error('Demo error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create demo');
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const openChatWithDemo = () => {
    if (documentId) {
      // Store demo document info for the chat to use simple endpoint
      sessionStorage.setItem('exampleDocumentId', documentId);
      sessionStorage.setItem('useSimpleChat', 'true');
      // Trigger navigation to chat tab with demo document
      window.dispatchEvent(new CustomEvent('openChatWithExample', { 
        detail: { documentId, useSimpleChat: true } 
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-600/10 to-emerald-600/10 mb-4">
          <FileText className="w-8 h-8 text-green-700" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Try the Live Demo</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience how multimodal AI works with a simple demonstration. 
          This mirrors the approach from our Python notebook (lab.ipynb) using real Voyage AI embeddings and MongoDB Atlas.
        </p>
      </div>

      {/* Process Steps */}
      <div className="glass rounded-2xl p-8">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 ${
                step.status === 'completed' 
                  ? 'bg-green-50 border border-green-200' 
                  : step.status === 'in_progress'
                  ? 'bg-blue-50 border border-blue-200 animate-pulse'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                step.status === 'completed'
                  ? 'bg-green-600'
                  : step.status === 'in_progress'
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}>
                {step.status === 'completed' ? (
                  <Check className="w-5 h-5 text-white" />
                ) : step.status === 'in_progress' ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <span className="text-white font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  step.status === 'pending' ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm mt-1 ${
                  step.status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {currentStep === 0 && !isProcessing && (
            <button
              onClick={createDemo}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transform transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Upload className="w-5 h-5" />
              <span>Create Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {currentStep === 3 && !isProcessing && (
            <button
              onClick={openChatWithDemo}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transform transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Start Asking Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Demo Info */}
        {currentStep === 3 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-semibold text-green-900 mb-2">Demo Ready!</h4>
            <p className="text-xs text-green-700">
              The demo contains sample content about multimodal AI, vector search, and MongoDB Atlas. 
              You can now ask questions about these topics to see how the system works.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <BookOpen className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Sample Content</h3>
          <p className="text-sm text-gray-600">
            The demo contains structured text content about AI concepts - perfect for demonstrating semantic search and understanding.
          </p>
        </div>

        <div className="glass rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
            <BookOpen className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Voyage AI Embeddings</h3>
          <p className="text-sm text-gray-600">
            Experience how voyage-multimodal-3 creates semantic embeddings that understand context and meaning in text.
          </p>
        </div>

        <div className="glass rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <MessageSquare className="w-6 h-6 text-blue-700" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Interactive Q&A</h3>
          <p className="text-sm text-gray-600">
            Ask questions about specific content, request summaries, or search for visual elements like diagrams and tables.
          </p>
        </div>
      </div>

      {/* Sample Questions */}
      {currentStep === 3 && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Try These Example Questions:</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">"What is multimodal AI?"</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">"How does vector search work?"</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">"Tell me about MongoDB Atlas"</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">"What is voyage-multimodal-3?"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}