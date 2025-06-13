
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
        className={`group cursor-pointer inline-flex items-center relative font-medium
          ${isEmpty 
            ? 'bg-amber-100 border-2 border-dashed border-amber-500 text-amber-900 px-3 py-2 rounded-md hover:bg-amber-200 transition-colors shadow-sm' 
            : 'hover:bg-gray-100 px-2 py-1 rounded border-2 border-gray-200 hover:border-gray-400 bg-white shadow-sm transition-colors'}`}
        onClick={handleClick}
      >
        <span className={isEmpty ? 'font-semibold' : ''}>{displayValue}</span>
        <span className="absolute -top-6 left-0 text-[10px] bg-willtank-50 text-willtank-700 font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-willtank-200 shadow-sm whitespace-nowrap z-10">
          Click to edit {label}
        </span>
        {isEmpty && (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-amber-600 group-hover:animate-pulse">
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
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 inline-flex ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAiHelp();
                  }}
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
      </span>
    );
  }

  return (
    <div className="my-3 relative bg-white border-2 border-willtank-300 rounded-lg p-4 shadow-sm">
      <label className="text-sm font-semibold text-gray-800 mb-2 block">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {multiline ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="min-h-[120px] bg-white shadow-sm border-2 focus:border-willtank-500 focus:ring-2 focus:ring-willtank-100 resize-none"
        />
      ) : (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="w-full p-3 border-2 rounded bg-white shadow-sm focus:border-willtank-500 focus:ring-2 focus:ring-willtank-100 font-medium text-gray-800"
        />
      )}
      
      <div className="flex gap-3 mt-3 justify-end">
        <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} className="bg-willtank-600 hover:bg-willtank-700">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
