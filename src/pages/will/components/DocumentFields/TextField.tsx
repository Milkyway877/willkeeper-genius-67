
import React, { useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';

interface TextFieldProps {
  value: string;
  label: string;
  onEdit: (value: string) => void;
  onAiHelp?: () => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}

export function TextField({
  value,
  label,
  onEdit,
  onAiHelp,
  placeholder = '',
  multiline = false,
  required = false
}: TextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleClick = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!isEditing) {
    const displayValue = value || `[${label.replace(/([A-Z])/g, ' $1').trim()}]`;
    const isEmpty = !value || value.trim() === '';
    
    return (
      <span 
        className={`group cursor-pointer ${isEmpty ? 'border-b-2 border-dashed border-amber-300 text-amber-700 bg-amber-50 px-1' : ''}`}
        onClick={handleClick}
      >
        {displayValue}
        {onAiHelp && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Get AI help with this field</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
    );
  }

  return (
    <div className="my-2">
      {multiline ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px]"
        />
      ) : (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 border rounded"
        />
      )}
      
      <div className="flex gap-2 mt-2 justify-end">
        <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
