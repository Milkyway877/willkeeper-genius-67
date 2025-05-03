
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pen, MessageCircleQuestion } from 'lucide-react';
import { AIAssistantPopup } from '../AIAssistantPopup';

interface TextFieldProps {
  value: string;
  label: string;
  onEdit: () => void;
  onAiHelp: () => void;
}

export function TextField({ value, label, onEdit, onAiHelp }: TextFieldProps) {
  const isPlaceholder = value.includes('[') && value.includes(']');
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const fieldRef = useRef<HTMLSpanElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Store scroll position before showing AI popup
  useEffect(() => {
    if (showAIPopup) {
      setScrollPosition(window.scrollY);
    }
  }, [showAIPopup]);
  
  // Restore scroll position after user interaction
  useEffect(() => {
    if (!showAIPopup && scrollPosition > 0) {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'instant'
      });
    }
  }, [showAIPopup, scrollPosition]);

  const handleAIHelp = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Calculate position for the popup near the field
    if (fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      setPopupPosition({ 
        x: rect.right + 10, 
        y: rect.top 
      });
    }
    
    setShowAIPopup(true);
    onAiHelp();
  };
  
  const handleAcceptSuggestion = (suggestion: string) => {
    // Extract actual content from the suggestion
    let extractedContent = suggestion;
    
    // Simple pattern matching to extract example content
    const exampleMatch = suggestion.match(/For example: (.*)/);
    if (exampleMatch && exampleMatch[1]) {
      extractedContent = exampleMatch[1];
    }
    
    // Dispatch a custom event with the suggestion
    const event = new CustomEvent('ai-suggestion-accepted', { 
      detail: { 
        field: label.toLowerCase().replace(/\s+/g, ''),
        value: extractedContent
      }
    });
    document.dispatchEvent(event);
    
    setShowAIPopup(false);
  };
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span 
              ref={fieldRef}
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
                onClick={handleAIHelp}
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
      
      <AIAssistantPopup 
        field={label.toLowerCase().replace(/\s+/g, '')}
        isVisible={showAIPopup}
        onAccept={handleAcceptSuggestion}
        onDismiss={() => setShowAIPopup(false)}
        position={popupPosition}
      />
    </>
  );
}
