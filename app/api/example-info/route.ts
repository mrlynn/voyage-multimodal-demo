import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const examplePath = path.join(process.cwd(), 'public', 'example.pdf');
    
    try {
      // Check if example PDF exists
      const stats = await fs.stat(examplePath);
      
      // Read the PDF file to generate a hash
      const pdfBuffer = await fs.readFile(examplePath);
      const hash = createHash('sha256').update(pdfBuffer).digest('hex');
      
      return NextResponse.json({
        exists: true,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        hash: hash.substring(0, 16), // First 16 chars for comparison
        path: '/public/example.pdf'
      });
      
    } catch (fileError) {
      return NextResponse.json({
        exists: false,
        error: 'Example PDF not found'
      });
    }
    
  } catch (error) {
    console.error('Example info error:', error);
    return NextResponse.json(
      { error: 'Failed to get example PDF info' },
      { status: 500 }
    );
  }
}