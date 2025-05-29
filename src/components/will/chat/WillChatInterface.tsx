
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User } from 'lucide-react';

export function WillChatInterface() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm here to help you create your will. What would you like to start with?"
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: message
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: "I understand. Let me help you with that. Can you provide more details?"
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Will Creation Assistant</h1>
        <p className="text-gray-600">Chat with our AI assistant to create your will step by step.</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            Chat with Will Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {msg.type === 'user' ? (
                      <User className="h-4 w-4 mr-1" />
                    ) : (
                      <Bot className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-xs font-medium">
                      {msg.type === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
