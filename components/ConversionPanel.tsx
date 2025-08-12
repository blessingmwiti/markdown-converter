'use client';

import { useState, useEffect } from 'react';
import { Download, Copy, FileText, Code, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { FileConverter, ConversionFormat, ConversionResult } from '@/lib/converters';
import { FileHandler } from '@/lib/file-handler';
import { detectMaliciousContent } from '@/lib/security';

interface ConversionPanelProps {
  markdownContent: string;
  originalFilename: string;
}

type ConversionState = {
  [K in ConversionFormat]: {
    result: ConversionResult | null;
    isConverting: boolean;
    error: string | null;
  };
}

const formatConfig = {
  html: {
    icon: Code,
    label: 'HTML',
    description: 'Styled web page',
    color: 'text-orange-400',
  },
  json: {
    icon: Database,
    label: 'JSON',
    description: 'Structured data',
    color: 'text-blue-400',
  },
  txt: {
    icon: FileText,
    label: 'Plain Text',
    description: 'Clean text format',
    color: 'text-green-400',
  },
};

export default function ConversionPanel({ markdownContent, originalFilename }: ConversionPanelProps) {
  const [conversionState, setConversionState] = useState<ConversionState>({
    html: { result: null, isConverting: false, error: null },
    json: { result: null, isConverting: false, error: null },
    txt: { result: null, isConverting: false, error: null },
  });
  
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});
  const [isDownloadSupported, setIsDownloadSupported] = useState(true); // Default to true to avoid flash
  const converter = new FileConverter();

  // Check download support on client side only
  useEffect(() => {
    setIsDownloadSupported(FileHandler.isDownloadSupported());
  }, []);

  const handleConvert = async (format: ConversionFormat) => {
    // Security check
    if (detectMaliciousContent(markdownContent)) {
      setConversionState(prev => ({
        ...prev,
        [format]: {
          ...prev[format],
          error: 'Content contains potentially malicious elements',
        },
      }));
      return;
    }

    setConversionState(prev => ({
      ...prev,
      [format]: {
        ...prev[format],
        isConverting: true,
        error: null,
      },
    }));

    try {
      const result = converter.convert(markdownContent, format, {
        originalFilename,
        prettify: true,
        includeMetadata: true,
      });

      setConversionState(prev => ({
        ...prev,
        [format]: {
          result,
          isConverting: false,
          error: result.success ? null : result.error || 'Conversion failed',
        },
      }));
    } catch (error) {
      setConversionState(prev => ({
        ...prev,
        [format]: {
          ...prev[format],
          isConverting: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    }
  };

  const handleDownload = (format: ConversionFormat) => {
    const state = conversionState[format];
    if (state.result && state.result.success) {
      try {
        FileHandler.downloadFile(state.result);
      } catch (error) {
        setConversionState(prev => ({
          ...prev,
          [format]: {
            ...prev[format],
            error: error instanceof Error ? error.message : 'Download failed',
          },
        }));
      }
    }
  };

  const handleCopy = async (format: ConversionFormat) => {
    const state = conversionState[format];
    if (state.result && state.result.success) {
      try {
        await FileHandler.copyToClipboard(state.result.content);
        setCopyStatus(prev => ({ ...prev, [format]: true }));
        setTimeout(() => {
          setCopyStatus(prev => ({ ...prev, [format]: false }));
        }, 2000);
      } catch (error) {
        setConversionState(prev => ({
          ...prev,
          [format]: {
            ...prev[format],
            error: error instanceof Error ? error.message : 'Copy failed',
          },
        }));
      }
    }
  };

  const handleConvertAll = () => {
    Object.keys(formatConfig).forEach(format => {
      handleConvert(format as ConversionFormat);
    });
  };

  const downloadAll = () => {
    const validResults = Object.values(conversionState)
      .map(state => state.result)
      .filter((result): result is ConversionResult => result !== null && result.success);

    if (validResults.length > 0) {
      FileHandler.downloadMultipleFiles(validResults);
    }
  };

  const hasAnyResults = Object.values(conversionState).some(state => state.result?.success);
  const allConverted = Object.values(conversionState).every(state => state.result !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleConvertAll}
          className="btn-primary flex-1"
          disabled={Object.values(conversionState).some(state => state.isConverting)}
        >
          Convert All Formats
        </button>
        
        {hasAnyResults && (
          <button
            onClick={downloadAll}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download All</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(formatConfig).map(([format, config]) => {
          const state = conversionState[format as ConversionFormat];
          const Icon = config.icon;
          
          return (
            <div key={format} className="card">
              <div className="flex items-center space-x-3 mb-4">
                <Icon className={`h-6 w-6 ${config.color}`} />
                <div>
                  <h3 className="font-semibold text-white">{config.label}</h3>
                  <p className="text-sm text-dark-400">{config.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleConvert(format as ConversionFormat)}
                  disabled={state.isConverting}
                  className="w-full btn-primary"
                >
                  {state.isConverting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Converting...</span>
                    </div>
                  ) : (
                    `Convert to ${config.label}`
                  )}
                </button>

                {state.error && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{state.error}</span>
                  </div>
                )}

                {state.result && state.result.success && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Converted successfully</span>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleDownload(format as ConversionFormat)}
                        className="w-full btn-secondary text-sm py-3 px-4"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </button>
                      
                      <button
                        onClick={() => handleCopy(format as ConversionFormat)}
                        className="w-full btn-secondary text-sm py-3 px-4"
                      >
                        {copyStatus[format] ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-dark-400">
                      File: {state.result.filename}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isDownloadSupported && (
        <div className="card border-yellow-600 bg-yellow-900/20">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-yellow-200">
              Your browser doesn't support automatic downloads. You can still copy the content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
