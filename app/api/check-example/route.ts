import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection();
    
    // Count documents with this documentId
    const count = await collection.countDocuments({ documentId });
    
    return NextResponse.json({
      exists: count > 0,
      pageCount: count,
      documentId
    });
    
  } catch (error) {
    console.error('Check example error:', error);
    return NextResponse.json(
      { error: 'Failed to check example PDF status' },
      { status: 500 }
    );
  }
}