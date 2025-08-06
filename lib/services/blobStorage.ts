import { put, del, list } from '@vercel/blob';

export interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Vercel Blob storage service for handling file uploads and management
 * Used for PDF files and processed page images in production deployment
 */
class BlobStorageService {
  private readonly TOKEN: string;

  constructor() {
    this.TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';
    if (!this.TOKEN) {
      console.warn('BLOB_READ_WRITE_TOKEN not found. Blob storage will not work in production.');
    }
  }

  /**
   * Upload a file buffer to Vercel Blob storage
   */
  async uploadFile(
    filename: string, 
    data: Buffer, 
    options?: { contentType?: string; pathname?: string }
  ): Promise<BlobFile> {
    try {
      const pathname = options?.pathname || filename;
      
      const blob = await put(pathname, data, {
        access: 'public',
        contentType: options?.contentType,
        token: this.TOKEN,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: 0, // Size not available from PutBlobResult
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Blob upload failed:', error);
      throw new Error(`Failed to upload ${filename}: ${error}`);
    }
  }

  /**
   * Upload PDF file and return blob info
   */
  async uploadPDF(filename: string, pdfBuffer: Buffer): Promise<BlobFile> {
    const pathname = `pdfs/${Date.now()}-${filename}`;
    return this.uploadFile(filename, pdfBuffer, {
      contentType: 'application/pdf',
      pathname,
    });
  }

  /**
   * Upload processed page image and return blob info
   */
  async uploadPageImage(
    documentId: string, 
    pageNumber: number, 
    imageBuffer: Buffer
  ): Promise<BlobFile> {
    const filename = `page-${pageNumber.toString().padStart(2, '0')}.png`;
    const pathname = `pdf-pages/${documentId}/${filename}`;
    
    return this.uploadFile(filename, imageBuffer, {
      contentType: 'image/png',
      pathname,
    });
  }

  /**
   * Delete a file from blob storage
   */
  async deleteFile(url: string): Promise<void> {
    try {
      await del(url, { token: this.TOKEN });
    } catch (error) {
      console.error('Blob deletion failed:', error);
      throw new Error(`Failed to delete blob: ${error}`);
    }
  }

  /**
   * List files in blob storage with optional prefix filter
   */
  async listFiles(prefix?: string): Promise<BlobFile[]> {
    try {
      const { blobs } = await list({
        prefix,
        token: this.TOKEN,
      });

      return blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      }));
    } catch (error) {
      console.error('Blob listing failed:', error);
      throw new Error(`Failed to list blobs: ${error}`);
    }
  }

  /**
   * Delete all page images for a document
   */
  async deleteDocumentPages(documentId: string): Promise<void> {
    try {
      const pageImages = await this.listFiles(`pdf-pages/${documentId}/`);
      const deletions = pageImages.map(image => this.deleteFile(image.url));
      await Promise.all(deletions);
    } catch (error) {
      console.error('Failed to delete document pages:', error);
      throw new Error(`Failed to delete pages for document ${documentId}: ${error}`);
    }
  }

  /**
   * Get direct URL for a blob file (already public)
   */
  getPublicUrl(blobUrl: string): string {
    return blobUrl;
  }

  /**
   * Check if blob storage is properly configured
   */
  isConfigured(): boolean {
    return !!this.TOKEN;
  }

  /**
   * Get storage info and quota (if available)
   */
  async getStorageInfo(): Promise<{ configured: boolean; hasToken: boolean }> {
    return {
      configured: this.isConfigured(),
      hasToken: !!this.TOKEN,
    };
  }
}

// Export singleton instance
export const blobStorage = new BlobStorageService();
export default blobStorage;