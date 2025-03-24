import React, { useCallback, useState } from 'react'
import { Upload, FileCheck, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface DropZoneProps {
  onFileSelect: (file: File) => void
  selectedFile?: File | null
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, selectedFile }) => {
  const { isDarkMode } = useTheme()
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      onFileSelect(pdfFile)
    }
  }, [onFileSelect])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      onFileSelect(files[0])
    }
  }

  const getDropZoneStyle = () => {
    if (selectedFile) {
      return isDarkMode
        ? 'border-green-500 bg-green-900/10'
        : 'border-green-500 bg-green-50'
    }
    if (isDragging) {
      return isDarkMode
        ? 'border-blue-500 bg-blue-900/10'
        : 'border-blue-500 bg-blue-50'
    }
    return isDarkMode
      ? 'border-gray-700 hover:border-gray-600'
      : 'border-gray-300 hover:border-gray-400'
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative
        border-2 border-dashed rounded-xl
        transition-all duration-200
        cursor-pointer
        p-8
        flex flex-col items-center justify-center
        ${getDropZoneStyle()}
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
      `}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {selectedFile ? (
        <>
          <FileCheck 
            size={40} 
            className={`mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} 
          />
          <p className={`text-center ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            {selectedFile.name}
          </p>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Click or drag another file to replace
          </p>
        </>
      ) : (
        <>
          <Upload 
            size={40} 
            className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
          />
          <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Drag and drop your PDF here, or click to select
          </p>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Only PDF files are accepted
          </p>
        </>
      )}
    </div>
  )
}

export default DropZone 