
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  onComplete?: (data: {
    extractedData: Record<string, any>;
    generatedContent: string;
    contacts: any[];
    documents: any[];
  }) => void;
}

export function WillChat({ templateId, templateName, onContentUpdate, willContent, onComplete }: WillChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [contacts, setContacts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [lastUpdatedField, setLastUpdatedField] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const willDraftIdRef = useRef<string | null>(localStorage.getItem('currentWillDraftId'));
  
  // Track user information in a structured way
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
    digitalAssets: [] as {type: string, details: string, recipient?: string}[],
    // Track which fields have been updated
    updatedFields: {} as Record<string, boolean>,
    lastUpdatedField: ""
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
    
    // Initialize the document with template content
    const initialContent = getInitialContent(templateId);
    console.log("[WillChat] Initializing will content:", initialContent.substring(0, 50) + "...");
    onContentUpdate(initialContent);

    // Load previously extracted data from localStorage if available
    const savedData = localStorage.getItem(`will_extracted_data_${willDraftIdRef.current}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setUserInfo(prevInfo => ({
          ...prevInfo,
          ...parsedData
        }));
        setExtractedData(parsedData);
        
        // Generate updated content with the loaded data
        setTimeout(() => {
          const updatedContent = generateWillContent({
            ...userInfo,
            ...parsedData
          });
          onContentUpdate(updatedContent);
        }, 100);
      } catch (e) {
        console.error("Error parsing saved extracted data:", e);
      }
    }
  }, [templateId, templateName]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
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
  
  const getInitialContent = (templateId: string): string => {
    const placeholders: Record<string, string> = {
      'basic': 'LAST WILL AND TESTAMENT\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament.',
      'family': 'FAMILY PROTECTION WILL\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament, with special provisions for the care and protection of my family.',
      'business': 'BUSINESS OWNER WILL\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament, with special provisions for my business assets and succession planning.',
      'complex': 'COMPLEX ESTATE WILL\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament, addressing my extensive holdings and complex distribution wishes.',
      'living': 'LIVING WILL AND HEALTHCARE DIRECTIVES\n\nI, [YOUR NAME], being of sound mind, declare these to be my Healthcare Directives and wishes regarding medical treatment.',
      'digital-assets': 'DIGITAL ASSETS WILL\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament, with special provisions for my digital assets, accounts and properties.'
    };
    
    return placeholders[templateId] || 'LAST WILL AND TESTAMENT\n\nI, [YOUR NAME], being of sound mind, declare this to be my Last Will and Testament.';
  };

  // Save extracted data to localStorage and Supabase
  const saveExtractedData = useCallback(async (data: Record<string, any>) => {
    if (!willDraftIdRef.current) return;
    
    // Save to localStorage for immediate access
    localStorage.setItem(`will_extracted_data_${willDraftIdRef.current}`, JSON.stringify(data));
    
    // Save to Supabase for persistence
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("Authentication error:", sessionError);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Check if a conversation record exists for this will
      const { data: existingConversation, error: fetchError } = await supabase
        .from('will_ai_conversations')
        .select('*')
        .eq('will_id', willDraftIdRef.current)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching conversation data:", fetchError);
        return;
      }
      
      // Prepare conversation data
      const conversationData = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }));
      
      if (existingConversation) {
        // Update existing conversation
        const { error: updateError } = await supabase
          .from('will_ai_conversations')
          .update({
            conversation_data: conversationData,
            extracted_entities: data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id);
        
        if (updateError) {
          console.error("Error updating conversation data:", updateError);
        } else {
          console.log("Successfully updated conversation data in Supabase");
        }
      } else {
        // Create new conversation
        const { error: insertError } = await supabase
          .from('will_ai_conversations')
          .insert({
            will_id: willDraftIdRef.current,
            conversation_data: conversationData,
            extracted_entities: data
          });
        
        if (insertError) {
          console.error("Error inserting conversation data:", insertError);
        } else {
          console.log("Successfully saved conversation data to Supabase");
        }
      }
    } catch (error) {
      console.error("Error saving extracted data:", error);
    }
  }, [messages]);
  
  // Function to extract information after each message exchange - now optimized with better patterns
  const extractAndUpdateInfo = useCallback(() => {
    let updatedInfo = { ...userInfo };
    let contentUpdated = false;
    let lastField = "";
    
    console.log("[WillChat] Extracting info from all messages");
    
    // We'll analyze the conversation as a whole to capture context
    let conversationContext = '';
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    // Aggregate user messages to build context
    userMessages.forEach(msg => {
      conversationContext += msg.content + ' ';
    });
    
    // Look through individual messages for specific pieces of information
    for (const message of messages) {
      // Skip system messages
      if (message.role === 'system') {
        continue;
      }
      
      const content = message.content.toLowerCase();
      
      // Skip if the message contains the assistant's self-introduction
      if (content.includes("i'm skyler") || content.includes("i am skyler")) {
        continue;
      }
      
      // 1. Extract full name (improved patterns)
      if (message.role === 'user') {
        // Check for direct name input (just a name with no other context)
        if (content.trim().split(' ').length >= 2 && 
            /^[A-Za-z][a-z]+ [A-Za-z][a-z]+$/i.test(content.trim()) &&
            !updatedInfo.fullName) {
          updatedInfo.fullName = content.trim();
          updatedInfo.updatedFields.name = true;
          lastField = "name";
          contentUpdated = true;
        }
        
        // Look for "my name is" patterns with improved flexibility
        const namePatterns = [
          /(?:my name is|I am|I'm|name|call me) ([A-Za-z\s.'-]+)/i,
          /(?:I'm|I am) ([A-Za-z\s.'-]+)/i,
          /(?:I,) ([A-Za-z\s.'-]+)/i,
          /(?:name:?) ([A-Za-z\s.'-]+)/i
        ];
        
        for (const pattern of namePatterns) {
          const nameMatch = message.content.match(pattern);
          if (nameMatch && nameMatch[1]) {
            const possibleName = nameMatch[1].trim();
            // Avoid extracting "Skyler" as the name (it's the AI assistant)
            if (!possibleName.toLowerCase().includes("skyler") && 
                !possibleName.toLowerCase().includes("assistant") &&
                possibleName.split(' ').length >= 2) {
              updatedInfo.fullName = possibleName;
              updatedInfo.updatedFields.name = true;
              lastField = "name";
              contentUpdated = true;
              break;
            }
          }
        }
      }
      
      // Look for names in AI responses (confirmation patterns)
      if (message.role === 'assistant' && !updatedInfo.fullName) {
        const aiNameConfirmation = [
          /thank you,? ([A-Za-z\s.'-]+)\.? now/i,
          /hello ([A-Za-z\s.'-]+)!? let's/i,
          /thanks,? ([A-Za-z\s.'-]+)\./i
        ];
        
        for (const pattern of aiNameConfirmation) {
          const nameMatch = message.content.match(pattern);
          if (nameMatch && nameMatch[1]) {
            const possibleName = nameMatch[1].trim();
            if (!possibleName.toLowerCase().includes("skyler") && 
                !possibleName.toLowerCase().includes("assistant") &&
                possibleName.split(' ').length >= 1) {
              updatedInfo.fullName = possibleName;
              updatedInfo.updatedFields.name = true;
              lastField = "name";
              contentUpdated = true;
              break;
            }
          }
        }
      }
      
      // 2. Extract marital status with improved patterns
      const maritalStatusPatterns = [
        { pattern: /(?:I am|I'm) single|never married|not married|unmarried/i, status: "single" },
        { pattern: /(?:I am|I'm) married|I have a (husband|wife|spouse)|my (husband|wife|spouse)|(?:I am|I'm) (?:a )?(?:married|husband|wife)/i, status: "married" },
        { pattern: /(?:I am|I'm) divorced|(?:I am|I'm) separated/i, status: "divorced" },
        { pattern: /(?:I am|I'm) widowed|(?:I am|I'm) (?:a )?widow(?:er)?/i, status: "widowed" }
      ];
      
      for (const { pattern, status } of maritalStatusPatterns) {
        if (content.match(pattern) && updatedInfo.maritalStatus !== status) {
          updatedInfo.maritalStatus = status;
          updatedInfo.updatedFields.maritalStatus = true;
          lastField = "maritalStatus";
          contentUpdated = true;
          break;
        }
      }
      
      // 3. Extract spouse name with improved matching
      if (updatedInfo.maritalStatus === "married" || content.includes("married")) {
        const spousePatterns = [
          /(?:my wife|my husband|my spouse)(?:'s| is| name is| named|:) ([A-Za-z\s.'-]+)/i,
          /married to ([A-Za-z\s.'-]+)/i,
          /spouse is ([A-Za-z\s.'-]+)/i,
          /(?:wife|husband|spouse):? ([A-Za-z\s.'-]+)/i
        ];
        
        for (const pattern of spousePatterns) {
          const spouseMatch = message.content.match(pattern);
          if (spouseMatch && spouseMatch[1] && updatedInfo.spouseName !== spouseMatch[1].trim()) {
            updatedInfo.spouseName = spouseMatch[1].trim();
            updatedInfo.updatedFields.spouseName = true;
            lastField = "spouseName";
            contentUpdated = true;
            break;
          }
        }
      }
      
      // 4. Extract executor information with improved matching
      if (message.role === 'user') {
        const executorPatterns = [
          /(?:my executor|the executor|executor) (?:will be|should be|is|name is|:) ([A-Za-z\s.'-]+)/i,
          /(?:appoint|choose|select|want|name) ([A-Za-z\s.'-]+) as (?:my|the) executor/i,
          /executor:? ([A-Za-z\s.'-]+)/i
        ];
        
        for (const pattern of executorPatterns) {
          const executorMatch = message.content.match(pattern);
          if (executorMatch && executorMatch[1]) {
            const possibleExecutor = executorMatch[1].trim();
            if (!possibleExecutor.toLowerCase().includes("skyler") && 
                !possibleExecutor.toLowerCase().includes("assistant") &&
                updatedInfo.executor !== possibleExecutor) {
              updatedInfo.executor = possibleExecutor;
              updatedInfo.updatedFields.executor = true;
              lastField = "executor";
              contentUpdated = true;
              break;
            }
          }
        }
      }
      
      // 5. Extract address with improved matching
      if (message.role === 'user') {
        const addressPatterns = [
          /(?:I live|I reside|my address|I live at|my home is|I stay at|I am located at) (?:at )?([A-Za-z0-9\s,.'-]+)/i,
          /(?:address is|address:|home address is) ([A-Za-z0-9\s,.'-]+)/i,
          /(?:address:?) ([A-Za-z0-9\s,.'-]+)/i
        ];
        
        for (const pattern of addressPatterns) {
          const addressMatch = message.content.match(pattern);
          if (addressMatch && addressMatch[1]) {
            const possibleAddress = addressMatch[1].trim();
            if (possibleAddress.length > 5 && updatedInfo.address !== possibleAddress) {
              updatedInfo.address = possibleAddress;
              updatedInfo.updatedFields.address = true;
              lastField = "address";
              contentUpdated = true;
              
              // Extract city, state, zip if present in the address
              const cityStateZipPattern = /([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/i;
              const cityStateMatch = updatedInfo.address.match(cityStateZipPattern);
              if (cityStateMatch) {
                updatedInfo.city = cityStateMatch[1].trim();
                updatedInfo.state = cityStateMatch[2].trim();
                updatedInfo.zipCode = cityStateMatch[3].trim();
                updatedInfo.updatedFields.cityState = true;
              }
              break;
            }
          }
        }
      }
      
      // 6. Extract children information with improved matching
      const childrenPatterns = [
        /(?:I have|we have) (\d+) (child|children|kids|son|daughter|sons|daughters)/i,
        /my (child|children|kids|son|daughter|sons|daughters)(?:'s name is|'s names are|ren are)? ([A-Za-z\s,.'-]+)/i,
        /(?:children|child)(?:ren)?(?:'s names are|:) ([A-Za-z\s,.'-]+)/i,
        /(?:I have|we have) ([A-Za-z\s,.'-]+) and ([A-Za-z\s,.'-]+)(?: as my| as our)? (?:kids|children|sons|daughters)/i
      ];
      
      for (const pattern of childrenPatterns) {
        const childrenMatch = message.content.match(pattern);
        if (childrenMatch && message.role === 'user') {
          let childrenNames: string[] = [];
          
          if (childrenMatch[1] && /\d+/.test(childrenMatch[1])) {
            // This matched "X children" pattern, look in the rest of the message for names
            const rest = message.content.substring(childrenMatch.index! + childrenMatch[0].length);
            // Try to extract names listed after mentioning number of children
            const namesPattern = /(?:named|called|:)?\s*([A-Za-z\s,.'-]+)/i;
            const namesMatch = rest.match(namesPattern);
            if (namesMatch && namesMatch[1]) {
              childrenNames = namesMatch[1].split(/,\s*|\s+and\s+|\s+&\s+/).filter(Boolean).map(n => n.trim());
            }
          } else if (childrenMatch[2]) {
            // This matched a direct list of names
            childrenNames = childrenMatch[2].split(/,\s*|\s+and\s+|\s+&\s+/).filter(Boolean).map(n => n.trim());
          }
          // Special case for "I have X and Y as my children" pattern
          else if (childrenMatch[1] && childrenMatch[2]) {
            childrenNames = [childrenMatch[1].trim(), childrenMatch[2].trim()];
          }
          
          if (childrenNames.length > 0 && JSON.stringify(updatedInfo.children) !== JSON.stringify(childrenNames)) {
            updatedInfo.children = childrenNames;
            updatedInfo.updatedFields.children = true;
            lastField = "children";
            contentUpdated = true;
          }
          break;
        }
      }
      
      // 7. Extract asset information with improved matching
      if (message.role === 'user') {
        const assetPatterns = [
          { pattern: /(?:my house|my home|my property|my real estate|my apartment|my condo) (?:is|at|located at|in|:) ([A-Za-z0-9\s,.'-]+)/i, type: "Real Estate" },
          { pattern: /(?:I have|I own) (?:a) (?:house|home|property|apartment|condo) (?:at|in|located at|:) ([A-Za-z0-9\s,.'-]+)/i, type: "Real Estate" },
          { pattern: /(?:my car|my vehicle|my automobile) (?:is|:) ([A-Za-z0-9\s,.'-]+)/i, type: "Vehicle" },
          { pattern: /(?:I have|I own) (?:a) (?:car|vehicle|automobile)(?::)? ([A-Za-z0-9\s,.'-]+)/i, type: "Vehicle" },
          { pattern: /(?:my savings|my bank account|my checking|my investment|my money) (?:is|at|with|:) ([A-Za-z0-9\s,.'-]+)/i, type: "Financial Assets" },
          { pattern: /(?:I have|I own) (?:savings|money|investments|accounts) (?:at|with|in|:) ([A-Za-z0-9\s,.'-]+)/i, type: "Financial Assets" }
        ];
        
        for (const { pattern, type } of assetPatterns) {
          const assetMatch = message.content.match(pattern);
          if (assetMatch && assetMatch[1]) {
            const assetDetails = assetMatch[1].trim();
            const newAsset = {
              name: type,
              value: assetDetails
            };
            
            const existingAssetIndex = updatedInfo.assets.findIndex(a => a.name === type);
            if (existingAssetIndex === -1) {
              // Add new asset
              updatedInfo.assets.push(newAsset);
              updatedInfo.updatedFields.assets = true;
              lastField = "assets";
              contentUpdated = true;
            } else if (updatedInfo.assets[existingAssetIndex].value !== assetDetails) {
              // Update existing asset
              updatedInfo.assets[existingAssetIndex].value = assetDetails;
              updatedInfo.updatedFields.assets = true;
              lastField = "assets";
              contentUpdated = true;
            }
          }
        }
        
        // Look for digital assets specifically for digital asset will type
        if (templateId === 'digital-assets') {
          const digitalAssetPatterns = [
            { pattern: /(?:my digital assets?|online accounts?|cryptocurrency|crypto|bitcoin|ethereum|nft) (?:include|is|are|:) ([A-Za-z0-9\s,.'-]+)/i, type: "Digital Assets" },
            { pattern: /(?:I have|I own) (?:digital assets?|online accounts?|cryptocurrency|crypto|bitcoin|ethereum|nft) (?::)? ([A-Za-z0-9\s,.'-]+)/i, type: "Digital Assets" }
          ];
          
          for (const { pattern, type } of digitalAssetPatterns) {
            const digitalAssetMatch = message.content.match(pattern);
            if (digitalAssetMatch && digitalAssetMatch[1]) {
              const assetDetails = digitalAssetMatch[1].trim();
              const digitalAsset = {
                type: type,
                details: assetDetails
              };
              
              const existingAssetIndex = updatedInfo.digitalAssets.findIndex(a => a.details === assetDetails);
              if (existingAssetIndex === -1) {
                updatedInfo.digitalAssets.push(digitalAsset);
                updatedInfo.updatedFields.digitalAssets = true;
                lastField = "digitalAssets";
                contentUpdated = true;
              }
            }
          }
        }
      }
    }
    
    // If we found new information, update state
    if (contentUpdated) {
      console.log("[WillChat] Content updated from message analysis, new info:", JSON.stringify(updatedInfo));
      updatedInfo.lastUpdatedField = lastField;
      setLastUpdatedField(lastField);
      setUserInfo(updatedInfo);
      setExtractedData(updatedInfo);
      
      // Save extracted data for persistence
      saveExtractedData(updatedInfo);
      
      // Update the will content
      const updatedWillContent = generateWillContent(updatedInfo);
      onContentUpdate(updatedWillContent);
    }

    return updatedInfo;
  }, [messages, userInfo, templateId, onContentUpdate, saveExtractedData]);
  
  // Run extraction whenever messages change
  useEffect(() => {
    if (messages.length > 1) {
      extractAndUpdateInfo();
    }
  }, [messages, extractAndUpdateInfo]);
  
  // Generate will content based on extracted information
  const generateWillContent = (info: typeof userInfo) => {
    // Generate will content based on template and extracted info
    let newContent = '';
    console.log("[WillChat] Generating will content with info:", JSON.stringify(info));
    
    if (templateId === 'digital-assets') {
      newContent = generateDigitalAssetsWill(info);
    } else if (templateId === 'business') {
      newContent = generateBusinessWill(info);
    } else {
      newContent = generateBasicWill(info);
    }
    
    return newContent;
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
      
      // Extract information after receiving AI response
      setTimeout(() => {
        extractAndUpdateInfo();
      }, 100);
      
      // Check for completion phrases to determine if we're done
      checkForCompletion(aiResponse);
      
    } catch (error) {
      console.error("[WillChat] Error processing message:", error);
      
      toast({
        title: "Communication Error",
        description: "There was a problem connecting to the AI assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to check for completion phrases to determine if we're done
  const checkForCompletion = (aiResponse: string) => {
    const completionPhrases = [
      /your will is now complete/i,
      /your will draft is ready/i,
      /we've completed your will/i,
      /all necessary information has been collected/i
    ];
    
    for (const phrase of completionPhrases) {
      if (aiResponse.match(phrase)) {
        setIsComplete(true);
        console.log("[WillChat] Will completion detected");
        break;
      }
    }
  };
  
  const toggleVoiceInput = () => {
    if (!recordingSupported) {
      toast({
        title: "Voice Recording Not Supported",
        description: "Your browser doesn't support voice recording. Please type your responses instead.",
        variant: "destructive"
      });
      return;
    }
    
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(prev => prev + ' ' + transcript);
          setIsRecording(false);
        };
        
        recognition.onerror = (event: any) => {
          console.error('[WillChat] Speech recognition error', event.error);
          setIsRecording(false);
          toast({
            title: "Voice Recognition Error",
            description: `Error: ${event.error}. Please try again or type your response.`,
            variant: "destructive"
          });
        };
        
        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } catch (error) {
        console.error('[WillChat] Error setting up speech recognition', error);
        setRecordingSupported(false);
        toast({
          title: "Voice Recording Error",
          description: "There was a problem setting up voice recording. Please type your responses.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle the completion process
  const handleComplete = () => {
    // Extract all information from the conversation
    const updatedInfo = extractAndUpdateInfo();
    
    // Generate the final will content
    const generatedContent = generateWillContent(updatedInfo);
    
    // Update the will content through the callback
    onContentUpdate(generatedContent);
    
    // If the parent component provided a completion handler, call it
    if (onComplete) {
      onComplete({
        extractedData: updatedInfo,
        generatedContent: generatedContent,
        contacts: contacts,
        documents: documents
      });
    }
  };
  
  // Generate will content based on template type and user information
  const generateBasicWill = (info: typeof userInfo): string => {
    let willContent = `LAST WILL AND TESTAMENT\n\n`;
    
    // Personal information section
    willContent += `I, ${info.fullName || '[YOUR NAME]'}, being of sound mind, declare this to be my Last Will and Testament. I revoke all wills and codicils previously made by me.\n\n`;
    
    // Residence information if available
    if (info.address || info.city || info.state || info.zipCode) {
      willContent += `RESIDENCE\n\n`;
      willContent += `At the time of executing this Will, I reside at ${info.address || '[ADDRESS]'}, ${info.city || '[CITY]'}, ${info.state || '[STATE]'} ${info.zipCode || '[ZIP CODE]'}.\n\n`;
    }
    
    // Family information if available
    if (info.maritalStatus || info.spouseName || (info.children && info.children.length > 0)) {
      willContent += `FAMILY INFORMATION\n\n`;
      
      // Add marital status info
      if (info.maritalStatus === 'single') {
        willContent += `I am currently single.\n\n`;
      } else if (info.maritalStatus === 'married') {
        willContent += `I am married to ${info.spouseName || '[SPOUSE NAME]'}.\n\n`;
      } else if (info.maritalStatus === 'divorced') {
        willContent += `I am divorced.\n\n`;
      } else if (info.maritalStatus === 'widowed') {
        willContent += `I am widowed.\n\n`;
      }
      
      // Add children info if available
      if (info.children && info.children.length > 0) {
        if (info.children.length === 1) {
          willContent += `I have one child, ${info.children[0]}.\n\n`;
        } else {
          willContent += `I have ${info.children.length} children: ${info.children.join(', ')}.\n\n`;
        }
      }
    }
    
    // Executor section
    willContent += `EXECUTOR\n\n`;
    willContent += `I appoint ${info.executor || '[EXECUTOR NAME]'} as the Executor of this Will.`;
    willContent += `\n\n`;
    
    // Assets and distribution section
    willContent += `DISTRIBUTION OF ESTATE\n\n`;
    if (info.assets && info.assets.length > 0) {
      info.assets.forEach(asset => {
        willContent += `I give my ${asset.name} to ${asset.recipient || '[BENEFICIARY]'}.\n`;
      });
      willContent += `\n`;
    } else {
      willContent += `I give all the rest and remainder of my estate to [PRIMARY BENEFICIARY].\n\n`;
    }
    
    willContent += `If none of my named beneficiaries survive me, I give my estate to [CONTINGENT BENEFICIARY].\n\n`;
    
    // Digital assets section if specified
    if (info.digitalAssets && info.digitalAssets.length > 0) {
      willContent += `DIGITAL ASSETS\n\n`;
      willContent += `I own the following digital assets:\n`;
      
      info.digitalAssets.forEach(asset => {
        willContent += `- ${asset.type}: ${asset.details}${asset.recipient ? ` - I give this to ${asset.recipient}` : ''}\n`;
      });
      
      willContent += `\n`;
    }
    
    // Signature section
    willContent += `IN WITNESS WHEREOF, I have signed this Will on ${new Date().toLocaleDateString()}.\n\n`;
    willContent += `____________________________\n`;
    willContent += `${info.fullName || '[TESTATOR NAME]'}\n\n`;
    willContent += `WITNESSES:\n\n`;
    willContent += `____________________________   ____________________________\n`;
    willContent += `Witness 1                      Witness 2\n\n`;
    
    return willContent;
  };
  
  const generateDigitalAssetsWill = (info: typeof userInfo): string => {
    let willContent = `DIGITAL ASSET WILL AND TESTAMENT OF ${info.fullName?.toUpperCase() || '[NAME]'}\n\n`;
    
    // Personal information section
    willContent += `I, ${info.fullName || '[YOUR NAME]'}, being of sound mind, declare this to be my Digital Asset Will and Testament.\n\n`;
    
    // Executor section
    willContent += `ARTICLE I: DIGITAL EXECUTOR\n\n`;
    willContent += `I appoint ${info.executor || '[DIGITAL EXECUTOR]'} as my Digital Executor with authority to manage all my digital assets.\n\n`;
    
    // Digital assets sections
    willContent += `ARTICLE II: CRYPTOCURRENCY ASSETS\n\n`;
    if (info.digitalAssets?.some(asset => asset.details.toLowerCase().includes('crypto') || 
                                asset.details.toLowerCase().includes('bitcoin') ||
                                asset.details.toLowerCase().includes('ethereum'))) {
      const cryptoAssets = info.digitalAssets.filter(asset => 
        asset.details.toLowerCase().includes('crypto') || 
        asset.details.toLowerCase().includes('bitcoin') ||
        asset.details.toLowerCase().includes('ethereum'));
      
      willContent += `My cryptocurrency assets include: ${cryptoAssets.map(asset => asset.details).join(', ')}\n\n`;
    } else {
      willContent += `I have no cryptocurrency assets.\n\n`;
    }
    
    willContent += `ARTICLE III: NFT ASSETS\n\n`;
    if (info.digitalAssets?.some(asset => asset.details.toLowerCase().includes('nft'))) {
      const nftAssets = info.digitalAssets.filter(asset => asset.details.toLowerCase().includes('nft'));
      willContent += `My NFT holdings include: ${nftAssets.map(asset => asset.details).join(', ')}\n\n`;
    } else {
      willContent += `I have no NFT assets.\n\n`;
    }
    
    willContent += `ARTICLE IV: SOCIAL MEDIA ACCOUNTS\n\n`;
    if (info.digitalAssets?.some(asset => asset.details.toLowerCase().includes('social') || 
                               asset.details.toLowerCase().includes('facebook') ||
                               asset.details.toLowerCase().includes('instagram') ||
                               asset.details.toLowerCase().includes('twitter'))) {
      const socialAccounts = info.digitalAssets.filter(asset => 
        asset.details.toLowerCase().includes('social') || 
        asset.details.toLowerCase().includes('facebook') ||
        asset.details.toLowerCase().includes('instagram') ||
        asset.details.toLowerCase().includes('twitter'));
      
      willContent += `My social media accounts include: ${socialAccounts.map(asset => asset.details).join(', ')}\n\n`;
    } else {
      willContent += `My social media accounts should be handled according to the individual platform policies.\n\n`;
    }
    
    willContent += `ARTICLE V: EMAIL ACCOUNTS\n\n`;
    if (info.digitalAssets?.some(asset => asset.details.toLowerCase().includes('email'))) {
      const emailAccounts = info.digitalAssets.filter(asset => asset.details.toLowerCase().includes('email'));
      willContent += `My email accounts include: ${emailAccounts.map(asset => asset.details).join(', ')}\n\n`;
    } else {
      willContent += `My email accounts should be closed after important information is saved.\n\n`;
    }
    
    willContent += `ARTICLE VI: ACCESS INFORMATION\n\n`;
    if (info.digitalAssets?.some(asset => asset.details.toLowerCase().includes('password'))) {
      const passwordInfo = info.digitalAssets.filter(asset => asset.details.toLowerCase().includes('password'));
      willContent += `My access information is stored in: ${passwordInfo.map(asset => asset.details).join(', ')}\n\n`;
    } else {
      willContent += `I have provided separate secure instructions for accessing my digital accounts.\n\n`;
    }
    
    willContent += `ARTICLE VII: DIGITAL LEGACY PREFERENCES\n\n`;
    if (info.digitalAssets && info.digitalAssets.length > 0) {
      willContent += `My preferences for my digital legacy are: ${info.digitalAssets.map(asset => asset.details).join('; ')}\n\n`;
    } else {
      willContent += `My preferences for my digital legacy are: [DIGITAL LEGACY PREFERENCES]\n\n`;
    }
    
    // Signature section
    willContent += `Signed: ${info.fullName || '[NAME]'}\n`;
    willContent += `Date: ${new Date().toLocaleDateString()}\n`;
    willContent += `Witnesses: [Witness 1], [Witness 2]\n`;
    
    return willContent;
  };
  
  const generateBusinessWill = (info: typeof userInfo): string => {
    let willContent = `BUSINESS OWNER WILL AND TESTAMENT OF ${info.fullName?.toUpperCase() || '[NAME]'}\n\n`;
    
    // Personal information section
    willContent += `I, ${info.fullName || '[YOUR NAME]'}, being of sound mind, declare this to be my Last Will and Testament, with special provisions for my business interests.\n\n`;
    
    // Family section
    willContent += `ARTICLE I: FAMILY INFORMATION\n\n`;
    if (info.maritalStatus === 'married') {
      willContent += `I am married to ${info.spouseName || '[SPOUSE NAME]'}.\n`;
    } else if (info.maritalStatus === 'single') {
      willContent += `I am single.\n`;
    } else if (info.maritalStatus === 'divorced') {
      willContent += `I am divorced.\n`;
    } else if (info.maritalStatus === 'widowed') {
      willContent += `I am widowed.\n`;
    }
    
    if (info.children && info.children.length > 0) {
      willContent += `I have ${info.children.length} children: ${info.children.join(', ')}.\n\n`;
    } else {
      willContent += `I have no children.\n\n`;
    }
    
    // Executor section
    willContent += `ARTICLE II: APPOINTMENT OF EXECUTOR\n\n`;
    willContent += `I appoint ${info.executor || '[EXECUTOR NAME]'} as the Executor of this Will.\n\n`;
    
    // Business interests section
    willContent += `ARTICLE III: BUSINESS INTERESTS\n\n`;
    if (info.assets && info.assets.some(asset => asset.name.toLowerCase().includes('business'))) {
      const businessAssets = info.assets.filter(asset => asset.name.toLowerCase().includes('business'));
      willContent += `I own the following business interests:\n\n`;
      businessAssets.forEach((asset, index) => {
        willContent += `${index + 1}. ${asset.value}\n`;
      });
      willContent += `\n`;
    } else {
      willContent += `I own the following business interests: [DESCRIBE BUSINESS INTERESTS]\n\n`;
    }
    
    // Business succession plan
    willContent += `ARTICLE IV: BUSINESS SUCCESSION PLAN\n\n`;
    willContent += `I direct that my business interests shall be: [CHOOSE ONE]\n`;
    willContent += `- Sold to [BUYER] at fair market value as determined by a qualified business appraiser\n`;
    willContent += `- Transferred to [SUCCESSOR] who shall continue the business operations\n`;
    willContent += `- Liquidated and distributed to my beneficiaries according to the terms of this Will\n\n`;
    
    // Remainder of estate
    willContent += `ARTICLE V: DISTRIBUTION OF REMAINDER\n\n`;
    willContent += `After addressing my business interests specifically, I direct that the remainder of my estate be distributed as follows: [DISTRIBUTION PLAN]\n\n`;
    
    // Signature section
    willContent += `IN WITNESS WHEREOF, I have signed this Will on ${new Date().toLocaleDateString()}.\n\n`;
    willContent += `____________________________\n`;
    willContent += `${info.fullName || '[TESTATOR NAME]'}\n\n`;
    willContent += `WITNESSES:\n\n`;
    willContent += `____________________________   ____________________________\n`;
    willContent += `Witness 1                      Witness 2\n\n`;
    
    return willContent;
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-willtank-600 text-white rounded-tr-none'
                  : message.role === 'system'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isProcessing}
            className="flex-1"
          />
          {recordingSupported && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleVoiceInput}
              disabled={isProcessing}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
          {isComplete && (
            <Button
              type="button"
              onClick={handleComplete}
              className="ml-2"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue
            </Button>
          )}
        </div>
        {isProcessing && (
          <div className="text-center mt-2">
            <div className="text-xs text-gray-500">Processing...</div>
          </div>
        )}
      </div>
    </div>
  );
}
