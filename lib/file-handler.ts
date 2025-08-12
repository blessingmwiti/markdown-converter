import { ConversionResult } from './converters';
import { sanitizeFilename } from './security';

export interface DownloadOptions {
  filename?: string;
  saveAsDialog?: boolean;
}

/**
 * Handles secure file operations including reading and downloading
 */
export class FileHandler {
  
  /**
   * Read file content securely using FileReader API
   */
  public static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.onabort = () => {
        reject(new Error('File reading was aborted'));
      };
      
      // Read file as text with UTF-8 encoding
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Download converted content as a file
   */
  public static downloadFile(
    result: ConversionResult,
    options: DownloadOptions = {}
  ): void {
    if (!result.success) {
      throw new Error(result.error || 'Conversion failed');
    }

    const filename = options.filename || result.filename;
    const sanitizedFilename = sanitizeFilename(filename);

    try {
      // Create blob with appropriate MIME type
      const blob = new Blob([result.content], { 
        type: result.mimeType 
      });

      // Create download URL
      const url = URL.createObjectURL(blob);

      // Create temporary download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = sanitizedFilename;
      
      // Prevent link from being displayed
      downloadLink.style.display = 'none';
      
      // Add to DOM temporarily
      document.body.appendChild(downloadLink);
      
      // Trigger download
      downloadLink.click();
      
      // Cleanup
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download multiple files as a ZIP (future enhancement)
   */
  public static async downloadMultipleFiles(
    results: ConversionResult[],
    zipFilename: string = 'converted-files.zip'
  ): Promise<void> {
    // Note: This would require a ZIP library like JSZip
    // For now, we'll download files individually
    
    const validResults = results.filter(result => result.success);
    
    if (validResults.length === 0) {
      throw new Error('No valid files to download');
    }

    // Download each file with a small delay to prevent browser blocking
    for (let i = 0; i < validResults.length; i++) {
      const result = validResults[i];
      
      // Add delay to prevent browser download blocking
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      this.downloadFile(result);
    }
  }

  /**
   * Copy content to clipboard
   */
  public static async copyToClipboard(content: string): Promise<void> {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      return this.fallbackCopyToClipboard(content);
    }

    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fallback clipboard copy for older browsers
   */
  private static fallbackCopyToClipboard(content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }

  /**
   * Validate file before processing
   */
  public static validateFileType(file: File): boolean {
    const allowedTypes = [
      'text/markdown',
      'text/plain',
      'application/octet-stream', // Some systems report .md as this
    ];
    
    const allowedExtensions = ['.md', '.markdown', '.txt'];
    
    // Check MIME type
    if (allowedTypes.includes(file.type)) {
      return true;
    }
    
    // Check file extension as fallback
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  }

  /**
   * Format file size for display
   */
  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   */
  public static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  /**
   * Check if browser supports File API
   */
  public static isFileAPISupported(): boolean {
    if (typeof window === 'undefined') {
      return false; // Server-side rendering
    }
    return !!(window.File && window.FileReader && window.FileList && window.Blob);
  }

  /**
   * Check if browser supports download functionality
   */
  public static isDownloadSupported(): boolean {
    if (typeof document === 'undefined') {
      return false; // Server-side rendering
    }
    const a = document.createElement('a');
    return typeof a.download !== 'undefined';
  }
}
