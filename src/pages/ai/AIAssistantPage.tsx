
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, RefreshCw, Send, Sparkles, Copy, ThumbsUp, ThumbsDown, Search, MessageSquare, ArrowRight, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSystemNotifications } from '@/hooks/use-system-notifications';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  lastUpdated: Date;
  messages: Message[];
};

export default function AIAssistantPage() {
  const { toast } = useToast();
  const { notifyWillUpdated } = useSystemNotifications();
  const [input, setInput] = useState('');
  const [currentConversation, setCurrentConversation] = useState<Conversation>({
    id: 'new',
    title: 'New Conversation',
    lastUpdated: new Date(),
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm Skyler, your WillTank AI assistant. How can I help you with your estate planning today?",
        timestamp: new Date()
      }
    ]
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const suggestedQuestions = [
    "How do I create a will for digital assets?",
    "What should I include in my living trust?",
    "How do I appoint an executor for my will?",
    "What are the tax implications of my estate plan?",
    "How can I include charitable giving in my will?"
  ];

  useEffect(() => {
    // Load conversations from local storage or API
    const loadConversations = async () => {
      try {
        // Try loading from Supabase first (if user is authenticated)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check if we have saved conversations in AI interactions
          const { data, error } = await supabase
            .from('ai_interactions')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
            
          if (!error && data && data.length > 0) {
            // Convert AI interactions to conversation format
            const processedConversations = data.reduce((acc: Conversation[], interaction) => {
              // Try to extract conversation data from request_type
              let conversationInfo: any = {};
              try {
                // This assumes request_type might contain JSON with conversation context
                const parsed = JSON.parse(interaction.request_type);
                if (parsed && typeof parsed === 'object') {
                  conversationInfo = parsed;
                }
              } catch (e) {
                // If not JSON, use as a plain title
                conversationInfo = { title: interaction.request_type };
              }
              
              // Create a conversation from this interaction
              const conversation: Conversation = {
                id: interaction.id,
                title: conversationInfo.title || `Conversation ${acc.length + 1}`,
                lastUpdated: new Date(interaction.created_at),
                messages: [
                  {
                    id: `user-${interaction.id}`,
                    role: 'user',
                    content: conversationInfo.query || 'How can you help me?',
                    timestamp: new Date(interaction.created_at),
                  },
                  {
                    id: `assistant-${interaction.id}`,
                    role: 'assistant',
                    content: interaction.response,
                    timestamp: new Date(interaction.created_at),
                  }
                ]
              };
              
              acc.push(conversation);
              return acc;
            }, []);
            
            if (processedConversations.length > 0) {
              setConversations(processedConversations);
              return;
            }
          }
        }
        
        // Fallback to localStorage if no supabase data
        const storedConversations = localStorage.getItem('ai-conversations');
        if (storedConversations) {
          try {
            const parsed = JSON.parse(storedConversations);
            const processedConversations = parsed.map((conv: any) => ({
              ...conv,
              lastUpdated: new Date(conv.lastUpdated),
              messages: conv.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }));
            setConversations(processedConversations);
          } catch (e) {
            console.error('Error parsing stored conversations:', e);
            // Create default conversations as fallback
            createDefaultConversations();
          }
        } else {
          // Create default conversations if nothing found
          createDefaultConversations();
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        createDefaultConversations();
      }
    };
    
    const createDefaultConversations = () => {
      const defaultConversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Digital Assets Will',
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
          messages: [
            {
              id: '1',
              role: 'assistant',
              content: "Hello! How can I help you with your estate planning?",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
            },
            {
              id: '2',
              role: 'user',
              content: "I need help with my digital assets will",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60000)
            }
          ]
        },
        {
          id: 'conv-2',
          title: 'Executor Questions',
          lastUpdated: new Date(Date.now() - 48 * 60 * 60 * 1000),
          messages: [
            {
              id: '1',
              role: 'assistant',
              content: "Hello! How can I help you with your estate planning?",
              timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
            },
            {
              id: '2',
              role: 'user',
              content: "How do I select an executor for my will?",
              timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000 + 60000)
            }
          ]
        }
      ];
      
      setConversations(defaultConversations);
    };
    
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ai-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    if (currentConversation.id === 'new' && currentConversation.messages.length === 1) {
      const newConversation = {
        ...currentConversation,
        id: `conv-${Date.now()}`,
        title: input.length > 30 ? `${input.substring(0, 30)}...` : input,
        messages: [...currentConversation.messages, userMessage]
      };
      setCurrentConversation(newConversation);
      setConversations([newConversation, ...conversations]);
    } else {
      const updatedMessages = [...currentConversation.messages, userMessage];
      const updatedConversation = {
        ...currentConversation,
        lastUpdated: new Date(),
        messages: updatedMessages
      };
      setCurrentConversation(updatedConversation);
      
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversation.id ? updatedConversation : conv
      );
      if (!updatedConversations.some(conv => conv.id === currentConversation.id)) {
        updatedConversations.unshift(updatedConversation);
      }
      setConversations(updatedConversations);
    }

    setInput('');
    setIsProcessing(true);

    try {
      // Store conversation history format that AI can process
      const conversationHistory = currentConversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
        
      // Call the AI assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: input,
          conversation_history: conversationHistory
        }
      });
      
      if (error) {
        console.error('Error calling AI assistant:', error);
        fallbackResponse(input);
        return;
      }
      
      const aiMessage: Message = { 
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date()
      };
      
      const finalMessages = [...currentConversation.messages, userMessage, aiMessage];
      const finalConversation = {
        ...currentConversation,
        lastUpdated: new Date(),
        messages: finalMessages
      };
      
      setCurrentConversation(finalConversation);
      
      const finalConversations = conversations.map(conv => 
        conv.id === currentConversation.id ? finalConversation : conv
      );
      if (!finalConversations.some(conv => conv.id === finalConversation.id)) {
        finalConversations.unshift(finalConversation);
      }
      setConversations(finalConversations);
      
      // Save interaction to Supabase if user is authenticated
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('ai_interactions').insert({
            user_id: session.user.id,
            request_type: JSON.stringify({
              title: finalConversation.title,
              query: input
            }),
            response: data.response
          });
        }
      } catch (err) {
        console.error('Error saving AI interaction:', err);
      }
      
      notifyWillUpdated({
        title: "AI Assistant",
        description: "New response received from Skyler."
      });
      
    } catch (error) {
      console.error('Exception in handleSendMessage:', error);
      fallbackResponse(input);
    } finally {
      setIsProcessing(false);
    }
  };

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
    
    const aiMessage: Message = { 
      id: Date.now().toString(), 
      role: 'assistant', 
      content: response,
      timestamp: new Date()
    };
    
    const updatedMessages = [...currentConversation.messages, aiMessage];
    const updatedConversation = {
      ...currentConversation,
      lastUpdated: new Date(),
      messages: updatedMessages
    };
    
    setCurrentConversation(updatedConversation);
    
    const updatedConversations = conversations.map(conv => 
      conv.id === currentConversation.id ? updatedConversation : conv
    );
    if (!updatedConversations.some(conv => conv.id === updatedConversation.id)) {
      updatedConversations.unshift(updatedConversation);
    }
    setConversations(updatedConversations);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    const inputElement = document.getElementById('message-input');
    if (inputElement) {
      inputElement.focus();
    }
  };

  const startNewConversation = () => {
    setCurrentConversation({
      id: 'new',
      title: 'New Conversation',
      lastUpdated: new Date(),
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: "Hello! I'm Skyler, your WillTank AI assistant. How can I help you with your estate planning today?",
          timestamp: new Date()
        }
      ]
    });
    toast({
      title: "New Conversation",
      description: "Started a new conversation with Skyler."
    });
  };

  const selectConversation = (conversationId: string) => {
    const selected = conversations.find(conv => conv.id === conversationId);
    if (selected) {
      setCurrentConversation(selected);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard."
    });
  };

  const deleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    
    if (currentConversation.id === conversationId) {
      startNewConversation();
    }
    
    // Also delete from Supabase if it exists there
    const deleteFromSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // If the ID is in Supabase UUID format, try to delete it
          if (conversationId.length === 36) {
            await supabase
              .from('ai_interactions')
              .delete()
              .eq('id', conversationId);
          }
        }
      } catch (err) {
        console.error('Error deleting AI interaction from Supabase:', err);
      }
    };
    
    deleteFromSupabase();
    
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed from your history."
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container px-0 md:px-4 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 h-[calc(100vh-12rem)]">
        <motion.div 
          initial={{ width: isSidebarOpen ? '300px' : '0px', opacity: isSidebarOpen ? 1 : 0 }}
          animate={{ width: isSidebarOpen ? '300px' : '0px', opacity: isSidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "bg-white rounded-l-xl shadow-sm border border-r-0 border-gray-200 flex-shrink-0 overflow-hidden",
            isSidebarOpen ? "block" : "hidden lg:block"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <MessageSquare size={18} className="text-willtank-500" />
                Conversations
              </h3>
              <Button variant="ghost" size="sm" onClick={startNewConversation}>
                <span className="sr-only">New conversation</span>
                <span className="text-xs">+ New</span>
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => selectConversation(conv.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg mb-1 transition-colors hover:bg-gray-100",
                        currentConversation.id === conv.id ? "bg-gray-100" : ""
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm truncate w-48">
                          {conv.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(conv.lastUpdated)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conv.messages[conv.messages.length - 1]?.content.substring(0, 60)}...
                      </p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                      onClick={(e) => deleteConversation(conv.id, e)}
                    >
                      <span className="sr-only">Delete</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-500">
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </motion.div>
        
        <div className="flex-1 flex flex-col bg-white rounded-xl lg:rounded-l-none shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <PanelLeft size={18} />
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-500" />
                <h2 className="font-medium">Skyler</h2>
              </div>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <PanelLeft size={16} className="mr-2" />
              {isSidebarOpen ? "Hide history" : "Show history"}
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-2">
              {currentConversation.messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex items-start gap-3 group animate-fade-in",
                    message.role === 'user' ? "justify-end" : ""
                  )}
                >
                  {message.role !== 'user' && (
                    <div className="h-8 w-8 rounded-full bg-willtank-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={16} className="text-willtank-600" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[85%] rounded-lg p-4 relative group",
                    message.role === 'user' 
                      ? "bg-willtank-500 text-white" 
                      : "bg-gray-50 text-gray-800"
                  )}>
                    <div className="whitespace-pre-line text-sm">
                      {message.content}
                    </div>
                    
                    <div className={cn(
                      "absolute -top-8 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                      message.role === 'user' ? "text-white" : "text-gray-500"
                    )}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(message.content)}
                      >
                        <Copy size={12} />
                        <span className="sr-only">Copy</span>
                      </Button>
                      
                      {message.role === 'assistant' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsUp size={12} />
                            <span className="sr-only">Like</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsDown size={12} />
                            <span className="sr-only">Dislike</span>
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-1 text-xs text-right opacity-60">
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-willtank-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} className="text-willtank-600" />
                  </div>
                  <div className="max-w-[85%] rounded-lg p-4 bg-gray-50 text-gray-800">
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {currentConversation.id === 'new' && currentConversation.messages.length === 1 && (
            <div className="p-4 border-t border-gray-100">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Sparkles size={14} className="text-amber-500 mr-2" />
                Suggested Questions
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center"
                  >
                    {question}
                    <ArrowRight size={12} className="ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Input
                id="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Skyler about estate planning or legacy options..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isProcessing || input.trim() === ''}
              >
                {isProcessing ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
