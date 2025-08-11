import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { generateTextEmbedding } from '@/lib/services/embeddings';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing simple demo...');

    const collection = await getCollection();
    const documentId = 'simple-demo';

    // Clean up existing demo
    await collection.deleteMany({ documentId });

    // Create demo pages with text content
    const demoPages = [
      {
        content: "Introduction to Multimodal AI: This document demonstrates how Voyage AI's multimodal embeddings work with PDF documents.",
        topics: ["introduction", "multimodal", "AI", "embeddings"]
      },
      {
        content: "Vector Search Technology: Using voyage-multimodal-3, we create unified embeddings that understand both text and visual content.",
        topics: ["vector search", "voyage-multimodal-3", "embeddings", "technology"]
      },
      {
        content: "MongoDB Atlas Integration: Store and search embeddings using MongoDB's vector search capabilities for scalable AI applications.",
        topics: ["MongoDB", "Atlas", "vector search", "database"]
      }
    ];

    // Process each demo page
    for (let i = 0; i < demoPages.length; i++) {
      const page = demoPages[i];
      const pageNumber = i + 1;
      
      console.log(`📄 Creating demo page ${pageNumber}...`);
      
      // Generate embedding for the content
      const embedding = await generateTextEmbedding(page.content, 'document');
      
      if (!embedding) {
        throw new Error(`Failed to generate embedding for page ${pageNumber}`);
      }
      
      // Store in MongoDB
      await collection.insertOne({
        documentId,
        pageNumber,
        content: page.content,
        topics: page.topics,
        embedding,
        createdAt: new Date(),
        storageType: 'demo',
        // No blob URL for demo - text only
      });
      
      console.log(`✅ Page ${pageNumber} created`);
    }

    return NextResponse.json({
      success: true,
      message: `Created demo with ${demoPages.length} pages`,
      documentId,
      instruction: 'You can now ask questions about multimodal AI, vector search, or MongoDB Atlas'
    });

  } catch (error) {
    console.error('❌ Demo init error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to initialize demo'
    }, { status: 500 });
  }
}