import { getCollection } from '../mongodb';
import { generateTextEmbedding } from './embeddings';

export interface SearchResult {
  key: string;
  pageNumber: number;
  score: number;
}

export async function vectorSearch(
  query: string,
  limit: number = 2
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateTextEmbedding(query, 'query');
    
    if (!queryEmbedding) {
      console.error('Failed to generate query embedding');
      return [];
    }
    
    const collection = await getCollection();
    const indexName = process.env.VS_INDEX_NAME || 'vector_index_voyageai';
    
    // Perform vector search
    const pipeline = [
      {
        $vectorSearch: {
          index: indexName,
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 150,
          limit: limit,
        }
      },
      {
        $project: {
          _id: 0,
          key: 1,
          pageNumber: 1,
          score: { $meta: 'vectorSearchScore' },
        }
      },
    ];
    
    const results = await collection.aggregate(pipeline).toArray();
    
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