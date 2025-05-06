import React, { useState, useEffect } from 'react';
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
  // Get notification manager, but handle potential undefined values
  const notificationManager = useNotificationManager();
  const notifyInfo = notificationManager?.notifyInfo;

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setIsLoading(true);
      setResponse('');
      
      // Get current auth session
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || '';
      const userId = session?.user?.id;
      
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
      
      const aiResponse = data?.response || 'I could not process your request. Please try again.';
      setResponse(aiResponse);
      
      // Save the conversation data to extract entities if user is authenticated
      if (userId) {
        try {
          const conversationData = [
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: aiResponse, timestamp: new Date() }
          ];
          
          // Call the save-will-conversation function to extract and store entities
          const saveResponse = await fetch('https://ksiinmxsycosnpchutuw.supabase.co/functions/v1/save-will-conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              conversation_data: conversationData,
              user_id: userId
            }),
          });
          
          if (saveResponse.ok) {
            const saveData = await saveResponse.json();
            console.log("Saved floating assistant conversation:", saveData);
          } else {
            console.error("Error saving conversation:", await saveResponse.text());
          }
        } catch (saveError) {
          console.error("Error calling save-will-conversation function:", saveError);
        }
      }
      
      // Try to create a notification for this interaction, but don't block if it fails
      try {
        if (notifyInfo) {
          notifyInfo('Skyler', 'You received a new response from Skyler.', 'low');
        }
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
    
    return "I'm Skyler, your WillTank AI assistant. I can help with estate planning, will creation, digital assets management, and more. What specific aspect of legacy planning can I assist you with today?";
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 max-w-sm w-full border border-gray-200 dark:border-gray-700 flex flex-col"
            style={{ height: '400px' }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Skyler</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              {response && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4 text-sm">
                  <p className="text-gray-700 dark:text-gray-200">{response}</p>
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                How can I help you today with your will or documents?
              </p>
            </div>
            
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
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
