
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { File, FileText, Image as ImageIcon, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentPreviewProps {
  open: boolean;
  onClose: () => void;
  documentUrl: string;
  fileName: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  open,
  onClose,
  documentUrl,
  fileName
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'other'>('other');
  
  useEffect(() => {
    // Reset states when URL changes
    setLoading(true);
    setError(null);
    
    // Determine file type
    if (documentUrl) {
      const lowerCaseUrl = documentUrl.toLowerCase();
      if (lowerCaseUrl.endsWith('.pdf')) {
        setFileType('pdf');
      } else if (
        lowerCaseUrl.endsWith('.jpg') || 
        lowerCaseUrl.endsWith('.jpeg') || 
        lowerCaseUrl.endsWith('.png') || 
        lowerCaseUrl.endsWith('.gif') || 
        lowerCaseUrl.endsWith('.webp')
      ) {
        setFileType('image');
      } else {
        setFileType('other');
      }
      setLoading(false);
    }
  }, [documentUrl]);
  
  const handleLoadError = () => {
    setError(`Failed to load the document. The file might be unavailable or the URL is incorrect.`);
    setLoading(false);
  };
  
  const handleLoadSuccess = () => {
    setLoading(false);
  };

  const handleDownload = () => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };
  
  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <FileText className="h-16 w-16 text-willtank-400 mb-4" />
            <p className="text-willtank-600">Loading document...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    switch (fileType) {
      case 'pdf':
        return (
          <iframe
            src={documentUrl}
            className="w-full h-[600px] border-none"
            title={fileName}
            onLoad={handleLoadSuccess}
            onError={handleLoadError}
          />
        );
      case 'image':
        return (
          <div className="flex justify-center py-4">
            <img 
              src={documentUrl} 
              alt={fileName}
              className="max-w-full max-h-[600px] object-contain"
              onLoad={handleLoadSuccess}
              onError={handleLoadError}
            />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center py-8">
            <File className="h-16 w-16 text-willtank-600 mb-4" />
            <p className="mb-4">This document type cannot be previewed directly.</p>
            <Button
              onClick={handleDownload}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Open Document
            </Button>
          </div>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {fileType === 'pdf' && <FileText className="h-5 w-5 text-amber-500" />}
            {fileType === 'image' && <ImageIcon className="h-5 w-5 text-blue-500" />}
            {fileType === 'other' && <File className="h-5 w-5 text-gray-500" />}
            <DialogTitle>Document Preview: {fileName}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderPreview()}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleDownload} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
