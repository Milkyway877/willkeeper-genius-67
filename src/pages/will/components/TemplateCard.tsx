
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

type TemplateProps = {
  template: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    tags: string[];
    sample?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
};

export function TemplateCard({ template, isSelected, onSelect }: TemplateProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          cursor-pointer border rounded-xl p-6 transition-all duration-200
          ${isSelected 
            ? 'border-willtank-500 shadow-md bg-willtank-50' 
            : 'border-gray-200 hover:border-willtank-300 bg-white'}
        `}
        onClick={onSelect}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="h-14 w-14 rounded-full bg-willtank-100 flex items-center justify-center">
            {template.icon}
          </div>
          {isSelected && (
            <div className="bg-willtank-500 text-white h-8 w-8 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
          )}
        </div>
        
        <h3 className="font-medium text-lg mb-2">{template.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-willtank-100 text-willtank-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {template.sample && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}
        </div>
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{template.title} Preview</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 border border-gray-200 rounded-lg p-6 bg-white">
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
            
            <div className="prose max-w-none whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800 mb-6">
              {template.sample || "Sample document content would appear here."}
            </div>
            
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button variant="default" onClick={() => {
                setShowPreview(false);
                onSelect();
              }}>Use This Template</Button>
              <Button variant="outline" onClick={() => setShowPreview(false)}>Close Preview</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
