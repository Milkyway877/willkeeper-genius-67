
import React, { useState, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { useLocation } from 'react-router-dom';

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { notifyInfo } = useNotificationManager();
  const location = useLocation();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setIsLoading(true);
      setResponse('');
      
      // Get current auth session
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || '';
      const userId = session?.user?.id;
      
      // Add current route context to the query
      const contextualMessage = `${message} [Current page: ${location.pathname}]`;
      
      // Call the AI assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: contextualMessage,
          conversation_history: []
        }
      });
      
      if (error) {
        console.error('Error invoking AI assistant:', error);
        
        // Fallback response with comprehensive WillTank knowledge
        const fallbackResponse = generateComprehensiveFallbackResponse(message, location.pathname);
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
        notifyInfo('Skyler', 'You received a new response from Skyler.', 'low');
      } catch (notifyError) {
        console.warn('Could not create notification:', notifyError);
      }
    } catch (err) {
      console.error('Error with AI processing:', err);
      
      // Fallback response with comprehensive knowledge
      const fallbackResponse = generateComprehensiveFallbackResponse(message, location.pathname);
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

  // Comprehensive fallback response generator with full WillTank knowledge
  const generateComprehensiveFallbackResponse = (query: string, currentPath: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Route-specific responses
    if (currentPath.includes('/dashboard')) {
      if (lowerQuery.includes('tank') || lowerQuery.includes('message')) {
        return "I see you're on the dashboard! The Tank is WillTank's unique feature for creating future messages. You can create Letters (text messages), Videos (recorded or uploaded), Audio messages, or attach Documents to be delivered to your loved ones at specific dates or triggered by events. To access the Tank, you'll need to have created at least one will first. Would you like help creating your first will or learning more about Tank messages?";
      }
      return "Welcome to your WillTank dashboard! From here you can create wills, manage your Tank messages, view your trusted contacts, and monitor your account security. Your dashboard shows your activity, security status, and quick actions. What would you like to work on today?";
    }
    
    if (currentPath.includes('/will')) {
      return "I'm here to help with will creation! WillTank offers several will templates: Traditional Wills, Digital Asset Wills (for cryptocurrency and online accounts), Living Trusts, Family-focused wills, Business succession wills, and Charitable giving wills. Our AI guides you through each step with simple questions. Which type of will are you interested in creating?";
    }
    
    if (currentPath.includes('/tank')) {
      return "You're in the Tank section! This is where you create future messages for your loved ones. You can create 4 types of messages: Letters (text-based), Videos (record or upload), Audio messages (voice recordings), and Documents (file attachments). Messages can be scheduled for specific dates or triggered by events. Your subscription determines how many messages you can create: Starter (2 messages), Gold (10 messages), Platinum (unlimited). What type of message would you like to create?";
    }
    
    if (currentPath.includes('/pricing')) {
      return "Looking at our pricing? WillTank offers three tiers: Starter ($14.99/month) with basic features and 2 Tank messages, Gold ($29/month) with advanced features and 10 Tank messages, and Platinum ($55/month) with premium features and unlimited Tank messages. All plans include will creation, encryption, and document storage. The main differences are in the number of Tank messages and advanced features like AI document analysis and family sharing.";
    }
    
    // Content-based responses with comprehensive knowledge
    if (lowerQuery.includes('tank') && lowerQuery.includes('message')) {
      return "Tank messages are WillTank's signature feature - they're future messages you create now to be delivered later. You can create Letters (text messages), Videos (recorded or uploaded videos), Audio messages (voice recordings), or Documents (file attachments). Messages can be scheduled for specific dates (birthdays, anniversaries) or triggered by events (your passing, verified through our death verification system). Each message can have multiple recipients and custom delivery settings.";
    }
    
    if (lowerQuery.includes('subscription') || lowerQuery.includes('plan') || lowerQuery.includes('upgrade')) {
      return "WillTank has three subscription tiers: Starter ($14.99/month) includes basic will templates, 2 Tank messages, standard encryption, and 5GB storage. Gold ($29/month) adds advanced templates, 10 Tank messages, enhanced encryption, AI document analysis, and 20GB storage. Platinum ($55/month) provides premium templates, unlimited Tank messages, military-grade encryption, advanced AI tools, family sharing for up to 5 users, and 100GB storage. You can upgrade anytime and we offer a 14-day money-back guarantee.";
    }
    
    if (lowerQuery.includes('will') && (lowerQuery.includes('create') || lowerQuery.includes('make'))) {
      return "Creating a will with WillTank is simple! We offer 6 specialized templates: Traditional Will (general estate planning), Digital Asset Will (cryptocurrency, online accounts, NFTs), Living Trust (lifetime asset management), Family Will (child guardianship, family provisions), Business Will (business succession planning), and Charitable Will (philanthropic giving). Our AI assistant Skyler guides you through each template with personalized questions. The process typically takes 10-15 minutes. Would you like to start with a specific template?";
    }
    
    if (lowerQuery.includes('digital') && (lowerQuery.includes('asset') || lowerQuery.includes('crypto'))) {
      return "WillTank specializes in digital asset planning! Our Digital Asset Will template helps you manage cryptocurrency wallets, NFT collections, social media accounts, email accounts, online banking, cloud storage, and digital memorabilia. You can specify access instructions, recovery phrases, password manager details, and designate digital executors with specific technical knowledge. We use bank-grade encryption to protect your sensitive digital asset information.";
    }
    
    if (lowerQuery.includes('security') || lowerQuery.includes('encryption')) {
      return "Security is paramount at WillTank. We use military-grade AES-256 encryption for all documents and data. Your Tank messages are encrypted at rest and in transit. We implement zero-knowledge architecture, meaning we can't access your encrypted content. Additional security features include two-factor authentication, trusted contact verification, death verification protocols, and secure key management. Your security score on the dashboard shows how well you've implemented these protections.";
    }
    
    if (lowerQuery.includes('death') && lowerQuery.includes('verification')) {
      return "Our death verification system ensures Tank messages are delivered appropriately. We use multiple verification methods: trusted contacts you designate can report and verify your passing, official death certificates can be submitted, and we monitor public death records. Once verified through our multi-step process, your Tank messages are delivered according to your specified timeline and recipients. This system prevents false triggers while ensuring your messages reach loved ones when intended.";
    }
    
    if (lowerQuery.includes('executor') || lowerQuery.includes('trustee')) {
      return "Executors are crucial for your estate plan. In WillTank, you can designate different types of executors: General Executors (handle overall estate), Digital Executors (specifically manage digital assets and online accounts), and Tank Executors (manage delivery of your Tank messages). You can provide detailed instructions, contact information, and access credentials. For digital assets, consider choosing someone tech-savvy who understands cryptocurrency and online account management.";
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('support')) {
      return "I'm Skyler, your dedicated WillTank AI assistant! I can help with will creation, Tank message setup, subscription questions, security settings, digital asset planning, and general estate planning guidance. For specific technical issues, you can contact our support team through the help section. I'm available 24/7 and learn from each conversation to provide better assistance. What specific area would you like help with?";
    }
    
    if (lowerQuery.includes('family') || lowerQuery.includes('children')) {
      return "Family planning is essential in estate planning. WillTank's Family Will template helps you designate guardians for minor children, set up education funds, create family trusts, and leave specific instructions for child care. You can also create special Tank messages for your children to receive at milestone ages (18th birthday, graduation, wedding). Our family sharing feature (Platinum plan) allows up to 5 family members to collaborate on estate planning.";
    }
    
    if (lowerQuery.includes('business') || lowerQuery.includes('company')) {
      return "Business succession planning is critical for business owners. WillTank's Business Will template addresses business ownership transfer, key employee provisions, business valuation instructions, partnership agreements, and succession timelines. You can create Tank messages with business instructions for successors, client transition plans, and important business relationships. This ensures business continuity and protects both your family and business interests.";
    }
    
    if (lowerQuery.includes('how') && lowerQuery.includes('work')) {
      return "WillTank works in three main phases: 1) Will Creation - Choose from 6 specialized templates and complete guided interviews with our AI. 2) Tank Messages - Create future messages (letters, videos, audio, documents) with custom delivery settings. 3) Secure Management - Your documents are encrypted and stored securely, with death verification systems ensuring proper delivery. Throughout the process, our AI provides personalized guidance, and your dashboard tracks progress and security status.";
    }
    
    // Default comprehensive response
    return "I'm Skyler, your WillTank AI assistant! I can help you with:\n\n• Will Creation (6 specialized templates)\n• Tank Messages (letters, videos, audio, documents)\n• Digital Asset Planning (crypto, NFTs, online accounts)\n• Subscription Management (Starter, Gold, Platinum)\n• Security Settings & Encryption\n• Family & Business Planning\n• Death Verification Systems\n\nWillTank combines traditional estate planning with modern digital asset management and future message delivery. What specific aspect would you like to explore?";
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
              <h3 className="font-medium">Skyler - WillTank AI</h3>
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
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{response}</p>
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Hi! I'm Skyler, your WillTank AI assistant. I can help with wills, Tank messages, digital assets, subscriptions, and more. What can I help you with today?
              </p>
            </div>
            
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Ask about wills, Tank messages, or anything..."
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
