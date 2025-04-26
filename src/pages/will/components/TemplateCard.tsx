
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    tags?: string[];
    features?: string[];
  };
  isSelected?: boolean;
  onSelect: () => void;
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden relative h-full",
        isSelected ? "ring-2 ring-willtank-600 shadow-lg" : ""
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "absolute top-0 right-0 w-0 h-0 transition-all duration-300",
        isSelected ? "border-t-[3rem] border-r-[3rem] border-t-transparent border-r-willtank-600" : "border-t-0 border-r-0"
      )} />
      
      {isSelected && (
        <div className="absolute top-0 right-0 p-1 text-white z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      )}
      
      <CardContent className="p-5 flex flex-col h-full">
        <div className="mb-4 flex items-center">
          <div className="p-2 bg-willtank-50 rounded-md mr-3">
            {template.icon}
          </div>
          <h3 className="font-semibold text-lg">{template.title}</h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 flex-grow">{template.description}</p>
        
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {template.tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-1 bg-willtank-50 text-willtank-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {template.features && template.features.length > 0 && (
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Key features:</p>
            <ul className="list-disc pl-5 space-y-1">
              {template.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className={cn(
            "mt-4 w-full",
            isSelected && "bg-willtank-50"
          )}
          onClick={onSelect}
        >
          {isSelected ? "Selected" : "Select Template"}
        </Button>
      </CardContent>
    </Card>
  );
}
