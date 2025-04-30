
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send } from "lucide-react";

export interface InputAreaProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  placeholder: string;
  onVoiceToggle?: () => void;
  isRecording?: boolean;
}

export function InputArea({
  inputValue,
  onInputChange,
  onSubmit,
  isSubmitting,
  placeholder,
  onVoiceToggle,
  isRecording,
}: InputAreaProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Input
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isSubmitting}
          className={`pr-10 ${isRecording ? 'bg-willtank-50' : ''}`}
        />
        {onVoiceToggle && (
          <Button
            size="sm"
            variant="ghost"
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
              isRecording ? 'text-willtank-600' : 'text-gray-400'
            }`}
            onClick={onVoiceToggle}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      <Button 
        onClick={onSubmit} 
        disabled={inputValue.trim() === '' || isSubmitting}
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
