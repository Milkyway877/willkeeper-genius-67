
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TankDashboard } from './components/TankDashboard';
import { TankAnalytics } from './components/TankAnalytics';
import { UnifiedVault } from './components/UnifiedVault';
import { TimerReset, Plus, LineChart, Archive, ShieldCheck, Loader2, Sparkles, MessageSquare, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export default function Tank() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [vaultCount, setVaultCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [suggestions] = useState([
    "How can I organize my legacy messages?",
    "What should I include in my personal story?",
    "How to create a meaningful video message?",
    "Best practices for digital inheritance"
  ]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        setIsLoading(true);
        
        const { count: totalCount, error: countError } = await supabase
          .from('future_messages')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        const { count: scheduledMessagesCount, error: scheduledError } = await supabase
          .from('future_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled');
          
        if (scheduledError) throw scheduledError;
        
        const { count: vaultItemsCount, error: vaultError } = await supabase
          .from('legacy_vault')
          .select('*', { count: 'exact', head: true });
          
        if (vaultError) throw vaultError;
        
        // Set actual counts from database
        setMessageCount(totalCount || 0);
        setScheduledCount(scheduledMessagesCount || 0);
        setVaultCount(vaultItemsCount || 0);
      } catch (error) {
        console.error('Error loading counts:', error);
        // Don't set fake numbers, just show 0
        setMessageCount(0);
        setScheduledCount(0);
        setVaultCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCounts();
  }, []);

  const handleAiPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsProcessingAi(true);
    try {
      // Call the AI assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: aiPrompt,
          conversation_history: []
        }
      });
      
      if (error) throw new Error('Failed to get AI response');
      
      setAiResponse(data.response || 'I could not process your request. Please try again.');
    } catch (err) {
      console.error('Error with AI processing:', err);
      setAiResponse('Sorry, I encountered an error while processing your request. Please try again later.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAiPrompt(suggestion);
  };

  // Fixed: Created direct navigation to the TankMessageCreation component
  const handleCreateMessage = () => {
    navigate('/tank/create-message');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <TimerReset className="mr-2 h-8 w-8 text-willtank-600" />
              The Tank
            </h1>
            <p className="text-gray-600">
              Your personal time capsule for future messages, videos, and more
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAiHelper(!showAiHelper)}
              variant="outline"
              className="flex-shrink-0"
            >
              <Bot size={16} className="mr-2 text-willtank-600" />
              AI Helper
            </Button>
            <Button 
              onClick={handleCreateMessage}
              className="bg-willtank-600 hover:bg-willtank-700 text-white flex-shrink-0"
            >
              <Plus size={16} className="mr-2" />
              Create New Message
            </Button>
          </div>
        </div>
        
        {showAiHelper && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="border-willtank-200 bg-gradient-to-r from-willtank-50/50 to-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                  <span>Tank AI Assistant</span>
                </CardTitle>
                <CardDescription>Ask me anything about legacy planning and message creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about legacy planning, message creation, or vault management..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="flex-grow"
                      onKeyDown={(e) => e.key === 'Enter' && handleAiPrompt()}
                    />
                    <Button 
                      onClick={handleAiPrompt} 
                      disabled={isProcessingAi || !aiPrompt.trim()}
                    >
                      {isProcessingAi ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                      <span className="ml-2">Ask</span>
                    </Button>
                  </div>
                  
                  {aiResponse && (
                    <Alert>
                      <Bot className="h-4 w-4" />
                      <AlertTitle>AI Response</AlertTitle>
                      <AlertDescription className="whitespace-pre-line">
                        {aiResponse}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 text-willtank-600" />
                <span>Secured Messages</span>
              </CardTitle>
              <CardDescription>Total messages in the Tank</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-willtank-600 animate-spin" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-3xl font-bold">{messageCount}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <LineChart className="mr-2 h-4 w-4 text-willtank-600" />
                <span>Scheduled Deliveries</span>
              </CardTitle>
              <CardDescription>Messages with set delivery dates</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-willtank-600 animate-spin" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-3xl font-bold">{scheduledCount}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Archive className="mr-2 h-4 w-4 text-willtank-600" />
                <span>Legacy Vault</span>
              </CardTitle>
              <CardDescription>Special memories securely stored</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 text-willtank-600 animate-spin" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className="text-3xl font-bold">{vaultCount}</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="dashboard" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Messages Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Status</TabsTrigger>
            <TabsTrigger value="vault">Legacy Vault</TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="dashboard" className="space-y-6">
                <TankDashboard />
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <TankAnalytics />
              </TabsContent>
              
              <TabsContent value="vault" className="space-y-6">
                <UnifiedVault />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </Layout>
  );
}
