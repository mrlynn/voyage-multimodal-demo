import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { keepExampleOnly } = body;
    
    const collection = await getCollection();
    
    if (keepExampleOnly) {
      // Delete all documents except the example PDF
      const deleteResult = await collection.deleteMany({ 
        documentId: { $ne: 'example-pdf-demo' } 
      });
      
      // Also delete documents with undefined/null documentId
      const deleteUndefined = await collection.deleteMany({ 
        $or: [
          { documentId: null },
          { documentId: { $exists: false } }
        ]
      });
      
      return NextResponse.json({
        success: true,
        message: `Cleaned database - kept only example PDF`,
        deletedDocuments: deleteResult.deletedCount,
        deletedUndefined: deleteUndefined.deletedCount,
        action: 'keep_example_only'
      });
    } else {
      // Delete ALL documents (complete reset)
      const result = await collection.deleteMany({});
      
      return NextResponse.json({
        success: true,
        message: `Deleted all documents from database`,
        deletedCount: result.deletedCount,
        action: 'delete_all'
      });
    }
    
  } catch (error) {
    console.error('Clean DB error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clean database'
    }, { status: 500 });
  }
}