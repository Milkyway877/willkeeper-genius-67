
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TemplateProps {
  template: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    sample: string;
    tags: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
}

export const TemplateCard: React.FC<TemplateProps> = ({ template, isSelected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${
        isSelected 
        ? 'border-willtank-500 ring-2 ring-willtank-200 bg-willtank-50' 
        : 'border-gray-200 hover:border-willtank-300 bg-white'
      }`}
      onClick={onSelect}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div 
            className={`h-12 w-12 rounded-full flex items-center justify-center ${
              isSelected ? 'bg-willtank-100' : 'bg-gray-100'
            }`}
          >
            {template.icon}
          </div>
          <div className="flex space-x-1">
            {template.tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-2">{template.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
        
        <div className="bg-gray-50 rounded-md p-3 mb-4 h-40 overflow-auto text-xs font-mono">
          <div className="text-xs text-gray-500 mb-1">Preview:</div>
          <pre className="whitespace-pre-wrap text-gray-700">{template.sample.substring(0, 220)}...</pre>
        </div>
        
        <Button 
          variant={isSelected ? "default" : "outline"} 
          className="w-full"
        >
          {isSelected ? 'Selected' : 'Select Template'}
        </Button>
      </div>
    </motion.div>
  );
};
