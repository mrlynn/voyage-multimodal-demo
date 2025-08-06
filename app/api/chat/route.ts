import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { vectorSearch } from '@/lib/services/vectorSearch';
import path from 'path';
import fs from 'fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Perform vector search to find relevant pages
    console.log('Performing vector search for:', message);
    const searchResults = await vectorSearch(message, 2);
    
    if (searchResults.length === 0) {
      return NextResponse.json({
        response: "I couldn't find any relevant information in the uploaded documents. Please make sure you've uploaded a PDF first.",
        sources: []
      });
    }
    
    // Load the relevant page images
    const images = [];
    const sources = [];
    
    for (const result of searchResults) {
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
        
        sources.push({
          page: result.pageNumber,
          score: result.score
        });
        
      } catch (error) {
        console.error(`Failed to load image ${result.key}:`, error);
      }
    }
    
    if (images.length === 0) {
      return NextResponse.json({
        response: "I found relevant pages but couldn't load the images. Please try again.",
        sources: []
      });
    }
    
    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const systemPrompt = `You are a helpful AI assistant analyzing PDF documents using Voyage AI's multimodal-3 embeddings. 
    Answer the user's question based ONLY on the provided page images. 
    If the information is not clearly visible in the images, say "I cannot find that information in the provided pages."
    Be specific and cite page numbers when possible.
    
    TECHNICAL CONTEXT: You're powered by voyage-multimodal-3, which uses a unified transformer architecture (not CLIP) 
    to process text and visual content together. This enables superior understanding of document layout, typography, 
    and semantic relationships between text and images.
    
    IMPORTANT: When referring to content from the document, always mention the specific page number(s) where the information can be found.
    Format page references as "page X" or "on page X" so they can be easily identified.
    If the user asks about technical details, you can mention that this search uses MongoDB Atlas Vector Search with 
    voyage-multimodal-3 embeddings for enhanced multimodal document understanding.`;
    
    const parts = [
      { text: systemPrompt },
      { text: `User question: ${message}` },
      { text: 'Here are the relevant pages from the document:' },
      ...images,
      { text: 'Please provide a clear and concise answer based on these pages.' }
    ];
    
    const geminiResult = await model.generateContent(parts);
    const response = geminiResult.response.text();
    
    return NextResponse.json({
      response,
      sources
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}