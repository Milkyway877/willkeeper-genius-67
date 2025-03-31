
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  FileIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

type FileUploaderProps = {
  onFilesUploaded: (files: File[]) => void;
};

type UploadedFile = {
  file: File;
  id: string;
  uploading: boolean;
  progress: number;
  error?: string;
  completed?: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploader({ onFilesUploaded }: FileUploaderProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getFileIcon = (file: File) => {
    const type = file.type;
    
    if (type.includes('image')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (type.includes('pdf')) {
      return <FileIcon className="h-5 w-5 text-red-500" />;
    } else if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    } else if (type.includes('document') || type.includes('word')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported';
    }
    
    return null;
  };
  
  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    const validFiles: File[] = [];
    
    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      const id = Math.random().toString(36).substring(2, 10);
      
      if (error) {
        toast({
          title: "File Error",
          description: `${file.name}: ${error}`,
          variant: "destructive"
        });
        
        newFiles.push({
          file,
          id,
          uploading: false,
          progress: 0,
          error
        });
      } else {
        newFiles.push({
          file,
          id,
          uploading: true,
          progress: 0
        });
        validFiles.push(file);
      }
    });
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      
      // Simulate file upload for each valid file
      newFiles.forEach(fileObj => {
        if (!fileObj.error) {
          simulateUpload(fileObj.id);
        }
      });
      
      if (validFiles.length > 0) {
        // Will be called when all uploads complete
        setTimeout(() => {
          onFilesUploaded(validFiles);
        }, 3000);
      }
    }
  };
  
  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Mark as completed
        setFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, uploading: false, progress: 100, completed: true } 
              : f
          )
        );
      } else {
        // Update progress
        setFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, progress } 
              : f
          )
        );
      }
    }, 300);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast({
      title: "File Removed",
      description: "The file has been removed from the upload list."
    });
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <Upload className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Document Upload</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div 
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${dragActive 
              ? 'border-willtank-400 bg-willtank-50' 
              : 'border-gray-300 hover:border-willtank-400 bg-gray-50 hover:bg-gray-100'}
          `}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
          
          <div className="mb-4">
            <div className="h-16 w-16 mx-auto bg-willtank-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-willtank-600" />
            </div>
          </div>
          
          <h4 className="text-lg font-medium mb-2">Drag and drop files here</h4>
          <p className="text-gray-500 text-sm mb-4">
            Upload supporting documents for your will (PDF, Word, Excel, images)
          </p>
          
          <Button onClick={openFileDialog}>
            Select Files
          </Button>
        </div>
        
        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Uploaded Documents</h4>
            <div className="space-y-3">
              {files.map((fileObj) => (
                <motion.div
                  key={fileObj.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    border rounded-lg p-3 flex items-center
                    ${fileObj.error ? 'border-red-200 bg-red-50' : fileObj.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}
                  `}
                >
                  <div className="p-2 rounded-md border border-gray-200 bg-white mr-3">
                    {getFileIcon(fileObj.file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileObj.file.name}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{formatFileSize(fileObj.file.size)}</span>
                      {fileObj.error && (
                        <div className="flex items-center ml-2 text-red-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {fileObj.error}
                        </div>
                      )}
                    </div>
                    
                    {fileObj.uploading && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-willtank-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${fileObj.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{fileObj.progress}% uploaded</p>
                      </div>
                    )}
                    
                    {fileObj.completed && (
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Upload complete
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    onClick={() => removeFile(fileObj.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-willtank-50 rounded-lg p-4 border border-willtank-100">
          <h4 className="font-medium text-willtank-700 mb-2">Document Guidelines</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
              Upload clearly scanned or photographed documents
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
              Include property deeds, financial statements, or other relevant documents
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
              Maximum file size: 10MB per document
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-willtank-500 mr-2 mt-1 flex-shrink-0" />
              Supported formats: PDF, Word, Excel, JPG, PNG
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
