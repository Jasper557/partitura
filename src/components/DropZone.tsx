import React, { useCallback, useState, useEffect } from 'react'
import { Upload, FileCheck, X, Music, File } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * Props for the DropZone component
 */
interface DropZoneProps {
  /** Callback function when a file is selected or cleared */
  onFileSelect: (file: File | null) => void;
  /** Currently selected file, if any */
  selectedFile?: File | null;
  /** Whether the dropzone is disabled */
  disabled?: boolean;
}

/**
 * DropZone component for handling PDF file uploads
 * Supports drag and drop as well as file selection
 */
const DropZone: React.FC<DropZoneProps> = ({ 
  onFileSelect, 
  selectedFile, 
  disabled = false 
}) => {
  const { isDarkMode } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show animation when file is selected
  useEffect(() => {
    if (selectedFile) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedFile]);

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, [disabled]);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileSelect(pdfFile);
    }
  }, [onFileSelect, disabled]);

  /**
   * Handle file selection through input
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  /**
   * Remove selected file
   */
  const handleRemoveFile = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.stopPropagation();
    e.preventDefault();
    onFileSelect(null);
  };

  // Theme-based color classes
  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const mutedTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  
  // Dynamic classes based on state
  const dynamicBorderClass = selectedFile 
    ? 'border-green-500' 
    : isDragging 
      ? 'border-blue-500' 
      : borderClass;
  
  const dynamicBgClass = selectedFile
    ? isDarkMode ? 'bg-gray-800' : 'bg-white'
    : isDragging
      ? isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50/50'
      : bgClass;

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative
        border border-dashed rounded-lg
        transition-all duration-200
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        flex flex-col items-center justify-center
        h-28
        overflow-hidden
        ${dynamicBorderClass}
        ${dynamicBgClass}
        ${isDragging ? 'scale-[1.01]' : ''}
      `}
    >
      {/* Hidden file input */}
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        disabled={disabled}
        className={`absolute inset-0 w-full h-full opacity-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} z-10`}
      />
      
      {/* Success animation */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/5 z-20 animate-fadeIn">
          <FileCheck size={30} className="text-green-500 animate-pulse" />
        </div>
      )}

      {/* Content: either selected file or upload prompt */}
      {selectedFile ? (
        <div className="flex items-center gap-3 px-4 py-2">
          <File size={20} className="text-green-500" />
          <span className={`font-medium text-sm truncate max-w-[200px] ${textClass}`}>
            {selectedFile.name}
          </span>
        </div>
      ) : (
        <div className={`
          flex flex-col items-center justify-center gap-1 p-4
          transition-transform duration-300
          ${isDragging ? 'scale-110' : ''}
        `}>
          <Upload 
            size={20} 
            className={`
              ${isDragging ? 'text-blue-500' : mutedTextClass}
              ${disabled ? 'opacity-50' : ''}
            `} 
          />
          <span className={`text-xs ${textClass} ${disabled ? 'opacity-50' : ''}`}>
            {isDragging ? 'Drop PDF here' : disabled ? 'Upload Disabled' : 'Upload PDF'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DropZone; 