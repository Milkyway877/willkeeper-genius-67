
import React from 'react';
import { Bot, User, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'file' | 'video' | 'video-start';
  fileUrl?: string;
  fileName?: string;
  onStopRecording?: () => void;
}

export const Message = ({ role, content, timestamp, type, fileUrl, fileName, onStopRecording }: MessageProps) => {
  return (
    <div
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          role === 'user'
            ? 'bg-black text-white ml-4 rounded-tr-none'
            : role === 'assistant'
            ? 'bg-gray-100 text-gray-800 mr-4 rounded-tl-none'
            : role === 'system' && type === 'video-start'
            ? 'bg-rose-50 text-rose-800 mx-auto border border-rose-200'
            : role === 'system'
            ? 'bg-willtank-50 text-willtank-800 mx-auto border border-willtank-200'
            : 'bg-rose-100 text-red-800 mx-auto'
        }`}
      >
        <div className="flex items-center mb-1">
          {role === 'assistant' ? (
            <div className="flex items-center">
              <Bot className="h-4 w-4 mr-2 text-willtank-600" />
              <span className="text-xs font-semibold">SKYLER</span>
            </div>
          ) : role === 'user' ? (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span className="text-xs font-semibold">You</span>
            </div>
          ) : null}
          
          <div className="ml-auto text-xs text-gray-500">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div>
          {type === 'file' ? (
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              <span>{fileName}</span>
            </div>
          ) : type === 'video' ? (
            <div>
              <video 
                src={fileUrl} 
                controls 
                className="w-full h-auto rounded mt-2 mb-2" 
                style={{ maxHeight: '200px' }}
              />
            </div>
          ) : type === 'video-start' ? (
            <div className="space-y-3">
              <div className="whitespace-pre-wrap">{content}</div>
              <div className="flex justify-center mt-2">
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="flex items-center"
                  onClick={onStopRecording}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
};
