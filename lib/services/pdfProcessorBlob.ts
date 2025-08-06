import { exec } from 'child_process';
import { promisify } from 'util';
import { generateImageEmbedding } from './embeddings';
import { getCollection, createVectorIndex } from '../mongodb';
import { blobStorage } from './blobStorage';
import fs from 'fs/promises';
import path from 'path';
import { ProcessingProgress, ProgressStep, ProgressCallback } from '../../types/progress';

const execAsync = promisify(exec);
const ZOOM_FACTOR = 2.0;

export interface ProcessedPage {
  key: string; // Blob URL for production, local path for development
  width: number;
  height: number;
  pageNumber: number;
  embedding?: number[];
  documentId?: string; // Added for blob storage organization
}

/**
 * Enhanced PDF processor with Vercel Blob support
 * Automatically detects environment and uses appropriate storage
 */
export class PDFProcessorService {
  private isProduction = process.env.NODE_ENV === 'production';
  private useBlob = this.isProduction && blobStorage.isConfigured();

  constructor() {
    console.log(`PDF Processor initialized:`, {
      isProduction: this.isProduction,
      useBlob: this.useBlob,
      blobConfigured: blobStorage.isConfigured()
    });
  }

  /**
   * Extract PDF pages and store them appropriately based on environment
   */
  async extractPDFPages(
    pdfBuffer: Buffer,
    documentId: string,
    onProgress?: ProgressCallback
  ): Promise<ProcessedPage[]> {
    const updateProgress = (currentStep: number, stepUpdate: Partial<ProgressStep>) => {
      if (!onProgress) return;
      
      const steps: ProgressStep[] = [
        { id: 'setup', title: 'Setting up', description: 'Preparing PDF processing environment', status: 'pending' },
        { id: 'convert', title: 'Converting PDF', description: 'Converting PDF pages to images', status: 'pending' },
        { id: 'process', title: 'Processing pages', description: this.useBlob ? 'Uploading to Vercel Blob' : 'Organizing local files', status: 'pending' }
      ];
      
      steps[currentStep] = { ...steps[currentStep], ...stepUpdate };
      
      const completedSteps = steps.filter(s => s.status === 'completed').length;
      const overallProgress = Math.round((completedSteps / steps.length) * 100);
      
      onProgress({
        currentStep: currentStep + 1,
        totalSteps: steps.length,
        steps,
        overallProgress
      });
    };

    try {
      // Step 1: Setup
      updateProgress(0, { status: 'in_progress', progress: 0, details: 'Creating temporary directory...' });
      
      // Always use temp directory for processing, even in production
      const tempDir = path.join(process.cwd(), 'temp', `pdf-${documentId}`);
      await fs.mkdir(tempDir, { recursive: true });
      
      updateProgress(0, { progress: 50, details: 'Saving PDF to temporary file...' });
      const tempPdfPath = path.join(tempDir, 'temp.pdf');
      await fs.writeFile(tempPdfPath, pdfBuffer);
      
      updateProgress(0, { status: 'completed', progress: 100, details: 'Setup complete' });

      try {
        // Step 2: Convert PDF to images
        updateProgress(1, { status: 'in_progress', progress: 0, details: 'Converting PDF to images...' });
        
        const outputPrefix = path.join(tempDir, 'page');
        const dpi = Math.round(ZOOM_FACTOR * 150);
        
        const command = `pdftoppm -png -r ${dpi} "${tempPdfPath}" "${outputPrefix}"`;
        console.log('Running command:', command);
        
        updateProgress(1, { progress: 50, details: 'Running PDF conversion command...' });
        await execAsync(command);
        
        updateProgress(1, { status: 'completed', progress: 100, details: 'PDF conversion complete' });

        // Step 3: Process and store images
        updateProgress(2, { status: 'in_progress', progress: 0, details: 'Reading generated images...' });
        
        const files = await fs.readdir(tempDir);
        const imageFiles = files
          .filter(file => file.startsWith('page-') && file.endsWith('.png'))
          .sort((a, b) => {
            const numA = parseInt(a.match(/page-(\d+)/)?.[1] || '0');
            const numB = parseInt(b.match(/page-(\d+)/)?.[1] || '0');
            return numA - numB;
          });
        
        updateProgress(2, { progress: 10, details: `Found ${imageFiles.length} page images` });

        const pages: ProcessedPage[] = [];

        // Process each image file
        for (let i = 0; i < imageFiles.length; i++) {
          const filename = imageFiles[i];
          const pageNumber = i + 1;
          
          const progress = Math.round(10 + (i / imageFiles.length) * 80);
          updateProgress(2, { 
            progress, 
            details: this.useBlob 
              ? `Uploading page ${pageNumber} to Vercel Blob...`
              : `Processing page ${pageNumber}...`
          });

          try {
            const imagePath = path.join(tempDir, filename);
            const imageBuffer = await fs.readFile(imagePath);
            
            let pageKey: string;

            if (this.useBlob) {
              // Upload to Vercel Blob for production
              const blobFile = await blobStorage.uploadPageImage(documentId, pageNumber, imageBuffer);
              pageKey = blobFile.url;
              console.log(`Uploaded page ${pageNumber} to blob: ${blobFile.url}`);
            } else {
              // Save to local public directory for development
              const publicDir = path.join(process.cwd(), 'public', 'uploads', 'pdf-pages');
              await fs.mkdir(publicDir, { recursive: true });
              
              const publicImagePath = path.join(publicDir, `page-${pageNumber.toString().padStart(2, '0')}.png`);
              await fs.writeFile(publicImagePath, imageBuffer);
              pageKey = `/uploads/pdf-pages/page-${pageNumber.toString().padStart(2, '0')}.png`;
              console.log(`Saved page ${pageNumber} locally: ${pageKey}`);
            }

            pages.push({
              key: pageKey,
              width: 1200,
              height: 1600,
              pageNumber,
              documentId
            });

          } catch (pageError) {
            console.error(`Error processing ${filename}:`, pageError);
          }
        }

        // Cleanup temp directory
        await fs.rm(tempDir, { recursive: true, force: true });

        updateProgress(2, { status: 'completed', progress: 100, details: `Successfully processed ${pages.length} pages` });
        
        console.log(`Successfully extracted ${pages.length} pages using ${this.useBlob ? 'Vercel Blob' : 'local storage'}`);
        return pages;

      } catch (conversionError) {
        console.error('PDF conversion failed:', conversionError);
        
        // Cleanup temp directory on error
        await fs.rm(tempDir, { recursive: true, force: true });
        
        // Create fallback page
        const fallbackPage = await this.createFallbackPage(documentId);
        return [fallbackPage];
      }

    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw error;
    }
  }

