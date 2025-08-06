'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
}

export default function ProgressIndicator({ 
  steps, 
  currentStep, 
  completedSteps 
}: ProgressIndicatorProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  // Calculate progress based on current step position (0-based index to 1-based progress)
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="relative mb-8">
      {/* Progress bar background */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
      
      {/* Progress bar fill */}
      <div 
        className="absolute top-5 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
      
      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step circle */}
              <div className={`
                relative w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300 transform
                ${isCompleted ? 'bg-gradient-to-br from-indigo-500 to-purple-600 scale-110' : 
                  isCurrent ? 'bg-white border-2 border-indigo-500 scale-105' : 
                  'bg-white border-2 border-gray-300'}
                ${isCurrent ? 'shadow-lg shadow-indigo-500/25' : ''}
              `}>
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <div className={`
                    w-3 h-3 rounded-full
                    ${isCurrent ? 'bg-indigo-500 animate-pulse' : 'bg-gray-300'}
                  `} />
                )}
                
                {/* Pulse effect for current step */}
                {isCurrent && (
                  <div className="absolute inset-0 w-10 h-10 rounded-full bg-indigo-500 opacity-25 animate-ping" />
                )}
              </div>
              
              {/* Step label */}
              <div className="mt-3 text-center">
                <div className={`
                  text-sm font-medium transition-colors
                  ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {step.label}
                </div>
                {step.icon && (
                  <div className="mt-1 opacity-60">
                    {step.icon}
                  </div>
                )}
              </div>
              
              {/* Current step indicator */}
              {isCurrent && (
                <div className="absolute -bottom-8 text-xs font-medium text-indigo-600">
                  Current
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}