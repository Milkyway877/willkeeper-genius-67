
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircleQuestion, Sparkle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  tooltipText?: string;
  onAiHelp?: (position: { x: number, y: number }) => void;
}

export function ContactField({ 
  label, 
  value, 
  onChange, 
  placeholder,
  type = 'text',
  tooltipText,
  onAiHelp 
}: ContactFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleAIHelp = (e: React.MouseEvent) => {
    if (onAiHelp) {
      e.stopPropagation();
      
      // Use getBoundingClientRect to get position relative to viewport
      const rect = e.currentTarget.getBoundingClientRect();
      const posX = rect.right;
      const posY = rect.top + (rect.height / 2);
      
      // Pass position to parent component
      onAiHelp({ x: posX, y: posY });
    }
  };

  return (
    <div className="relative space-y-1">
      <div className="flex justify-between items-center">
        <Label htmlFor={`contact-${label}`} className="text-xs">{label}</Label>
        
        {onAiHelp && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-5 w-5 p-0"
                  onClick={handleAIHelp}
                >
                  <Sparkle className="h-3 w-3 text-amber-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{tooltipText || `Get AI help with ${label.toLowerCase()}`}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <Input 
        id={`contact-${label}`}
        type={type}
        value={value} 
        onChange={handleChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className="h-8 text-sm"
      />
    </div>
  );
}
