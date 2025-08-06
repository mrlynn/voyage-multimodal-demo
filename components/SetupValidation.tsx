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
  Eye,
  EyeOff
} from 'lucide-react';

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

export default function SetupValidation() {
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

  const getStatusIcon = (configured: boolean, valid: boolean, isOptional = false) => {
    if (!configured && isOptional) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    if (!configured) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (valid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = (configured: boolean, valid: boolean, isOptional = false) => {
    if (!configured && isOptional) {
      return { text: 'Optional', color: 'text-yellow-600' };
    }
    if (!configured) {
      return { text: 'Not Configured', color: 'text-red-600' };
    }
    if (valid) {
      return { text: 'Working', color: 'text-green-600' };
    }
    return { text: 'Error', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-gray-600">Validating configuration...</span>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className="text-center p-8">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load configuration validation</p>
        <button
          onClick={fetchValidation}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { config, overallStatus } = validation;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overall Status */}
      <div className={`p-6 rounded-lg border-2 ${
        overallStatus.ready 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {overallStatus.ready ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {overallStatus.ready ? 'System Ready' : 'Configuration Issues'}
              </h2>
              <p className="text-sm text-gray-600">
                Last checked: {new Date(validation.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={fetchValidation}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {overallStatus.errors.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-red-800 mb-2">Errors:</h3>
            <ul className="list-disc list-inside space-y-1">
              {overallStatus.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-700">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {overallStatus.warnings.length > 0 && (
          <div>
            <h3 className="font-medium text-yellow-800 mb-2">Warnings:</h3>
            <ul className="list-disc list-inside space-y-1">
              {overallStatus.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700">{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Service Details */}
      <div className="grid gap-4">
        {/* MongoDB */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">MongoDB Atlas</h3>
                <p className="text-sm text-gray-600">Vector database for storing embeddings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(config.mongodb.configured, config.mongodb.connected)}
              <span className={`text-sm font-medium ${getStatusText(config.mongodb.configured, config.mongodb.connected).color}`}>
                {getStatusText(config.mongodb.configured, config.mongodb.connected).text}
              </span>
              <button
                onClick={() => toggleDetails('mongodb')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {showDetails.mongodb ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showDetails.mongodb && (
            <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
              <div><strong>URI:</strong> {config.mongodb.uri || 'Not configured'}</div>
              <div><strong>Database:</strong> {config.mongodb.database}</div>
              <div><strong>Collection:</strong> {config.mongodb.collection}</div>
              <div><strong>Vector Index:</strong> {config.mongodb.indexName}</div>
              {config.mongodb.error && (
                <div className="text-red-600"><strong>Status:</strong> {config.mongodb.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Voyage AI */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Image className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Voyage AI</h3>
                <p className="text-sm text-gray-600">Multimodal embeddings for images and text</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(config.voyageAI.configured, config.voyageAI.valid)}
              <span className={`text-sm font-medium ${getStatusText(config.voyageAI.configured, config.voyageAI.valid).color}`}>
                {getStatusText(config.voyageAI.configured, config.voyageAI.valid).text}
              </span>
              <button
                onClick={() => toggleDetails('voyageAI')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {showDetails.voyageAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showDetails.voyageAI && (
            <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
              <div><strong>API Key:</strong> {config.voyageAI.keyMasked || 'Not configured'}</div>
              {config.voyageAI.error && (
                <div className="text-red-600"><strong>Error:</strong> {config.voyageAI.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Google Gemini */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Google Gemini</h3>
                <p className="text-sm text-gray-600">Large language model for analyzing images</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(config.gemini.configured, config.gemini.valid)}
              <span className={`text-sm font-medium ${getStatusText(config.gemini.configured, config.gemini.valid).color}`}>
                {getStatusText(config.gemini.configured, config.gemini.valid).text}
              </span>
              <button
                onClick={() => toggleDetails('gemini')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {showDetails.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showDetails.gemini && (
            <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
              <div><strong>API Key:</strong> {config.gemini.keyMasked || 'Not configured'}</div>
              {config.gemini.error && (
                <div className="text-red-600"><strong>Error:</strong> {config.gemini.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Serverless Endpoint (Optional) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Cloud className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Serverless Endpoint</h3>
                <p className="text-sm text-gray-600">Optional fallback for embedding generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(config.serverless.configured, config.serverless.reachable, true)}
              <span className={`text-sm font-medium ${getStatusText(config.serverless.configured, config.serverless.reachable, true).color}`}>
                {getStatusText(config.serverless.configured, config.serverless.reachable, true).text}
              </span>
              <button
                onClick={() => toggleDetails('serverless')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {showDetails.serverless ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showDetails.serverless && (
            <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
              <div><strong>URL:</strong> {config.serverless.url || 'Not configured'}</div>
              {config.serverless.error && (
                <div className="text-yellow-600"><strong>Status:</strong> {config.serverless.error}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Settings className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help?</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>To configure your environment variables, create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file with:</p>
              <pre className="bg-blue-100 p-3 rounded text-xs overflow-x-auto">
{`MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
VOYAGE_API_KEY=pa-your-voyage-api-key
GOOGLE_API_KEY=your-google-gemini-api-key
SERVERLESS_URL=https://your-serverless-endpoint.com (optional)`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}