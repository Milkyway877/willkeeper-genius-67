
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pen, MessageCircleQuestion, Sparkle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface TextFieldProps {
  value: string;
  label: string;
  onEdit: () => void;
  onAiHelp: () => void;
}

export function TextField({ value, label, onEdit, onAiHelp }: TextFieldProps) {
  const isPlaceholder = value.includes('[') && value.includes(']');
  const [glowing, setGlowing] = useState(false);
  const fieldRef = useRef<HTMLSpanElement>(null);
  
  // Add subtle glow effect for fields that need attention
  useEffect(() => {
    if (isPlaceholder) {
      const interval = setInterval(() => {
        setGlowing(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaceholder]);

  const handleAIHelp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAiHelp();
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.span 
            ref={fieldRef}
            className={`cursor-pointer relative group flex items-center ${
              isPlaceholder ? 
              'bg-amber-50 text-amber-800 px-2 py-0.5 border border-amber-200 rounded-md shadow-sm' : 
              'border-b border-dashed border-gray-300 hover:border-willtank-400 px-1'
            } ${glowing && isPlaceholder ? 'ring-2 ring-amber-300 ring-opacity-50' : ''}`}
            onClick={onEdit}
            animate={glowing && isPlaceholder ? { boxShadow: ['0 0 0 rgba(251, 191, 36, 0)', '0 0 5px rgba(251, 191, 36, 0.5)', '0 0 0 rgba(251, 191, 36, 0)'] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {value}
            <span className="inline-flex items-center">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-5 w-5 p-0 ml-1 opacity-0 group-hover:opacity-100 inline-flex"
                onClick={onEdit}
              >
                <Pen className="h-3 w-3" />
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                className={`h-6 w-6 p-0 ml-0.5 ${isPlaceholder ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} inline-flex`}
                onClick={handleAIHelp}
              >
                <Sparkle className="h-4 w-4 text-amber-500" />
              </Button>
            </span>
            
            {isPlaceholder && (
              <Badge 
                variant="outline" 
                className="ml-2 bg-amber-100 text-amber-800 text-[10px] cursor-pointer hover:bg-amber-200"
                onClick={handleAIHelp}
              >
                <MessageCircleQuestion className="h-2 w-2 mr-1" /> 
                AI Help
              </Badge>
            )}
          </motion.span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{isPlaceholder ? `Click to edit ${label.replace(/([A-Z])/g, ' $1').trim()} or get AI help` : `Edit ${label.replace(/([A-Z])/g, ' $1').trim()}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
