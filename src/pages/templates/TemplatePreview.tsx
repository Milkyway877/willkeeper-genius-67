
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, CheckCircle, ArrowRight } from 'lucide-react';
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
  return (
    <Card className={`h-full flex flex-col relative overflow-hidden ${popularTemplate ? 'border-willtank-500' : ''}`}>
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
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
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
                <WillPreview content={sampleContent} />
              </motion.div>
            </div>
            
            <DialogFooter>
              <Button onClick={onSelect} className="w-full md:w-auto">
                Use This Template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button className="w-full" onClick={onSelect}>
          Select Template
        </Button>
      </CardFooter>
    </Card>
  );
}
