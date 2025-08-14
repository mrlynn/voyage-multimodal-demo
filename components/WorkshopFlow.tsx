'use client';

import React from 'react';
import { BookOpen, Zap, Hammer, ArrowRight } from 'lucide-react';

export default function WorkshopFlow() {
  return (
    <div className="w-full max-w-5xl mx-auto mb-12">
      <h3 className="text-center text-lg font-semibold text-gray-700 mb-6">Workshop Journey</h3>
      
      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2 z-0" />
        
        {/* Step 1: Python Notebooks */}
        <div className="relative z-10 flex flex-col items-center group">
          <div className="w-20 h-20 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center mb-3 group-hover:border-green-500 transition-colors">
            <BookOpen className="w-10 h-10 text-gray-600 group-hover:text-green-600 transition-colors" />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900">1. Python Notebooks</h4>
            <p className="text-sm text-gray-600 mt-1">Theory & Code</p>
          </div>
        </div>

        {/* Arrow 1 */}
        <ArrowRight className="w-6 h-6 text-gray-400" />
        
        {/* Step 2: Interactive Demo */}
        <div className="relative z-10 flex flex-col items-center group">
          <div className="w-20 h-20 bg-green-600 border-4 border-green-600 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-green-700">2. Interactive Demo</h4>
            <p className="text-sm text-green-600 mt-1 font-medium">You are here</p>
          </div>
        </div>

        {/* Arrow 2 */}
        <ArrowRight className="w-6 h-6 text-gray-400" />
        
        {/* Step 3: Build Your Own */}
        <div className="relative z-10 flex flex-col items-center group">
          <div className="w-20 h-20 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center mb-3 group-hover:border-blue-500 transition-colors">
            <Hammer className="w-10 h-10 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-gray-900">3. Build Your Own</h4>
            <p className="text-sm text-gray-600 mt-1">Hands-on Practice</p>
          </div>
        </div>
      </div>
    </div>
  );
}