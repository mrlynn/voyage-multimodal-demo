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
  resolveImageUrl(pageNumber: number, storedKey?: string): ResolvedImage {
    // If we have a stored key from the database, use it (this will be blob URL in production)
    if (storedKey) {
      const isBlob = storedKey.startsWith('http');
      return {
        url: storedKey,
        isBlob,
        fallbackUrl: this.getLocalImagePath(pageNumber)
      };
    }
    
    // Fallback to local path format
    const localPath = this.getLocalImagePath(pageNumber);
    return {
      url: localPath,
      isBlob: false
    };
  }

  /**
   * Get the local image path in the expected format
   */
  private getLocalImagePath(pageNumber: number): string {
    // Files are saved as page-02.png format (zero-padded)
    return `/uploads/pdf-pages/page-${pageNumber.toString().padStart(2, '0')}.png`;
  }

  /**
   * Generate fallback URLs to try if the primary image fails
   */
  getFallbackUrls(pageNumber: number): string[] {
    return [
      `/uploads/pdf-pages/page-${pageNumber.toString().padStart(2, '0')}.png`,
      `/uploads/pdf-pages/page-${pageNumber}.png`
    ];
  }

  /**
   * Handle image load error with fallback logic
   */
  handleImageError(imgElement: HTMLImageElement, pageNumber: number): void {
    const fallbackUrls = this.getFallbackUrls(pageNumber);
    const currentSrc = imgElement.src;
    
    // Try the next fallback URL
    const currentIndex = fallbackUrls.findIndex(url => currentSrc.includes(url.replace(/^\//, '')));
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < fallbackUrls.length) {
      console.log(`Image failed to load: ${currentSrc}, trying fallback: ${fallbackUrls[nextIndex]}`);
      imgElement.src = fallbackUrls[nextIndex];
    } else {
      console.error(`All fallback images failed for page ${pageNumber}`);
      // Could set a default error image here
    }
  }
}

// Export singleton instance
export const imageResolver = new ImageResolverService();
export default imageResolver;