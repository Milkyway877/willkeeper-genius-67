import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  MessageSquare, Send, RefreshCw, Sparkles, History, 
  Save, ThumbsUp, ThumbsDown, User, Bot, ArrowDown, 
  Copy, Download, Cog, BookOpen, Video, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  attachments?: { name: string; type: string }[];
}

interface SavedConversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
}

export default function AIAssistance() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: "Hello! I'm your WillTank AI assistant. I can help you with estate planning, answer questions about wills and trusts, explain legal concepts, and guide you through the process of creating your documents. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent',
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([
    {
      id: 'conv-1',
      title: 'Will Creation Help',
      preview: 'Questions about creating my first will',
      timestamp: new Date(2023, 10, 15),
      messageCount: 12,
    },
    {
      id: 'conv-2',
      title: 'Trust vs Will Discussion',
      preview: 'Exploring the differences between trusts and wills',
      timestamp: new Date(2023, 10, 10),
      messageCount: 8,
    },
    {
      id: 'conv-3',
      title: 'Estate Tax Questions',
      preview: 'Understanding estate taxes and exemptions',
      timestamp: new Date(2023, 9, 28),
      messageCount: 15,
    }
  ]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    setTimeout(() => {
      generateAIResponse(inputValue);
    }, 1000);
  };
  
  const generateAIResponse = async (userInput: string) => {
    setIsTyping(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: userInput,
          conversation_history: messages.slice(-10)
        }
      });
      
      if (error) {
        console.error('Error calling AI assistant:', error);
        generateLocalResponse(userInput);
        return;
      }
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        content: data.response || "I'm sorry, I couldn't process your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Exception in generateAIResponse:', error);
      generateLocalResponse(userInput);
    } finally {
      setIsTyping(false);
    }
  };
  
  const generateLocalResponse = (userInput: string) => {
    let aiResponseContent = '';
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('will') && (lowerInput.includes('create') || lowerInput.includes('make') || lowerInput.includes('write'))) {
      aiResponseContent = "Creating a will with WillTank is simple and comprehensive. Our platform guides you through several key steps:\n\n1. Choose a template that fits your needs (traditional, digital assets, living trust)\n2. Answer our AI-guided questions to personalize your document\n3. Review and edit the generated will\n4. Record a video testament for additional clarity\n5. Upload supporting documents\n6. Sign digitally to authenticate\n\nWould you like me to help you start the process or explain any specific aspect of will creation?";
    } else if (lowerInput.includes('trust')) {
      aiResponseContent = "A trust is a legal arrangement where one party (the trustor) gives another party (the trustee) the right to hold and manage assets for a third party (the beneficiary). Trusts offer several advantages:\n\n• Avoiding probate\n• Potential tax benefits\n• Privacy protection\n• Asset management during incapacity\n• Control over asset distribution\n\nThere are many types of trusts, including revocable living trusts, irrevocable trusts, and special needs trusts. Would you like to know more about a specific type?";
    } else if (lowerInput.includes('executor')) {
      aiResponseContent = "An executor is the person named in your will who is responsible for carrying out your final wishes regarding your estate. Their duties typically include:\n\n• Identifying and gathering your assets\n• Paying debts and taxes\n• Distributing remaining assets to beneficiaries\n• Representing the estate in legal proceedings\n\nWhen choosing an executor, look for someone who is trustworthy, organized, and financially responsible. It's often advisable to name a backup executor as well.";
    } else if (lowerInput.includes('tax') || lowerInput.includes('taxes')) {
      aiResponseContent = "Estate taxes can significantly impact the amount your beneficiaries receive. As of 2023, the federal estate tax exemption is $12.92 million per individual, meaning estates valued below this amount aren't subject to federal estate tax.\n\nHowever, some states have their own estate or inheritance taxes with lower thresholds. Strategic estate planning can help minimize tax implications through tools like:\n\n• Irrevocable life insurance trusts\n• Charitable donations\n• Annual gifting\n• Family limited partnerships\n\nWould you like me to explain any of these strategies?";
    } else if (lowerInput.includes('digital') || lowerInput.includes('online')) {
      aiResponseContent = "Digital assets are an increasingly important part of estate planning. These include:\n\n• Email accounts\n• Social media profiles\n• Cryptocurrency\n• Digital media (photos, videos, music)\n• Online financial accounts\n• NFTs and digital collectibles\n\nUnlike physical assets, digital assets often come with terms of service agreements that may restrict transferability. I recommend creating a digital asset inventory that includes account information and wishes for each asset. WillTank offers a Digital Asset Will template specifically designed for this purpose.";
    } else {
      aiResponseContent = "That's an interesting question about estate planning. I'd be happy to help you understand this topic better. Estate planning involves making decisions about how your assets will be distributed after your death, who will care for your dependents, and how your affairs will be managed if you become incapacitated.\n\nA comprehensive estate plan typically includes documents like a will, possibly trusts, power of attorney, and healthcare directives. Each serves a specific purpose in ensuring your wishes are carried out.\n\nCan you tell me more specifically what aspect of estate planning you'd like to learn about?";
    }
    
    const aiMessage: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      content: aiResponseContent,
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };
  
  const saveConversation = () => {
    if (messages.length <= 1) {
      toast({
        title: "Cannot Save",
        description: "Please have a conversation before saving.",
        variant: "destructive"
      });
      return;
    }
    
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    const preview = firstUserMessage 
      ? firstUserMessage.content.length > 60 
        ? firstUserMessage.content.substring(0, 60) + '...' 
        : firstUserMessage.content
      : 'New conversation';
    
    const newSavedConversation: SavedConversation = {
      id: `conv-${Date.now()}`,
      title: conversationTitle,
      preview,
      timestamp: new Date(),
      messageCount: messages.length,
    };
    
    setSavedConversations([newSavedConversation, ...savedConversations]);
    
    toast({
      title: "Conversation Saved",
      description: "Your conversation has been saved successfully."
    });
  };
  
  const startNewConversation = () => {
    setMessages([
      {
        id: 'welcome',
        content: "Hello! I'm your WillTank AI assistant. I can help you with estate planning, answer questions about wills and trusts, explain legal concepts, and guide you through the process of creating your documents. How can I assist you today?",
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
      }
    ]);
    setConversationTitle('New Conversation');
    
    toast({
      title: "New Conversation",
      description: "Started a new conversation with the AI assistant."
    });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const copyMessageToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to Clipboard",
      description: "Message content has been copied to your clipboard."
    });
  };
  
  const downloadConversation = () => {
    if (messages.length <= 1) {
      toast({
        title: "Cannot Download",
        description: "Please have a conversation before downloading.",
        variant: "destructive"
      });
      return;
    }
    
    const conversationText = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.sender === 'user' ? 'You' : 'AI Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversationTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Conversation Downloaded",
      description: "Your conversation has been downloaded as a text file."
    });
  };
  
  const renderMessageContent = (content: string) => {
    return content.split('\n').map((paragraph, idx) => (
      paragraph === '' ? <br key={idx} /> : <p key={idx} className="mb-2">{paragraph}</p>
    ));
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-12rem)] gap-6">
          <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-medium">History</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={startNewConversation}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <AnimatePresence>
                {savedConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-2 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => toast({
                      title: "Load Conversation",
                      description: "Loading saved conversation..."
                    })}
                  >
                    <h4 className="font-medium text-sm">{conversation.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">{conversation.preview}</p>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>{conversation.messageCount} messages</span>
                      <span>{conversation.timestamp.toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="p-3 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={startNewConversation}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="text"
                  value={conversationTitle}
                  onChange={(e) => setConversationTitle(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-lg font-medium"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={saveConversation}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={downloadConversation}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start px-4 pt-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0 m-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.sender === 'user' ? 'bg-willtank-500 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl p-4`}>
                          <div className="flex items-center mb-2">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${message.sender === 'user' ? 'bg-willtank-600' : 'bg-gray-200'}`}>
                              {message.sender === 'user' ? (
                                <User className="h-3 w-3 text-white" />
                              ) : (
                                <Bot className="h-3 w-3 text-willtank-600" />
                              )}
                            </div>
                            <span className="text-xs font-medium">
                              {message.sender === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            <span className="text-xs ml-2 opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <div className="text-sm">
                            {renderMessageContent(message.content)}
                          </div>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200 border-opacity-20">
                              <p className="text-xs mb-1">Attachments:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.attachments.map((attachment, idx) => (
                                  <div key={idx} className="bg-white bg-opacity-10 rounded px-2 py-1 text-xs flex items-center">
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    {attachment.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {message.sender === 'ai' && (
                            <div className="flex justify-between mt-3 pt-2 border-t border-gray-200 border-opacity-20">
                              <div className="flex space-x-2">
                                <button className="text-xs hover:bg-white hover:bg-opacity-10 rounded p-1">
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button className="text-xs hover:bg-white hover:bg-opacity-10 rounded p-1">
                                  <ThumbsDown className="h-3 w-3" />
                                </button>
                              </div>
                              <button 
                                className="text-xs hover:bg-white hover:bg-opacity-10 rounded p-1"
                                onClick={() => copyMessageToClipboard(message.content)}
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 text-gray-800 rounded-xl p-4 max-w-[80%]">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <Bot className="h-3 w-3 text-willtank-600" />
                          </div>
                          <span className="text-xs font-medium">AI Assistant is typing</span>
                        </div>
                        <div className="flex space-x-1 mt-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-300"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-gray-100">
                  <div className="relative">
                    <Textarea
                      placeholder="Type your message here..."
                      className="pr-12 min-h-[80px] resize-none"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <Button 
                      className="absolute right-2 bottom-2"
                      size="sm"
                      onClick={sendMessage}
                      disabled={isTyping || !inputValue.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <div>
                      <span>Powered by WillTank AI</span>
                    </div>
                    <button className="hover:text-willtank-600 flex items-center">
                      <Cog className="h-3 w-3 mr-1" />
                      Settings
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Estate Planning Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center mr-3">
                            <BookOpen className="h-5 w-5 text-willtank-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Will Templates</h4>
                            <p className="text-sm text-gray-500">Standard and specialized will templates</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          View Templates
                        </Button>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-willtank-50 flex items-center justify-center mr-3">
                            <BookOpen className="h-5 w-5 text-willtank-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Trust Documents</h4>
                            <p className="text-sm text-gray-500">Various trust formation documents</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          View Documents
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Legal Resources</h3>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <BookOpen className="h-5 w-5 text-willtank-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-sm">Estate Planning Guide</h4>
                          <p className="text-xs text-gray-500">Comprehensive guide to estate planning basics</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <BookOpen className="h-5 w-5 text-willtank-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-sm">Digital Assets Management</h4>
                          <p className="text-xs text-gray-500">How to handle digital assets in your estate plan</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <BookOpen className="h-5 w-5 text-willtank-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-sm">Tax Planning Strategies</h4>
                          <p className="text-xs text-gray-500">Minimize tax implications in your estate plan</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tutorials" className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Video Tutorials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                          <Video className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium">Creating Your First Will</h4>
                          <p className="text-xs text-gray-500 mt-1">10:15 minutes</p>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            Watch Now
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                          <Video className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium">Understanding Trusts</h4>
                          <p className="text-xs text-gray-500 mt-1">15:30 minutes</p>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            Watch Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Interactive Guides</h3>
                    <div className="space-y-3">
                      <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4">
                        <h4 className="font-medium">Estate Planning Questionnaire</h4>
                        <p className="text-sm text-gray-600 mt-1 mb-3">Answer a few questions to get personalized guidance for your estate plan.</p>
                        <Button size="sm">
                          Start Questionnaire
                        </Button>
                      </div>
                      
                      <div className="bg-willtank-50 border border-willtank-100 rounded-lg p-4">
                        <h4 className="font-medium">Document Checklist</h4>
                        <p className="text-sm text-gray-600 mt-1 mb-3">Interactive checklist of documents you should include in your estate plan.</p>
                        <Button size="sm">
                          View Checklist
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="mt-6">
          <Alert className="bg-willtank-50 border-willtank-100">
            <Sparkles className="h-4 w-4 text-willtank-600" />
            <AlertTitle>AI Assistant Information</AlertTitle>
            <AlertDescription>
              The AI assistant provides general information about estate planning and wills. For legal advice specific to your situation, please consult with a qualified attorney.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </Layout>
  );
}
