
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { FileUp, FileText, AlertCircle, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { createVaultItem } from '@/services/tankService';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onUploadComplete?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    if (acceptedFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    const file = acceptedFiles[0];

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 300);

    try {
      // Simulate actual upload and legacy vault addition
      const success = await uploadToLegacyVault(file, file.name);

      clearInterval(interval);
      setUploadProgress(100);

      if (success) {
        setUploadSuccess(true);
        toast({
          title: "Upload successful",
          description: `${file.name} has been successfully uploaded and added to your legacy vault.`,
        });
        onUploadComplete?.();
      } else {
        setUploadError('Failed to add file to legacy vault.');
        toast({
          title: "Upload failed",
          description: "There was an error adding the file to your legacy vault. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      clearInterval(interval);
      setUploadError('File upload failed. Please try again.');
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  // Ensure we use createVaultItem with the proper type fields
  const uploadToLegacyVault = async (file: File, title: string): Promise<boolean> => {
    try {
      // Simulate file upload to get a document URL
      const documentUrl = `https://example.com/documents/${file.name}`;
      
      const vaultItem = await createVaultItem({
        title: title || file.name,
        category: 'document', // Use category instead of type
        preview: `Document: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        document_url: documentUrl,
        is_encrypted: false
      });
      
      return !!vaultItem;
    } catch (error) {
      console.error('Error adding to legacy vault:', error);
      return false;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
            isDragActive ? 'border-willtank-500 bg-willtank-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <FileUp className="mx-auto mb-4 h-6 w-6 text-gray-500" />
          <p className="text-sm text-gray-500">
            {isDragActive
              ? 'Drop the file here...'
              : 'Click here or drag and drop to upload a file'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supported formats: txt, pdf, doc, docx
          </p>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 rounded-md bg-red-50 text-red-500 text-sm flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 p-3 rounded-md bg-green-50 text-green-500 text-sm flex items-center">
            <Check className="mr-2 h-4 w-4" />
            File uploaded successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
