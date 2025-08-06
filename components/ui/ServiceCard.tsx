'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'connected' | 'connecting' | 'error' | 'optional';
  color: string;
  details?: React.ReactNode;
  onToggleDetails?: () => void;
  showDetails?: boolean;
}

export default function ServiceCard({
  title,
  description,
  icon: Icon,
  status,
  color,
  details,
  onToggleDetails,
  showDetails
}: ServiceCardProps) {
  const statusConfig = {
    connected: {
      bg: 'bg-emerald-500',
      pulse: 'bg-emerald-400',
      text: 'Connected',
      animation: true
    },
    connecting: {
      bg: 'bg-amber-500',
      pulse: 'bg-amber-400',
      text: 'Configuring',
      animation: true
    },
    error: {
      bg: 'bg-rose-500',
      pulse: 'bg-rose-400',
      text: 'Error',
      animation: false
    },
    optional: {
      bg: 'bg-gray-400',
      pulse: 'bg-gray-300',
      text: 'Optional',
      animation: false
    }
  };

  const config = statusConfig[status];

  return (
    <div className="service-node glass rounded-2xl p-6 hover-lift relative overflow-hidden group">
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{
          background: `radial-gradient(circle at top right, ${color}, transparent 70%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-500/10 to-${color}-600/10`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${config.bg}`} />
              {config.animation && (
                <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.pulse} animate-ping`} />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">{config.text}</span>
          </div>
          
          {details && (
            <button
              onClick={onToggleDetails}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showDetails ? 'Hide' : 'Show'} details
            </button>
          )}
        </div>

        {/* Expandable details */}
        {showDetails && details && (
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            {details}
          </div>
        )}
      </div>

      {/* Connection indicator */}
      <svg className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-1 opacity-50">
        <defs>
          <linearGradient id="gradient-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="0" x2="32" y2="0" className="connection-line" />
      </svg>
    </div>
  );
}