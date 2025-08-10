import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { documentId } = body;
    
    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'pdf-pages');
    
    if (documentId) {
      // Clean specific document
      const docDir = path.join(baseDir, documentId);
      
      try {
        await fs.access(docDir);
        await fs.rm(docDir, { recursive: true, force: true });
        return NextResponse.json({
          success: true,
          message: `Cleaned up PDF pages for document ${documentId}`,
          deletedCount: 1,
          documentId
        });
      } catch {
        return NextResponse.json({
          success: true,
          message: 'No files found for this document',
          deletedCount: 0,
          documentId
        });
      }
    }
    
    // Clean all documents (admin function)
    try {
      await fs.access(baseDir);
    } catch {
      return NextResponse.json({
        success: true,
        message: 'No PDF pages directory found, nothing to clean',
        deletedCount: 0
      });
    }
    
    // Read all subdirectories
    const dirs = await fs.readdir(baseDir, { withFileTypes: true });
    const documentDirs = dirs.filter(dirent => dirent.isDirectory());
    
    let deletedCount = 0;
    const errors: string[] = [];
    
    // Delete each document directory
    for (const dir of documentDirs) {
      try {
        await fs.rm(path.join(baseDir, dir.name), { recursive: true, force: true });
        deletedCount++;
      } catch (error) {
        errors.push(`Failed to delete ${dir.name}: ${error}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} document directories`,
      deletedCount,
      totalFound: documentDirs.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clean up PDF pages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    
    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'pdf-pages');
    
    if (documentId) {
      // List files for specific document
      const docDir = path.join(baseDir, documentId);
      
      try {
        await fs.access(docDir);
        const files = await fs.readdir(docDir);
        const imageFiles = files.filter(file => file.endsWith('.png'));
        
        return NextResponse.json({
          exists: true,
          documentId,
          count: imageFiles.length,
          files: imageFiles.sort()
        });
      } catch {
        return NextResponse.json({
          exists: false,
          documentId,
          count: 0,
          files: []
        });
      }
    }
    
    // List all documents
    try {
      await fs.access(baseDir);
      const dirs = await fs.readdir(baseDir, { withFileTypes: true });
      const documentDirs = dirs.filter(dirent => dirent.isDirectory());
      
      const documents = [];
      for (const dir of documentDirs) {
        const docPath = path.join(baseDir, dir.name);
        const files = await fs.readdir(docPath);
        const imageFiles = files.filter(file => file.endsWith('.png'));
        documents.push({
          documentId: dir.name,
          pageCount: imageFiles.length
        });
      }
      
      return NextResponse.json({
        exists: true,
        documentCount: documents.length,
        documents
      });
    } catch {
      return NextResponse.json({
        exists: false,
        documentCount: 0,
        documents: []
      });
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list PDF pages' },
      { status: 500 }
    );
  }
}