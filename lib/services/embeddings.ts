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
        // For multimodal embeddings
        const base64Image = input.toString('base64');
        const response = await axios.post('https://api.voyageai.com/v1/multimodal-embed', {
          input: [[`data:image/png;base64,${base64Image}`]],
          model: 'voyage-multimodal-3',
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
        // For text embeddings
        const response = await axios.post('https://api.voyageai.com/v1/embeddings', {
          input: [input],
          model: 'voyage-3',
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
  imageBuffer: Buffer
): Promise<number[] | null> {
  return generateEmbedding(imageBuffer, 'document');
}