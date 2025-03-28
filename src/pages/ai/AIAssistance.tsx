
import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Sparkles, Clock, Save, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AIAssistance() {
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([
    { 
      id: 1, 
      title: "Will Structure Conversation", 
      date: "Yesterday", 
      preview: "I need help structuring my will for international assets..." 
    },
    { 
      id: 2, 
      title: "Executor Responsibilities", 
      date: "June 15, 2023", 
      preview: "What are the key responsibilities of my will executor?" 
    },
    { 
      id: 3, 
      title: "Living Will Creation", 
      date: "May 28, 2023", 
      preview: "Can you help me draft a living will?" 
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your WillTank AI assistant powered by GPT-4o Mini. How can I help you with your estate planning today?",
      timestamp: new Date(Date.now() - 500000)
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    const userMessage = { 
      role: 'user' as const, 
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (input.toLowerCase().includes('international assets')) {
        response = "For international assets, you'll need to consider: 1) Laws of each country where assets are located, 2) Potential double taxation issues, 3) Different inheritance laws. I recommend creating a separate section in your will for international assets and consulting with a lawyer familiar with international estate planning. Would you like me to help draft this section?";
      } else if (input.toLowerCase().includes('digital executor')) {
        response = "To assign a digital executor: 1) Explicitly name them in your will, 2) Grant them legal authority to access your digital accounts, 3) Provide detailed instructions for each digital asset. A digital executor manages your online accounts, cryptocurrency, and digital files after death. Would you like me to draft sample language for your will?";
      } else if (input.toLowerCase().includes('living will')) {
        response = "A living will (advance healthcare directive) outlines your medical treatment preferences if you're unable to communicate. Key components include: 1) Medical treatments you approve/refuse, 2) Pain management preferences, 3) Feeding/hydration instructions, 4) Naming a healthcare proxy. Shall we start creating a basic living will document?";
      } else {
        response = "I'd be happy to help with that. Could you provide more details about your specific estate planning needs? I can help with drafting will sections, explaining legal requirements, or providing information about different types of wills and trusts.";
      }
      
      const aiMessage = { 
        role: 'assistant' as const, 
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-150px)]">
        <div className="flex h-full">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block w-72 bg-white border-r border-gray-200 mr-6 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <Button className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            </div>
            
            <div className="p-2">
              <h3 className="text-xs font-medium text-gray-500 px-2 py-2">Recent Conversations</h3>
              
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-1"
                >
                  <h4 className="text-sm font-medium mb-1">{conversation.title}</h4>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 truncate w-36">{conversation.preview}</p>
                    <span className="text-xs text-gray-400">{conversation.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Chat Area */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                <h2 className="font-semibold">AI Assistant (GPT-4o Mini)</h2>
              </div>
              <div className="ml-auto flex items-center">
                <Button variant="ghost" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save Conversation
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-4 flex ${
                      message.role === 'user' 
                        ? 'bg-willtank-500 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <div className={`mr-3 mt-1 ${message.role === 'user' ? 'order-first' : 'order-last'}`}>
                      {message.role === 'user' ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-willtank-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex mb-4 justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 text-gray-800 rounded-tl-none flex">
                    <div className="mr-3 mt-1 order-last">
                      <Bot size={16} className="text-willtank-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <textarea 
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about will creation, legal requirements, etc..."
                  className="flex-1 py-2 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-willtank-500/50 focus:border-willtank-500 resize-none"
                />
                <Button 
                  size="icon"
                  onClick={handleSendMessage} 
                  disabled={isLoading || input.trim() === ''}
                  className="shrink-0"
                >
                  <Send size={16} />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <Sparkles size={10} className="mr-1 text-yellow-400" />
                AI powered by GPT-4o Mini • Your conversations are end-to-end encrypted
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
