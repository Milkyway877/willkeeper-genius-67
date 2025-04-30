
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';

interface InputAreaProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isProcessing: boolean;
  isRecording: boolean;
  recordingSupported: boolean;
  currentStage: string;
  onSendMessage: () => void;
  onToggleVoiceInput: () => void;
  onCompleteInfo?: () => void;
  isReadyToComplete: boolean;
}

export const InputArea = ({
  inputValue,
  setInputValue,
  isProcessing,
  isRecording,
  recordingSupported,
  currentStage,
  onSendMessage,
  onToggleVoiceInput,
  onCompleteInfo,
  isReadyToComplete,
}: InputAreaProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex flex-col p-4 border-t gap-2">
      <div className="flex items-center">
        {recordingSupported && (
          <Button
            variant="outline"
            size="icon"
            className={`mr-2 ${isRecording ? 'bg-rose-100' : ''}`}
            onClick={onToggleVoiceInput}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5 text-rose-500" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}
        
        <Input
          placeholder={isRecording ? "Listening..." : "Type your message..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isProcessing}
          className="flex-1"
        />
        
        <Button
          variant="default"
          size="icon"
          className="ml-2"
          onClick={onSendMessage}
          disabled={(!inputValue.trim() && !isRecording) || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {isReadyToComplete && onCompleteInfo && (
        <Button
          variant="default"
          className="mt-4 bg-willtank-600 hover:bg-willtank-700 w-full text-white font-medium py-3 px-4 animate-pulse shadow-lg text-lg"
          onClick={onCompleteInfo}
        >
          Generate My Will Document Now
        </Button>
      )}
    </div>
  );
};
