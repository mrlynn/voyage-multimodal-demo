import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { generateTextEmbedding } from '@/lib/services/embeddings';

/**
 * Stable chat endpoint that follows the notebook approach
 * - Uses reliable text-based matching as fallback
 * - Follows the systematic approach from the Python notebook
 * - Provides consistent, predictable results
 */
export async function POST(request: NextRequest) {
  try {
    const { message, documentId } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log(`💬 Stable chat - Message: "${message}", DocumentId: "${documentId}"`);

    const collection = await getCollection();
    
    // Step 1: Try vector search with error handling
    let searchResults: any[] = [];
    let searchMethod = 'none';
    
    try {
      // Generate query embedding
      const queryEmbedding = await generateTextEmbedding(message, 'query');
      
      if (queryEmbedding) {
        console.log('🧠 Generated query embedding successfully');
        
        // Simple vector search without complex filtering
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
              key: 1,
              pageNumber: 1,
              documentId: 1,
              content: 1,
              summary: 1,
              topics: 1,
              score: { $meta: 'vectorSearchScore' }
            }
          }
        ];

        // Add document filter if specified
        if (documentId) {
          pipeline.push({
            $match: { documentId: documentId }
          });
        }

        const vectorResults = await collection.aggregate(pipeline).toArray();
        
        if (vectorResults.length > 0) {
          searchResults = vectorResults;
          searchMethod = 'vector';
          console.log(`✅ Vector search found ${searchResults.length} results`);
        }
      }
    } catch (vectorError) {
      console.log('⚠️ Vector search failed, trying fallback:', vectorError);
    }

    // Step 2: Fallback to text-based search (like notebook's reliable approach)
    if (searchResults.length === 0) {
      console.log('🔄 Using text-based fallback search');
      
      // Create text search query
      const textQuery: any = {};
      if (documentId) {
        textQuery.documentId = documentId;
      }

      // Use MongoDB text search or simple content matching
      const keywords = message.toLowerCase().split(' ').filter(word => word.length > 2);
      
      if (keywords.length > 0) {
        textQuery.$or = [
          { content: { $regex: keywords.join('|'), $options: 'i' } },
          { summary: { $regex: keywords.join('|'), $options: 'i' } },
          { topics: { $in: keywords } }
        ];
      }

      const textResults = await collection.find(textQuery).limit(3).toArray();
      
      if (textResults.length > 0) {
        searchResults = textResults.map(doc => ({
          ...doc,
          score: 0.8 // Assign a reasonable score for text matches
        }));
        searchMethod = 'text';
        console.log(`✅ Text search found ${searchResults.length} results`);
      }
    }

    // Step 3: If still no results, get any documents from the specified documentId
    if (searchResults.length === 0 && documentId) {
      console.log('🔄 Getting sample documents from documentId');
      const anyResults = await collection.find({ documentId }).limit(2).toArray();
      
      if (anyResults.length > 0) {
        searchResults = anyResults.map(doc => ({
          ...doc,
          score: 0.5 // Lower score for generic matches
        }));
        searchMethod = 'fallback';
        console.log(`✅ Fallback found ${searchResults.length} results`);
      }
    }

    // Step 4: Generate response based on found content
    let response = '';
    
    if (searchResults.length > 0) {
      // Create a comprehensive response using the found content
      const contexts = searchResults.map(result => {
        let context = `Page ${result.pageNumber}:`;
        if (result.content) context += `\\n- Content: ${result.content}`;
        if (result.summary) context += `\\n- Summary: ${result.summary}`;
        if (result.topics) context += `\\n- Topics: ${result.topics.join(', ')}`;
        return context;
      }).join('\\n\\n');

      // Simple response generation based on query type
      if (message.toLowerCase().includes('about') || message.toLowerCase().includes('what')) {
        response = `Based on the document content, here's what I found:\\n\\n${contexts}`;
      } else if (message.toLowerCase().includes('main') || message.toLowerCase().includes('contribution')) {
        const mainContent = searchResults.filter(r => r.pageNumber <= 3);
        if (mainContent.length > 0) {
          response = `The main contributions of this paper include:\\n\\n${mainContent.map(r => `• ${r.content || r.summary}`).join('\\n')}`;
        } else {
          response = `Based on the available content:\\n\\n${contexts}`;
        }
      } else {
        response = `Here's what I found related to "${message}":\\n\\n${contexts}`;
      }
    } else {
      response = `I couldn't find relevant information about "${message}" in the specified document. The document might not be properly indexed yet.`;
    }

    // Return results in the expected format
    return NextResponse.json({
      response,
      sources: searchResults.map(result => ({
        page: result.pageNumber,
        score: result.score
      })),
      debug: {
        documentId,
        searchMethod,
        searchResultsCount: searchResults.length,
        queryProcessed: message
      }
    });

  } catch (error) {
    console.error('❌ Stable chat error:', error);
    return NextResponse.json({
      response: 'I encountered an error while processing your question. Please try again.',
      sources: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}