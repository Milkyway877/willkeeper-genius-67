
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Mic, MicOff, Send, Loader2, Video } from 'lucide-react';

interface InputAreaProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isProcessing: boolean;
  isRecording: boolean;
  recordingSupported: boolean;
  currentStage: string;
  onSendMessage: () => void;
  onToggleVoiceInput: () => void;
  onFileButtonClick: () => void;
  onVideoButtonClick?: () => void;
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
  onFileButtonClick,
  onVideoButtonClick,
}: InputAreaProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex items-center p-4 border-t">
      <Button
        variant="outline"
        size="icon"
        className="mr-2"
        onClick={onFileButtonClick}
        disabled={isProcessing}
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      
      {onVideoButtonClick && (
        <Button
          variant="outline"
          size="icon"
          className="mr-2"
          onClick={onVideoButtonClick}
        >
          <Video className="h-5 w-5 text-willtank-600" />
        </Button>
      )}
      
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
  );
};
