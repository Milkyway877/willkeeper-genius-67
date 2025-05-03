
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pen, MessageCircleQuestion, Sparkle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TextFieldProps {
  value: string;
  label: string;
  onEdit: () => void;
  onAiHelp: (position: { x: number, y: number }) => void;
}

export function TextField({ value, label, onEdit, onAiHelp }: TextFieldProps) {
  const isPlaceholder = value.includes('[') && value.includes(']');
  const [glowing, setGlowing] = useState(false);
  const fieldRef = useRef<HTMLSpanElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  
  // Add subtle glow effect for fields that need attention
  React.useEffect(() => {
    if (isPlaceholder) {
      const interval = setInterval(() => {
        setGlowing(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaceholder]);
  
  // Update editValue when value changes
  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Use useCallback to prevent recreation on every render
  const handleAIHelp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Calculate position for the AI helper popup
    const clickX = e.clientX;
    const clickY = e.clientY;
    
    // Pass position to parent component
    onAiHelp({ x: clickX, y: clickY });
  }, [onAiHelp]);
  
  // Use useCallback for the click handler too
  const handleClick = useCallback(() => {
    setIsDialogOpen(true);
  }, []);
  
  const handleSaveEdit = useCallback(() => {
    // Here we would save the edited value
    // For now, just close the dialog
    setIsDialogOpen(false);
    onEdit();
  }, [onEdit]);
  
  const formattedLabel = label.replace(/([A-Z])/g, ' $1').trim();
  const capitalizedLabel = formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1);
  
  return (
    <>
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
              onClick={handleClick}
              animate={glowing && isPlaceholder ? { boxShadow: ['0 0 0 rgba(251, 191, 36, 0)', '0 0 5px rgba(251, 191, 36, 0.5)', '0 0 0 rgba(251, 191, 36, 0)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {value}
              <span className="inline-flex items-center">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-5 w-5 p-0 ml-1 opacity-0 group-hover:opacity-100 inline-flex"
                  onClick={handleClick}
                  type="button"
                >
                  <Pen className="h-3 w-3" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`h-6 w-6 p-0 ml-0.5 ${isPlaceholder ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} inline-flex`}
                  onClick={handleAIHelp}
                  type="button"
                >
                  <Sparkle className="h-4 w-4 text-amber-500" />
                </Button>
              </span>
              
              {isPlaceholder && (
                <span className="ml-2">
                  <Badge 
                    variant="outline" 
                    className="bg-amber-100 text-amber-800 text-[10px] cursor-pointer hover:bg-amber-200 flex items-center"
                    onClick={handleAIHelp}
                  >
                    <MessageCircleQuestion className="h-2 w-2 mr-1" /> 
                    AI Help
                  </Badge>
                </span>
              )}
            </motion.span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{isPlaceholder ? `Click to edit ${formattedLabel} or get AI help` : `Edit ${formattedLabel}`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {capitalizedLabel}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-field">{capitalizedLabel}</Label>
                <Textarea 
                  id="edit-field"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter ${formattedLabel}...`}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
