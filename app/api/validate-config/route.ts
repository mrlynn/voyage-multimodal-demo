import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  const config = {
    mongodb: {
      configured: false,
      connected: false,
      uri: '',
      database: '',
      collection: '',
      indexName: '',
      error: ''
    },
    voyageAI: {
      configured: false,
      valid: false,
      keyMasked: '',
      error: ''
    },
    gemini: {
      configured: false,
      valid: false,
      keyMasked: '',
      error: ''
    },
    serverless: {
      configured: false,
      reachable: false,
      url: '',
      error: ''
    }
  };

  // Check MongoDB Configuration
  try {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME;
    const collectionName = process.env.COLLECTION_NAME;
    const indexName = process.env.VS_INDEX_NAME;

    if (mongoUri) {
      config.mongodb.configured = true;
      // Mask the MongoDB URI for security
      const uriParts = mongoUri.match(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@(.+)/);
      if (uriParts) {
        config.mongodb.uri = `mongodb${uriParts[1] || ''}://${uriParts[2]}:****@${uriParts[4]}`;
      } else {
        config.mongodb.uri = 'mongodb://****';
      }
      
      config.mongodb.database = dbName || 'Not configured';
      config.mongodb.collection = collectionName || 'Not configured';
      config.mongodb.indexName = indexName || 'Not configured';

      // Test MongoDB connection
      try {
        const client = new MongoClient(mongoUri);
        await client.connect();
        const result = await client.db().admin().ping();
        config.mongodb.connected = result.ok === 1;
        
        // Check if collection exists and has documents
        if (config.mongodb.connected && dbName && collectionName) {
          const db = client.db(dbName);
          const collection = db.collection(collectionName);
          const count = await collection.countDocuments({});
          config.mongodb.error = count > 0 ? `${count} documents found` : 'Collection is empty';
        }
        
        await client.close();
      } catch (connectError: unknown) {
        config.mongodb.connected = false;
        config.mongodb.error = (connectError as Error).message || 'Connection failed';
      }
    } else {
      config.mongodb.error = 'MONGODB_URI not configured';
    }
  } catch (error: unknown) {
    config.mongodb.error = (error as Error).message || 'Configuration check failed';
  }

  // Check Voyage AI Configuration
  try {
    const voyageApiKey = process.env.VOYAGE_API_KEY;
    
    if (voyageApiKey) {
      config.voyageAI.configured = true;
      // Mask the API key for security (show first 5 and last 3 chars)
      const keyLength = voyageApiKey.length;
      if (keyLength > 10) {
        config.voyageAI.keyMasked = `${voyageApiKey.substring(0, 5)}...${voyageApiKey.substring(keyLength - 3)}`;
      } else {
        config.voyageAI.keyMasked = '****';
      }
      
      // Test Voyage AI API
      try {
        const response = await axios.post(
          'https://api.voyageai.com/v1/embeddings',
          {
            input: ['test'],
            model: 'voyage-3',
            input_type: 'query'
          },
          {
            headers: {
              'Authorization': `Bearer ${voyageApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );
        
        config.voyageAI.valid = response.status === 200;
      } catch (apiError: unknown) {
        config.voyageAI.valid = false;
        const error = apiError as any;
        if (error.response?.status === 401) {
          config.voyageAI.error = 'Invalid API key';
        } else if (error.response?.status === 429) {
          config.voyageAI.error = 'Rate limit exceeded';
        } else {
          config.voyageAI.error = error.message || 'API test failed';
        }
      }
    } else {
      config.voyageAI.error = 'VOYAGE_API_KEY not configured';
    }
  } catch (error: unknown) {
    config.voyageAI.error = (error as Error).message || 'Configuration check failed';
  }

  // Check Google Gemini Configuration
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    
    if (googleApiKey) {
      config.gemini.configured = true;
      // Mask the API key for security
      const keyLength = googleApiKey.length;
      if (keyLength > 10) {
        config.gemini.keyMasked = `${googleApiKey.substring(0, 7)}...${googleApiKey.substring(keyLength - 3)}`;
      } else {
        config.gemini.keyMasked = '****';
      }
      
      // Test Gemini API
      try {
        const genAI = new GoogleGenerativeAI(googleApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent('Say "ok" if this works');
        config.gemini.valid = !!result.response;
      } catch (apiError: unknown) {
        config.gemini.valid = false;
        config.gemini.error = (apiError as Error).message || 'API test failed';
      }
    } else {
      config.gemini.error = 'GOOGLE_API_KEY not configured';
    }
  } catch (error: unknown) {
    config.gemini.error = (error as Error).message || 'Configuration check failed';
  }

  // Check Serverless URL (optional)
  try {
    const serverlessUrl = process.env.SERVERLESS_URL;
    
    if (serverlessUrl) {
      config.serverless.configured = true;
      // Mask the URL for security
      const urlParts = serverlessUrl.match(/^(https?:\/\/)([^\/]+)(.*)/);
      if (urlParts) {
        const domain = urlParts[2];
        const maskedDomain = domain.length > 10 
          ? `${domain.substring(0, 5)}...${domain.substring(domain.length - 5)}`
          : '****';
        config.serverless.url = `${urlParts[1]}${maskedDomain}${urlParts[3] || ''}`;
      } else {
        config.serverless.url = '****';
      }
      
      // Test serverless endpoint
      try {
        const response = await axios.post(
          serverlessUrl,
          { task: 'health_check' },
          { timeout: 5000 }
        );
        
        config.serverless.reachable = response.status === 200;
      } catch (apiError: unknown) {
        config.serverless.reachable = false;
        config.serverless.error = 'Endpoint not reachable';
      }
    } else {
      config.serverless.error = 'Optional - not configured';
    }
  } catch (error: unknown) {
    config.serverless.error = (error as Error).message || 'Configuration check failed';
  }

  // Calculate overall status
  const overallStatus = {
    ready: config.mongodb.connected && config.voyageAI.valid && config.gemini.valid,
    warnings: [] as string[],
    errors: [] as string[]
  };

  if (!config.mongodb.connected) {
    overallStatus.errors.push('MongoDB is not connected');
  }
  if (!config.voyageAI.valid && !config.serverless.reachable) {
    overallStatus.errors.push('No embedding service available');
  }
  if (!config.gemini.valid) {
    overallStatus.errors.push('Gemini AI is not configured');
  }
  if (config.mongodb.error === 'Collection is empty') {
    overallStatus.warnings.push('MongoDB collection is empty - upload a PDF to get started');
  }

  return NextResponse.json({
    config,
    overallStatus,
    timestamp: new Date().toISOString()
  });
}