  /**
   * Create a fallback page when PDF processing fails
   */
  private async createFallbackPage(documentId: string): Promise<ProcessedPage> {
    const svg = `
      <svg width="1200" height="1600" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="1600" fill="white"/>
        <text x="600" y="800" font-family="Arial" font-size="48" text-anchor="middle" fill="#333">
          PDF Content
        </text>
        <text x="600" y="860" font-family="Arial" font-size="24" text-anchor="middle" fill="#666">
          Could not render PDF pages
        </text>
        <text x="600" y="920" font-family="Arial" font-size="18" text-anchor="middle" fill="#999">
          Using fallback for demo
        </text>
      </svg>
    `;
    
    const sharp = await import('sharp');
    const imageBuffer = await sharp.default(Buffer.from(svg))
      .png()
      .toBuffer();

    let pageKey: string;

    if (this.useBlob) {
      const blobFile = await blobStorage.uploadPageImage(documentId, 1, imageBuffer);
      pageKey = blobFile.url;
    } else {
      const publicDir = path.join(process.cwd(), 'public', 'uploads', 'pdf-pages');
      await fs.mkdir(publicDir, { recursive: true });
      const fallbackPath = path.join(publicDir, 'page-01.png');
      await fs.writeFile(fallbackPath, imageBuffer);
      pageKey = '/uploads/pdf-pages/page-01.png';
    }

    return {
      key: pageKey,
      width: 1200,
      height: 1600,
      pageNumber: 1,
      documentId
    };
  }

