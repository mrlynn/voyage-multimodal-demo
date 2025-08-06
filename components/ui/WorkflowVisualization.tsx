'use client';

import React from 'react';
import { FileText, Brain, Database, MessageSquare, Sparkles } from 'lucide-react';

export default function WorkflowVisualization() {
  return (
    <div className="relative w-full h-64 mb-8">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200">
        <defs>
          <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.2" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Connection paths */}
        <path
          d="M 100 100 Q 200 100 300 100"
          stroke="url(#flow-gradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          className="connection-line"
        />
        <path
          d="M 300 100 Q 400 100 500 100"
          stroke="url(#flow-gradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          className="connection-line"
        />
        <path
          d="M 500 100 Q 600 100 700 100"
          stroke="url(#flow-gradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          className="connection-line"
        />
        

        
        <path
          id="flow-path-1"
          d="M 100 100 Q 200 100 300 100 Q 400 100 500 100 Q 600 100 700 100"
          fill="none"
        />
      </svg>
      
      {/* Workflow nodes */}
      <div className="relative flex items-center justify-between h-full px-8">
        <WorkflowNode
          icon={FileText}
          label="PDF Upload"
          color="blue"
          delay={0}
        />
        <WorkflowNode
          icon={Brain}
          label="Extract & Embed"
          color="purple"
          delay={100}
        />
        <WorkflowNode
          icon={Database}
          label="Vector Store"
          color="green"
          delay={200}
        />
        <WorkflowNode
          icon={MessageSquare}
          label="Query"
          color="orange"
          delay={300}
        />
        <WorkflowNode
          icon={Sparkles}
          label="AI Response"
          color="pink"
          delay={400}
        />
      </div>
    </div>
  );
}

interface WorkflowNodeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  delay: number;
}

function WorkflowNode({ icon: Icon, label, color, delay }: WorkflowNodeProps) {
  return (
    <div 
      className="flex flex-col items-center space-y-2 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className={`
        w-16 h-16 rounded-2xl glass flex items-center justify-center
        transform transition-all duration-300 hover:scale-110 hover:rotate-3
        bg-gradient-to-br from-${color}-500/10 to-${color}-600/20
        border border-${color}-200/50
        shadow-lg hover:shadow-${color}-500/25
      `}>
        <Icon className={`w-8 h-8 text-${color}-600`} />
      </div>
      <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
    </div>
  );
}