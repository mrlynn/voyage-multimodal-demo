import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { generateImageEmbedding } from '@/lib/services/embeddings';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const execAsync = promisify(exec);

/**
 * Stable PDF processor following the robust approach from the Python notebook
 * - Direct PDF to image conversion using pdftoppm (like pymupdf)
 * - Systematic page extraction with proper zoom factor
 * - Reliable embedding generation and storage
 * - Proper error handling and cleanup
 */
export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    console.log(`🚀 Starting stable processing for document: ${documentId}`);

    // Step 1: Setup - Read PDF file
    const pdfPath = path.join(process.cwd(), 'public', 'example.pdf');
    
    try {
      await fs.access(pdfPath);
    } catch {
      return NextResponse.json({ error: 'PDF file not found' }, { status: 404 });
    }

    // Step 2: Create working directory
    const workDir = path.join(process.cwd(), 'temp', `stable-${documentId}`);
    await fs.mkdir(workDir, { recursive: true });
    
    try {
      // Step 3: Convert PDF to images using pdftoppm (following notebook approach)
      const zoom = 3.0; // Same zoom factor as notebook
      const dpi = Math.round(zoom * 150); // 450 DPI for high quality
      const outputPrefix = path.join(workDir, 'page');
      
      console.log(`📄 Converting PDF to images at ${dpi} DPI...`);
      const command = `pdftoppm -png -r ${dpi} "${pdfPath}" "${outputPrefix}"`;
      
      await execAsync(command, { timeout: 60000 });
      console.log('✅ PDF conversion completed');

      // Step 4: Read generated images
      const files = await fs.readdir(workDir);
      const imageFiles = files
        .filter(file => file.startsWith('page-') && file.endsWith('.png'))
        .sort((a, b) => {
          const numA = parseInt(a.match(/page-(\d+)/)?.[1] || '0');
          const numB = parseInt(b.match(/page-(\d+)/)?.[1] || '0');
          return numA - numB;
        });

      console.log(`📊 Found ${imageFiles.length} pages to process`);

      // Step 5: Clean up existing documents for this documentId
      const collection = await getCollection();
      await collection.deleteMany({ documentId });
      console.log('🧹 Cleaned up existing documents');

      // Step 6: Process each page systematically (like notebook)
      const processedPages = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const filename = imageFiles[i];
        const pageNumber = i + 1;
        
        console.log(`⚙️ Processing page ${pageNumber}/${imageFiles.length}...`);
        
        const imagePath = path.join(workDir, filename);
        const imageBuffer = await fs.readFile(imagePath);
        
        // Get image dimensions using sharp (like PIL in notebook)
        const { width, height } = await sharp(imageBuffer).metadata();
        
        // Save to public directory with document-specific folder
        const publicDir = path.join(process.cwd(), 'public', 'uploads', 'pdf-pages', documentId);
        await fs.mkdir(publicDir, { recursive: true });
        
        const publicImagePath = path.join(publicDir, `page-${pageNumber.toString().padStart(2, '0')}.png`);
        await fs.writeFile(publicImagePath, imageBuffer);
        
        const pageKey = `/uploads/pdf-pages/${documentId}/page-${pageNumber.toString().padStart(2, '0')}.png`;
        
        // Generate embedding for this page
        console.log(`🧠 Generating embedding for page ${pageNumber}...`);
        const embedding = await generateImageEmbedding(imageBuffer);
        
        // Create document following notebook structure
        const pageDoc = {
          documentId,
          pageNumber,
          key: pageKey,
          width: width || 1200,
          height: height || 1600,
          embedding,
          createdAt: new Date(),
          storageType: 'local'
        };
        
        // Insert into MongoDB
        await collection.insertOne(pageDoc);
        processedPages.push(pageDoc);
        
        console.log(`✅ Page ${pageNumber} processed and stored`);
      }

      // Step 7: Cleanup temp directory
      await fs.rm(workDir, { recursive: true, force: true });

      console.log(`🎉 Successfully processed ${processedPages.length} pages for ${documentId}`);

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${processedPages.length} pages`,
        pageCount: processedPages.length,
        documentId,
        pages: processedPages.map(p => ({
          pageNumber: p.pageNumber,
          key: p.key,
          width: p.width,
          height: p.height
        }))
      });

    } catch (error) {
      // Cleanup on error
      await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
      throw error;
    }

  } catch (error) {
    console.error('❌ Stable processing error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed'
    }, { status: 500 });
  }
}