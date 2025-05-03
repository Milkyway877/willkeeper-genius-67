
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { File } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <File className="h-5 w-5 text-amber-500" />
            <DialogTitle>Document Preview: {fileName}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            {documentUrl.endsWith('.pdf') ? (
              <iframe
                src={documentUrl}
                className="w-full h-[600px] border-none"
                title={fileName}
              />
            ) : (
              <div className="flex flex-col items-center py-8">
                <File className="h-16 w-16 text-willtank-600 mb-4" />
                <p className="mb-4">This document type cannot be previewed directly.</p>
                <Button
                  onClick={() => window.open(documentUrl, '_blank')}
                  variant="outline"
                >
                  Open Document
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
