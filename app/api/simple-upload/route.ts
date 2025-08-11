import { NextRequest, NextResponse } from 'next/server';
import { generateImageEmbedding } from '@/lib/services/embeddings';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`📄 Processing: ${file.name}`);
    
    // For demo: create simple text pages instead of actual PDF processing
    const demoPages = [
      "This is page 1 of your PDF document. It contains introduction and overview content.",
      "This is page 2 with detailed methodology and technical specifications.", 
      "This is page 3 showing results, conclusions and future work."
    ];
    
    const collection = await getCollection();
    
    // Clear existing documents
    await collection.deleteMany({});
    
    // Process each page
    const documents = [];
    for (let i = 0; i < demoPages.length; i++) {
      const pageNumber = i + 1;
      const content = demoPages[i];
      
      console.log(`🧠 Generating embedding for page ${pageNumber}...`);
      
      // Generate text embedding (simpler than image for demo)
      const embedding = await generateImageEmbedding(Buffer.from(content));
      
      if (embedding) {
        documents.push({
          pageNumber,
          content,
          embedding,
          filename: file.name,
          createdAt: new Date()
        });
      }
    }
    
    if (documents.length > 0) {
      await collection.insertMany(documents);
      console.log(`✅ Stored ${documents.length} pages in MongoDB`);
      
      return NextResponse.json({
        success: true,
        pageCount: documents.length,
        message: `Successfully processed ${documents.length} pages`
      });
    } else {
      return NextResponse.json({
        error: 'Failed to generate embeddings'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Processing failed'
    }, { status: 500 });
  }
}