  /**
   * Generate embeddings for processed pages
   */
  async generateEmbeddingsForPages(
    pages: ProcessedPage[],
    onProgress?: ProgressCallback
  ): Promise<ProcessedPage[]> {
    const updateProgress = (pageIndex: number, details: string) => {
      if (!onProgress) return;
      
      const steps: ProgressStep[] = [
        { 
          id: 'embeddings', 
          title: 'Generating embeddings', 
          description: 'Creating AI embeddings for each page',
          status: 'in_progress',
          progress: Math.round((pageIndex / pages.length) * 100),
          details
        }
      ];
      
      onProgress({
        currentStep: 1,
        totalSteps: 1,
        steps,
        overallProgress: Math.round((pageIndex / pages.length) * 100)
      });
    };

    const embeddedPages: ProcessedPage[] = [];
    
    console.log(`Generating embeddings for ${pages.length} pages...`);
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      updateProgress(i, `Processing page ${page.pageNumber} of ${pages.length}`);
      
      try {
        let imageBuffer: Buffer;

        if (this.useBlob) {
          // Fetch image from Vercel Blob
          const response = await fetch(page.key);
          if (!response.ok) {
            throw new Error(`Failed to fetch image from blob: ${response.statusText}`);
          }
          imageBuffer = Buffer.from(await response.arrayBuffer());
        } else {
          // Read from local filesystem
          const imagePath = path.join(process.cwd(), 'public', page.key);
          imageBuffer = await fs.readFile(imagePath);
        }
        
        // Generate embedding
        const embedding = await generateImageEmbedding(imageBuffer);
        
        if (embedding) {
          embeddedPages.push({
            ...page,
            embedding
          });
        } else {
          console.warn(`Failed to generate embedding for page ${page.pageNumber}`);
        }
        
      } catch (error) {
        console.error(`Error processing page ${page.pageNumber}:`, error);
      }
    }
    
    // Final progress update
    if (onProgress) {
      const steps: ProgressStep[] = [
        { 
          id: 'embeddings', 
          title: 'Generating embeddings', 
          description: 'Creating AI embeddings for each page',
          status: 'completed',
          progress: 100,
          details: `Successfully generated embeddings for ${embeddedPages.length} pages`
        }
      ];
      
      onProgress({
        currentStep: 1,
        totalSteps: 1,
        steps,
        overallProgress: 100
      });
    }
    
    console.log(`Successfully generated embeddings for ${embeddedPages.length} pages`);
    return embeddedPages;
  }

  /**
   * Complete PDF ingestion pipeline with blob storage support
   */
  async ingestPDFToMongoDB(
    pdfBuffer: Buffer,
    documentId: string,
    onProgress?: ProgressCallback
  ): Promise<{ success: boolean; pageCount: number; message: string; documentId: string }> {
    try {
      // First, upload the original PDF to blob if in production
      if (this.useBlob) {
        await blobStorage.uploadPDF(`${documentId}.pdf`, pdfBuffer);
      }

      // Extract pages from PDF
      const pages = await this.extractPDFPages(pdfBuffer, documentId, onProgress);
      
      if (pages.length === 0) {
        return {
          success: false,
          pageCount: 0,
          message: 'No pages extracted from PDF',
          documentId
        };
      }
      
      // Generate embeddings for pages
      const embeddedPages = await this.generateEmbeddingsForPages(pages, onProgress);
      
      if (embeddedPages.length === 0) {
        return {
          success: false,
          pageCount: 0,
          message: 'Failed to generate embeddings for pages',
          documentId
        };
      }
      
      // Get MongoDB collection
      const collection = await getCollection();
      
      // Clear existing documents for this document ID
      await collection.deleteMany({ documentId });
      
      // Insert embedded pages with document ID
      const documentsToInsert = embeddedPages.map(page => ({
        ...page,
        documentId,
        createdAt: new Date(),
        storageType: this.useBlob ? 'blob' : 'local'
      }));
      
      await collection.insertMany(documentsToInsert);
      
      // Create vector index if it doesn't exist
      await createVectorIndex();
      
      return {
        success: true,
        pageCount: embeddedPages.length,
        message: `Successfully ingested ${embeddedPages.length} pages using ${this.useBlob ? 'Vercel Blob' : 'local storage'}`,
        documentId
      };
      
    } catch (error) {
      console.error('PDF ingestion failed:', error);
      
      // Cleanup blob storage on failure
      if (this.useBlob) {
        try {
          await blobStorage.deleteDocumentPages(documentId);
        } catch (cleanupError) {
          console.error('Failed to cleanup blob storage:', cleanupError);
        }
      }
      
      return {
        success: false,
        pageCount: 0,
        message: error instanceof Error ? error.message : 'PDF ingestion failed',
        documentId
      };
    }
  }
}

// Export singleton instance
export const pdfProcessor = new PDFProcessorService();
export default pdfProcessor;