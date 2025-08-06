import { NextRequest } from 'next/server';
import { ingestPDFToMongoDB } from '@/lib/services/pdfProcessor';
import { ProcessingProgress } from '@/types/progress';

export const maxDuration = 300; // Maximum function duration: 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const sendProgress = (progress: ProcessingProgress) => {
        const data = `data: ${JSON.stringify(progress)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };
      
      const sendError = (error: string) => {
        const data = `data: ${JSON.stringify({ error })}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.close();
      };
      
      const sendComplete = (result: { success: boolean; pageCount: number; message: string }) => {
        const data = `data: ${JSON.stringify({ ...result, complete: true })}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.close();
      };
      
      // Process the request
      (async () => {
        try {
          const formData = await request.formData();
          const file = formData.get('pdf') as File;
          
          if (!file || !file.name.endsWith('.pdf')) {
            sendError('Please upload a valid PDF file');
            return;
          }
          
          // Convert file to buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Process with progress updates
          const result = await ingestPDFToMongoDB(buffer, sendProgress);
          sendComplete(result);
          
        } catch (error) {
          console.error('Upload error:', error);
          sendError('Failed to process PDF');
        }
      })();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}