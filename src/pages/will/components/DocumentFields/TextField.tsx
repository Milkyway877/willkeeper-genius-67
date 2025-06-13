
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageCircleQuestion, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  tooltipText?: string;
  onAiHelp?: (field: string, position?: { x: number, y: number }) => void;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
  type = 'text',
  tooltipText,
  onAiHelp,
  className
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (required && !newValue.trim()) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  };

  const handleAiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAiHelp) {
      onAiHelp(label.toLowerCase().replace(/\s+/g, '_'), { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={label.replace(/\s+/g, '-').toLowerCase()}
          className={cn(
            "text-sm font-medium transition-colors",
            focused ? "text-willtank-700" : "text-gray-700",
            required && "after:content-['*'] after:text-red-500 after:ml-1"
          )}
        >
          {label}
        </Label>
        
        <div className="flex items-center gap-1">
          {tooltipText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onAiHelp && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-willtank-100"
                    onClick={handleAiClick}
                  >
                    <MessageCircleQuestion className="h-4 w-4 text-willtank-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Get AI help with this field</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {multiline ? (
        <Textarea
          id={label.replace(/\s+/g, '-').toLowerCase()}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            "min-h-[120px] transition-all duration-200",
            focused && "ring-2 ring-willtank-500 border-willtank-500",
            hasError && "border-red-500 ring-red-500",
            "text-sm leading-relaxed"
          )}
        />
      ) : (
        <Input
          id={label.replace(/\s+/g, '-').toLowerCase()}
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            "h-10 transition-all duration-200",
            focused && "ring-2 ring-willtank-500 border-willtank-500",
            hasError && "border-red-500 ring-red-500"
          )}
        />
      )}

      {hasError && required && !value.trim() && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          This field is required
        </p>
      )}
    </div>
  );
}
