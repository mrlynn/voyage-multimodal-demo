'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain, Cpu, Database, Sparkles } from 'lucide-react';

interface EmbeddingStep {
  phase: string;
  description: string;
  duration: number;
  visual: 'text' | 'vector' | 'search' | 'results';
}

export default function LiveEmbeddingDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userQuery, setUserQuery] = useState("Find diagrams explaining transformers");

  const steps: EmbeddingStep[] = [
    {
      phase: 'Text Processing',
      description: 'Tokenizing and analyzing query intent',
      duration: 1500,
      visual: 'text'
    },
    {
      phase: 'Embedding Generation',
      description: 'Converting to 1024-dimensional vector using Voyage AI',
      duration: 2000,
      visual: 'vector'
    },
    {
      phase: 'Vector Search',
      description: 'Searching MongoDB Atlas for similar embeddings',
      duration: 2500,
      visual: 'search'
    },
    {
      phase: 'Ranking Results',
      description: 'Combining text and image similarities',
      duration: 1000,
      visual: 'results'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length) {
      const currentDuration = steps[currentStep].duration;
      const increment = 100 / (currentDuration / 50); // Update every 50ms
      
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (currentStep < steps.length - 1) {
              setCurrentStep(currentStep + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return Math.min(prev + increment, 100);
        });
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps]);

  const reset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentStep === steps.length - 1 && progress === 100) {
      reset();
    }
    setIsPlaying(!isPlaying);
  };

  // Generate animated vector visualization
  const renderVector = () => {
    const dimensions = 32; // Simplified visualization
    return (
      <div className="grid grid-cols-16 gap-0.5">
        {Array.from({ length: dimensions * 4 }, (_, i) => {
          const intensity = Math.sin(i * 0.2 + progress * 0.05) * 0.5 + 0.5;
          const hue = (i * 2 + progress * 2) % 360;
          
          return (
            <div
              key={i}
              className="w-2 h-2 rounded-sm transition-all duration-300"
              style={{
                backgroundColor: `hsla(${hue}, 70%, 50%, ${intensity})`,
                transform: `scale(${0.5 + intensity * 0.5})`,
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderVisualization = () => {
    const step = steps[currentStep];
    
    switch (step.visual) {
      case 'text':
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-lg font-mono">{userQuery}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {userQuery.split(' ').map((word, idx) => (
                <span
                  key={idx}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    transition-all duration-500
                    ${progress > (idx + 1) * (100 / userQuery.split(' ').length)
                      ? 'bg-indigo-100 text-indigo-700 scale-110'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                  style={{
                    transitionDelay: `${idx * 100}ms`
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        );
        
      case 'vector':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Generating 1024-dimensional embedding vector
              </p>
              {renderVector()}
            </div>
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3">
              <p className="text-xs font-mono text-center">
                voyage-3 model: text + visual understanding
              </p>
            </div>
          </div>
        );
        
      case 'search':
        return (
          <div className="space-y-4">
            <div className="relative h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
              {/* Central query node */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Document nodes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                const radian = (angle * Math.PI) / 180;
                const x = Math.cos(radian) * 80;
                const y = Math.sin(radian) * 80;
                const similarity = 0.5 + Math.random() * 0.5;
                const isActive = progress > (idx + 1) * 12.5;
                
                return (
                  <div
                    key={angle}
                    className={`
                      absolute top-1/2 left-1/2 w-12 h-12 rounded-full
                      flex items-center justify-center transition-all duration-500
                      ${isActive 
                        ? 'bg-white shadow-md scale-110' 
                        : 'bg-gray-200 scale-90 opacity-50'
                      }
                    `}
                    style={{
                      transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                    }}
                  >
                    <span className="text-xs font-bold">
                      {Math.round(similarity * 100)}%
                    </span>
                  </div>
                );
              })}
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                  const radian = (angle * Math.PI) / 180;
                  const x = Math.cos(radian) * 80;
                  const y = Math.sin(radian) * 80;
                  const isActive = progress > (idx + 1) * 12.5;
                  
                  return (
                    <line
                      key={angle}
                      x1="50%"
                      y1="50%"
                      x2={`${50 + x * 0.5}%`}
                      y2={`${50 + y * 0.5}%`}
                      stroke={isActive ? '#6366f1' : '#e5e7eb'}
                      strokeWidth={isActive ? 2 : 1}
                      strokeDasharray={isActive ? "0" : "5,5"}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
            </div>
            
            <p className="text-center text-sm text-gray-600">
              Searching {Math.round(progress * 50)} documents...
            </p>
          </div>
        );
        
      case 'results':
        return (
          <div className="space-y-3">
            {[
              { page: 3, score: 0.92, type: 'multimodal' },
              { page: 7, score: 0.85, type: 'image' },
              { page: 12, score: 0.78, type: 'text' }
            ].map((result, idx) => {
              const isVisible = progress > (idx + 1) * 33;
              
              return (
                <div
                  key={idx}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-500
                    ${isVisible 
                      ? 'border-indigo-200 bg-indigo-50 opacity-100 translate-x-0' 
                      : 'border-gray-200 bg-white opacity-0 translate-x-4'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Page {result.page}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{result.type}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                          style={{ 
                            width: isVisible ? `${result.score * 100}%` : '0%',
                            transitionDelay: `${idx * 200}ms`
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold">{Math.round(result.score * 100)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Live Embedding Process Demo
        </h2>
        <p className="text-gray-600">
          Watch how your query becomes searchable vectors in real-time
        </p>
      </div>

      {/* Query Input */}
      <div className="max-w-2xl mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Query
        </label>
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          disabled={isPlaying}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="Enter a search query..."
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={togglePlay}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isPlaying ? 'Pause' : 'Start Demo'}</span>
        </button>
        
        <button
          onClick={reset}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isComplete = idx < currentStep || (idx === currentStep && progress === 100);
            
            return (
              <div key={idx} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 scale-110' 
                      : isComplete 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                    }
                  `}>
                    {idx === 0 && <Cpu className="w-6 h-6 text-white" />}
                    {idx === 1 && <Sparkles className="w-6 h-6 text-white" />}
                    {idx === 2 && <Database className="w-6 h-6 text-white" />}
                    {idx === 3 && <Brain className="w-6 h-6 text-white" />}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                    {step.phase}
                  </span>
                </div>
                
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-1 bg-gray-300 mx-2 relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                      style={{
                        width: idx < currentStep ? '100%' : idx === currentStep ? `${progress}%` : '0%'
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visualization Area */}
      <div className="bg-white rounded-xl shadow-lg p-8 min-h-[300px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[currentStep]?.phase}
          </h3>
          <p className="text-sm text-gray-600">
            {steps[currentStep]?.description}
          </p>
        </div>
        
        <div className="mt-6">
          {renderVisualization()}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Workshop Tip:</p>
        <p>
          Voyage AI's multimodal embeddings understand both text and visual content,
          making them perfect for PDF search where documents contain mixed content.
          Try clicking the pipeline cards in the "Search Process" tab for detailed technical explanations!
        </p>
      </div>
    </div>
  );
}