'use client';

import { useState } from 'react';

export default function SimplePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setStatus('Uploading PDF...');
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      const response = await fetch('/api/simple-upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus(`✅ Processed ${result.pageCount} pages`);
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ Upload failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setAnswer('');
    
    try {
      const response = await fetch('/api/simple-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      
      const result = await response.json();
      setAnswer(result.answer || result.error || 'No response');
    } catch (error) {
      setAnswer('Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Simple Multimodal AI Demo
        </h1>
        
        {/* Step 1: Upload PDF */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Upload PDF</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4 block w-full"
          />
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading && status.includes('Uploading') ? 'Processing...' : 'Upload & Process'}
          </button>
          {status && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              {status}
            </div>
          )}
        </div>

        {/* Step 2: Ask Questions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">2. Ask Questions</h2>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your PDF..."
            className="w-full p-3 border rounded mb-4"
            onKeyPress={(e) => e.key === 'Enter' && handleQuestion()}
          />
          <button
            onClick={handleQuestion}
            disabled={loading || !question.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading && !status.includes('Uploading') ? 'Thinking...' : 'Ask'}
          </button>
          
          {answer && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Answer:</h3>
              <p className="whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Pipeline: PDF → Voyage AI Multimodal → MongoDB Atlas → Gemini AI</p>
        </div>
      </div>
    </div>
  );
}