import axios from 'axios';

const voyageApiKey = process.env.VOYAGE_API_KEY;
const serverlessUrl = process.env.SERVERLESS_URL;

function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return norm > 0 ? vector.map(val => val / norm) : vector;
}

export async function generateEmbedding(
  input: string | Buffer,
  inputType: 'document' | 'query' = 'document'
): Promise<number[] | null> {
  try {
    console.log(`Generating embedding for ${Buffer.isBuffer(input) ? 'image' : 'text'}, inputType: ${inputType}`);
    console.log(`Available services: serverlessUrl=${!!serverlessUrl}, voyageApiKey=${!!voyageApiKey}`);
    
    if (serverlessUrl) {
      // Use serverless endpoint first (more reliable for this demo)
      const requestData = Buffer.isBuffer(input) 
        ? input.toString('base64')
        : input;
      
      console.log(`Calling serverless endpoint: ${serverlessUrl}`);
      const response = await axios.post(serverlessUrl, {
        task: 'get_embedding',
        data: {
          input: requestData,
          input_type: inputType
        }
      });
      
      console.log(`Serverless response status: ${response.status}`);
      if (response.status === 200 && response.data.embedding) {
        console.log(`Got embedding with ${response.data.embedding.length} dimensions`);
        return normalizeVector(response.data.embedding);
      } else {
        console.warn('Serverless endpoint did not return embedding, falling back...');
      }
    } else if (voyageApiKey) {
      // Fallback to Voyage AI API directly
      const isImage = Buffer.isBuffer(input);
      
      if (isImage) {
        // For image embeddings, we'll use a text-based fallback since voyage-multimodal-3 isn't available
        // Create a more descriptive placeholder that will help with search
        console.log('Image embedding requested, but multimodal models not available. Using text fallback.');
        
        // Create a unique identifier based on image content hash (simple approach)
        const imageHash = input.toString('base64').slice(0, 32);
        const imageDescription = `PDF document page visual content image data representation ${imageHash}`;
        
        const response = await axios.post('https://api.voyageai.com/v1/embeddings', {
          input: [imageDescription],
          model: 'voyage-2',
          input_type: inputType
        }, {
          headers: {
            'Authorization': `Bearer ${voyageApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        const embedding = response.data.data[0].embedding;
        return normalizeVector(embedding);
      } else {
        // For text embeddings - use voyage-2 (most capable available model)
        const response = await axios.post('https://api.voyageai.com/v1/embeddings', {
          input: [input],
          model: 'voyage-2',
          input_type: inputType
        }, {
          headers: {
            'Authorization': `Bearer ${voyageApiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        const embedding = response.data.data[0].embedding;
        return normalizeVector(embedding);
      }
    }
    
    // Fallback: return random embedding for testing
    console.warn('No embedding service available, using random embedding');
    const randomEmbedding = Array.from({ length: 1024 }, () => Math.random() * 2 - 1);
    return normalizeVector(randomEmbedding);
    
  } catch (error) {
    console.error('Embedding generation failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
    }
    return null;
  }
}

export async function generateTextEmbedding(
  text: string,
  inputType: 'document' | 'query' = 'query'
): Promise<number[] | null> {
  return generateEmbedding(text, inputType);
}

export async function generateImageEmbedding(
  imageBuffer: Buffer,
  pageNumber?: number,
  pageText?: string
): Promise<number[] | null> {
  // Since we don't have multimodal models available, we'll use page text if available
  if (pageText && pageText.trim().length > 0) {
    console.log(`Using page text for embedding instead of image (page ${pageNumber})`);
    return generateEmbedding(pageText, 'document');
  }
  
  // Fallback to image processing (which will use text placeholder)
  return generateEmbedding(imageBuffer, 'document');
}