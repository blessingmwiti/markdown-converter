'use client';

import { useState } from 'react';
import { FileText, Github, Shield, Zap, AlertCircle, X } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import MarkdownPreview from '@/components/MarkdownPreview';
import ConversionPanel from '@/components/ConversionPanel';
import { rateLimiter } from '@/lib/security';

export default function Home() {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileRead = (content: string, originalFilename: string) => {
    // Check rate limiting
    if (!rateLimiter.canMakeRequest()) {
      setError('Too many requests. Please wait before uploading another file.');
      return;
    }

    setIsProcessing(true);
    setError('');
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      setMarkdownContent(content);
      setFilename(originalFilename);
      setIsProcessing(false);
    }, 500);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  };

  const clearContent = () => {
    setMarkdownContent('');
    setFilename('');
    setError('');
  };

  const remainingRequests = rateLimiter.getRemainingRequests();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-navy-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Markdown Converter</h1>
                <p className="text-dark-300">Secure client-side conversion to HTML, JSON, and Text</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* <div className="text-right text-sm">
                <div className="text-dark-400">Requests remaining</div>
                <div className="text-white font-semibold">{remainingRequests}/10</div>
              </div> */}
              <a 
                href="https://github.com/blessingmwiti/markdown-converter" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <Github className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Banner */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <Shield className="h-8 w-8 text-navy-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Secure Processing</h3>
            <p className="text-sm text-dark-300">All processing happens in your browser. Files never leave your device.</p>
          </div>
          <div className="card text-center">
            <Zap className="h-8 w-8 text-navy-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Fast Conversion</h3>
            <p className="text-sm text-dark-300">Instant conversion to HTML, JSON, and plain text formats.</p>
          </div>
          <div className="card text-center">
            <FileText className="h-8 w-8 text-navy-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Multiple Formats</h3>
            <p className="text-sm text-dark-300">Export to various formats with proper styling and structure.</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 card border-red-600 bg-red-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-200">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {!markdownContent ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-4">
                Upload Your Markdown File
              </h2>
              <p className="text-dark-300 mb-8 max-w-2xl mx-auto">
                Select a markdown file (.md, .markdown, or .txt) to convert it to HTML, JSON, or plain text format. 
                All processing is done securely in your browser.
              </p>
              <div className="max-w-2xl mx-auto">
                <FileUpload
                  onFileRead={handleFileRead}
                  onError={handleError}
                  disabled={isProcessing}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-8">
              {/* File Info and Clear Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Processing: {filename}</h2>
                  <p className="text-dark-300">Choose your conversion format below</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={clearContent}
                    className="btn-secondary"
                  >
                    Upload New File
                  </button>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column - Preview */}
                <div>
                  <MarkdownPreview content={markdownContent} filename={filename} />
                </div>
                
                {/* Right Column - Conversion */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Convert & Download</h3>
                  <ConversionPanel 
                    markdownContent={markdownContent} 
                    originalFilename={filename}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700 bg-dark-900/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <p className="text-dark-400 text-sm">
              Built with Next.js, deployed on Vercel. All processing happens client-side for maximum security.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <span className="text-dark-400">Supported formats:</span>
              <span className="text-navy-400">HTML</span>
              <span className="text-blue-400">JSON</span>
              <span className="text-green-400">Plain Text</span>
            </div>
            <p className="text-xs text-dark-500">
              © {new Date().getFullYear()} Markdown Converter. Privacy-focused, secure file conversion. By Blessing Mwiti
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
