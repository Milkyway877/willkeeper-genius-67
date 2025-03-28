
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";

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
    
    try {
      // Call the AI assistant edge function if available
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: input,
          conversation_history: messages
        }
      });
      
      if (error) {
        console.error('Error calling AI assistant:', error);
        fallbackResponse(input);
        return;
      }
      
      const aiMessage = { 
        role: 'assistant' as const, 
        content: data.response || "I'm sorry, I couldn't process your request. Please try again."
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Exception in handleSendMessage:', error);
      fallbackResponse(input);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback responses when the edge function is unavailable
  const fallbackResponse = (userInput: string) => {
    let response = '';
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('will') && (lowerInput.includes('create') || lowerInput.includes('make') || lowerInput.includes('write'))) {
      response = "Creating a will with WillTank is simple and comprehensive. Our platform guides you through several key steps:\n\n1. Choose a template that fits your needs (traditional, digital assets, living trust)\n2. Answer our AI-guided questions to personalize your document\n3. Review and edit the generated will\n4. Record a video testament for additional clarity\n5. Upload supporting documents\n6. Sign digitally to authenticate\n\nWould you like me to help you start the process or explain any specific aspect of will creation?";
    } 
    else if (lowerInput.includes('international assets') || lowerInput.includes('foreign')) {
      response = "For international assets in your will, WillTank offers specialized guidance on:\n\n1. Navigating different legal jurisdictions and inheritance laws\n2. Addressing potential double taxation issues\n3. Creating proper documentation for foreign property\n4. Setting up international executor arrangements\n\nOur Digital Asset Will template can be customized to include international holdings. Would you like more specific information about certain countries or asset types?";
    } 
    else if (lowerInput.includes('digital') && (lowerInput.includes('assets') || lowerInput.includes('executor'))) {
      response = "WillTank specializes in digital asset planning. Our platform lets you:\n\n1. Inventory all digital assets (cryptocurrency, NFTs, online accounts)\n2. Assign a specific digital executor with proper legal authority\n3. Create access instructions for each digital asset\n4. Specify your wishes for social media accounts and digital legacy\n\nOur Digital Asset Will template is specifically designed for this modern need. Would you like help setting up your digital asset provisions?";
    } 
    else if (lowerInput.includes('living will') || lowerInput.includes('advanced directive')) {
      response = "A living will (advance healthcare directive) is an essential document WillTank helps you create. It includes:\n\n1. Medical treatment preferences if you're incapacitated\n2. Pain management directives\n3. Feeding/hydration instructions\n4. Healthcare proxy designation\n\nOur platform guides you through creating legally binding advance directives that complement your main will. Would you like to learn about how this integrates with your estate plan?";
    } 
    else if (lowerInput.includes('trust') || lowerInput.includes('trustee')) {
      response = "WillTank offers comprehensive trust creation services. Our Living Trust template helps you:\n\n1. Establish revocable or irrevocable trusts\n2. Name trustees and successor trustees\n3. Define beneficiary distributions and conditions\n4. Avoid probate and potentially reduce estate taxes\n5. Create privacy for your estate matters\n\nTrusts can work alongside wills in your estate plan. Would you like to explore which trust type might be right for your situation?";
    } 
    else if (lowerInput.includes('executor') || lowerInput.includes('executrix')) {
      response = "Choosing an executor is a critical decision WillTank helps you make. An executor:\n\n1. Administers your estate after death\n2. Pays debts and distributes assets according to your will\n3. Handles court processes and paperwork\n4. Manages property until distribution\n\nWillTank recommends naming alternate executors and clearly defining their powers. Would you like guidance on selecting the right executor for your situation?";
    } 
    else if (lowerInput.includes('guardian') || (lowerInput.includes('children') && lowerInput.includes('minor'))) {
      response = "Appointing guardians for minor children is a crucial part of estate planning that WillTank prioritizes. Our platform helps you:\n\n1. Name primary and alternate guardians\n2. Specify guardian responsibilities and powers\n3. Create financial provisions for children's care\n4. Document your reasoning for guardian selection\n\nWould you like to understand more about the guardian appointment process or how to structure their authority?";
    } 
    else if (lowerInput.includes('probate') || lowerInput.includes('avoid probate')) {
      response = "Probate avoidance is a common goal that WillTank addresses through various strategies:\n\n1. Creating living trusts that transfer assets outside probate\n2. Setting up Transfer/Payable on Death designations\n3. Establishing joint ownership with rights of survivorship\n4. Using beneficiary designations effectively\n\nOur platform designs estate plans that minimize probate exposure while maintaining your wishes. Would you like to learn which probate avoidance strategies might work best for your situation?";
    } 
    else if (lowerInput.includes('tax') || lowerInput.includes('estate tax') || lowerInput.includes('inheritance tax')) {
      response = "WillTank provides strategies to minimize estate and inheritance taxes, including:\n\n1. Trust creation to reduce taxable estate value\n2. Annual gift tax exclusion planning\n3. Charitable remainder trusts for tax benefits\n4. Family limited partnerships for business owners\n\nOur platform considers both federal and state-level estate taxes in your planning. Would you like more specific tax planning advice for your estate situation?";
    } 
    else if (lowerInput.includes('cryptocurrency') || lowerInput.includes('bitcoin') || lowerInput.includes('crypto')) {
      response = "Cryptocurrency inheritance planning is a WillTank specialty. Our Digital Asset Will template helps you:\n\n1. Document wallet locations and access methods\n2. Create secure key transfer protocols\n3. Designate crypto-knowledgeable executors\n4. Address tax implications of crypto assets\n\nWe understand the unique challenges of passing on digital currency and can help ensure your crypto assets reach your intended beneficiaries. Would you like specific guidance on including crypto in your estate plan?";
    } 
    else if (lowerInput.includes('template') || lowerInput.includes('templates')) {
      response = "WillTank offers several specialized will templates to meet different needs:\n\n1. Traditional Last Will & Testament - Comprehensive coverage of all standard estate elements\n2. Digital Asset Will - Focused on cryptocurrency, NFTs, and online accounts\n3. Living Trust & Estate Plan - Avoids probate and offers enhanced control\n4. Charitable Bequest Will - Optimized for philanthropic giving\n5. Business Succession Plan - For business ownership transition\n6. Pet Care Trust - Specialized provisions for pet care\n\nEach template is customizable through our AI-guided process. Which template interests you most?";
    } 
    else if (lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('subscription')) {
      response = "WillTank offers flexible pricing options to meet different needs:\n\n1. Basic Plan ($99) - Will document download and one year of storage\n2. Premium Plan ($199) - Five years of storage, video testament, and legal advisory\n3. Lifetime Plan ($499) - Lifetime storage, unlimited updates, and priority support\n\nAll plans include our AI-guided will creation process and legally sound documents. Would you like more details about what's included in each plan?";
    } 
    else if (lowerInput.includes('state') && (lowerInput.includes('law') || lowerInput.includes('laws'))) {
      response = "WillTank creates wills compliant with state-specific laws. Our platform:\n\n1. Adapts will language to meet state requirements\n2. Adjusts witness and notary provisions by state\n3. Considers state-specific inheritance and probate laws\n4. Addresses state estate tax considerations where applicable\n\nWe stay current with legal changes across jurisdictions. Is there a specific state's requirements you'd like to learn more about?";
    } 
    else if (lowerInput.includes('update') || lowerInput.includes('revise') || lowerInput.includes('change')) {
      response = "Updating your will is simple with WillTank. Our platform allows you to:\n\n1. Make unlimited revisions to existing documents\n2. Track changes and document versions\n3. Add codicils for minor changes\n4. Create entirely new wills when major changes are needed\n5. Re-execute updated documents with proper witnesses\n\nWe recommend reviewing your will after major life events (marriage, children, property acquisition). Would you like to update an existing will?";
    } 
    else if (lowerInput.includes('witness') || lowerInput.includes('notary') || lowerInput.includes('sign')) {
      response = "WillTank guides you through proper will execution requirements:\n\n1. Digital signature capabilities built into our platform\n2. State-specific witness requirements clearly explained\n3. Self-proving affidavit options where available\n4. Remote notarization support in eligible jurisdictions\n\nOur system ensures your will meets legal formalities for validity. Would you like details about signing requirements in your specific location?";
    } 
    else if (lowerInput.includes('beneficiary') || lowerInput.includes('heir')) {
      response = "Designating beneficiaries is a core function of WillTank's platform. We help you:\n\n1. Clearly identify primary and contingent beneficiaries\n2. Specify exact distribution percentages or specific assets\n3. Create conditions for inheritance if desired\n4. Address special needs beneficiary considerations\n5. Coordinate beneficiary designations across all assets\n\nOur system helps prevent unintentional disinheritance or conflicts. Would you like guidance on structuring your beneficiary designations?";
    } 
    else if (lowerInput.includes('business') || lowerInput.includes('company') || lowerInput.includes('succession')) {
      response = "WillTank's Business Succession template addresses the unique needs of business owners:\n\n1. Ownership transfer mechanisms\n2. Management succession planning\n3. Buy-sell agreement integration\n4. Family business considerations\n5. Business valuation guidance\n\nOur platform helps ensure business continuity after your passing while meeting your wishes. What specific business succession concerns can I help with?";
    } 
    else if (lowerInput.includes('charity') || lowerInput.includes('donation') || lowerInput.includes('charitable')) {
      response = "WillTank's Charitable Bequest template specializes in philanthropic planning:\n\n1. Options for specific bequests or residuary gifts\n2. Charitable remainder trust provisions\n3. Donor-advised fund designations\n4. Tax-optimized giving strategies\n\nOur platform helps maximize your charitable impact while potentially reducing estate taxes. Would you like to explore different charitable giving options for your estate?";
    } 
    else if (lowerInput.includes('pet') || lowerInput.includes('animal')) {
      response = "WillTank's Pet Care Trust template ensures your pets are cared for after your passing:\n\n1. Naming pet guardians and alternates\n2. Establishing pet care funds\n3. Detailing care instructions and preferences\n4. Creating legal protection for allocated funds\n\nOur specialized documents ensure your pets receive the care you intend. Would you like help setting up provisions for your pets?";
    } 
    else if (lowerInput.includes('thank')) {
      response = "You're very welcome! I'm here to help with any other estate planning or will creation questions you might have. WillTank is committed to making the process as straightforward and comprehensive as possible. Is there anything else I can assist you with today?";
    } 
    else {
      response = "As your WillTank AI assistant, I'm specialized in all aspects of estate planning and will creation. I can help with:\n\n• Choosing the right will template for your situation\n• Understanding legal requirements for valid wills\n• Digital asset planning and cryptocurrency inheritance\n• Trust creation and benefits\n• Business succession planning\n• Charitable giving strategies\n• State-specific legal requirements\n• Executor selection and responsibilities\n\nWhat specific aspect of estate planning or will creation can I help you with today?";
    }
    
    const aiMessage = { role: 'assistant' as const, content: response };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
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
