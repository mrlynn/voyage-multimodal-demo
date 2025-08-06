'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Brain, 
  Image, 
  Cloud,
  Settings,
  Sparkles
} from 'lucide-react';
import ServiceCard from './ui/ServiceCard';

interface ConfigStatus {
  mongodb: {
    configured: boolean;
    connected: boolean;
    uri: string;
    database: string;
    collection: string;
    indexName: string;
    error: string;
  };
  voyageAI: {
    configured: boolean;
    valid: boolean;
    keyMasked: string;
    error: string;
  };
  gemini: {
    configured: boolean;
    valid: boolean;
    keyMasked: string;
    error: string;
  };
  serverless: {
    configured: boolean;
    reachable: boolean;
    url: string;
    error: string;
  };
}

interface ValidationResponse {
  config: ConfigStatus;
  overallStatus: {
    ready: boolean;
    warnings: string[];
    errors: string[];
  };
  timestamp: string;
}

export default function SetupValidationEnhanced() {
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const fetchValidation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/validate-config');
      const data = await response.json();
      setValidation(data);
    } catch (error) {
      console.error('Failed to fetch validation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidation();
  }, []);

  const toggleDetails = (service: string) => {
    setShowDetails(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="relative">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-indigo-500/20 animate-ping" />
        </div>
        <span className="ml-3 text-gray-600 font-medium">Validating configuration...</span>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className="text-center p-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4">
          <XCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h3>
        <p className="text-gray-600 mb-6">Failed to load configuration validation</p>
        <button
          onClick={fetchValidation}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Validation
        </button>
      </div>
    );
  }

  const { config, overallStatus } = validation;

  const services = [
    {
      id: 'mongodb',
      title: 'MongoDB Atlas',
      description: 'Vector database for embeddings',
      icon: Database,
      status: !config.mongodb.configured ? 'error' : 
              config.mongodb.connected ? 'connected' : 'connecting',
      color: 'green',
      config: config.mongodb,
      details: (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Database:</span>
            <span className="font-mono text-gray-700">{config.mongodb.database || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Collection:</span>
            <span className="font-mono text-gray-700">{config.mongodb.collection || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Vector Index:</span>
            <span className="font-mono text-gray-700">{config.mongodb.indexName || 'Not set'}</span>
          </div>
          {config.mongodb.error && (
            <div className="mt-2 p-2 bg-rose-50 rounded-lg text-rose-600 text-xs">
              {config.mongodb.error}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'voyage',
      title: 'Voyage AI',
      description: 'Multimodal embeddings API',
      icon: Image,
      status: !config.voyageAI.configured ? 'error' :
              config.voyageAI.valid ? 'connected' : 'error',
      color: 'blue',
      config: config.voyageAI,
      details: (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">API Key:</span>
            <span className="font-mono text-gray-700">{config.voyageAI.keyMasked || 'Not configured'}</span>
          </div>
          {config.voyageAI.error && (
            <div className="mt-2 p-2 bg-rose-50 rounded-lg text-rose-600 text-xs">
              {config.voyageAI.error}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'gemini',
      title: 'Google Gemini',
      description: 'Vision & language model',
      icon: Brain,
      status: !config.gemini.configured ? 'error' :
              config.gemini.valid ? 'connected' : 'error',
      color: 'purple',
      config: config.gemini,
      details: (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">API Key:</span>
            <span className="font-mono text-gray-700">{config.gemini.keyMasked || 'Not configured'}</span>
          </div>
          {config.gemini.error && (
            <div className="mt-2 p-2 bg-rose-50 rounded-lg text-rose-600 text-xs">
              {config.gemini.error}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'serverless',
      title: 'Serverless Endpoint',
      description: 'Optional fallback service',
      icon: Cloud,
      status: !config.serverless.configured ? 'optional' :
              config.serverless.reachable ? 'connected' : 'error',
      color: 'orange',
      config: config.serverless,
      details: (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">URL:</span>
            <span className="font-mono text-gray-700 text-xs break-all">
              {config.serverless.url || 'Not configured'}
            </span>
          </div>
          {config.serverless.error && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg text-amber-600 text-xs">
              {config.serverless.error}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* System Status Header */}
      <div className={`
        relative p-8 rounded-2xl overflow-hidden
        ${overallStatus.ready ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-rose-50 to-pink-50'}
      `}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {overallStatus.ready ? (
              <div className="relative">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
              </div>
            ) : (
              <AlertTriangle className="w-12 h-12 text-rose-500" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {overallStatus.ready ? 'System Ready' : 'Configuration Required'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {overallStatus.ready 
                  ? 'All services are properly configured and connected'
                  : `${overallStatus.errors.length} issue${overallStatus.errors.length !== 1 ? 's' : ''} need attention`
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchValidation}
            className="p-3 rounded-xl bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <RefreshCw className="w-5 h-5 text-gray-700 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Issues list */}
        {(overallStatus.errors.length > 0 || overallStatus.warnings.length > 0) && (
          <div className="mt-6 space-y-3">
            {overallStatus.errors.map((error, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <XCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{error}</span>
              </div>
            ))}
            {overallStatus.warnings.map((warning, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div 
            key={service.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards', opacity: 0 }}
          >
            <ServiceCard
              title={service.title}
              description={service.description}
              icon={service.icon}
              status={service.status as 'connected' | 'connecting' | 'error' | 'optional'}
              color={service.color}
              details={service.details}
              showDetails={showDetails[service.id]}
              onToggleDetails={() => toggleDetails(service.id)}
            />
          </div>
        ))}
      </div>

      {/* Configuration Help */}
      <div className="glass rounded-2xl p-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10">
            <Settings className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Setup Guide</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a <code className="px-2 py-1 bg-gray-900 text-white rounded text-xs">.env.local</code> file in your project root:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto font-mono">
{`MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
VOYAGE_API_KEY=pa-your-voyage-api-key
GOOGLE_API_KEY=your-google-gemini-api-key
SERVERLESS_URL=https://your-endpoint.com # Optional`}
            </pre>
            <div className="mt-4 flex items-center space-x-2 text-sm text-indigo-600">
              <Sparkles className="w-4 h-4" />
              <span>Need help? Check the workshop documentation for detailed setup instructions.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}