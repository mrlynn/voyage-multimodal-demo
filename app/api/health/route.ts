import { NextResponse } from 'next/server';
import { blobStorage } from '@/lib/services/blobStorage';
import { getCollection } from '@/lib/mongodb';
import { checkEnvironment, getInstallInstructions } from '@/lib/services/environmentCheck';

export async function GET() {
  try {
    // Check blob storage configuration
    const blobInfo = await blobStorage.getStorageInfo();
    
    // Check MongoDB connection
    let mongodbConnected = false;
    let sampleDocuments = 0;
    try {
      const collection = await getCollection();
      const count = await collection.countDocuments({});
      mongodbConnected = true;
      sampleDocuments = count;
    } catch (error) {
      console.error('MongoDB check failed:', error);
    }
    
    // Check environment tools
    const envCheck = await checkEnvironment();
    
    // Check environment
    const env = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      BLOB_CONFIGURED: blobInfo.configured,
      MONGODB_CONNECTED: mongodbConnected,
      DOCUMENT_COUNT: sampleDocuments,
      DEPLOYMENT_PLATFORM: process.env.VERCEL ? 'Vercel' : 'Local',
      PDF_TOOLS_AVAILABLE: envCheck.pdftoppm.available,
      SHARP_AVAILABLE: envCheck.sharp.available,
    };
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env,
      tools: envCheck,
      recommendations: getRecommendations(env, envCheck),
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}

function getRecommendations(env: any, envCheck: any): string[] {
  const recommendations = [];
  
  if (env.NODE_ENV === 'production' && !env.BLOB_CONFIGURED) {
    recommendations.push('BLOB_READ_WRITE_TOKEN is not configured. PDF storage will not work properly in production.');
  }
  
  if (!env.MONGODB_CONNECTED) {
    recommendations.push('MongoDB connection failed. Check your MONGODB_URI environment variable.');
  }
  
  if (env.DOCUMENT_COUNT === 0) {
    recommendations.push('No documents found in database. Upload a PDF to get started.');
  }
  
  if (!envCheck.pdftoppm.available) {
    recommendations.push(`PDF conversion tools not available. ${getInstallInstructions(envCheck.platform)}. PDF uploads will use fallback mode.`);
  }
  
  if (!envCheck.sharp.available) {
    recommendations.push('Sharp image processing library not available. This may affect fallback image generation.');
  }
  
  if (env.NODE_ENV === 'production' && env.DEPLOYMENT_PLATFORM === 'Vercel') {
    recommendations.push('Running on Vercel. Make sure all environment variables are configured in the Vercel dashboard.');
  }
  
  return recommendations;
}