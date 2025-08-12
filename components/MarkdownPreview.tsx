'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Code2, Type } from 'lucide-react';
import { MarkdownParser } from '@/lib/markdown-parser';
import { detectMarkdownFeatures } from '@/lib/converters';

interface MarkdownPreviewProps {
  content: string;
  filename: string;
}

export default function MarkdownPreview({ content, filename }: MarkdownPreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [parsedContent, setParsedContent] = useState<string>('');
  const [features, setFeatures] = useState<ReturnType<typeof detectMarkdownFeatures> | null>(null);

  useEffect(() => {
    if (content) {
      const parser = new MarkdownParser();
      const parsed = parser.parse(content);
      setParsedContent(parsed.html);
      setFeatures(detectMarkdownFeatures(content));
    }
  }, [content]);

  const contentLines = content.split('\n').length;
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Preview</h3>
          <p className="text-sm text-dark-400">{filename}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('preview')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'preview' 
                ? 'bg-navy-600 text-white' 
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'raw' 
                ? 'bg-navy-600 text-white' 
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <Code2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="card py-3">
          <div className="text-dark-400">Lines</div>
          <div className="text-white font-semibold">{contentLines.toLocaleString()}</div>
        </div>
        <div className="card py-3">
          <div className="text-dark-400">Words</div>
          <div className="text-white font-semibold">{wordCount.toLocaleString()}</div>
        </div>
        <div className="card py-3">
          <div className="text-dark-400">Characters</div>
          <div className="text-white font-semibold">{charCount.toLocaleString()}</div>
        </div>
        <div className="card py-3">
          <div className="text-dark-400">Size</div>
          <div className="text-white font-semibold">
            {(new Blob([content]).size / 1024).toFixed(1)} KB
          </div>
        </div>
      </div>

      {features && (
        <div className="card">
          <h4 className="text-sm font-medium text-white mb-3">Detected Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {Object.entries({
              'Headers': features.hasHeaders,
              'Lists': features.hasLists,
              'Code Blocks': features.hasCodeBlocks,
              'Links': features.hasLinks,
              'Images': features.hasImages,
              'Tables': features.hasTable,
            }).map(([feature, hasFeature]) => (
              <div key={feature} className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${hasFeature ? 'bg-green-500' : 'bg-dark-600'}`} />
                <span className={hasFeature ? 'text-white' : 'text-dark-400'}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center space-x-2 mb-3">
          {viewMode === 'preview' ? (
            <>
              <Eye className="h-4 w-4 text-navy-400" />
              <span className="text-sm font-medium text-white">Rendered Preview</span>
            </>
          ) : (
            <>
              <Type className="h-4 w-4 text-navy-400" />
              <span className="text-sm font-medium text-white">Raw Markdown</span>
            </>
          )}
        </div>
        
        <div className="bg-dark-950 rounded-lg p-4 max-h-96 overflow-auto border border-dark-700">
          {viewMode === 'preview' ? (
            <div 
              className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-dark-200 prose-strong:text-white prose-code:text-navy-300 prose-code:bg-dark-800 prose-pre:bg-dark-900 prose-a:text-navy-400"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <pre className="text-sm text-dark-200 whitespace-pre-wrap font-mono">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
