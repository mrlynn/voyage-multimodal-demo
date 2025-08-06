import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME || 'mongodb_aiewf';
const collectionName = process.env.COLLECTION_NAME || 'multimodal_workshop_voyageai';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db(dbName);
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

export async function getCollection(): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

export async function createVectorIndex() {
  const collection = await getCollection();
  const indexName = process.env.VS_INDEX_NAME || 'vector_index_voyageai';
  
  try {
    const indexes = await collection.listSearchIndexes().toArray();
    const indexExists = indexes.some((idx: any) => idx.name === indexName);
    
    if (indexExists) {
      console.log(`Index '${indexName}' already exists`);
      return true;
    }
    
    const model = {
      name: indexName,
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: 1024,
            similarity: 'cosine',
          }
        ]
      },
    };
    
    await collection.createSearchIndex(model);
    console.log(`Vector search index '${indexName}' created successfully!`);
    return true;
  } catch (error) {
    console.error('Index creation failed:', error);
    return false;
  }
}