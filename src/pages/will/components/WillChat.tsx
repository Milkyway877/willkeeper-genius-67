
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
    beneficiaries: [] as string[],
    address: "",
    city: "",
    state: "",
    zipCode: "",
    spouseName: "",
    assets: [] as {name: string, value: string, recipient?: string}[],
    digitalAssets: [] as {type: string, details: string, recipient?: string}[]
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
    extractAndUpdateInfo();
  }, [messages]);
  
  // Also extract info from input as user types (real-time preview)
  useEffect(() => {
    if (inputValue.trim()) {
      extractPreviewInfo();
    }
  }, [inputValue]);
  
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
  
  const extractPreviewInfo = () => {
    // Extract info from current input as user types for real-time preview
    // This avoids waiting for the full message to be sent
    let updatedInfo = { ...userInfo };
    let contentUpdated = false;
    
    // Try to extract full name
    const nameMatch = inputValue.match(/(?:my name is|I am|I'm) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
    if (nameMatch && nameMatch[1] && updatedInfo.fullName !== nameMatch[1]) {
      updatedInfo.fullName = nameMatch[1];
      contentUpdated = true;
    }
    
    // Try to extract marital status
    if (inputValue.match(/single/i) && updatedInfo.maritalStatus !== "single") {
      updatedInfo.maritalStatus = "single";
      contentUpdated = true;
    } else if (inputValue.match(/married/i) && updatedInfo.maritalStatus !== "married") {
      updatedInfo.maritalStatus = "married";
      contentUpdated = true;
    }
    
    // Try to extract address info
    const addressMatch = inputValue.match(/address (?:is|:) ([^.]+)/i);
    if (addressMatch && addressMatch[1] && updatedInfo.address !== addressMatch[1]) {
      updatedInfo.address = addressMatch[1];
      contentUpdated = true;
    }
    
    // If we found new information, update will content for real-time preview
    if (contentUpdated) {
      // Just update locally but don't persist to state yet
      // This will be properly saved when the message is sent
      generateAndUpdateWillContent({ ...updatedInfo });
    }
  };
  
  const extractAndUpdateInfo = () => {
    let updatedInfo = { ...userInfo };
    let contentUpdated = false;
    
    // Look through user messages to extract information
    for (const message of messages) {
      // Skip system messages and the last assistant message
      if (message.role === 'system' || (message.role === 'assistant' && message === messages[messages.length - 1])) {
        continue;
      }
      
      if (message.role === 'user') {
        // Extract full name
        const nameMatch = message.content.match(/(?:my name is|I am|I'm|name:) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
        if (nameMatch && nameMatch[1] && updatedInfo.fullName !== nameMatch[1]) {
          updatedInfo.fullName = nameMatch[1];
          contentUpdated = true;
        }
        
        // Extract marital status
        if (message.content.match(/(?:I am|I'm) single/i) && updatedInfo.maritalStatus !== "single") {
          updatedInfo.maritalStatus = "single";
          contentUpdated = true;
        } else if (message.content.match(/(?:I am|I'm) married/i) && updatedInfo.maritalStatus !== "married") {
          updatedInfo.maritalStatus = "married";
          contentUpdated = true;
        } else if (message.content.match(/(?:I am|I'm) divorced/i) && updatedInfo.maritalStatus !== "divorced") {
          updatedInfo.maritalStatus = "divorced";
          contentUpdated = true;
        } else if (message.content.match(/(?:I am|I'm) widowed/i) && updatedInfo.maritalStatus !== "widowed") {
          updatedInfo.maritalStatus = "widowed";
          contentUpdated = true;
        }
        
        // Extract spouse name if married
        if (updatedInfo.maritalStatus === "married") {
          const spouseMatch = message.content.match(/(?:wife|husband|spouse)(?:'s| is| name is| named) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
          if (spouseMatch && spouseMatch[1] && updatedInfo.spouseName !== spouseMatch[1]) {
            updatedInfo.spouseName = spouseMatch[1];
            contentUpdated = true;
          }
        }
        
        // Extract executor information
        const executorMatch = message.content.match(/executor(?:'s| is| will be| should be| name is) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
        if (executorMatch && executorMatch[1] && updatedInfo.executor !== executorMatch[1]) {
          updatedInfo.executor = executorMatch[1];
          contentUpdated = true;
        }
        
        // Extract address
        const addressMatch = message.content.match(/address(?:'s| is| :) ([^.]+)/i);
        if (addressMatch && addressMatch[1] && updatedInfo.address !== addressMatch[1]) {
          updatedInfo.address = addressMatch[1].trim();
          contentUpdated = true;
          
          // Try to extract city, state, zip from address
          const cityStateMatch = updatedInfo.address.match(/([^,]+),\s*([A-Z]{2})\s*(\d{5}(-\d{4})?)/i);
          if (cityStateMatch) {
            updatedInfo.city = cityStateMatch[1].trim();
            updatedInfo.state = cityStateMatch[2].trim();
            updatedInfo.zipCode = cityStateMatch[3].trim();
          }
        }
        
        // Extract children information
        const childrenMatch = 
          message.content.match(/children(?:'s| are| named| :) ([^.]+)/i) || 
          message.content.match(/have (\d+) children(?: named| :)? ([^.]+)/i);
        
        if (childrenMatch) {
          let childrenText = childrenMatch[1];
          // If we matched the "have X children" pattern, use the second capture group
          if (childrenMatch[2]) childrenText = childrenMatch[2];
          
          const childrenNames = childrenText.split(/,\s*|\s+and\s+/).filter(Boolean);
          if (childrenNames.length > 0 && JSON.stringify(updatedInfo.children) !== JSON.stringify(childrenNames)) {
            updatedInfo.children = childrenNames;
            contentUpdated = true;
          }
        }
        
        // Extract asset information
        const assetMatches = message.content.match(/(?:I have|possess|own) ([^.]+)/ig);
        if (assetMatches) {
          for (const assetMatch of assetMatches) {
            // Look for common assets like house, car, bank account
            if (assetMatch.match(/house|property|real estate|land/i)) {
              const newAsset = {
                name: "Real Estate",
                value: assetMatch.replace(/(?:I have|possess|own) /i, '')
              };
              
              if (!updatedInfo.assets.some(a => a.name === newAsset.name && a.value === newAsset.value)) {
                updatedInfo.assets.push(newAsset);
                contentUpdated = true;
              }
            } else if (assetMatch.match(/car|vehicle|automobile/i)) {
              const newAsset = {
                name: "Vehicle",
                value: assetMatch.replace(/(?:I have|possess|own) /i, '')
              };
              
              if (!updatedInfo.assets.some(a => a.name === newAsset.name && a.value === newAsset.value)) {
                updatedInfo.assets.push(newAsset);
                contentUpdated = true;
              }
            }
          }
        }
        
        // Extract digital assets for digital asset wills
        if (templateId === 'digital-assets') {
          const digitalAssetMatches = message.content.match(/(?:digital assets include|I have|own|manage) ([^.]+) (?:accounts|wallets)/i);
          if (digitalAssetMatches && digitalAssetMatches[1]) {
            const assetTypes = digitalAssetMatches[1].split(/,\s*|\s+and\s+/).filter(Boolean);
            for (const assetType of assetTypes) {
              const newDigitalAsset = {
                type: assetType.trim(),
                details: `${assetType.trim()} account`
              };
              
              if (!updatedInfo.digitalAssets.some(a => a.type === newDigitalAsset.type)) {
                updatedInfo.digitalAssets.push(newDigitalAsset);
                contentUpdated = true;
              }
            }
          }
        }
      }
    }
    
    // If we found new information, update state and generate new will content
    if (contentUpdated) {
      setUserInfo(updatedInfo);
      generateAndUpdateWillContent(updatedInfo);
    }
  };
  
  const generateAndUpdateWillContent = (info: typeof userInfo) => {
    // Generate and update will content based on template and extracted info
    let newContent = '';
    
    if (templateId === 'digital-assets') {
      newContent = generateDigitalAssetsWill(info);
    } else if (templateId === 'business') {
      newContent = generateBusinessWill(info);
    } else {
      newContent = generateBasicWill(info);
    }
    
    // Call the parent component's onContentUpdate with the new content
    onContentUpdate(newContent);
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
    
    // Extract information immediately from the user's message
    // to update the preview without waiting for the AI response
    let tempUpdatedInfo = { ...userInfo };
    let tempContentUpdated = false;
    
    // Extract full name
    const nameMatch = userMessage.content.match(/(?:my name is|I am|I'm) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
    if (nameMatch && nameMatch[1] && tempUpdatedInfo.fullName !== nameMatch[1]) {
      tempUpdatedInfo.fullName = nameMatch[1];
      tempContentUpdated = true;
    }
    
    // Extract other information as in the main extraction function
    // This is a simplified version for immediate feedback
    
    if (tempContentUpdated) {
      // Update state and content immediately for responsive feedback
      setUserInfo(tempUpdatedInfo);
      generateAndUpdateWillContent(tempUpdatedInfo);
    }
    
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
      
      // Extract information from AI response as well
      extractInfoFromAIResponse(aiResponse);
      
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
  
  const extractInfoFromAIResponse = (aiResponse: string) => {
    // This function extracts info from AI responses
    // Often AI will confirm information or suggest next steps
    let updatedInfo = { ...userInfo };
    let contentUpdated = false;
    
    // Check for confirmation of user name
    const nameConfirmMatch = aiResponse.match(/(?:Thank you|thanks),\s+([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
    if (nameConfirmMatch && nameConfirmMatch[1] && !updatedInfo.fullName) {
      updatedInfo.fullName = nameConfirmMatch[1];
      contentUpdated = true;
    }
    
    // Check for confirmation of marital status
    if (aiResponse.match(/you are single/i) && !updatedInfo.maritalStatus) {
      updatedInfo.maritalStatus = "single";
      contentUpdated = true;
    } else if (aiResponse.match(/you are married/i) && !updatedInfo.maritalStatus) {
      updatedInfo.maritalStatus = "married";
      contentUpdated = true;
    }
    
    if (contentUpdated) {
      setUserInfo(updatedInfo);
      generateAndUpdateWillContent(updatedInfo);
    }
  };
  
  const generateBasicWill = (info: typeof userInfo): string => {
    return `LAST WILL AND TESTAMENT

I, ${info.fullName || "[YOUR NAME]"}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am ${info.maritalStatus || "[MARITAL STATUS]"}${info.spouseName ? ` and married to ${info.spouseName}` : ""}.
${info.children.length > 0 ? 
  `I have ${info.children.length} ${info.children.length === 1 ? "child" : "children"} as named below: ${info.children.join(', ')}.` : 
  "I have no children."}

${info.address ? `ARTICLE III: RESIDENCE\nMy current residence is at ${info.address}.` : ""}

ARTICLE ${info.address ? "IV" : "III"}: EXECUTOR
${info.executor ? 
  `I appoint ${info.executor} as the Executor of this Will.` : 
  "I appoint [EXECUTOR NAME] as the Executor of this Will."}

ARTICLE ${info.address ? "V" : "IV"}: DISTRIBUTION OF ESTATE
${info.beneficiaries.length > 0 ? 
  `I direct that my assets be distributed to ${info.beneficiaries.join(', ')}.` : 
  "I direct that my assets be distributed as follows:"}

${info.assets.length > 0 ? 
  info.assets.map(asset => 
    `${asset.name}: ${asset.value}${asset.recipient ? ` to ${asset.recipient}` : ""}`
  ).join('\n') : 
  ""}

Additional details will be incorporated as we continue our conversation.`;
  };
  
  const generateDigitalAssetsWill = (info: typeof userInfo): string => {
    return `DIGITAL ASSET WILL AND TESTAMENT

I, ${info.fullName || "[YOUR NAME]"}, being of sound mind, declare this to be my Digital Asset Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils relating to digital assets.

${info.address ? `ARTICLE II: RESIDENCE\nMy current residence is at ${info.address}.` : ""}

ARTICLE ${info.address ? "III" : "II"}: DIGITAL EXECUTOR
${info.executor ? 
  `I appoint ${info.executor} as the Digital Executor of this Will.` : 
  "I appoint [DIGITAL EXECUTOR NAME] as the Digital Executor of this Will."}

ARTICLE ${info.address ? "IV" : "III"}: DIGITAL ASSETS
My digital assets include:
${info.digitalAssets.length > 0 ? 
  info.digitalAssets.map(asset => `- ${asset.type}: ${asset.details}`).join('\n') : 
  `- [CRYPTOCURRENCY]
- [SOCIAL MEDIA ACCOUNTS]
- [EMAIL ACCOUNTS]`}

ARTICLE ${info.address ? "V" : "IV"}: ACCESS INSTRUCTIONS
Access instructions will be securely stored with my Digital Executor.

Additional details will be incorporated as we continue our conversation.`;
  };
  
  const generateBusinessWill = (info: typeof userInfo): string => {
    return `BUSINESS OWNER WILL AND TESTAMENT

I, ${info.fullName || "[YOUR NAME]"}, being of sound mind, declare this to be my Last Will and Testament with special provisions for my business interests.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

${info.address ? `ARTICLE II: RESIDENCE\nMy current residence is at ${info.address}.` : ""}

ARTICLE ${info.address ? "III" : "II"}: EXECUTOR
${info.executor ? 
  `I appoint ${info.executor} as the Executor of this Will.` : 
  "I appoint [EXECUTOR NAME] as the Executor of this Will."}

ARTICLE ${info.address ? "IV" : "III"}: BUSINESS INTERESTS
My business interests are to be handled as follows:

ARTICLE ${info.address ? "V" : "IV"}: SUCCESSION PLAN
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
        
        // Try to extract info from the transcript in real-time
        extractPreviewInfo();
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
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
      
      {/* Input area with typing indicator */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
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
        
        {!isRecording && inputValue && (
          <div className="text-xs text-gray-500 mt-1">
            <span>Typing preview: Will updates in real-time as you type...</span>
          </div>
        )}
      </div>
    </div>
  );
}
