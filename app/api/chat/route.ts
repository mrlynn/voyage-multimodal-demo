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
    
    const systemPrompt = `You are an AI assistant helping users understand their PDF documents. Your PRIMARY job is to answer questions about the CONTENT of the PDF based on the provided page images.

    CRITICAL INSTRUCTIONS:
    1. ALWAYS examine the images carefully and extract all visible text and content
    2. If text is partially visible or requires careful reading, make your best effort to read it
    3. For questions about PDF content, focus on what you can actually see in the images
    4. If specific information isn't clearly visible, say "I cannot clearly read that information in these pages"
    5. ALWAYS cite the specific page number(s) where you found the information
    6. Be thorough and extract all relevant details from the images, even if text quality varies

    WHAT TO ANALYZE:
    - All text content: headings, paragraphs, lists, captions
    - Tables, charts, graphs and their data values
    - Diagrams, figures, and any visible labels
    - Numerical data, statistics, or metrics
    - Technical specifications or parameters
    - Formulas, equations, or calculations
    - Document structure and organization

    IMAGE ANALYSIS APPROACH:
    - Look carefully at each image, even if text appears small or unclear
    - Try to read text at different scales and orientations
    - Pay attention to document layout and visual elements
    - Extract information from graphs, charts, and diagrams

    FORMAT YOUR RESPONSE:
    - Start with a direct answer based on what you can see
    - Provide supporting details from the document
    - Always mention "on page X" or "as shown on page X" when citing information
    - If referring to multiple pages, list all relevant page numbers

    ONLY mention the technical search details (Voyage AI, MongoDB Atlas) if the user specifically asks about how the search works.`;
    
    const parts = [
      { text: systemPrompt },
      { text: `User question: ${message}` },
      { text: 'Here are the relevant pages from the document:' },
      ...images,
      { text: `Now analyze these pages carefully and answer the user's question: "${message}". Remember to focus on the CONTENT of the document, not the search technology.` }
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