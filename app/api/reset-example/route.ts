import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { blobStorage } from '@/lib/services/blobStorage';

export async function POST(request: NextRequest) {
  try {
    console.log('Resetting example PDF data...');
    
    const EXAMPLE_DOC_ID = 'example-pdf-demo';
    
    const collection = await getCollection();
    
    // Get all documents with the example document ID to clean up blob storage
    const exampleDocs = await collection.find({ documentId: EXAMPLE_DOC_ID }).toArray();
    
    // Clean up blob storage if configured and in production
    if (blobStorage.isConfigured() && process.env.NODE_ENV === 'production') {
      console.log('Cleaning up blob storage...');
      
      for (const doc of exampleDocs) {
        try {
          if (doc.key && doc.key.startsWith('http')) {
            // Extract blob filename from URL if needed
            // For now, we'll skip individual blob cleanup as it requires more complex URL parsing
            console.log(`Would clean up blob: ${doc.key}`);
          }
        } catch (error) {
          console.warn('Could not clean up blob:', doc.key, error);
        }
      }
      
      // Clean up the original PDF blob
      try {
        await blobStorage.deleteFile(`${EXAMPLE_DOC_ID}.pdf`);
        console.log('Cleaned up example PDF from blob storage');
      } catch (error) {
        console.warn('Could not delete example PDF blob:', error);
      }
    }
    
    // Remove all documents with the example document ID from MongoDB
    const deleteResult = await collection.deleteMany({ documentId: EXAMPLE_DOC_ID });
    
    console.log(`Deleted ${deleteResult.deletedCount} documents from MongoDB`);
    
    return NextResponse.json({
      success: true,
      message: `Reset complete. Deleted ${deleteResult.deletedCount} documents.`,
      deletedCount: deleteResult.deletedCount
    });
    
  } catch (error) {
    console.error('Reset example error:', error);
    return NextResponse.json(
      { error: 'Failed to reset example PDF' },
      { status: 500 }
    );
  }
}