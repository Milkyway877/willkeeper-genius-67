
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploaderProps {
  onDocumentsUploaded: (fileNames: string[]) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
}

export function DocumentUploader({ 
  onDocumentsUploaded,
  acceptedFileTypes = ".pdf,.jpg,.jpeg,.png",
  maxFileSizeMB = 25
}: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  // Open file input dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process uploaded files
  const handleFiles = (files: FileList) => {
    const validFiles: {name: string, size: number}[] = [];
    const rejectedFiles: string[] = [];
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    
    Array.from(files).forEach(file => {
      // Check file type
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = acceptedFileTypes.includes(fileExt);
      
      // Check file size
      const isValidSize = file.size <= maxSizeBytes;
      
      if (isValidType && isValidSize) {
        validFiles.push({
          name: file.name,
          size: file.size
        });
      } else {
        rejectedFiles.push(file.name);
      }
    });
    
    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newFiles);
      
      // Extract just the file names for the parent component
      const fileNames = validFiles.map(file => file.name);
      onDocumentsUploaded(fileNames);
      
      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) have been added.`,
      });
    }
    
    if (rejectedFiles.length > 0) {
      toast({
        title: "Some files were rejected",
        description: `${rejectedFiles.length} file(s) were rejected due to invalid type or size.`,
        variant: "destructive"
      });
    }
  };
  
  // Remove a file from the list
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    
    toast({
      title: "File removed",
      description: "The file has been removed from your uploads.",
    });
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="space-y-4">
      <div 
        className={`border-2 ${dragActive ? 'border-willtank-500 bg-willtank-50' : 'border-dashed border-gray-300'} rounded-lg p-8 text-center transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-sm text-gray-600">
          Drag and drop files here, or click to browse
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Supported formats: {acceptedFileTypes.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} (Max: {maxFileSizeMB}MB per file)
        </p>
        <Button className="mt-4" onClick={openFileDialog}>
          Browse Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-700">Uploaded Documents</h4>
          
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center overflow-hidden">
                  <FileText className="h-5 w-5 text-willtank-600 mr-2 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => removeFile(index)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
