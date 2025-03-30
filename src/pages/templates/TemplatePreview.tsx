
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, CheckCircle, ArrowRight, Download } from 'lucide-react';
import { WillPreview } from '@/pages/will/components/WillPreview';
import { motion } from 'framer-motion';

interface TemplatePreviewProps {
  title: string;
  description: string;
  features: string[];
  sampleContent: string;
  onSelect: () => void;
  popularTemplate?: boolean;
}

export function TemplatePreview({ 
  title, 
  description, 
  features, 
  sampleContent,
  onSelect,
  popularTemplate = false
}: TemplatePreviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectInDialog = () => {
    setIsDialogOpen(false);
    onSelect();
  };
  
  const handleDownloadTemplate = () => {
    // Create a blob with the sample content
    const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-template.txt`;
    
    // Append to the document, click, and clean up
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Release the blob URL
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md ${popularTemplate ? 'border-willtank-500' : ''}`}>
      {popularTemplate && (
        <div className="absolute top-0 right-0">
          <div className="bg-willtank-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
            Popular Choice
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-4 w-4 text-willtank-500 mr-2 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full transition-colors hover:bg-willtank-50">
              <Eye className="h-4 w-4 mr-2" />
              Preview Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{title} Template Preview</DialogTitle>
              <DialogDescription>
                This is a preview of how your final document might look using this template
              </DialogDescription>
            </DialogHeader>
            
            <div className="h-[65vh] overflow-y-auto py-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WillPreview 
                  content={sampleContent} 
                  onDownload={handleDownloadTemplate}
                />
              </motion.div>
            </div>
            
            <DialogFooter className="flex justify-between flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={handleDownloadTemplate}
                className="sm:mr-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              
              <Button onClick={handleSelectInDialog}>
                Use This Template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full bg-willtank-600 hover:bg-willtank-700 transition-colors"
          onClick={onSelect}
        >
          Select Template
        </Button>
      </CardFooter>
    </Card>
  );
}
