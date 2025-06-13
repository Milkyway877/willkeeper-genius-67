
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageCircleQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContactFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  tooltipText?: string;
  className?: string;
  onAiHelp?: (position: { x: number, y: number }) => void;
}

export function ContactField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  tooltipText,
  className,
  onAiHelp
}: ContactFieldProps) {
  const isEmpty = !value || value.trim() === '';
  
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-gray-800">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {onAiHelp && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-5 w-5 p-0"
                  onClick={(e) => onAiHelp({ x: e.clientX, y: e.clientY })}
                >
                  <MessageCircleQuestion className="h-3 w-3 text-willtank-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{tooltipText || `Get help with ${label.toLowerCase()}`}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isEmpty 
              ? `[${placeholder || `Enter ${label.toLowerCase()}`}]`
              : placeholder || `Enter ${label.toLowerCase()}`
          }
          className={`
            transition-all min-h-[42px] text-sm
            ${isEmpty 
              ? 'border-2 border-amber-300 bg-amber-50 focus:border-willtank-600 focus:bg-white placeholder:text-amber-700 placeholder:font-medium' 
              : 'border-2 border-gray-300 bg-white focus:border-willtank-600 hover:border-gray-400'
            }
            focus:ring-2 focus:ring-willtank-100
          `}
        />
        {isEmpty && (
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400 rounded-md bg-amber-50/20" />
        )}
      </div>
    </div>
  );
}
