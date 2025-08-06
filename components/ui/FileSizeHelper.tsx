'use client';

import React from 'react';
import { FileText, Zap, ExternalLink, AlertCircle } from 'lucide-react';

interface FileSizeHelperProps {
  maxSizeMB: number;
  currentSizeMB: number;
  onClose: () => void;
}

export default function FileSizeHelper({ maxSizeMB, currentSizeMB, onClose }: FileSizeHelperProps) {
  const compressionTools = [
    {
      name: 'SmallPDF',
      url: 'https://smallpdf.com/compress-pdf',
      description: 'Free online PDF compressor'
    },
    {
      name: 'ILovePDF',
      url: 'https://www.ilovepdf.com/compress_pdf',
      description: 'Compress PDF files online'
    },
    {
      name: 'Adobe Acrobat',
      url: 'https://www.adobe.com/acrobat/online/compress-pdf.html',
      description: 'Official Adobe compression tool'
    }
  ];

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">
              File Too Large
            </h4>
            <p className="text-sm text-yellow-700 mb-3">
              Your PDF is <strong>{currentSizeMB}MB</strong>, but the maximum allowed size is <strong>{maxSizeMB}MB</strong>.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-yellow-400 hover:text-yellow-600 ml-2"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-yellow-800">
          <Zap className="w-4 h-4 mr-2" />
          <span className="font-medium">Quick Solutions:</span>
        </div>

        <div className="pl-6 space-y-2">
          <div className="text-sm text-yellow-700">
            <strong>Option 1:</strong> Use fewer pages - extract only the pages you need
          </div>
          <div className="text-sm text-yellow-700">
            <strong>Option 2:</strong> Compress your PDF using these free tools:
          </div>
          
          <div className="grid gap-2 mt-2">
            {compressionTools.map((tool, index) => (
              <a
                key={index}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-white rounded border hover:border-yellow-300 transition-colors group"
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-blue-500 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.description}</div>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
              </a>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-yellow-200">
          <p className="text-xs text-yellow-600">
            💡 <strong>Pro Tip:</strong> Most PDFs can be compressed to 50-70% of their original size without noticeable quality loss.
          </p>
        </div>
      </div>
    </div>
  );
}