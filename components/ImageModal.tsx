'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
  pageNumber?: number;
}

export default function ImageModal({ imageUrl, onClose, pageNumber }: ImageModalProps) {
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
              <a
                href={imageUrl}
                download={`page-${pageNumber || 'image'}.png`}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-5 h-5" />
              </a>
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
          
          {/* Image */}
          <img
            src={imageUrl}
            alt={`Page ${pageNumber || 'image'}`}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
          />
          
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