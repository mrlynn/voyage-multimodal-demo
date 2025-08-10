/**
 * Image resolver service for handling both blob URLs and local paths
 * Automatically detects the storage type and provides appropriate URLs
 */

export interface ResolvedImage {
  url: string;
  isBlob: boolean;
  fallbackUrl?: string;
}

class ImageResolverService {
  private isProduction = process.env.NODE_ENV === 'production';
  
  /**
   * Resolve image URL for display, handling both blob and local storage
   */
  resolveImageUrl(pageNumber: number, storedKey?: string, documentId?: string): ResolvedImage {
    // If we have a stored key from the database, use it (this will be blob URL in production)
    if (storedKey) {
      const isBlob = storedKey.startsWith('http');
      return {
        url: storedKey,
        isBlob,
        fallbackUrl: this.getLocalImagePath(pageNumber, documentId)
      };
    }
    
    // Fallback to local path format
    const localPath = this.getLocalImagePath(pageNumber, documentId);
    return {
      url: localPath,
      isBlob: false
    };
  }

  /**
   * Get the local image path in the expected format
   */
  private getLocalImagePath(pageNumber: number, documentId?: string): string {
    // Files are saved as page-02.png format (zero-padded) in document-specific directories
    const fileName = `page-${pageNumber.toString().padStart(2, '0')}.png`;
    
    if (documentId) {
      return `/uploads/pdf-pages/${documentId}/${fileName}`;
    }
    
    // Fallback to old format for backward compatibility
    return `/uploads/pdf-pages/${fileName}`;
  }

  /**
   * Generate fallback URLs to try if the primary image fails
   */
  getFallbackUrls(pageNumber: number, documentId?: string): string[] {
    const fileName = `page-${pageNumber.toString().padStart(2, '0')}.png`;
    const fallbacks = [];
    
    if (documentId) {
      fallbacks.push(`/uploads/pdf-pages/${documentId}/${fileName}`);
      fallbacks.push(`/uploads/pdf-pages/${documentId}/page-${pageNumber}.png`);
    }
    
    // Always include backward-compatible paths
    fallbacks.push(`/uploads/pdf-pages/${fileName}`);
    fallbacks.push(`/uploads/pdf-pages/page-${pageNumber}.png`);
    
    return fallbacks;
  }

  /**
   * Handle image load error with fallback logic
   */
  handleImageError(imgElement: HTMLImageElement, pageNumber: number, documentId?: string): void {
    const fallbackUrls = this.getFallbackUrls(pageNumber, documentId);
    const currentSrc = imgElement.src;
    
    // Try the next fallback URL
    const currentIndex = fallbackUrls.findIndex(url => currentSrc.includes(url.replace(/^\//, '')));
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < fallbackUrls.length) {
      console.log(`Image failed to load: ${currentSrc}, trying fallback: ${fallbackUrls[nextIndex]}`);
      imgElement.src = fallbackUrls[nextIndex];
    } else {
      console.error(`All fallback images failed for page ${pageNumber}`);
      // Hide the image or show a placeholder
      imgElement.style.display = 'none';
    }
  }
}

// Export singleton instance
export const imageResolver = new ImageResolverService();
export default imageResolver;