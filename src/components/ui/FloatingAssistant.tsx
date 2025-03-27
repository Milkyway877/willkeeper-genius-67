
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your WillTank AI assistant powered by GPT-4o Mini. How can I help you with your estate planning today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Simulate AI response (in a real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample AI responses based on the message content
      let aiResponse = "I'm analyzing your query. Could you provide more details about your estate planning needs?";
      
      const lowerCaseInput = inputValue.toLowerCase();
      
      if (lowerCaseInput.includes('will structure') || lowerCaseInput.includes('how do i structure')) {
        aiResponse = "For structuring your will, especially with international assets, I recommend listing assets by country and following each country's legal requirements. Consider separate executors for each jurisdiction. Would you like me to help draft specific sections for your international assets?";
      } else if (lowerCaseInput.includes('digital executor') || lowerCaseInput.includes('digital assets')) {
        aiResponse = "To assign a digital executor, you should create a dedicated section in your will specifically for digital assets. List all accounts, provide access instructions, and clearly state your wishes for each. Your digital executor should be tech-savvy and trustworthy. Would you like a template for this section?";
      } else if (lowerCaseInput.includes('living will') || lowerCaseInput.includes('draft')) {
        aiResponse = "I can help draft a living will. This document should cover your healthcare preferences if you're unable to communicate. Key elements include medical treatments you consent to or refuse, end-of-life care preferences, and organ donation wishes. Shall we start with a basic template?";
      } else if (lowerCaseInput.includes('beneficiaries') || lowerCaseInput.includes('add beneficiary')) {
        aiResponse = "To add beneficiaries to your will, you'll need their full legal names, relationship to you, contact information, and what specific assets they'll receive. Would you like to add them to your document now?";
      } else if (lowerCaseInput.includes('encrypt') || lowerCaseInput.includes('security')) {
        aiResponse = "WillTank uses end-to-end encryption to secure your documents. Your encryption keys are stored securely and can be managed in the Encryption Keys section. Would you like more information about our security measures?";
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={cn(
              "flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 md:w-96",
              "overflow-hidden backdrop-blur-sm border border-gray-200 dark:border-gray-700",
              isMinimized ? "h-14" : "h-96"
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-willtank-500 text-white dark:bg-willtank-700">
              <div className="flex items-center gap-2">
                <span className="animate-pulse relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <h3 className="font-medium text-sm">AI Assistant (GPT-4o Mini)</h3>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  {isMinimized ? <PlusCircle size={16} /> : <MinusCircle size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {!isMinimized && (
              <>
                <div className="flex-1 p-3 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={cn(
                        "mb-3 p-3 rounded-lg max-w-[85%]",
                        message.role === 'user' 
                          ? "bg-willtank-100 dark:bg-willtank-900 text-gray-800 dark:text-gray-100 ml-auto" 
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200 mb-3 max-w-[85%]">
                      <Loader2 size={16} className="animate-spin" />
                      <p>Thinking...</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form 
                  onSubmit={handleSubmit}
                  className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about will creation, legal terms..."
                      className="flex-1 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-willtank-500/50 focus:border-willtank-500 transition-all dark:text-white"
                      disabled={isLoading}
                    />
                    <button 
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className={cn(
                        "p-2 rounded-lg text-white transition-all",
                        isLoading || !inputValue.trim() 
                          ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed" 
                          : "bg-willtank-500 dark:bg-willtank-600 hover:bg-willtank-600 dark:hover:bg-willtank-700"
                      )}
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-3 rounded-full text-white shadow-lg transition-all",
          "bg-gradient-to-br from-willtank-500 to-willtank-600 hover:from-willtank-600 hover:to-willtank-700"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <MessageCircle size={24} />
      </motion.button>
    </div>
  );
}
