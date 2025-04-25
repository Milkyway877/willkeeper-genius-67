import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Send,
  User,
  Bot,
  Loader2,
  Check,
  FileText,
  RefreshCw,
  ArrowRight,
  Mic,
  MicOff,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type AIQuestionFlowProps = {
  selectedTemplate: any;
  responses: Record<string, any>;
  setResponses: (responses: Record<string, any>) => void;
  onComplete: (responses: Record<string, any>, generatedWill: string) => void;
};

type TemplateInfo = {
  name: string;
  key: string;
  completionKey?: string;
  questions: string[];
  systemMessage: string;
};

export function AIQuestionFlow({
  selectedTemplate,
  responses,
  setResponses,
  onComplete
}: AIQuestionFlowProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeVoiceInput, setActiveVoiceInput] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [conversationCompleted, setConversationCompleted] = useState(false);
  const [showNextStepButton, setShowNextStepButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const conversationHistoryRef = useRef<any[]>([]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecordingSupported(true);
    }
  }, []);

  const initSpeechRecognition = useCallback(() => {
    if (!recordingSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInputValue(prev => prev + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }
        setTranscribedText(interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setActiveVoiceInput(false);
        toast({
          title: "Voice Input Error",
          description: "There was a problem with voice recognition. Please try again or type your response.",
          variant: "destructive"
        });
      };
      
      recognitionRef.current.onend = () => {
        setActiveVoiceInput(false);
      };
    }
  }, [recordingSupported, toast]);

  const toggleVoiceInput = useCallback(() => {
    if (activeVoiceInput) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setActiveVoiceInput(false);
      setTranscribedText('');
    } else {
      initSpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setActiveVoiceInput(true);
      }
    }
  }, [activeVoiceInput, initSpeechRecognition]);

  useEffect(() => {
    if (!selectedTemplate) return;
    
    let welcomeMessage = '';
    
    if (selectedTemplate.id === 'traditional') {
      welcomeMessage = `👋 Hello! I'm your AI will assistant, and I'll be guiding you through creating a traditional will. I'll ask you a series of questions to gather all the necessary information. Let's start with the basics: What is your full legal name?`;
    } else if (selectedTemplate.id === 'digital-assets') {
      welcomeMessage = `👋 Hello! I'm your AI will assistant specializing in digital assets. I'll help you create a will that properly addresses your online accounts, cryptocurrency, and other digital property. Let's start with the basics: What is your full legal name?`;
    } else if (selectedTemplate.id === 'living-trust') {
      welcomeMessage = `👋 Hello! I'm your AI will assistant specializing in living trusts. I'll guide you through creating a trust that can help manage your assets during your lifetime and distribute them after your passing. Let's start with the basics: What is your full legal name?`;
    } else {
      welcomeMessage = `👋 Hello! I'm your AI will assistant. I'll help you create a comprehensive will tailored to your needs. Let's start with the basics: What is your full legal name?`;
    }
    
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }
    ]);
    
    conversationHistoryRef.current = [
      { role: 'assistant', content: welcomeMessage }
    ];
  }, [selectedTemplate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);
  
  const extractInformationFromConversation = useCallback(() => {
    const extractedResponses: Record<string, any> = { ...responses };
    let userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    
    const nameMatch = userMessages.find(msg => 
      /^(my name is|I am|I'm) ([A-Z][a-z]+ [A-Z][a-z]+)/i.test(msg)
    );
    if (nameMatch) {
      const nameRegex = /^(?:my name is|I am|I'm) ([A-Z][a-z]+ [A-Z][a-z]+)/i;
      const match = nameMatch.match(nameRegex);
      if (match && match[1]) {
        extractedResponses.fullName = match[1];
      }
    }
    
    const maritalStatusMatch = userMessages.find(msg => 
      /(single|married|divorced|widowed)/i.test(msg) && 
      /status/i.test(msg)
    );
    if (maritalStatusMatch) {
      if (maritalStatusMatch.match(/single/i)) extractedResponses.maritalStatus = 'Single';
      else if (maritalStatusMatch.match(/married/i)) extractedResponses.maritalStatus = 'Married';
      else if (maritalStatusMatch.match(/divorced/i)) extractedResponses.maritalStatus = 'Divorced';
      else if (maritalStatusMatch.match(/widowed/i)) extractedResponses.maritalStatus = 'Widowed';
    }
    
    if (extractedResponses.maritalStatus === 'Married') {
      const spouseMatch = userMessages.find(msg => 
        /spouse|wife|husband|partner/i.test(msg) && 
        /name/i.test(msg)
      );
      if (spouseMatch) {
        const nameRegex = /(?:spouse|wife|husband|partner)(?:'s| is| name is)? ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i;
        const match = spouseMatch.match(nameRegex);
        if (match && match[1]) {
          extractedResponses.spouseName = match[1];
        }
      }
    }
    
    const childrenMatch = userMessages.find(msg => 
      /(have|has) (no |[0-9]+) (child|children)/i.test(msg)
    );
    if (childrenMatch) {
      if (childrenMatch.match(/no child/i)) {
        extractedResponses.hasChildren = false;
      } else {
        extractedResponses.hasChildren = true;
        
        const childrenNamesMatch = userMessages.find(msg => 
          /(children|kids) (are|named|:) /i.test(msg)
        );
        if (childrenNamesMatch) {
          const childrenNames = childrenNamesMatch.replace(/(my|the) (children|kids) (are|named|:) /i, '');
          extractedResponses.childrenNames = childrenNames;
        }
      }
    }
    
    const executorMatch = userMessages.find(msg => 
      /executor/i.test(msg) && 
      /name/i.test(msg)
    );
    if (executorMatch) {
      const nameRegex = /executor (?:is|would be|will be|should be) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i;
      const match = executorMatch.match(nameRegex);
      if (match && match[1]) {
        extractedResponses.executorName = match[1];
      }
    }
    
    const residualMatch = userMessages.find(msg => 
      /(residual|remainder|rest|remaining)/i.test(msg) && 
      /(estate|assets|property)/i.test(msg)
    );
    if (residualMatch) {
      extractedResponses.residualEstate = residualMatch;
    }
    
    if (selectedTemplate.id === 'digital-assets') {
      const digitalAssetsMatch = userMessages.find(msg => 
        /(cryptocurrency|crypto|bitcoin|ethereum|nft|digital assets|online accounts)/i.test(msg)
      );
      if (digitalAssetsMatch) {
        extractedResponses.digitalAssets = true;
        extractedResponses.digitalAssetsDetails = digitalAssetsMatch;
      }
    }
    
    setResponses(extractedResponses);
    return extractedResponses;
  }, [messages, responses, selectedTemplate, setResponses]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() !== '' && !isProcessing && !conversationCompleted) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isProcessing || conversationCompleted) return;
    
    if (activeVoiceInput) {
      toggleVoiceInput();
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push({ role: 'user', content: inputValue });
    
    setInputValue('');
    setTranscribedText('');
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gpt-will-assistant', {
        body: { 
          query: inputValue,
          template_type: selectedTemplate?.id || 'traditional',
          conversation_history: conversationHistoryRef.current
        }
      });
      
      if (error) {
        throw new Error(`Error calling AI assistant: ${error.message}`);
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data?.response || 'I apologize, but I encountered an issue processing your request. Could you please try again?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      conversationHistoryRef.current.push({ role: 'assistant', content: aiMessage.content });
      
      checkForCompletion(aiMessage.content);
      
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Connection Error',
        description: 'There was a problem connecting to the AI assistant. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const checkForCompletion = (lastAiMessage: string) => {
    const completionPhrases = [
      'we have all the information',
      'we\'ve collected all the necessary information',
      'that completes all the',
      'we now have everything we need',
      'that covers all the essential information',
      'now ready to generate your will',
      'now i have all the information needed',
      'i have all the information i need',
      'i\'ve gathered all the necessary information',
      'would you like to review',
      'shall we proceed to',
      'thank you for providing all the information',
      'we can now proceed to',
      'we are done with this part',
      'let\'s proceed to',
      'we can move on to'
    ];
    
    const isComplete = completionPhrases.some(phrase => 
      lastAiMessage.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (isComplete || messages.length >= 15) {
      setAllQuestionsAnswered(true);
      
      if (!conversationCompleted) {
        setTimeout(() => {
          const conclusionMessage: Message = {
            id: `conclusion-${Date.now()}`,
            role: 'system',
            content: '✅ We have completed the information gathering phase for your will. Click the "Next Step" button below to proceed to the contacts collection stage.',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, conclusionMessage]);
          setConversationCompleted(true);
          setShowNextStepButton(true);
          
          setTimeout(() => {
            setInputValue('');
          }, 300);
        }, 800);
      }
    }
  };
  
  const handleGenerateWill = async () => {
    setIsGenerating(true);
    
    try {
      const extractedResponses = extractInformationFromConversation();
      
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 95) {
          clearInterval(progressInterval);
        } else {
          setProgress(progress);
        }
      }, 200);
      
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        const generatedWill = generateWillContent(selectedTemplate, extractedResponses);
        
        setTimeout(() => {
          onComplete(extractedResponses, generatedWill);
        }, 1000);
      }, 3000);
    } catch (error) {
      console.error('Error generating will:', error);
      
      toast({
        title: 'Error Generating Will',
        description: 'There was a problem generating your will. Please try again.',
        variant: 'destructive'
      });
      
      setIsGenerating(false);
      setProgress(0);
    }
  };
  
  const handleNextStep = () => {
    const extractedResponses = extractInformationFromConversation();
    
    const generatedWill = generateWillContent(selectedTemplate, extractedResponses);
    
    onComplete(extractedResponses, generatedWill);
  };
  
  const generateWillContent = (template: any, responses: Record<string, any>): string => {
    if (template.id === 'traditional') {
      return `LAST WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[NAME]'}

I, ${responses.fullName || '[NAME]'}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am ${responses.maritalStatus || '[MARITAL STATUS]'}${responses.spouseName ? ` to ${responses.spouseName}` : ''}.
${responses.hasChildren ? `I have the following children: ${responses.childrenNames || '[CHILDREN NAMES]'}.` : 'I have no children.'}

ARTICLE III: EXECUTOR
I appoint ${responses.executorName || '[EXECUTOR NAME]'} as the Executor of this Will.
${responses.alternateExecutor ? `If they are unable or unwilling to serve, I appoint ${responses.alternateExecutorName || '[ALTERNATE EXECUTOR]'} as alternate Executor.` : ''}

${responses.guardianNeeded ? `ARTICLE IV: GUARDIAN
If needed, I appoint ${responses.guardianName || '[GUARDIAN NAME]'} as guardian of my minor children.` : ''}

ARTICLE ${responses.guardianNeeded ? 'V' : 'IV'}: DISPOSITION OF PROPERTY
${responses.specificBequests ? `I make the following specific bequests: ${responses.bequestsDetails || '[SPECIFIC BEQUESTS]'}` : ''}

I give all my remaining property to ${responses.residualEstate || '[BENEFICIARIES]'}.

ARTICLE ${responses.guardianNeeded ? 'VI' : 'V'}: DIGITAL ASSETS
${responses.digitalAssets ? `I direct my Executor regarding my digital assets as follows: ${responses.digitalAssetsDetails || '[DIGITAL ASSETS DETAILS]'}` : 'I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.'}

Signed: ${responses.fullName || '[NAME]'}
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]`;
    } else if (template.id === 'digital-assets') {
      return `DIGITAL ASSET WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[NAME]'}

I, ${responses.fullName || '[NAME]'}, being of sound mind, declare this to be my Digital Asset Will and Testament.

ARTICLE I: DIGITAL EXECUTOR
I appoint ${responses.executorName || '[DIGITAL EXECUTOR]'} as my Digital Executor with authority to manage all my digital assets.

ARTICLE II: CRYPTOCURRENCY ASSETS
${responses.digitalAssetsDetails?.includes('crypto') ? `My cryptocurrency assets include: ${responses.digitalAssetsDetails || '[CRYPTOCURRENCY DETAILS]'}` : 'I have no cryptocurrency assets.'}

ARTICLE III: NFT ASSETS
${responses.digitalAssetsDetails?.includes('nft') ? `My NFT holdings include: ${responses.digitalAssetsDetails || '[NFT DETAILS]'}` : 'I have no NFT assets.'}

ARTICLE IV: SOCIAL MEDIA ACCOUNTS
${responses.digitalAssetsDetails?.includes('social') ? `My social media accounts include: ${responses.digitalAssetsDetails || '[SOCIAL MEDIA ACCOUNTS]'}` : 'My social media accounts should be handled according to the individual platform policies.'}

ARTICLE V: EMAIL ACCOUNTS
${responses.digitalAssetsDetails?.includes('email') ? `My email accounts include: ${responses.digitalAssetsDetails || '[EMAIL ACCOUNTS]'}` : 'My email accounts should be closed after important information is saved.'}

ARTICLE VI: ACCESS INFORMATION
${responses.digitalAssetsDetails?.includes('password') ? `My access information is stored in: ${responses.digitalAssetsDetails || '[PASSWORD MANAGER DETAILS]'}` : 'I have provided separate secure instructions for accessing my digital accounts.'}

ARTICLE VII: DIGITAL LEGACY PREFERENCES
My preferences for my digital legacy are: ${responses.digitalAssetsDetails || '[DIGITAL LEGACY PREFERENCES]'}

Signed: ${responses.fullName || '[NAME]'}
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]`;
    } else {
      return `LAST WILL AND TESTAMENT OF ${responses.fullName?.toUpperCase() || '[NAME]'}

I, ${responses.fullName || '[NAME]'}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: EXECUTOR
I appoint ${responses.executorName || '[EXECUTOR NAME]'} as the Executor of this Will.

ARTICLE III: DISPOSITION OF PROPERTY
I give all my property to my beneficiaries as follows: ${responses.residualEstate || '[BENEFICIARIES]'}

Signed: ${responses.fullName || '[NAME]'}
Date: [Current Date]
Witnesses: [Witness 1], [Witness 2]`;
    }
  };

  return (
    <div className="flex flex-col h-[65vh]">
      <Card className="flex-1 flex flex-col overflow-hidden h-full">
        <CardHeader className="flex-shrink-0 border-b p-4">
          <div className="flex items-center">
            <div className="bg-willtank-50 p-1 rounded-full">
              <Bot className="h-6 w-6 text-willtank-600" />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold">Will AI Assistant</h3>
              <p className="text-xs text-gray-500">Powered by GPT-4o-mini</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-y-auto">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-black text-white ml-4 rounded-tr-none'
                        : message.role === 'assistant'
                        ? 'bg-gray-100 text-gray-800 mr-4 rounded-tl-none'
                        : message.role === 'system'
                        ? 'bg-willtank-50 text-willtank-800 mx-auto border border-willtank-200'
                        : 'bg-rose-100 text-red-800 mx-auto'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === 'assistant' ? (
                        <div className="flex items-center">
                          <Bot className="h-4 w-4 mr-2 text-willtank-600" />
                          <span className="text-xs font-semibold text-willtank-600">Will Assistant</span>
                        </div>
                      ) : message.role === 'user' ? (
                        <div className="flex items-center ml-auto">
                          <span className="text-xs font-semibold text-gray-200">You</span>
                          <User className="h-4 w-4 ml-2 text-gray-200" />
                        </div>
                      ) : message.role === 'system' ? (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-willtank-600" />
                          <span className="text-xs font-semibold text-willtank-600">System</span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-red-800">System</span>
                      )}
                    </div>
                    <p className="whitespace-pre-line text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1 flex justify-end">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg mr-4 rounded-tl-none">
                    <div className="flex items-center mb-1">
                      <Bot className="h-4 w-4 mr-2 text-willtank-600" />
                      <span className="text-xs font-semibold text-willtank-600">Will Assistant</span>
                    </div>
                    <div className="flex items-center">
                      <div className="dot-flashing"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeVoiceInput && transcribedText && (
                <div className="flex justify-end">
                  <div className="bg-gray-100 text-gray-500 p-3 rounded-lg ml-4 rounded-tr-none border border-dashed border-gray-300">
                    <div className="flex items-center mb-1">
                      <div className="flex items-center ml-auto">
                        <span className="text-xs font-semibold text-gray-500">Transcribing...</span>
                        <Mic className="h-4 w-4 ml-2 text-gray-500" />
                      </div>
                    </div>
                    <p className="text-sm italic">{transcribedText}</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        
        {!allQuestionsAnswered ? (
          <div className="p-4 border-t flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={conversationCompleted ? "Conversation completed. Click Next Step." : "Type your message..."}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isProcessing || conversationCompleted}
                className={`pr-10 ${activeVoiceInput ? 'bg-willtank-50' : ''} ${conversationCompleted ? 'bg-gray-100' : ''}`}
              />
              {recordingSupported && !conversationCompleted && (
                <Button
                  size="sm"
                  variant="ghost"
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                    activeVoiceInput ? 'text-willtank-600' : 'text-gray-400'
                  }`}
                  onClick={toggleVoiceInput}
                  disabled={conversationCompleted}
                >
                  {activeVoiceInput ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={inputValue.trim() === '' || isProcessing || conversationCompleted}
              className="shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <div className="p-4 border-t">
            {isGenerating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Generating your will document</span>
                  <span className="text-sm">{progress}%</span>
                </div>
                
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-willtank-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-500">
                  {progress < 30 && "Analyzing your responses..."}
                  {progress >= 30 && progress < 60 && "Structuring your will document..."}
                  {progress >= 60 && progress < 90 && "Generating legal clauses..."}
                  {progress >= 90 && "Finalizing your document..."}
                </p>
              </div>
            ) : showNextStepButton ? (
              <div className="text-center">
                <Button 
                  onClick={handleNextStep} 
                  className="w-full pulse-animation"
                  size="lg"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next Step: Contact Information
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  You've provided all the necessary information. Proceed to enter contact details for key people in your will.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Button 
                  onClick={handleGenerateWill} 
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate My Will Document
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  You've provided all the necessary information. Click to generate your will document.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
      
      <style>
        {`
        .dot-flashing {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
        }
        .dot-flashing::before, .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 1s;
        }

        @keyframes dot-flashing {
          0% {
            background-color: #9880ff;
          }
          50%, 100% {
            background-color: rgba(152, 128, 255, 0.2);
          }
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 rgba(0, 0, 0, 0.2);
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
          }
        }
        `}
      </style>
    </div>
  );
}
