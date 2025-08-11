import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCollection } from '@/lib/mongodb';
import { generateTextEmbedding } from '@/lib/services/embeddings';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, documentId } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log(`💬 Chat query: "${message}", Document: "${documentId}"`);

    const collection = await getCollection();
    
    // Generate query embedding
    console.log('🧠 Generating query embedding...');
    const queryEmbedding = await generateTextEmbedding(message, 'query');
    
    if (!queryEmbedding) {
      return NextResponse.json({ 
        error: 'Failed to generate query embedding' 
      }, { status: 500 });
    }

    // Perform vector search
    let searchResults: any[] = [];
    
    try {
      const pipeline = [
        {
          $vectorSearch: {
            index: process.env.VS_INDEX_NAME || 'vector_index_voyageai',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: 5
          }
        },
        {
          $project: {
            _id: 0,
            pageNumber: 1,
            documentId: 1,
            content: 1,
            topics: 1,
            blobUrl: 1,
            key: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ];

      // Add document filter if specified
      if (documentId) {
        pipeline.push({
          $match: { documentId: documentId }
        } as any);
      }

      searchResults = await collection.aggregate(pipeline).toArray();
      console.log(`🔍 Found ${searchResults.length} results`);
      
    } catch (searchError) {
      console.error('Vector search error:', searchError);
      
      // Fallback to simple query
      if (documentId) {
        searchResults = await collection
          .find({ documentId })
          .limit(3)
          .toArray();
        searchResults = searchResults.map(doc => ({
          ...doc,
          score: 0.5
        }));
      }
    }

    // Generate intelligent response using Gemini
    let response = '';
    
    if (searchResults.length > 0) {
      // Extract text content from search results
      const contexts = searchResults.map((result, index) => {
        return `Content from page ${result.pageNumber} (relevance: ${(result.score * 100).toFixed(1)}%):
${result.content || 'No text content available'}`;
      }).join('\n\n');
      
      // Generate response using Gemini with text-only content
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const systemPrompt = `You are an AI assistant explaining concepts from a technical demo. Your job is to answer questions based on the provided text content.

INSTRUCTIONS:
1. Answer questions based on the provided context content
2. Be informative and educational
3. If asked about concepts mentioned in the content, elaborate with your knowledge
4. Always cite which page number(s) contain the relevant information
5. Keep responses concise but comprehensive
6. If the question isn't covered in the content, say so clearly

CONTEXT:
${contexts}

USER QUESTION: ${message}

Provide a clear, informative answer based on the context above.`;

      const result = await model.generateContent(systemPrompt);
      response = result.response.text();
      
    } else {
      response = `I couldn't find any relevant information about "${message}" in the demo content. Try asking about multimodal AI, vector search, or MongoDB Atlas.`;
    }

    return NextResponse.json({
      response,
      sources: searchResults.map(r => ({
        page: r.pageNumber,
        score: r.score,
        imageUrl: r.blobUrl || r.key
      }))
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Chat failed'
    }, { status: 500 });
  }
}