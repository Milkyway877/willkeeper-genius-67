
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { MessageRole } from '../types';

interface MessageProps {
  role: MessageRole;
  content: string;
  timestamp: Date;
  type?: 'text';
}

export const Message = ({ role, content, timestamp }: MessageProps) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[85%]`}>
        <div className="flex-shrink-0 mr-2">
          <Avatar className={isUser ? 'ml-2' : 'mr-2'}>
            {!isUser ? (
              <>
                <AvatarFallback className="bg-willtank-100 text-willtank-800">SKY</AvatarFallback>
                <AvatarImage src="/images/skyler-avatar.png" />
              </>
            ) : (
              <AvatarFallback className="bg-gray-100">
                <User className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? 'bg-willtank-600 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">
            {role === 'system' ? (
              <div className="flex items-center">
                <div className="bg-amber-100 p-1 rounded-full mr-2">
                  <Bot className="h-4 w-4 text-amber-600" />
                </div>
                <span>{content}</span>
              </div>
            ) : (
              content
            )}
          </div>
          
          <div className="mt-1 text-xs opacity-70">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
