
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

type TemplateProps = {
  template: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    tags: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
};

export function TemplateCard({ template, isSelected, onSelect }: TemplateProps) {
  return (
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
    </motion.div>
  );
}
