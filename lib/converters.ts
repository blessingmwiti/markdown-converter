import { MarkdownParser, ParsedMarkdown } from './markdown-parser';
import { sanitizeFilename } from './security';

export type ConversionFormat = 'html' | 'json' | 'txt';

export interface ConversionResult {
  content: string;
  filename: string;
  mimeType: string;
  success: boolean;
  error?: string;
}

export interface ConversionOptions {
  originalFilename?: string;
  prettify?: boolean;
  includeMetadata?: boolean;
}

/**
 * Main converter class that handles all format conversions
 */
export class FileConverter {
  private parser: MarkdownParser;

  constructor() {
    this.parser = new MarkdownParser({
      sanitize: true,
      allowHtml: false,
      breaks: true,
      gfm: true,
    });
  }

  /**
   * Convert markdown content to specified format
   */
  public convert(
    markdownContent: string,
    format: ConversionFormat,
    options: ConversionOptions = {}
  ): ConversionResult {
    try {
      const parsed = this.parser.parse(markdownContent);
      const baseFilename = this.getBaseFilename(options.originalFilename);

      switch (format) {
        case 'html':
          return this.convertToHTML(parsed, baseFilename, options);
        case 'json':
          return this.convertToJSON(parsed, baseFilename, options);
        case 'txt':
          return this.convertToPlainText(parsed, baseFilename, options);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      return {
        content: '',
        filename: '',
        mimeType: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Convert to HTML format
   */
  private convertToHTML(
    parsed: ParsedMarkdown,
    baseFilename: string,
    options: ConversionOptions
  ): ConversionResult {
    const metadata = options.includeMetadata ? this.generateMetadata() : '';
    const styles = this.getHTMLStyles();
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${baseFilename}</title>
    <style>${styles}</style>
    ${metadata}
</head>
<body>
    <article class="markdown-content">
        ${parsed.html}
    </article>
</body>
</html>`;

    return {
      content: options.prettify ? this.prettifyHTML(htmlContent) : htmlContent,
      filename: `${baseFilename}.html`,
      mimeType: 'text/html',
      success: true,
    };
  }

  /**
   * Convert to JSON format
   */
  private convertToJSON(
    parsed: ParsedMarkdown,
    baseFilename: string,
    options: ConversionOptions
  ): ConversionResult {
    const jsonData = {
      metadata: {
        filename: baseFilename,
        convertedAt: new Date().toISOString(),
        format: 'json',
        ...(options.includeMetadata && {
          generator: 'Markdown Converter',
          version: '1.0.0',
        }),
      },
      content: {
        structure: this.parser.toJSON(parsed.tokens),
        html: parsed.html,
        plainText: parsed.plainText,
      },
    };

    const jsonString = options.prettify 
      ? JSON.stringify(jsonData, null, 2)
      : JSON.stringify(jsonData);

    return {
      content: jsonString,
      filename: `${baseFilename}.json`,
      mimeType: 'application/json',
      success: true,
    };
  }

  /**
   * Convert to plain text format
   */
  private convertToPlainText(
    parsed: ParsedMarkdown,
    baseFilename: string,
    options: ConversionOptions
  ): ConversionResult {
    let textContent = parsed.plainText;

    if (options.includeMetadata) {
      const metadata = [
        `File: ${baseFilename}`,
        `Converted: ${new Date().toLocaleString()}`,
        `Format: Plain Text`,
        '='.repeat(50),
        '',
      ].join('\n');
      
      textContent = metadata + textContent;
    }

    return {
      content: textContent,
      filename: `${baseFilename}.txt`,
      mimeType: 'text/plain',
      success: true,
    };
  }

  /**
   * Get base filename from original filename or generate default
   */
  private getBaseFilename(originalFilename?: string): string {
    if (!originalFilename) {
      return `converted_${Date.now()}`;
    }

    // Remove extension and sanitize
    const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
    return sanitizeFilename(nameWithoutExt) || `converted_${Date.now()}`;
  }

  /**
   * Generate HTML metadata
   */
  private generateMetadata(): string {
    return `
    <meta name="generator" content="Markdown Converter">
    <meta name="converted-at" content="${new Date().toISOString()}">
    <meta name="format" content="html">`;
  }

  /**
   * Get CSS styles for HTML output
   */
  private getHTMLStyles(): string {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background-color: #fff;
      }
      
      .markdown-content {
        font-size: 16px;
      }
      
      h1, h2, h3, h4, h5, h6 {
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 600;
        line-height: 1.25;
      }
      
      h1 { font-size: 2rem; border-bottom: 2px solid #eaecef; padding-bottom: 0.3rem; }
      h2 { font-size: 1.5rem; border-bottom: 1px solid #eaecef; padding-bottom: 0.3rem; }
      h3 { font-size: 1.25rem; }
      h4 { font-size: 1rem; }
      h5 { font-size: 0.875rem; }
      h6 { font-size: 0.85rem; color: #6a737d; }
      
      p { margin-bottom: 1rem; }
      
      a {
        color: #0366d6;
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      blockquote {
        padding: 0 1rem;
        color: #6a737d;
        border-left: 4px solid #dfe2e5;
        margin: 1rem 0;
      }
      
      code {
        padding: 0.2rem 0.4rem;
        margin: 0;
        font-size: 85%;
        background-color: rgba(27,31,35,0.05);
        border-radius: 3px;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      }
      
      pre {
        padding: 1rem;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 6px;
        margin: 1rem 0;
      }
      
      pre code {
        background: transparent;
        padding: 0;
        margin: 0;
        font-size: 100%;
      }
      
      ul, ol {
        padding-left: 2rem;
        margin: 1rem 0;
      }
      
      li {
        margin: 0.25rem 0;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0;
      }
      
      th, td {
        border: 1px solid #dfe2e5;
        padding: 6px 13px;
        text-align: left;
      }
      
      th {
        background-color: #f6f8fa;
        font-weight: 600;
      }
      
      img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
      }
      
      hr {
        border: none;
        border-top: 2px solid #eaecef;
        margin: 2rem 0;
      }
    `;
  }

  /**
   * Basic HTML prettification
   */
  private prettifyHTML(html: string): string {
    return html
      .replace(/></g, '>\n<')
      .replace(/^\s+|\s+$/gm, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }
}

/**
 * Utility function to detect markdown content type
 */
export function detectMarkdownFeatures(content: string): {
  hasHeaders: boolean;
  hasLists: boolean;
  hasCodeBlocks: boolean;
  hasLinks: boolean;
  hasImages: boolean;
  hasTable: boolean;
} {
  return {
    hasHeaders: /^#{1,6}\s/.test(content),
    hasLists: /^[\s]*[-*+]\s|^[\s]*\d+\.\s/m.test(content),
    hasCodeBlocks: /```[\s\S]*?```/.test(content),
    hasLinks: /\[.*?\]\(.*?\)/.test(content),
    hasImages: /!\[.*?\]\(.*?\)/.test(content),
    hasTable: /\|.*\|/.test(content),
  };
}
