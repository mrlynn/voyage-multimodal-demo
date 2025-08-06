'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, Sparkles, ArrowRight, Check, Loader2, BookOpen, MessageSquare, RotateCcw, Trash2 } from 'lucide-react';

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
  const [pdfInfo, setPdfInfo] = useState<{ 
    hash?: string; 
    exists: boolean; 
    size?: number; 
    modified?: string; 
    path?: string; 
  } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  
  const steps: DemoStep[] = [
    {
      id: 'load',
      title: 'Load Example PDF',
      description: 'We\'ll use a pre-loaded research paper to demonstrate the system',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'in_progress' : 'pending'
    },
    {
      id: 'process',
      title: 'Process & Generate Embeddings',
      description: 'Extract pages and create multimodal embeddings with Voyage AI',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'in_progress' : 'pending'
    },
    {
      id: 'index',
      title: 'Index in MongoDB Atlas',
      description: 'Store embeddings for vector similarity search',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'in_progress' : 'pending'
    },
    {
      id: 'ready',
      title: 'Ready to Query',
      description: 'Ask questions about the document content',
      status: currentStep === 3 ? 'completed' : 'pending'
    }
  ];

  // Check for existing processed PDF and get PDF info on component mount
  useEffect(() => {
    const checkExistingPDF = async () => {
      if (checkedForExisting) return;
      
      try {
        const EXAMPLE_DOC_ID = 'example-pdf-demo';
        
        // Get current PDF info
        const infoResponse = await fetch('/api/example-info');
        if (infoResponse.ok) {
          const infoData = await infoResponse.json();
          setPdfInfo(infoData);
        }
        
        const checkResponse = await fetch('/api/check-example', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: EXAMPLE_DOC_ID })
        });
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (checkData.exists && checkData.pageCount > 0) {
            // Example PDF already processed, show as ready
            setCurrentStep(3);
            setDocumentId(EXAMPLE_DOC_ID);
          }
        }
      } catch (error) {
        console.log('Could not check for existing PDF:', error);
      } finally {
        setCheckedForExisting(true);
      }
    };
    
    checkExistingPDF();
  }, [checkedForExisting]);

  const processExamplePDF = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Step 1: Check if example PDF already exists in database
      setCurrentStep(1);
      
      const EXAMPLE_DOC_ID = 'example-pdf-demo';
      
      // First check if the example PDF is already processed
      const checkResponse = await fetch('/api/check-example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: EXAMPLE_DOC_ID })
      });
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.exists && checkData.pageCount > 0) {
          // Example PDF already processed, skip to final step
          setCurrentStep(3);
          setDocumentId(EXAMPLE_DOC_ID);
          return;
        }
      }
      
      // If not found, process it normally
      // Step 2: Load the example PDF
      setCurrentStep(2);
      
      const pdfResponse = await fetch('/example.pdf');
      if (!pdfResponse.ok) {
        throw new Error('Failed to load example PDF');
      }
      
      const pdfBlob = await pdfResponse.blob();
      const pdfFile = new File([pdfBlob], 'example.pdf', { type: 'application/pdf' });
      
      // Step 3: Upload and process with predefined ID
      setCurrentStep(3);
      
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('documentId', EXAMPLE_DOC_ID); // Use predefined ID
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }
      
      const uploadResult = await uploadResponse.json();
      setDocumentId(uploadResult.documentId);
      
    } catch (err) {
      console.error('Demo error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process example PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetExamplePDF = async () => {
    setIsResetting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reset-example', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Reset result:', result);
        
        // Reset component state
        setCurrentStep(0);
        setDocumentId(null);
        setCheckedForExisting(false);
        
        // Refresh PDF info
        const infoResponse = await fetch('/api/example-info');
        if (infoResponse.ok) {
          const infoData = await infoResponse.json();
          setPdfInfo(infoData);
        }
        
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reset example PDF');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset example PDF');
    } finally {
      setIsResetting(false);
    }
  };

  const openChatWithExample = () => {
    if (documentId) {
      // Store the document ID in session storage for the chat to pick up
      sessionStorage.setItem('exampleDocumentId', documentId);
      // Trigger navigation to chat tab (parent component will handle this)
      window.dispatchEvent(new CustomEvent('openChatWithExample', { detail: { documentId } }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-600/10 to-emerald-600/10 mb-4">
          <FileText className="w-8 h-8 text-green-700" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Try It With An Example</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the full multimodal search pipeline using a pre-loaded research paper. 
          Watch how Voyage AI processes both text and visual content.
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
              onClick={processExamplePDF}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transform transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Upload className="w-5 h-5" />
              <span>Process Example PDF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          
          {currentStep === 3 && !isProcessing && (
            <>
              <button
                onClick={openChatWithExample}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transform transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Open Chat with Example</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={resetExamplePDF}
                disabled={isResetting}
                className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transform transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
                <span>{isResetting ? 'Resetting...' : 'Reset'}</span>
              </button>
            </>
          )}
        </div>

        {/* PDF Info Display */}
        {pdfInfo && pdfInfo.exists && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Current Example PDF</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div>File: example.pdf {pdfInfo.size && `(${(pdfInfo.size / 1024).toFixed(1)} KB)`}</div>
              <div>Hash: {pdfInfo.hash || 'Unknown'}</div>
              <div>Modified: {pdfInfo.modified ? new Date(pdfInfo.modified).toLocaleString() : 'Unknown'}</div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 <strong>Tip:</strong> Replace /public/example.pdf with a new PDF and click "Reset" to use a different document for the demo.
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
          <h3 className="font-semibold text-gray-900 mb-2">Research Paper</h3>
          <p className="text-sm text-gray-600">
            The example PDF contains mixed content including text, diagrams, tables, and formulas - perfect for demonstrating multimodal capabilities.
          </p>
        </div>

        <div className="glass rounded-xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
            <Sparkles className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Voyage AI Processing</h3>
          <p className="text-sm text-gray-600">
            Watch as voyage-multimodal-3 creates unified embeddings that understand both textual content and visual layout.
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
              <p className="text-sm text-gray-700">"What evaluation metrics are discussed?"</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">"Show me any performance comparison tables"</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">"What algorithms are mentioned?"</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">"Find any architectural diagrams"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}