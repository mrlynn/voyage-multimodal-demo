import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    
    const collection = await getCollection();
    
    // Get sample documents
    const query = documentId ? { documentId } : {};
    const documents = await collection.find(query).limit(5).toArray();
    
    // Get counts
    const totalCount = await collection.countDocuments();
    const filteredCount = documentId ? await collection.countDocuments({ documentId }) : totalCount;
    
    // Get unique document IDs (filter out undefined/null values)
    const uniqueDocIds = await collection.distinct('documentId');
    const validDocIds = uniqueDocIds.filter(id => id != null);
    
    return NextResponse.json({
      totalDocuments: totalCount,
      filteredCount,
      uniqueDocumentIds: validDocIds,
      totalUniqueIds: uniqueDocIds.length,
      validUniqueIds: validDocIds.length,
      sampleDocuments: documents.map(doc => ({
        documentId: doc.documentId,
        pageNumber: doc.pageNumber,
        key: doc.key,
        hasEmbedding: !!doc.embedding,
        embeddingLength: doc.embedding?.length || 0,
        createdAt: doc.createdAt,
        storageType: doc.storageType
      })),
      requestedDocumentId: documentId
    });
    
  } catch (error) {
    console.error('Debug DB error:', error);
    return NextResponse.json(
      { error: 'Failed to query database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}