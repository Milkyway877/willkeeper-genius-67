
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Trash2, Clock, Copy, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date | string;
}

export default function AIAssistantPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: "Hello! I'm your WillTank AI assistant. How can I help with your estate planning today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  
  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (isAutoScrollEnabled && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAutoScrollEnabled]);

  const fetchConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_interactions')
        .select('*')
        .limit(10)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching conversation:', error);
      } else {
        setConversationHistory(data as any);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };
  
  const loadInitialMessages = async () => {
    await fetchConversation();
  };
  
  useEffect(() => {
    loadInitialMessages();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: query,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    
    try {
      // Ensure auto-scroll is enabled when sending new messages
      setIsAutoScrollEnabled(true);
      
      // Add a small timeout to ensure the UI updates with the user message before showing the loading state
      setTimeout(async () => {
        try {
          // Get the current session token
          const { data: { session } } = await supabase.auth.getSession();
          const accessToken = session?.access_token || '';
          
          const response = await fetch('https://ksiinmxsycosnpchutuw.supabase.co/functions/v1/ai-assistant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              query: userMessage.content,
              conversation_history: messages.map(m => ({
                role: m.role,
                content: m.content,
              })),
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const data = await response.json();
          
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            content: data.response || "I'm sorry, I couldn't generate a response. Please try again.",
            role: 'assistant',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Store the interaction in the database if the user is authenticated
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            await supabase.from('ai_interactions').insert({
              user_id: sessionData.session.user.id,
              request_type: 'estate_planning',
              response: JSON.stringify({
                query: userMessage.content,
                response: assistantMessage.content
              })
            });
          }
          
        } catch (error) {
          console.error('Error sending message:', error);
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            content: "I'm sorry, I encountered an error. Please try again later.",
            role: 'assistant',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          
          toast({
            title: "Error",
            description: "Failed to get a response from the AI assistant.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error in message handling:', error);
      setLoading(false);
    }
  };
  
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Message copied to clipboard"
    });
  };
  
  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        content: "Hello! I'm your WillTank AI assistant. How can I help with your estate planning today?",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been cleared."
    });
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="border shadow-sm flex flex-col" style={{ height: "80vh" }}>
        <CardHeader className="bg-willtank-50 border-b shrink-0">
          <CardTitle className="flex items-center text-willtank-700">
            <Bot className="mr-2 h-5 w-5" />
            WillTank AI Assistant
          </CardTitle>
          <CardDescription>
            Your personal estate planning and digital legacy assistant
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-willtank-100 text-willtank-900'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          message.role === 'user' ? 'bg-willtank-200' : 'bg-gray-200'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="text-xs font-medium">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {typeof message.timestamp === 'string'
                          ? new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.role === 'assistant' && (
                      <div className="flex justify-end mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </ScrollArea>
          
          <div className="p-4 border-t mt-auto">
            <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
              <Textarea
                ref={messageInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about wills, digital assets, or estate planning..."
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" size="sm" onClick={handleClearChat}>
                  <Trash2 className="h-4 w-4 mr-1" /> Clear Chat
                </Button>
                <Button type="submit" size="sm" disabled={loading || !query.trim()}>
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Send <Send className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
