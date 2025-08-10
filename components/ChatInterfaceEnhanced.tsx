'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import VectorSearchInsights from './VectorSearchInsights';
import { imageResolver } from '@/lib/services/imageResolver';
import ImageModal from './ImageModal';
// Using standard img tags for local files instead of Next.js Image

interface Source {
  page: number;
  score: number;
  imagePath?: string; // Will be set by the component using imageResolver
  storedKey?: string; // Original key from vector search (blob URL or local path)
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface ChatInterfaceEnhancedProps {
  documentId: string | null;
}

export default function ChatInterfaceEnhanced({ documentId }: ChatInterfaceEnhancedProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; pageNumber: number } | null>(null);
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate summary when document ID is provided and not already generated
  useEffect(() => {
    const generateSummary = async () => {
      // Check for example document ID from session storage
      const exampleDocId = sessionStorage.getItem('exampleDocumentId');
      const docId = documentId || exampleDocId;
      
      if (!docId || summaryGenerated) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: docId })
        });
        
        const data = await response.json();
        
        if (data.success) {
          const summaryMessage: Message = {
            id: `summary-${Date.now()}`,
            role: 'assistant',
            content: data.summary,
            timestamp: new Date()
          };
          
          setMessages([summaryMessage]);
          setSummaryGenerated(true);
          
          // Clear the example document ID from session storage
          if (exampleDocId) {
            sessionStorage.removeItem('exampleDocumentId');
          }
        }
      } catch (error) {
        console.error('Failed to generate summary:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generateSummary();
  }, [documentId, summaryGenerated]);

  // Function to detect page references in content
  const extractPageReferences = (content: string): number[] => {
    // More comprehensive regex pattern
    const pagePatterns = [
      /\bpage\s+(\d+)/gi,
      /\bp\.?\s*(\d+)/gi,
      /\bpages?\s+(\d+(?:\s*[-,and]\s*\d+)*)/gi,
      /\bon\s+page\s+(\d+)/gi,
      /\bPage\s+(\d+)/g,  // Capital P
    ];
    
    const pages = new Set<number>();
    
    pagePatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          // Handle single page or page ranges
          const pageNums = match[1].split(/[,-and\s]+/).filter(p => p.trim());
          pageNums.forEach(num => {
            const pageNum = parseInt(num.trim());
            if (!isNaN(pageNum) && pageNum > 0 && pageNum <= 100) {
              pages.add(pageNum);
            }
          });
        }
      }
    });
    
    console.log('Extracted page references:', Array.from(pages));
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check if we should use stable chat API
      const useStableChat = sessionStorage.getItem('useStableChat') === 'true';
      const apiEndpoint = useStableChat ? '/api/chat-stable' : '/api/chat';
      
      console.log(`Using ${useStableChat ? 'stable' : 'standard'} chat API:`, apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          documentId: documentId || sessionStorage.getItem('exampleDocumentId') || undefined
        }),
      });

      const data = await response.json();

      // Extract page references from the response
      const referencedPages = extractPageReferences(data.response || '');
      
      // Get current document ID for image resolution
      const currentDocId = documentId || sessionStorage.getItem('exampleDocumentId');
      
      // Enhance sources with image paths using imageResolver
      const enhancedSources = data.sources?.map((source: any) => {
        // Only try to resolve images if we have a key
        const imagePath = source.key 
          ? imageResolver.resolveImageUrl(source.page, source.key, currentDocId || '').url
          : null;
        
        return {
          page: source.page,
          score: source.score,
          imagePath: imagePath,
          storedKey: source.key,
          hasImage: !!source.key // Flag to indicate if image should be shown
        };
      }) || [];

      // Add any referenced pages not in sources
      referencedPages.forEach(pageNum => {
        if (!enhancedSources.find((s: Source) => s.page === pageNum)) {
          const resolved = imageResolver.resolveImageUrl(pageNum, undefined, currentDocId || '');
          enhancedSources.push({
            page: pageNum,
            score: 0,
            imagePath: resolved.url
          });
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.error || 'Sorry, I couldn\'t process that request.',
        sources: enhancedSources,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className="flex flex-col h-[450px] glass rounded-2xl shadow-xl overflow-hidden">
        {/* Insights Toggle */}
        <div className="flex justify-end p-3 border-b border-gray-200/50">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={`text-xs flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
              showInsights 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{showInsights ? '🔬' : '👁️'}</span>
            <span>{showInsights ? 'Hide' : 'Show'} Technical Insights</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-600/10 to-emerald-600/10 mb-4">
                <Bot className="w-8 h-8 text-green-700" />
              </div>
              {documentId && !summaryGenerated ? (
                <>
                  <p className="text-xl font-semibold text-gray-900">Analyzing your document...</p>
                  <p className="text-sm mt-2 text-gray-600">
                    Generating a comprehensive summary to get you started
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl font-semibold text-gray-900">Start a conversation</p>
                  <p className="text-sm mt-2 text-gray-600">
                    Ask questions about your PDF and I'll show you the relevant pages
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <SampleQuestion text="What is on page 1?" />
                    <SampleQuestion text="Summarize the main points" />
                    <SampleQuestion text="Show me any diagrams" />
                  </div>
                </>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-fade-in`}
              >
                <div
                  className={`flex max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600 ml-3'
                        : 'bg-gradient-to-br from-gray-600 to-gray-700 mr-3'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Vector Search Insights for assistant messages */}
                    {message.role === 'assistant' && message.sources && message.sources.length > 0 && showInsights && (
                      <VectorSearchInsights insights={{ sources: message.sources }} />
                    )}
                    
                    {/* Display source images */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-gray-500 flex items-center">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Referenced pages:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.sources.map((source) => (
                            <div
                              key={source.page}
                              className="relative group cursor-pointer"
                              onClick={() => source.imagePath && setSelectedImage({ url: source.imagePath, pageNumber: source.page })}
                            >
                              <div className="relative w-20 h-28 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-600 transition-all duration-300 hover:scale-105">
                                {source.imagePath ? (
                                  <img
                                    src={source.imagePath}
                                    alt={`Page ${source.page}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Use imageResolver to handle fallbacks
                                      const img = e.target as HTMLImageElement;
                                      const currentDocId = documentId || sessionStorage.getItem('exampleDocumentId');
                                      imageResolver.handleImageError(img, source.page, currentDocId || '');
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <div className="text-center">
                                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                      <span className="text-xs text-gray-500">Page {source.page}</span>
                                    </div>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 p-1 text-center">
                                  <span className="text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded">
                                    Page {source.page}
                                  </span>
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ZoomIn className="w-4 h-4 text-white drop-shadow-lg" />
                                </div>
                              </div>
                              {source.score > 0 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                  {Math.round(source.score * 100)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-center space-x-3 glass px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-gray-600">Analyzing document...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200/50 p-4 bg-white/50">
          <div className="flex space-x-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about specific pages, content, or request to see images..."
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Full-size image modal using portal */}
      <ImageModal 
        imageUrl={selectedImage?.url || null}
        pageNumber={selectedImage?.pageNumber}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}

function SampleQuestion({ text }: { text: string }) {
  return (
    <div className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 cursor-pointer transition-colors">
      {text}
    </div>
  );
}