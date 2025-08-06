import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const pagesDir = path.join(process.cwd(), 'public', 'uploads', 'pdf-pages');
    
    try {
      const files = await fs.readdir(pagesDir);
      const pageFiles = files
        .filter(file => file.endsWith('.png'))
        .sort((a, b) => {
          const pageA = parseInt(a.match(/\d+/)?.[0] || '0');
          const pageB = parseInt(b.match(/\d+/)?.[0] || '0');
          return pageA - pageB;
        });
      
      const pages = pageFiles.map(file => {
        const pageNumber = parseInt(file.match(/\d+/)?.[0] || '0');
        return {
          page: pageNumber,
          filename: file,
          path: `/uploads/pdf-pages/${file}`
        };
      });
      
      return NextResponse.json({ 
        pages,
        total: pages.length 
      });
    } catch (error) {
      // Directory doesn't exist yet
      return NextResponse.json({ 
        pages: [],
        total: 0 
      });
    }
  } catch (error) {
    console.error('Error listing pages:', error);
    return NextResponse.json(
      { error: 'Failed to list pages' },
      { status: 500 }
    );
  }
}