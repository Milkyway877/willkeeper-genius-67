
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your WillTank AI assistant powered by GPT-4o Mini. How can I help you with your estate planning today?"
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
    
    const userMessage = { role: 'user' as const, content: input };
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
      
      const aiMessage = { role: 'assistant' as const, content: response };
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
  
  const floatingButtonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } },
    tap: { scale: 0.9 }
  };

  const chatContainerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div 
            key="chat"
            variants={chatContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col bg-white rounded-lg shadow-lg w-80 md:w-96 h-96 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 bg-willtank-500 text-white">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-300" />
                <h3 className="font-medium">AI Assistant (GPT-4o Mini)</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "mb-4 max-w-[85%] rounded-lg p-3 text-sm",
                    message.role === 'assistant' 
                      ? "bg-gray-100 text-gray-800" 
                      : "bg-willtank-500 text-white ml-auto"
                  )}
                >
                  <p>{message.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-100 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <span className="animate-pulse">•</span>
                  <span className="animate-pulse delay-75">•</span>
                  <span className="animate-pulse delay-150">•</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about will creation..."
                  className="flex-1 py-2 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-willtank-500/50 focus:border-willtank-500"
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
            </div>
          </motion.div>
        ) : (
          <motion.button 
            key="button"
            variants={floatingButtonVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            whileTap="tap"
            onClick={() => setIsOpen(true)} 
            className="p-3 rounded-full bg-willtank-500 text-white shadow-md hover:bg-willtank-600 transition-colors"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
