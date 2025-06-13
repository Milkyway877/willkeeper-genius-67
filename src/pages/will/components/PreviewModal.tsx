
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WillPreview } from './WillPreview';
import { X, FileText, Printer } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  signature?: string | null;
  title?: string;
}

export function PreviewModal({ 
  isOpen, 
  onClose, 
  content, 
  signature = null, 
  title = "Will Preview" 
}: PreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="formatted" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formatted">Formatted View</TabsTrigger>
              <TabsTrigger value="legal">Legal Document</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formatted" className="h-full mt-4">
              <div className="h-[60vh] overflow-y-auto border border-gray-200 rounded-lg p-6 bg-white">
                <WillPreview 
                  content={content} 
                  signature={signature}
                  formatted={true}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="legal" className="h-full mt-4">
              <div className="h-[60vh] overflow-y-auto border border-gray-200 rounded-lg p-6 bg-white">
                <WillPreview 
                  content={content} 
                  signature={signature}
                  formatted={true}
                  useProfessionalFormat={true}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {signature ? "✓ Document is signed and ready" : "⚠ Signature required before finalization"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
