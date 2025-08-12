'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { validateFile, FileValidationResult } from '@/lib/security';
import { FileHandler } from '@/lib/file-handler';

interface FileUploadProps {
  onFileRead: (content: string, filename: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileRead, onError, disabled }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileAPISupported, setIsFileAPISupported] = useState(true); // Default to true to avoid flash
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check File API support on client side only
  useEffect(() => {
    setIsFileAPISupported(FileHandler.isFileAPISupported());
  }, []);

  const handleFileSelection = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Validate file
      const validation: FileValidationResult = validateFile(file);
      if (!validation.isValid) {
        onError(validation.error || 'File validation failed');
        return;
      }

      // Additional file type validation
      if (!FileHandler.validateFileType(file)) {
        onError('Please select a markdown (.md), text (.txt), or markdown (.markdown) file');
        return;
      }

      // Read file content
      const content = await FileHandler.readFile(file);
      
      // Validate content
      if (content.trim().length === 0) {
        onError('File appears to be empty');
        return;
      }

      setUploadedFile(file);
      onFileRead(content, file.name);
      
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to read file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      onError('Please select only one file at a time');
      return;
    }
    
    if (files.length === 1) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 1) {
      handleFileSelection(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled && !isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-navy-400 bg-navy-950/50' 
            : 'border-dark-600 hover:border-dark-500'
          }
          ${disabled || isProcessing 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-dark-800/50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || isProcessing}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-500"></div>
          ) : (
            <Upload 
              className={`h-12 w-12 ${isDragOver ? 'text-navy-400' : 'text-dark-400'}`} 
            />
          )}
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-white">
              {isProcessing 
                ? 'Processing file...' 
                : isDragOver 
                  ? 'Drop your file here' 
                  : 'Drop your markdown file here'
              }
            </p>
            
            {!isProcessing && (
              <p className="text-sm text-dark-300">
                or <span className="text-navy-400 font-medium">click to browse</span>
              </p>
            )}
          </div>
          
          <div className="text-xs text-dark-400 space-y-1">
            <p>Supports: .md, .markdown, .txt files</p>
            <p>Maximum size: 10MB</p>
          </div>
        </div>
      </div>

      {uploadedFile && (
        <div className="card">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-navy-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-dark-400">
                {FileHandler.formatFileSize(uploadedFile.size)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-400">Ready</span>
            </div>
          </div>
        </div>
      )}

      {!isFileAPISupported && (
        <div className="card border-yellow-600 bg-yellow-900/20">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-yellow-200">
              Your browser doesn't fully support file uploads. Please use a modern browser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
