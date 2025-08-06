'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Image as ImageIcon, X, ZoomIn, AlertCircle } from 'lucide-react';

interface Source {
  page: number;
  score: number;
  imagePath?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

export default function ChatInterfaceDebug() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to detect page references in content
  const extractPageReferences = (content: string): number[] => {
    const pagePatterns = [
      /\bpage\s+(\d+)/gi,
      /\bp\.?\s*(\d+)/gi,
      /\bpages?\s+(\d+(?:\s*[-,and]\s*\d+)*)/gi,
      /\bon\s+page\s+(\d+)/gi,
      /\bPage\s+(\d+)/g,
    ];
    
    const pages = new Set<number>();
    
    pagePatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      // Extract page references from the response
      const referencedPages = extractPageReferences(data.response || '');
      
      // Try multiple image path formats - prioritize zero-padded since that's how files are saved
      const getImagePaths = (pageNum: number): string[] => {
        return [
          `/uploads/pdf-pages/page-${pageNum.toString().padStart(2, '0')}.png`, // Try this first (page-02.png)
          `/uploads/pdf-pages/page-${pageNum}.png`,                            // Fallback to single digit
          `/uploads/pdf-pages/page-${pageNum.toString().padStart(3, '0')}.png`, // Fallback to 3-digit
        ];
      };

      // Enhance sources with image paths
      const enhancedSources = data.sources?.map((source: Source) => ({
        ...source,
        imagePath: getImagePaths(source.page)[0], // Start with first format
        alternativePaths: getImagePaths(source.page)
      })) || [];

      // Add any referenced pages not in sources
      referencedPages.forEach(pageNum => {
        if (!enhancedSources.find((s: Source) => s.page === pageNum)) {
          enhancedSources.push({
            page: pageNum,
            score: 0,
            imagePath: getImagePaths(pageNum)[0],
            alternativePaths: getImagePaths(pageNum)
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

  const handleImageError = (source: any, attemptIndex: number = 0) => {
    if (attemptIndex < source.alternativePaths?.length - 1) {
      return source.alternativePaths[attemptIndex + 1];
    }
    setImageErrors(prev => ({ ...prev, [`page-${source.page}`]: true }));
    return null;
  };

  return (
    <>
      <div className="flex flex-col h-full glass rounded-2xl shadow-xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 mb-4">
                <Bot className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900">Start a conversation</p>
              <p className="text-sm mt-2 text-gray-600">
                Ask questions about your PDF and I'll show you the relevant pages
              </p>
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
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 ml-3'
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
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Display source images */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-gray-500 flex items-center">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Referenced pages:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.sources.map((source: any) => (
                            <div
                              key={source.page}
                              className="relative group"
                            >
                              {imageErrors[`page-${source.page}`] ? (
                                <div className="w-20 h-28 rounded-lg border-2 border-red-300 bg-red-50 flex flex-col items-center justify-center p-2">
                                  <AlertCircle className="w-6 h-6 text-red-500 mb-1" />
                                  <span className="text-xs text-red-600 text-center">
                                    Page {source.page}
                                    <br />
                                    Not Found
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className="relative w-20 h-28 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-500 transition-all duration-300 hover:scale-105 cursor-pointer"
                                  onClick={() => !imageErrors[`page-${source.page}`] && setSelectedImage(source.imagePath || null)}
                                >
                                  <ImageWithFallback
                                    source={source}
                                    onError={handleImageError}
                                    onLoad={() => console.log(`Loaded: ${source.imagePath}`)}
                                  />
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
                              )}
                              {source.score > 0 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                  {Math.round(source.score * 100)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Debug info */}
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                          <div>Debug Info:</div>
                          {message.sources.map((source: any) => (
                            <div key={source.page}>
                              Page {source.page}: {source.imagePath}
                              {source.alternativePaths && (
                                <div className="ml-4 text-gray-600">
                                  Alternatives: {source.alternativePaths.join(', ')}
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
                <Loader2 className="w-4 h-4 animate-spin" />
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
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
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

      {/* Full-size image modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt="PDF Page"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Component to handle image loading with fallbacks
function ImageWithFallback({ source, onError, onLoad }: any) {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (currentPathIndex < source.alternativePaths.length - 1) {
      setCurrentPathIndex(currentPathIndex + 1);
    } else {
      setHasError(true);
      onError(source, currentPathIndex);
    }
  };

  if (hasError) {
    return null;
  }

  return (
    <img
      src={source.alternativePaths?.[currentPathIndex] || source.imagePath}
      alt={`Page ${source.page}`}
      className="w-full h-full object-cover"
      onError={handleError}
      onLoad={onLoad}
    />
  );
}