
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface AIConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export default function AIAssistantPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [sessionId, setSessionId] = useState(() => Math.random().toString(36).substring(2, 15));

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setConversations([]);
        setIsLoadingConversations(false);
        return;
      }

      const { data, error } = await supabase
        .from('ai_interactions')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group interactions by session_id to form conversations
      const conversationsMap = new Map<string, AIConversation>();
      
      if (data && data.length > 0) {
        data.forEach(interaction => {
          // This is simplified, you would need to properly parse your stored interactions
          // based on your db schema
          if (interaction.session_id) {
            if (!conversationsMap.has(interaction.session_id)) {
              conversationsMap.set(interaction.session_id, {
                id: interaction.session_id,
                title: interaction.title || `Conversation ${conversationsMap.size + 1}`,
                messages: [],
                createdAt: new Date(interaction.created_at)
              });
            }
            
            // Add messages from stored format
            try {
              const message = {
                role: interaction.role || 'user',
                content: interaction.content || interaction.request_type || '',
                timestamp: new Date(interaction.created_at)
              };
              conversationsMap.get(interaction.session_id)?.messages.push(message);
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          }
        });
      }
      
      // Convert map to array and sort by date
      const conversationsArray = Array.from(conversationsMap.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setConversations(conversationsArray);
      
      // Set current conversation to the most recent one, or create a new one
      if (conversationsArray.length > 0) {
        setCurrentConversation(conversationsArray[0]);
      } else {
        createNewConversation();
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your conversations.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const createNewConversation = () => {
    const newId = Math.random().toString(36).substring(2, 15);
    setSessionId(newId);
    const newConversation: AIConversation = {
      id: newId,
      title: `New Conversation`,
      messages: [],
      createdAt: new Date()
    };
    setCurrentConversation(newConversation);
    setConversations([newConversation, ...conversations]);
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim() || loading) return;
    
    if (!currentConversation) {
      createNewConversation();
    }
    
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    
    // Update UI immediately with user message
    setCurrentConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, userMessage]
      };
    });
    
    setLoading(true);
    setPrompt('');
    
    try {
      // Call the AI assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: prompt,
          conversation_history: currentConversation?.messages || [],
          session_id: sessionId
        }
      });
      
      if (error) throw error;
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'I could not process your request. Please try again.',
        timestamp: new Date()
      };
      
      // Update the current conversation with the assistant's response
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, assistantMessage]
        };
      });
      
      // Store the interaction in the database
      await supabase.from('ai_interactions').insert([
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          request_type: prompt,
          response: assistantMessage.content,
          session_id: sessionId
        }
      ]);
      
    } catch (error) {
      console.error('Error with AI processing:', error);
      
      // Show the error to the user
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, {
            role: 'assistant',
            content: 'Sorry, I encountered an error while processing your request. Please try again later.',
            timestamp: new Date()
          }]
        };
      });
      
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI assistant.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div className="container mx-auto py-8 h-full">
      <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Your recent AI conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full mb-4" 
                onClick={createNewConversation}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
              
              <ScrollArea className="h-[calc(100vh-350px)]">
                {isLoadingConversations ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No conversations yet. Start a new one!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map(conversation => (
                      <Button
                        key={conversation.id}
                        variant={currentConversation?.id === conversation.id ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={() => setCurrentConversation(conversation)}
                      >
                        <Bot className="mr-2 h-4 w-4" />
                        <div className="truncate">
                          {conversation.title}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Chat with AI</CardTitle>
              <CardDescription>Ask anything about your legal documents, wills, or general advice</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                {currentConversation && currentConversation.messages.length > 0 ? (
                  <div className="space-y-4">
                    {currentConversation.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.role === 'user' ? (
                              <>
                                <span className="font-medium">You</span>
                                <User className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                <Bot className="h-4 w-4" />
                                <span className="font-medium">AI Assistant</span>
                              </>
                            )}
                          </div>
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>
                          {message.timestamp && (
                            <div className="text-xs mt-2 opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Bot className="h-16 w-16 mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                    <p className="text-gray-500 max-w-md">
                      Ask me anything about wills, estate planning, legal documents, or any other questions you might have.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex w-full items-center space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-10 resize-none"
                  disabled={loading}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendPrompt}
                  disabled={!prompt.trim() || loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
