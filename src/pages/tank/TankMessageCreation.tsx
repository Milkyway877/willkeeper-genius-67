
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Video, FileText, AudioLines, MessageSquare, Sparkles, Loader2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { createFutureMessage } from '@/services/tankService';
import { TankVideoCreator } from './components/creators/TankVideoCreator';
import { TankDocumentCreator } from './components/creators/TankDocumentCreator';
import { TankAudioCreator } from './components/creators/TankAudioCreator';
import { TankLetterCreator } from './components/creators/TankLetterCreator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function TankMessageCreation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messageType, setMessageType] = useState<string>('letter');
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [preview, setPreview] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [messageUrl, setMessageUrl] = useState<string | null>(null);
  const [isCreatingMessage, setIsCreatingMessage] = useState(false);
  const [aiSuggestions] = useState([
    "Write a heartfelt letter to my daughter",
    "Compose a message for my future grandchildren",
    "Create an inspirational message for my spouse", 
    "Draft a message sharing my life lessons"
  ]);

  const handleAiPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsProcessingAi(true);
    try {
      // Call the AI assistant edge function for content creation
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          query: `Create a legacy message based on this description: ${aiPrompt}`,
          conversation_history: []
        }
      });
      
      if (error) throw new Error('Failed to get AI response');
      
      setAiResponse(data.response || 'I could not process your request. Please try again.');
      
      // Auto-populate the preview with a summary from the AI
      if (data.response && data.response.length > 100) {
        setPreview(data.response.substring(0, 97) + '...');
      } else if (data.response) {
        setPreview(data.response);
      }
      
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

  const handleContentUpdated = (content: string, url: string | null = null) => {
    if (content && content.length > 100) {
      setPreview(content.substring(0, 97) + '...');
    } else {
      setPreview(content);
    }
    
    if (url) {
      setMessageUrl(url);
    }
  };

  const saveMessage = async () => {
    if (!title || !recipientName || !recipientEmail || !date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!preview) {
      toast({
        title: "Missing content",
        description: "Please create some content for your message.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingMessage(true);

    try {
      toast({
        title: "Saving message",
        description: "Your message is being saved...",
      });

      // Ensure we have valid data
      const newMessage = {
        title,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        message_type: messageType,
        preview: preview,
        message_url: messageUrl || '',
        status: 'Scheduled',
        delivery_date: date.toISOString()
      };

      console.log("Saving message with data:", newMessage);
      
      // Use a try-catch to see what's going wrong
      try {
        const createdMessage = await createFutureMessage(newMessage);
        console.log("Created message response:", createdMessage);
        
        if (!createdMessage) {
          throw new Error("Failed to create message - no response");
        }
        
        toast({
          title: "Message created",
          description: "Your message has been scheduled successfully.",
        });
        
        // Add a small delay before navigating to prevent any race conditions
        setTimeout(() => {
          navigate('/tank');
        }, 500);
      } catch (innerError) {
        console.error("Inner error creating message:", innerError);
        throw innerError;
      }
    } catch (error) {
      console.error("Error creating message:", error);
      toast({
        title: "Error",
        description: "Failed to create your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingMessage(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Legacy Message</h1>
          <p className="text-gray-600 mt-1">
            Craft a message that will be delivered to your loved ones at a future date
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Message Details</CardTitle>
                <CardDescription>
                  Provide information about your message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Message Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., My Life Lessons" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input 
                    id="recipientName" 
                    placeholder="e.g., John Smith" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input 
                    id="recipientEmail" 
                    type="email" 
                    placeholder="e.g., john@example.com" 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <Select
                    value={messageType}
                    onValueChange={setMessageType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select message type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          <span>Letter</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          <span>Video</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center">
                          <AudioLines className="h-4 w-4 mr-2" />
                          <span>Audio</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="document">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Document</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                  AI Message Assistant
                </CardTitle>
                <CardDescription>
                  Let AI help you craft your message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aiPrompt">Describe your message</Label>
                  <Textarea 
                    id="aiPrompt"
                    placeholder="e.g., Write a heartfelt letter to my daughter about life lessons" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <Button 
                  onClick={handleAiPrompt} 
                  className="w-full"
                  disabled={isProcessingAi || !aiPrompt.trim()}
                >
                  {isProcessingAi ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
                
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                
                {aiResponse && (
                  <Alert>
                    <AlertTitle>AI Generated Content</AlertTitle>
                    <AlertDescription className="max-h-[200px] overflow-y-auto whitespace-pre-line">
                      {aiResponse}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>
                  {messageType === 'letter' && 'Write Your Letter'}
                  {messageType === 'video' && 'Record Your Video'}
                  {messageType === 'audio' && 'Record Your Audio'}
                  {messageType === 'document' && 'Upload Your Document'}
                </CardTitle>
                <CardDescription>
                  {messageType === 'letter' && 'Compose a personal letter for your recipient'}
                  {messageType === 'video' && 'Record a video message for your recipient'}
                  {messageType === 'audio' && 'Record an audio message for your recipient'}
                  {messageType === 'document' && 'Upload a document to share with your recipient'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="h-full">
                  {messageType === 'letter' && (
                    <TankLetterCreator 
                      onContentChange={handleContentUpdated}
                      onTitleChange={setTitle}
                      onRecipientChange={setRecipientName}
                    />
                  )}
                  {messageType === 'video' && (
                    <TankVideoCreator 
                      onContentChange={handleContentUpdated}
                      onTitleChange={setTitle}
                      onRecipientChange={setRecipientName}
                    />
                  )}
                  {messageType === 'audio' && (
                    <TankAudioCreator 
                      onContentChange={handleContentUpdated}
                      onTitleChange={setTitle}
                      onRecipientChange={setRecipientName}
                    />
                  )}
                  {messageType === 'document' && (
                    <TankDocumentCreator 
                      onContentChange={handleContentUpdated}
                      onTitleChange={setTitle}
                      onRecipientChange={setRecipientName}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/tank')}
                className="mr-2"
              >
                Cancel
              </Button>
              
              <Button 
                onClick={saveMessage}
                disabled={isCreatingMessage || !title || !recipientName || !recipientEmail || !date || !preview}
              >
                {isCreatingMessage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Message'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
