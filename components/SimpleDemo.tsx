'use client';

import React, { useState } from 'react';
import { Upload, MessageSquare, Sparkles, Loader2 } from 'lucide-react';

export default function SimpleDemo() {
  const [step, setStep] = useState<'init' | 'upload' | 'chat'>('init');
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [error, setError] = useState('');

  // Initialize demo
  const initDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/init-simple-demo', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setDocumentId(data.documentId);
        setStep('chat');
      } else {
        setError(data.error || 'Failed to initialize demo');
      }
    } catch (err) {
      setError('Failed to initialize demo');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      const response = await fetch('/api/upload-simple', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDocumentId(data.documentId);
        setStep('chat');
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle chat
  const handleChat = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setError('');
    setChatResponse('');
    
    try {
      const response = await fetch('/api/chat-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          documentId
        })
      });
      
      const data = await response.json();
      
      if (data.response) {
        setChatResponse(data.response);
      } else {
        setError(data.error || 'Chat failed');
      }
    } catch (err) {
      setError('Chat failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Simple Multimodal AI Demo</h1>
        <p className="text-gray-600">Upload a PDF and ask questions using Voyage AI embeddings</p>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step !== 'init' ? 'bg-green-600 text-white' : 'bg-gray-300'
          }`}>
            1
          </div>
          <div className="w-20 h-0.5 bg-gray-300"></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            step === 'chat' ? 'bg-green-600 text-white' : 'bg-gray-300'
          }`}>
            2
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {step === 'init' && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Choose an option:</h2>
            
            <div className="space-y-4">
              <button
                onClick={initDemo}
                disabled={loading}
                className="w-full max-w-sm mx-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Try Demo Content</span>
                  </>
                )}
              </button>
              
              <div className="text-gray-500">OR</div>
              
              <label className="w-full max-w-sm mx-auto flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>Upload Your PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUpload}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {step === 'upload' && loading && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Processing your PDF...</p>
          </div>
        )}

        {step === 'chat' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Ask questions about your document
            </h2>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                placeholder="What would you like to know?"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleChat}
                disabled={loading || !message.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ask'}
              </button>
            </div>

            {chatResponse && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Response:</h3>
                <p className="whitespace-pre-wrap">{chatResponse}</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Document ID: {documentId || 'Not loaded'}</p>
        <p>Using Voyage AI multimodal embeddings with MongoDB Atlas</p>
      </div>
    </div>
  );
}