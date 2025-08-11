'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
  pageNumber?: number;
  isPlaceholder?: boolean;
}

export default function ImageModal({ imageUrl, onClose, pageNumber, isPlaceholder }: ImageModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (imageUrl) {
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm animate-modal-fade-in"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top toolbar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
            <div className="text-white pointer-events-auto">
              {pageNumber && (
                <span className="text-lg font-medium">Page {pageNumber}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 pointer-events-auto">
              {!isPlaceholder && (
                <a
                  href={imageUrl}
                  download={`page-${pageNumber || 'image'}.png`}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close image"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Image or placeholder */}
          {isPlaceholder ? (
            <div className="flex items-center justify-center min-h-[400px] min-w-[300px] bg-gray-100 rounded-lg shadow-2xl">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Page {pageNumber}</h3>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                  This demo uses text content only. In a full implementation, you would see the actual PDF page image here with all visual elements, diagrams, and formatted text.
                </p>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>💡 Demo Note:</strong> This simplified demo shows how vector search works with text content. 
                    Upload a PDF in the main application to see actual page images.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={`Page ${pageNumber || 'image'}`}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            />
          )}
          
          {/* Click instruction */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-black/70 text-white text-sm">
              Click anywhere to close • Press ESC to exit
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return modalContent;
}