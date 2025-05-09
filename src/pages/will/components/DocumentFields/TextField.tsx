
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
        className={`group cursor-pointer inline-flex items-center relative
          ${isEmpty 
            ? 'bg-amber-100 border-b-2 border-dashed border-amber-400 text-amber-800 px-2 py-1 rounded-sm hover:bg-amber-200 transition-colors' 
            : 'hover:bg-gray-100 px-1 rounded border-b border-gray-200 hover:border-gray-400'}`}
        onClick={handleClick}
      >
        {displayValue}
        <span className="absolute -top-5 left-0 text-[10px] bg-amber-50 text-amber-700 font-medium px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-amber-200 shadow-sm whitespace-nowrap">
          Click to edit {label}
        </span>
        {isEmpty && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-amber-500 group-hover:animate-pulse">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
        )}
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
    <div className="my-2 relative">
      <label className="text-xs font-medium text-gray-700 mb-1 block">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {multiline ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="min-h-[100px] bg-white shadow-sm border-2 focus:border-willtank-500 focus:ring-2 focus:ring-willtank-100"
        />
      ) : (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="w-full p-2 border-2 rounded bg-white shadow-sm focus:border-willtank-500 focus:ring-2 focus:ring-willtank-100 font-medium"
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
