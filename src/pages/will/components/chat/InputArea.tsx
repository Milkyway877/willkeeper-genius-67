
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, SendIcon } from 'lucide-react';

interface InputAreaProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  placeholder: string;
  onVoiceToggle?: () => void;
  isRecording?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  inputValue,
  onInputChange,
  onSubmit,
  isSubmitting,
  placeholder,
  onVoiceToggle,
  isRecording = false,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {onVoiceToggle && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={isRecording ? "bg-red-100 text-red-600" : ""}
          onClick={onVoiceToggle}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
        </Button>
      )}
      
      <div className="relative flex-grow">
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder={placeholder}
          onKeyDown={handleKeyPress}
          className="rounded-lg border border-gray-300 w-full py-2 px-4 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-willtank-500 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>
      
      <Button 
        type="button" 
        onClick={onSubmit} 
        disabled={isSubmitting || !inputValue.trim()}
        size="icon"
        className="bg-willtank-600 hover:bg-willtank-700"
      >
        <SendIcon className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
};
