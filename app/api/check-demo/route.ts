import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId = 'simple-demo' } = body;

    const collection = await getCollection();
    const count = await collection.countDocuments({ documentId });

    return NextResponse.json({
      exists: count > 0,
      pageCount: count,
      documentId
    });

  } catch (error) {
    console.error('Check demo error:', error);
    return NextResponse.json({
      exists: false,
      pageCount: 0,
      error: error instanceof Error ? error.message : 'Failed to check demo'
    });
  }
}