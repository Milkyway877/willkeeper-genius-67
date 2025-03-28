
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

type WillTemplate = {
  id: string;
  title: string;
  description: string;
  icon: string;
  recommended: boolean;
};

interface WillTemplateSelectorProps {
  templates: WillTemplate[];
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export function WillTemplateSelector({ 
  templates, 
  selectedTemplate, 
  onSelectTemplate 
}: WillTemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <motion.div
          key={template.id}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className={`bg-white p-6 rounded-xl border ${
            selectedTemplate === template.id ? 'border-willtank-600 ring-2 ring-willtank-200' : 'border-gray-200 hover:border-willtank-200'
          } shadow-sm cursor-pointer relative overflow-hidden`}
          onClick={() => onSelectTemplate(template.id)}
        >
          {template.recommended && (
            <div className="absolute top-0 right-0">
              <div className="bg-willtank-600 text-white text-xs font-bold px-3 py-1 transform rotate-0 translate-x-2 -translate-y-0">
                Recommended
              </div>
            </div>
          )}
          
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-willtank-50 flex items-center justify-center text-willtank-600 mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            </div>
            
            <div className="mt-auto">
              <Button 
                variant={selectedTemplate === template.id ? "default" : "outline"} 
                className="w-full"
                onClick={() => onSelectTemplate(template.id)}
              >
                {selectedTemplate === template.id ? "Selected" : "Select"}
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
