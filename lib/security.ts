// Security utilities for file validation and content sanitization

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedExtensions?: string[];
  maxContentLength?: number;
}

const DEFAULT_OPTIONS: Required<FileValidationOptions> = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['.md', '.markdown', '.txt'],
  maxContentLength: 1024 * 1024, // 1MB of text content
};

/**
 * Validates uploaded file for security and size constraints
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check file size
  if (file.size > opts.maxSize) {
    return {
      isValid: false,
      error: `File size exceeds limit of ${Math.round(opts.maxSize / 1024 / 1024)}MB`
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = opts.allowedExtensions.some(ext => 
    fileName.endsWith(ext.toLowerCase())
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${opts.allowedExtensions.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Validates file content length
 */
export function validateContent(
  content: string,
  maxLength: number = DEFAULT_OPTIONS.maxContentLength
): FileValidationResult {
  if (content.length > maxLength) {
    return {
      isValid: false,
      error: `Content exceeds maximum length of ${Math.round(maxLength / 1024)}KB`
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .substring(0, 255); // Limit length
}

/**
 * Detects potentially malicious content patterns
 */
export function detectMaliciousContent(content: string): boolean {
  const suspiciousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
    /eval\s*\(/i,
    /document\.write/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(content));
}

/**
 * Rate limiting for file processing (simple client-side implementation)
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

export const rateLimiter = new RateLimiter();
