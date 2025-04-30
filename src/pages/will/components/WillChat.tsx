
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send, Mic, MicOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface WillChatProps {
  templateId: string;
  templateName: string;
  onContentUpdate: (content: string) => void;
  willContent: string;
}

export function WillChat({ templateId, templateName, onContentUpdate, willContent }: WillChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  
  // Track user information for real-time updates
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    maritalStatus: "",
    children: [] as string[],
    executor: "",
    beneficiaries: [] as string[]
  });
  
  // Check if speech recognition is supported
  const [recordingSupported, setRecordingSupported] = useState(false);
  
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecordingSupported(true);
    }
  }, []);
  
  // Welcome message when component mounts
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [templateId, templateName]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Effect to extract information from messages and update will content in real-time
  useEffect(() => {
    const extractAndUpdateInfo = () => {
      let updatedInfo = { ...userInfo };
      let contentUpdated = false;
      
      // Look through user messages to extract information
      for (const message of messages) {
        if (message.role === 'user') {
          // Extract full name
          const nameMatch = message.content.match(/(?:my name is|I am|I'm) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
          if (nameMatch && nameMatch[1] && updatedInfo.fullName !== nameMatch[1]) {
            updatedInfo.fullName = nameMatch[1];
            contentUpdated = true;
          }
          
          // Extract marital status
          if (message.content.match(/single/i) && updatedInfo.maritalStatus !== "single") {
            updatedInfo.maritalStatus = "single";
            contentUpdated = true;
          } else if (message.content.match(/married/i) && updatedInfo.maritalStatus !== "married") {
            updatedInfo.maritalStatus = "married";
            contentUpdated = true;
          } else if (message.content.match(/divorced/i) && updatedInfo.maritalStatus !== "divorced") {
            updatedInfo.maritalStatus = "divorced";
            contentUpdated = true;
          } else if (message.content.match(/widowed/i) && updatedInfo.maritalStatus !== "widowed") {
            updatedInfo.maritalStatus = "widowed";
            contentUpdated = true;
          }
          
          // Extract executor information
          const executorMatch = message.content.match(/executor is ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
          if (executorMatch && executorMatch[1] && updatedInfo.executor !== executorMatch[1]) {
            updatedInfo.executor = executorMatch[1];
            contentUpdated = true;
          }
          
          // Extract children information
          const childrenMatch = message.content.match(/children are ([^.]+)/i) || message.content.match(/children: ([^.]+)/i);
          if (childrenMatch && childrenMatch[1]) {
            const childrenNames = childrenMatch[1].split(/,\s*|\s+and\s+/).filter(Boolean);
            if (childrenNames.length > 0 && JSON.stringify(updatedInfo.children) !== JSON.stringify(childrenNames)) {
              updatedInfo.children = childrenNames;
              contentUpdated = true;
            }
          }
        }
      }
      
      // If we found new information, update state and generate new will content
      if (contentUpdated) {
        setUserInfo(updatedInfo);
        
        // Generate and update will content based on template and extracted info
        let newContent = '';
        if (templateId === 'digital-assets') {
          newContent = generateDigitalAssetsWill(updatedInfo);
        } else if (templateId === 'business') {
          newContent = generateBusinessWill(updatedInfo);
        } else {
          newContent = generateBasicWill(updatedInfo);
        }
        
        // Call the parent component's onContentUpdate with the new content
        onContentUpdate(newContent);
      }
    };
    
    // Only run extraction if we have user messages
    if (messages.length > 1) {
      extractAndUpdateInfo();
    }
  }, [messages, templateId, onContentUpdate]);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const getWelcomeMessage = () => {
    let welcomeMessage = `👋 Hello! I'm Skyler, your AI will assistant. I'll guide you through creating a ${templateName}. Let's start with the basics. What is your full legal name?`;
    
    if (templateId === 'digital-assets') {
      welcomeMessage = `👋 Hello! I'm Skyler, your AI will assistant specializing in digital assets. I'll help you create a will that properly addresses your online accounts, cryptocurrency, and other digital property. Let's start with the basics. What is your full legal name?`;
    } else if (templateId === 'family') {
      welcomeMessage = `👋 Hello! I'm Skyler, your AI will assistant specializing in family protection. I'll help you create a will that ensures your loved ones are properly cared for. Let's start with the basics. What is your full legal name?`;
    } else if (templateId === 'business') {
      welcomeMessage = `👋 Hello! I'm Skyler, your AI will assistant specializing in business succession. I'll help you create a will that protects your business interests. Let's start with the basics. What is your full legal name?`;
    }
    
    return welcomeMessage;
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    if (isRecording) {
      toggleVoiceInput();
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gpt-will-assistant', {
        body: {
          query: inputValue,
          template_type: templateId,
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });
      
      if (error) {
        throw new Error(`Error calling AI assistant: ${error.message}`);
      }
      
      const aiResponse = data?.response || "I'm sorry, I couldn't generate a response. Let's try again.";
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Check for completion phrases to determine if we're done
      checkForCompletion(aiResponse);
      
    } catch (error) {
      console.error("Error processing message:", error);
      
      toast({
        title: "Communication Error",
        description: "There was a problem connecting to the AI assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const generateBasicWill = (info: typeof userInfo): string => {
    return `LAST WILL AND TESTAMENT

I, ${info.fullName || "[YOUR NAME]"}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am ${info.maritalStatus || "[MARITAL STATUS]"}.
${info.children.length > 0 ? 
  `I have ${info.children.length} children as named below: ${info.children.join(', ')}.` : 
  "I have no children."}

ARTICLE III: EXECUTOR
${info.executor ? 
  `I appoint ${info.executor} as the Executor of this Will.` : 
  "I appoint [EXECUTOR NAME] as the Executor of this Will."}

ARTICLE IV: DISTRIBUTION OF ESTATE
${info.beneficiaries.length > 0 ? 
  `I direct that my assets be distributed to ${info.beneficiaries.join(', ')}.` : 
  "I direct that my assets be distributed as follows:"}

Additional details will be incorporated as we continue our conversation.`;
  };
  
  const generateDigitalAssetsWill = (info: typeof userInfo): string => {
    return `DIGITAL ASSET WILL AND TESTAMENT

I, ${info.fullName || "[YOUR NAME]"}, being of sound mind, declare this to be my Digital Asset Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils relating to digital assets.

ARTICLE II: DIGITAL EXECUTOR
${info.executor ? 
  `I appoint ${info.executor} as the Digital Executor of this Will.` : 
  "I appoint [DIGITAL EXECUTOR NAME] as the Digital Executor of this Will."}

ARTICLE III: DIGITAL ASSETS
My digital assets include:
- [CRYPTOCURRENCY]
- [SOCIAL MEDIA ACCOUNTS]
- [EMAIL ACCOUNTS]

ARTICLE IV: ACCESS INSTRUCTIONS
Access instructions will be securely stored with my Digital Executor.

Additional details will be incorporated as we continue our conversation.`;
  };
  
  const generateBusinessWill = (info: typeof userInfo): string => {
    return `BUSINESS OWNER WILL AND TESTAMENT

I, ${info.fullName || "[YOUR NAME]"}, being of sound mind, declare this to be my Last Will and Testament with special provisions for my business interests.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: EXECUTOR
${info.executor ? 
  `I appoint ${info.executor} as the Executor of this Will.` : 
  "I appoint [EXECUTOR NAME] as the Executor of this Will."}

ARTICLE III: BUSINESS INTERESTS
My business interests are to be handled as follows:

ARTICLE IV: SUCCESSION PLAN
My business succession plan is as follows:

Additional details will be incorporated as we continue our conversation.`;
  };
  
  const checkForCompletion = (aiResponse: string) => {
    // Check if the AI response contains completion indicators
    const completionPhrases = [
      "we have all the information",
      "we've collected all the necessary information",
      "that completes all the",
      "we now have everything we need",
      "your will is now ready",
      "you can now proceed to",
      "that covers all the essential information"
    ];
    
    // Check for completion phrases and message count threshold
    const isComplete = completionPhrases.some(phrase => 
      aiResponse.toLowerCase().includes(phrase.toLowerCase())
    ) || messages.length >= 20;
    
    if (isComplete && !isComplete) {
      // Show completion message and button
      setTimeout(() => {
        const completionMessage: Message = {
          id: `completion-${Date.now()}`,
          role: 'system',
          content: "✅ Great! We have all the information needed for your will. You can now click the 'Proceed' button to continue to the next stage of creating your will.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setIsComplete(true);
      }, 1000);
    }
  };
  
  const initSpeechRecognition = () => {
    if (!recordingSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  };
  
  const toggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      initSpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleProceed = () => {
    // Save progress and navigate to the next stage
    toast({
      title: "Will Draft Complete",
      description: "Your will draft has been saved. You're ready to move to the next stage.",
      variant: "default",
    });
    
    // Navigate to wills page
    navigate('/wills');
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.role === 'system'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    : 'bg-muted text-muted-foreground border'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {/* Show proceed button when complete */}
          {isComplete && (
            <div className="flex justify-center mt-4">
              <Button onClick={handleProceed} className="bg-green-600 hover:bg-green-700">
                Proceed <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isProcessing ? "Waiting for response..." : "Type your message..."}
            disabled={isProcessing}
            className="flex-1"
          />
          
          {recordingSupported && (
            <Button
              onClick={toggleVoiceInput}
              variant="outline"
              type="button"
              disabled={isProcessing}
              className={isRecording ? "bg-red-100" : ""}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          
          <Button
            onClick={handleSendMessage}
            type="submit"
            disabled={isProcessing || !inputValue.trim()}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                <span>Sending...</span>
              </div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {isRecording && (
          <div className="text-xs text-center mt-1">
            <span className="text-red-500">●</span> Recording... Speak clearly.
          </div>
        )}
      </div>
    </div>
  );
}
