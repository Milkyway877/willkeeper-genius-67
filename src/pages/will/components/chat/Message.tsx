
import React from 'react';
import { Bot, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'file' | 'video';
  fileUrl?: string;
  fileName?: string;
}

export const Message = ({ role, content, timestamp, type, fileUrl, fileName }: MessageProps) => {
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
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
};
