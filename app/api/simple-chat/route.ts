import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateImageEmbedding } from '@/lib/services/embeddings';
import { getCollection } from '@/lib/mongodb';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    console.log(`🔍 Question: ${question}`);
    
    // Generate embedding for the question
    const queryEmbedding = await generateImageEmbedding(Buffer.from(question));
    
    if (!queryEmbedding) {
      return NextResponse.json({ error: 'Failed to generate query embedding' }, { status: 500 });
    }

    // Search MongoDB for relevant content
    const collection = await getCollection();
    
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index_voyageai',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 3
        }
      },
      {
        $project: {
          content: 1,
          pageNumber: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    console.log(`📊 Found ${results.length} relevant pages`);

    if (results.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant content in the uploaded document."
      });
    }

    // Create context from search results
    const context = results.map((result, i) => 
      `Page ${result.pageNumber}: ${result.content}`
    ).join('\n\n');

    // Generate answer using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `Based on the following content from a PDF document, answer the user's question.

CONTENT:
${context}

QUESTION: ${question}

Provide a clear, concise answer based only on the content above. If the content doesn't contain enough information to answer the question, say so.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    console.log(`✅ Generated answer`);

    return NextResponse.json({
      answer,
      sources: results.map(r => ({ page: r.pageNumber, score: r.score }))
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process question'
    }, { status: 500 });
  }
}