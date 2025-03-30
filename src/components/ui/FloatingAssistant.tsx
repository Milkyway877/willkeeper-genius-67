
import React, { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotificationManager } from '@/hooks/use-notification-manager';

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { notifyInfo } = useNotificationManager();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setIsLoading(true);
      setResponse('');
      
      // Call the AI assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: message,
          conversation_history: []
        }
      });
      
      if (error) {
        console.error('Error invoking AI assistant:', error);
        
        // Fallback response if there's an error
        const fallbackResponse = generateFallbackResponse(message);
        setResponse(fallbackResponse);
        
        toast({
          title: 'Connection Issue',
          description: 'Using offline response mode. Some features may be limited.',
          variant: 'default'
        });
        return;
      }
      
      setResponse(data?.response || 'I could not process your request. Please try again.');
      
      // Try to create a notification for this interaction, but don't block if it fails
      try {
        notifyInfo('AI Assistant', 'You received a new response from the AI assistant.', 'low');
      } catch (notifyError) {
        console.warn('Could not create notification:', notifyError);
      }
    } catch (err) {
      console.error('Error with AI processing:', err);
      
      // Fallback response
      const fallbackResponse = generateFallbackResponse(message);
      setResponse(fallbackResponse);
      
      toast({
        title: 'Offline Mode',
        description: 'Using AI assistant in offline mode.',
        variant: 'default'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a fallback response when the edge function fails
  const generateFallbackResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('will') && 
        (lowerQuery.includes('create') || lowerQuery.includes('make'))) {
      return "Creating a will with WillTank is simple. Our platform guides you through selecting a template, answering questions, and finalizing your document. Would you like me to help you get started?";
    } 
    
    if (lowerQuery.includes('executor') || lowerQuery.includes('trustee')) {
      return "An executor is responsible for administering your estate after your passing. WillTank makes it easy to designate executors and provide them with necessary instructions. Would you like to know more about choosing the right executor?";
    }
    
    if (lowerQuery.includes('digital') && lowerQuery.includes('assets')) {
      return "WillTank specializes in digital asset planning. Our platform helps you inventory digital assets (cryptocurrency, online accounts), assign specific executors, and create secure access instructions. Would you like help setting this up?";
    }
    
    return "I'm your WillTank AI assistant. I can help with estate planning, will creation, digital assets management, and more. What specific aspect of legacy planning can I assist you with today?";
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-30">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4 max-w-sm w-full border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">AI Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            
            {response && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4 text-sm">
                <p className="text-gray-700 dark:text-gray-200">{response}</p>
              </div>
            )}
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              How can I help you today with your will or documents?
            </p>
            
            <div className="flex">
              <input
                type="text"
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                className={`bg-black text-white dark:bg-white dark:text-black px-3 py-2 rounded-r-md text-sm font-medium flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white dark:border-black border-t-transparent rounded-full mr-1"></span>
                ) : (
                  <Send size={14} className="mr-1" />
                )}
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white dark:bg-white dark:text-black p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
      >
        <Bot size={24} />
      </button>
    </div>
  );
}
