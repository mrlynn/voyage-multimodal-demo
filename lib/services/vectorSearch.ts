import { getCollection } from '../mongodb';
import { generateTextEmbedding } from './embeddings';

export interface SearchResult {
  key: string;
  pageNumber: number;
  score: number;
}

export async function vectorSearch(
  query: string,
  limit: number = 2,
  documentId?: string
): Promise<SearchResult[]> {
  try {
    console.log(`🔍 Vector search - Query: "${query}", DocumentId: "${documentId}", Limit: ${limit}`);
    
    // Generate embedding for the query
    const queryEmbedding = await generateTextEmbedding(query, 'query');
    
    if (!queryEmbedding) {
      console.error('Failed to generate query embedding');
      return [];
    }
    
    const collection = await getCollection();
    const indexName = process.env.VS_INDEX_NAME || 'vector_index_voyageai';
    
    // Check document status and decide whether to filter
    let shouldFilter = false;
    if (documentId) {
      const docCount = await collection.countDocuments({ documentId });
      console.log(`📊 Found ${docCount} documents with documentId: ${documentId}`);
      
      if (docCount === 0) {
        console.log('❌ No documents found with this documentId - searching all documents instead');
        shouldFilter = false;
      } else {
        shouldFilter = true;
      }
    } else {
      const totalCount = await collection.countDocuments({});
      console.log(`📊 No documentId provided, searching across all ${totalCount} documents`);
      shouldFilter = false;
    }
    
    // Perform vector search without filter (since documentId isn't indexed for filtering)
    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: indexName,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 150,
          limit: shouldFilter ? limit * 10 : limit, // Get more candidates when we need to filter
        }
      },
      {
        $project: {
          _id: 0,
          key: 1,
          pageNumber: 1,
          documentId: 1,
          score: { $meta: 'vectorSearchScore' },
        }
      }
    ];
    
    // Only filter by documentId if we found documents with that ID
    if (shouldFilter && documentId) {
      pipeline.push({
        $match: { documentId: documentId }
      });
      pipeline.push({
        $limit: limit
      });
    }
    
    console.log('🔎 Executing pipeline:', JSON.stringify(pipeline, null, 2));
    const results = await collection.aggregate(pipeline).toArray();
    console.log(`📋 Vector search returned ${results.length} results:`, results.map(r => ({
      page: r.pageNumber,
      documentId: r.documentId,
      score: r.score,
      key: r.key?.substring(0, 50) + '...'
    })));
    
    return results.map(result => ({
      key: result.key,
      pageNumber: result.pageNumber || result.page_number,
      score: result.score
    }));
    
  } catch (error) {
    console.error('Vector search failed:', error);
    return [];
  }
}

export async function getRelevantPages(query: string, topK: number = 2): Promise<string[]> {
  const searchResults = await vectorSearch(query, topK);
  return searchResults.map(result => result.key);
}