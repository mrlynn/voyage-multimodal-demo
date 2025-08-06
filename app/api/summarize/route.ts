import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { vectorSearch } from '@/lib/services/vectorSearch';
import path from 'path';
import fs from 'fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Generating summary for document:', documentId);
    
    // Get a sampling of pages from the document to create a comprehensive summary
    // We'll get the first few pages and some representative content
    const sampleQueries = [
      'main content overview summary',
      'key topics themes concepts',
      'introduction abstract executive summary',
      'table of contents structure outline'
    ];
    
    const allResults = [];
    const seenPages = new Set();
    
    // Collect diverse pages for comprehensive summary
    for (const query of sampleQueries) {
      try {
        const results = await vectorSearch(query, 3);
        for (const result of results) {
          if (!seenPages.has(result.pageNumber) && allResults.length < 8) {
            allResults.push(result);
            seenPages.add(result.pageNumber);
          }
        }
      } catch (error) {
        console.warn(`Failed to search for "${query}":`, error);
      }
    }
    
    if (allResults.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Could not find document content for summarization"
      });
    }
    
    console.log(`Processing ${allResults.length} pages for summary`);
    
    // Load the page images for analysis
    const images = [];
    const pageNumbers = [];
    
    for (const result of allResults) {
      try {
        let imageBuffer: Buffer;
        
        // Check if the key is a blob URL or local path
        if (result.key.startsWith('http')) {
          // Blob URL - fetch from Vercel Blob
          const response = await fetch(result.key);
          if (!response.ok) {
            throw new Error(`Failed to fetch blob image: ${response.statusText}`);
          }
          imageBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          // Local path - read from filesystem
          const imagePath = path.join(process.cwd(), 'public', result.key);
          imageBuffer = await fs.readFile(imagePath);
        }
        
        const base64Image = imageBuffer.toString('base64');
        
        images.push({
          inlineData: {
            data: base64Image,
            mimeType: 'image/png'
          }
        });
        
        pageNumbers.push(result.pageNumber);
        
      } catch (error) {
        console.error(`Failed to load image ${result.key}:`, error);
      }
    }
    
    if (images.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Could not load document images for summarization"
      });
    }
    
    // Generate comprehensive summary using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const summaryPrompt = `You are analyzing a PDF document to create a welcome summary for users. 

    TASK: Create a brief, engaging summary of this document that will serve as the first message in a chat interface.

    REQUIREMENTS:
    1. Write 2-3 paragraphs maximum
    2. Identify the document type (research paper, manual, report, etc.)
    3. Highlight the main topics and key themes
    4. Mention notable visual elements (diagrams, tables, charts) if present
    5. End with an invitation for the user to ask specific questions
    6. Be conversational and welcoming
    7. Don't use overly formal language

    STYLE: Write as a helpful AI assistant introducing the document to someone who just uploaded it.
    Begin with something like "I've analyzed your document..." or "I've processed your PDF..."
    
    FORMAT: Return only the summary text, no additional formatting or metadata.

    Analyze the following pages from the document:`;
    
    const parts = [
      { text: summaryPrompt },
      { text: `Pages included in this analysis: ${pageNumbers.sort((a, b) => a - b).join(', ')}` },
      ...images,
    ];
    
    try {
      const result = await model.generateContent(parts);
      const summary = result.response.text();
      
      return NextResponse.json({
        success: true,
        summary: summary,
        pagesAnalyzed: pageNumbers.length,
        documentId: documentId
      });
      
    } catch (genError) {
      console.error('Gemini generation error:', genError);
      return NextResponse.json({
        success: false,
        error: "Failed to generate document summary"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate document summary' },
      { status: 500 }
    );
  }
}