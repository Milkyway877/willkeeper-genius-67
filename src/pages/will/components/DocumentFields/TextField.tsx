
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pen, MessageCircleQuestion } from 'lucide-react';

interface TextFieldProps {
  value: string;
  label: string;
  onEdit: () => void;
  onAiHelp: () => void;
}

export function TextField({ value, label, onEdit, onAiHelp }: TextFieldProps) {
  const isPlaceholder = value.includes('[') && value.includes(']');
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={`cursor-pointer relative group ${isPlaceholder ? 'bg-amber-50 text-amber-800 px-1 border border-amber-200 rounded' : 'border-b border-dashed border-gray-300 hover:border-willtank-400 px-1'}`}
            onClick={onEdit}
          >
            {value}
            <span className="inline-block ml-1 opacity-50 group-hover:opacity-100">
              <Pen className="h-3 w-3 inline" />
            </span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 inline-flex ml-1"
              onClick={(e) => {
                e.stopPropagation();
                onAiHelp();
              }}
            >
              <MessageCircleQuestion className="h-3 w-3 text-willtank-600" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{`Edit ${label} or get AI assistance`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
