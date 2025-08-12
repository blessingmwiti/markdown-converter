import { marked } from 'marked';
import DOMPurify from 'dompurify';

export interface ParsedMarkdown {
  html: string;
  tokens: marked.Token[];
  plainText: string;
}

export interface MarkdownParserOptions {
  sanitize?: boolean;
  allowHtml?: boolean;
  breaks?: boolean;
  gfm?: boolean;
}

const DEFAULT_OPTIONS: Required<MarkdownParserOptions> = {
  sanitize: true,
  allowHtml: false,
  breaks: true,
  gfm: true,
};

/**
 * Secure markdown parser with sanitization
 */
export class MarkdownParser {
  private options: Required<MarkdownParserOptions>;

  constructor(options: MarkdownParserOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.configureMarked();
  }

  private configureMarked(): void {
    // Configure marked with security settings
    marked.setOptions({
      breaks: this.options.breaks,
      gfm: this.options.gfm,
      sanitize: false, // We'll handle sanitization with DOMPurify
    });

    // Custom renderer to control output
    const renderer = new marked.Renderer();

    // Override link renderer for security
    renderer.link = (href: string, title: string | null, text: string): string => {
      // Sanitize href to prevent XSS
      const sanitizedHref = this.sanitizeUrl(href);
      const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
      return `<a href="${sanitizedHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // Override image renderer for security
    renderer.image = (href: string, title: string | null, text: string): string => {
      const sanitizedHref = this.sanitizeUrl(href);
      const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
      const altAttr = ` alt="${this.escapeHtml(text)}"`;
      return `<img src="${sanitizedHref}"${altAttr}${titleAttr} loading="lazy">`;
    };

    // Disable HTML rendering if not allowed
    if (!this.options.allowHtml) {
      renderer.html = (): string => '';
    }

    marked.use({ renderer });
  }

  /**
   * Parse markdown content and return structured data
   */
  public parse(markdown: string): ParsedMarkdown {
    // Get tokens for JSON conversion
    const tokens = marked.lexer(markdown);
    
    // Parse to HTML
    let html = marked.parser(tokens);

    // Sanitize HTML if requested
    if (this.options.sanitize && typeof window !== 'undefined') {
      html = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 's',
          'ul', 'ol', 'li', 'blockquote',
          'code', 'pre', 'a', 'img',
          'table', 'thead', 'tbody', 'tr', 'td', 'th'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
        FORBID_SCRIPTS: true,
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'style'],
      });
    }

    // Convert to plain text
    const plainText = this.toPlainText(tokens);

    return {
      html,
      tokens,
      plainText,
    };
  }

  /**
   * Convert markdown tokens to structured JSON
   */
  public toJSON(tokens: marked.Token[]): object {
    return {
      type: 'document',
      children: tokens.map(token => this.tokenToJSON(token)),
    };
  }

  /**
   * Convert markdown to plain text with basic formatting
   */
  private toPlainText(tokens: marked.Token[]): string {
    return tokens.map(token => this.tokenToPlainText(token)).join('\n\n');
  }

  private tokenToJSON(token: marked.Token): object {
    const base = { type: token.type };

    switch (token.type) {
      case 'heading':
        return {
          ...base,
          level: token.depth,
          text: token.text,
        };
      case 'paragraph':
        return {
          ...base,
          text: token.text,
        };
      case 'list':
        return {
          ...base,
          ordered: token.ordered,
          items: token.items.map(item => ({
            type: 'list_item',
            text: item.text,
          })),
        };
      case 'code':
        return {
          ...base,
          language: token.lang || 'text',
          code: token.text,
        };
      case 'blockquote':
        return {
          ...base,
          text: token.text,
        };
      default:
        return {
          ...base,
          raw: token.raw,
        };
    }
  }

  private tokenToPlainText(token: marked.Token): string {
    switch (token.type) {
      case 'heading':
        const prefix = '#'.repeat(token.depth);
        return `${prefix} ${token.text}`;
      case 'paragraph':
        return token.text;
      case 'list':
        return token.items
          .map((item, index) => {
            const bullet = token.ordered ? `${index + 1}.` : '•';
            return `${bullet} ${item.text}`;
          })
          .join('\n');
      case 'code':
        return `\`\`\`${token.lang || ''}\n${token.text}\n\`\`\``;
      case 'blockquote':
        return `> ${token.text}`;
      case 'hr':
        return '---';
      default:
        return token.raw || '';
    }
  }

  private sanitizeUrl(url: string): string {
    // Allow only safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:'];
    try {
      const parsed = new URL(url);
      if (safeProtocols.includes(parsed.protocol)) {
        return url;
      }
    } catch {
      // Invalid URL
    }
    return '#';
  }

  private escapeHtml(text: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, char => escapeMap[char]);
  }
}
