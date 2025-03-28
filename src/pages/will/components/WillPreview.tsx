
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Eye, Download, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type WillPreviewProps = {
  content: string;
  onDownload?: () => void;
};

export function WillPreview({ content, onDownload }: WillPreviewProps) {
  const { toast } = useToast();
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download implementation if no custom handler is provided
      try {
        // Create a blob with the will content
        const willHtml = `
          <html>
            <head>
              <title>Will Document</title>
              <style>
                body { font-family: 'Times New Roman', Times, serif; margin: 2cm; }
                h1 { text-align: center; font-size: 18pt; margin-bottom: 24pt; }
                .content { line-height: 1.5; font-size: 12pt; white-space: pre-line; }
              </style>
            </head>
            <body>
              <h1>LAST WILL AND TESTAMENT</h1>
              <div class="content">${content}</div>
            </body>
          </html>
        `;
        
        const blob = new Blob([willHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'will_document.html';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: "Your document is being downloaded"
        });
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: "Download Error",
          description: "There was a problem downloading your document.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Unable to open print window. Please check your popup settings.",
        variant: "destructive"
      });
      return;
    }
    
    const willHtml = `
      <html>
        <head>
          <title>Will Document</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; margin: 2cm; }
            h1 { text-align: center; font-size: 18pt; margin-bottom: 24pt; }
            .content { line-height: 1.5; font-size: 12pt; white-space: pre-line; }
          </style>
        </head>
        <body>
          <h1>LAST WILL AND TESTAMENT</h1>
          <div class="content">${content}</div>
        </body>
      </html>
    `;
    
    printWindow.document.write(willHtml);
    printWindow.document.close();
    
    // Give time for styles to load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    toast({
      title: "Print Initialized",
      description: "Opening print dialog"
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Will Document',
        text: 'I\'ve created a will document',
      })
      .then(() => {
        toast({
          title: "Document Shared",
          description: "Share completed successfully"
        });
      })
      .catch((error) => {
        toast({
          title: "Share Failed",
          description: error.message,
          variant: "destructive"
        });
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        navigator.clipboard.writeText(content)
          .then(() => {
            toast({
              title: "Content Copied",
              description: "Document content copied to clipboard since sharing is not supported on this device"
            });
          })
          .catch(err => {
            throw err;
          });
      } catch (error) {
        toast({
          title: "Share Options",
          description: "Sharing not supported on this device or browser"
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <Eye className="text-willtank-700 mr-2" size={18} />
          <h3 className="font-medium">Will Preview</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <motion.div 
          className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-willtank-500 rounded-md flex items-center justify-center mr-3">
                <span className="text-white font-bold">W</span>
              </div>
              <div>
                <p className="text-willtank-700 font-bold">WILLTANK</p>
                <p className="text-xs text-gray-500">Legal Document</p>
              </div>
            </div>
            <div className="border-2 border-gray-300 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">Document ID</p>
              <p className="text-sm font-mono">{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </div>
          
          <div className="prose max-w-none mb-6">
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800">
              {content}
            </pre>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Signature</p>
                <div className="h-16 w-48 border border-dashed border-gray-300 rounded flex items-center justify-center">
                  <p className="text-xs text-gray-400">Signature will appear here</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Official Stamp</p>
                <div className="h-16 w-16 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <p className="text-xs text-gray-400">Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
