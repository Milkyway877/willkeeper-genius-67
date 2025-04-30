
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
  const [isPendingExtraction, setIsPendingExtraction] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const extractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track user information for real-time updates with a more structured approach
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
    // Track which fields have been updated to maintain order
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
  }, [templateId, templateName]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Effect to extract information from messages and update will content
  // Now runs only after a message is sent, not continuously
  useEffect(() => {
    if (isPendingExtraction) {
      // Add a small delay to ensure UI updates first
      extractionTimeoutRef.current = setTimeout(() => {
        extractAndUpdateInfo();
        setIsPendingExtraction(false);
      }, 500);
    }
    
    return () => {
      if (extractionTimeoutRef.current) {
        clearTimeout(extractionTimeoutRef.current);
      }
    };
  }, [isPendingExtraction, messages]);
  
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
  
  // Enhanced extraction function with better regex matching for various types of information
  const extractAndUpdateInfo = () => {
    let updatedInfo = { ...userInfo };
    let contentUpdated = false;
    let updatedField = "";
    
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
      
      const content = message.content;
      
      // Skip if the message contains the assistant's self-introduction
      if (content.includes("I'm Skyler") || content.includes("I am Skyler")) {
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
          updatedField = "PERSONAL INFORMATION";
          contentUpdated = true;
          console.log("[WillChat] Found direct name input:", updatedInfo.fullName);
        }
        
        // Look for "my name is" patterns
        const namePatterns = [
          /(?:my name is|I am|I'm|name|call me) ([A-Za-z\s.'-]+)/i,
          /(?:I'm|I am) ([A-Za-z\s.'-]+)/i,
          /(?:I,) ([A-Za-z\s.'-]+)/i
        ];
        
        for (const pattern of namePatterns) {
          const nameMatch = content.match(pattern);
          if (nameMatch && nameMatch[1]) {
            const possibleName = nameMatch[1].trim();
            // Avoid extracting "Skyler" as the name (it's the AI assistant)
            if (!possibleName.toLowerCase().includes("skyler") && 
                !possibleName.toLowerCase().includes("assistant") &&
                possibleName.split(' ').length >= 2) {
              updatedInfo.fullName = possibleName;
              updatedInfo.updatedFields.name = true;
              updatedField = "PERSONAL INFORMATION";
              contentUpdated = true;
              console.log("[WillChat] Found name:", updatedInfo.fullName);
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
          updatedField = "FAMILY INFORMATION";
          contentUpdated = true;
          console.log(`[WillChat] Found marital status: ${status}`);
          break;
        }
      }
      
      // 3. Extract spouse name with improved matching
      if (updatedInfo.maritalStatus === "married" || content.toLowerCase().includes("married")) {
        const spousePatterns = [
          /(?:my wife|my husband|my spouse)(?:'s| is| name is| named|:) ([A-Za-z\s.'-]+)/i,
          /married to ([A-Za-z\s.'-]+)/i,
          /spouse is ([A-Za-z\s.'-]+)/i
        ];
        
        for (const pattern of spousePatterns) {
          const spouseMatch = content.match(pattern);
          if (spouseMatch && spouseMatch[1] && updatedInfo.spouseName !== spouseMatch[1].trim()) {
            updatedInfo.spouseName = spouseMatch[1].trim();
            updatedInfo.updatedFields.spouseName = true;
            updatedField = "FAMILY INFORMATION";
            contentUpdated = true;
            console.log("[WillChat] Found spouse name:", updatedInfo.spouseName);
            break;
          }
        }
      }
      
      // 4. Extract executor information with improved matching
      if (message.role === 'user') {
        const executorPatterns = [
          /(?:my executor|the executor|executor) (?:will be|should be|is|name is|:) ([A-Za-z\s.'-]+)/i,
          /(?:appoint|choose|select|want|name) ([A-Za-z\s.'-]+) as (?:my|the) executor/i
        ];
        
        for (const pattern of executorPatterns) {
          const executorMatch = content.match(pattern);
          if (executorMatch && executorMatch[1]) {
            const possibleExecutor = executorMatch[1].trim();
            if (!possibleExecutor.toLowerCase().includes("skyler") && 
                !possibleExecutor.toLowerCase().includes("assistant") &&
                updatedInfo.executor !== possibleExecutor) {
              updatedInfo.executor = possibleExecutor;
              updatedInfo.updatedFields.executor = true;
              updatedField = "EXECUTOR";
              contentUpdated = true;
              console.log("[WillChat] Found executor:", updatedInfo.executor);
              break;
            }
          }
        }
      }
      
      // 5. Extract address with improved matching
      if (message.role === 'user') {
        const addressPatterns = [
          /(?:I live|I reside|my address|I live at|my home is|I stay at|I am located at) (?:at )?([A-Za-z0-9\s,.'-]+)/i,
          /(?:address is|address:|home address is) ([A-Za-z0-9\s,.'-]+)/i
        ];
        
        for (const pattern of addressPatterns) {
          const addressMatch = content.match(pattern);
          if (addressMatch && addressMatch[1]) {
            const possibleAddress = addressMatch[1].trim();
            if (possibleAddress.length > 5 && updatedInfo.address !== possibleAddress) {
              updatedInfo.address = possibleAddress;
              updatedInfo.updatedFields.address = true;
              updatedField = "RESIDENCE";
              contentUpdated = true;
              console.log("[WillChat] Found address:", updatedInfo.address);
              
              // Extract city, state, zip if present in the address
              const cityStateZipPattern = /([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/i;
              const cityStateMatch = updatedInfo.address.match(cityStateZipPattern);
              if (cityStateMatch) {
                updatedInfo.city = cityStateMatch[1].trim();
                updatedInfo.state = cityStateMatch[2].trim();
                updatedInfo.zipCode = cityStateMatch[3].trim();
                updatedInfo.updatedFields.cityState = true;
                console.log("[WillChat] Extracted city/state/zip:", updatedInfo.city, updatedInfo.state, updatedInfo.zipCode);
              }
              break;
            }
          }
        }
      }
      
      // 6. Extract children information with improved matching
      const childrenPatterns = [
        /(?:I have|we have) (\d+) (child|children|kids|son|daughter)/i,
        /my (child|children|kids|son|daughter)(?:'s name is|'s names are|ren are)? ([A-Za-z\s,.'-]+)/i,
        /(?:children|child)(?:ren)?(?:'s names are|:) ([A-Za-z\s,.'-]+)/i
      ];
      
      for (const pattern of childrenPatterns) {
        const childrenMatch = content.match(pattern);
        if (childrenMatch && message.role === 'user') {
          let childrenNames: string[] = [];
          
          if (childrenMatch[1] && /\d+/.test(childrenMatch[1])) {
            // This matched "X children" pattern, look in the rest of the message for names
            const rest = content.substring(childrenMatch.index! + childrenMatch[0].length);
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
          
          if (childrenNames.length > 0 && JSON.stringify(updatedInfo.children) !== JSON.stringify(childrenNames)) {
            updatedInfo.children = childrenNames;
            updatedInfo.updatedFields.children = true;
            updatedField = "FAMILY INFORMATION";
            contentUpdated = true;
            console.log("[WillChat] Found children:", updatedInfo.children);
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
          const assetMatch = content.match(pattern);
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
              updatedField = "DISTRIBUTION OF ESTATE";
              contentUpdated = true;
              console.log(`[WillChat] Found asset: ${type} - ${assetDetails}`);
            } else if (updatedInfo.assets[existingAssetIndex].value !== assetDetails) {
              // Update existing asset
              updatedInfo.assets[existingAssetIndex].value = assetDetails;
              updatedInfo.updatedFields.assets = true;
              updatedField = "DISTRIBUTION OF ESTATE";
              contentUpdated = true;
              console.log(`[WillChat] Updated asset: ${type} - ${assetDetails}`);
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
            const digitalAssetMatch = content.match(pattern);
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
                updatedField = "DIGITAL ASSETS";
                contentUpdated = true;
                console.log(`[WillChat] Found digital asset: ${type} - ${assetDetails}`);
              }
            }
          }
        }
      }
    }
    
    // If we found new information, update state and generate new will content
    if (contentUpdated) {
      updatedInfo.lastUpdatedField = updatedField;
      console.log("[WillChat] Content updated from message analysis, new info:", JSON.stringify(updatedInfo));
      setUserInfo(updatedInfo);
      generateAndUpdateWillContent(updatedInfo);
    }
  };
  
  const generateAndUpdateWillContent = (info: typeof userInfo) => {
    // Generate and update will content based on template and extracted info
    let newContent = '';
    console.log("[WillChat] Generating will content with info:", JSON.stringify(info));
    
    if (templateId === 'digital-assets') {
      newContent = generateDigitalAssetsWill(info);
    } else if (templateId === 'business') {
      newContent = generateBusinessWill(info);
    } else {
      newContent = generateBasicWill(info);
    }
    
    // Call the parent component's onContentUpdate with the new content
    console.log("[WillChat] Updating will content, length:", newContent.length);
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
    
    // Indicate that we need to extract info after this message is sent
    setIsPendingExtraction(true);
    
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
      
      // Extract information from AI response, but only after the response is received
      // This will be processed by the useEffect monitoring isPendingExtraction
      setIsPendingExtraction(true);
      
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
    willContent += `I appoint ${info.executor || '[EXECUTOR NAME]'} as Executor of this Will. If ${info.executor || 'my named Executor'} is unwilling or unable to serve, I appoint [ALTERNATE EXECUTOR] to serve as my alternate Executor.\n\n`;
    
    // Assets and distribution section
    willContent += `DISTRIBUTION OF ESTATE\n\n`;
    if (info.assets && info.assets.length > 0) {
      info.assets.forEach(asset => {
        willContent += `I give my ${asset.name} to ${asset.recipient || '[BENEFICIARY]'}.\n`;
      });
    } else {
      willContent += `I give all the rest and remainder of my estate to [PRIMARY BENEFICIARY].\n`;
    }
    
    willContent += `\nIf none of my named beneficiaries survive me, I give my estate to [CONTINGENT BENEFICIARY].\n\n`;
    
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
    willContent += `IN WITNESS WHEREOF, I have signed this Will on this ____ day of ____________, 20____.\n\n`;
    willContent += `____________________________\n${info.fullName || '[YOUR SIGNATURE]'}\n\n`;
    
    // Witnesses section
    willContent += `The foregoing instrument was signed, published, and declared by ${info.fullName || '[NAME OF TESTATOR]'} as their Will in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses thereto, believing said ${info.fullName || '[NAME OF TESTATOR]'} to be of sound mind and memory.\n\n`;
    willContent += `____________________________\nWITNESS SIGNATURE\n\n`;
    willContent += `____________________________\nWITNESS SIGNATURE\n`;
    
    return willContent;
  };
  
  const generateDigitalAssetsWill = (info: typeof userInfo): string => {
    let willContent = `DIGITAL ASSETS WILL AND TESTAMENT\n\n`;
    
    // Personal information section
    willContent += `I, ${info.fullName || '[YOUR NAME]'}, being of sound mind, declare this to be my Last Will and Testament with specific provisions for my digital assets. I revoke all wills and codicils previously made by me.\n\n`;
    
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
    willContent += `I appoint ${info.executor || '[EXECUTOR NAME]'} as Executor of this Will. If ${info.executor || 'my named Executor'} is unwilling or unable to serve, I appoint [ALTERNATE EXECUTOR] to serve as my alternate Executor.\n\n`;
    
    // Enhanced digital assets section
    willContent += `DIGITAL ASSETS\n\n`;
    willContent += `I own the following digital assets, online accounts, and digital property:\n\n`;
    
    if (info.digitalAssets && info.digitalAssets.length > 0) {
      info.digitalAssets.forEach((asset, index) => {
        willContent += `${index + 1}. ${asset.type}: ${asset.details}${asset.recipient ? ` - I give this to ${asset.recipient}` : ''}\n`;
      });
    } else {
      willContent += `1. [DIGITAL ASSET TYPE]: [DESCRIPTION AND ACCESS INFORMATION]\n`;
      willContent += `2. [DIGITAL ASSET TYPE]: [DESCRIPTION AND ACCESS INFORMATION]\n`;
    }
    
    willContent += `\nI appoint ${info.executor || '[DIGITAL EXECUTOR NAME]'} as my Digital Executor to manage, access, control, and dispose of my digital assets according to this Will.\n\n`;
    
    // Authorization for digital access
    willContent += `AUTHORIZATION FOR DIGITAL ACCESS\n\n`;
    willContent += `I explicitly authorize my Digital Executor to access, handle, distribute, and dispose of my digital assets. This includes accessing my computers, smartphones, tablets, storage devices, email accounts, social media accounts, financial accounts, cryptocurrency wallets, domain names, digital intellectual property, and other digital assets.\n\n`;
    
    // Password manager info if applicable
    willContent += `PASSWORDS AND ACCESS INFORMATION\n\n`;
    willContent += `Access information for my digital accounts can be found in [LOCATION OF PASSWORD MANAGER OR ACCESS INFORMATION].\n\n`;
    
    // Standard closing as in basic will
    willContent += `IN WITNESS WHEREOF, I have signed this Will on this ____ day of ____________, 20____.\n\n`;
    willContent += `____________________________\n${info.fullName || '[YOUR SIGNATURE]'}\n\n`;
    
    // Witnesses section
    willContent += `The foregoing instrument was signed, published, and declared by ${info.fullName || '[NAME OF TESTATOR]'} as their Will in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses thereto, believing said ${info.fullName || '[NAME OF TESTATOR]'} to be of sound mind and memory.\n\n`;
    willContent += `____________________________\nWITNESS SIGNATURE\n\n`;
    willContent += `____________________________\nWITNESS SIGNATURE\n`;
    
    return willContent;
  };
  
  const generateBusinessWill = (info: typeof userInfo): string => {
    let willContent = `BUSINESS OWNER'S LAST WILL AND TESTAMENT\n\n`;
    
    // Personal information section
    willContent += `I, ${info.fullName || '[YOUR NAME]'}, being of sound mind, declare this to be my Last Will and Testament with specific provisions for my business interests. I revoke all wills and codicils previously made by me.\n\n`;
    
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
    willContent += `I appoint ${info.executor || '[EXECUTOR NAME]'} as Executor of this Will. If ${info.executor || 'my named Executor'} is unwilling or unable to serve, I appoint [ALTERNATE EXECUTOR] to serve as my alternate Executor.\n\n`;
    
    // Business succession section
    willContent += `BUSINESS INTERESTS\n\n`;
    willContent += `I own the following business interests:\n\n`;
    willContent += `1. [BUSINESS NAME]: [DESCRIPTION, OWNERSHIP PERCENTAGE, AND BUSINESS STRUCTURE]\n`;
    willContent += `2. [BUSINESS NAME]: [DESCRIPTION, OWNERSHIP PERCENTAGE, AND BUSINESS STRUCTURE]\n\n`;
    
    willContent += `BUSINESS SUCCESSION\n\n`;
    willContent += `I direct that my business interests be handled as follows:\n\n`;
    willContent += `1. [BUSINESS NAME]: I give my ownership interest to [BENEFICIARY/SUCCESSOR].\n`;
    willContent += `2. [BUSINESS NAME]: I direct my Executor to [SELL/TRANSFER] this business and distribute the proceeds to [BENEFICIARY].\n\n`;
    
    willContent += `If any business succession plan, buy-sell agreement, or other contractual arrangement exists that governs the disposition of my business interests, such agreement shall take precedence over the provisions in this Will.\n\n`;
    
    // Standard closing as in basic will
    willContent += `IN WITNESS WHEREOF, I have signed this Will on this ____ day of ____________, 20____.\n\n`;
    willContent += `____________________________\n${info.fullName || '[YOUR SIGNATURE]'}\n\n`;
    
    // Witnesses section
    willContent += `The foregoing instrument was signed, published, and declared by ${info.fullName || '[NAME OF TESTATOR]'} as their Will in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses thereto, believing said ${info.fullName || '[NAME OF TESTATOR]'} to be of sound mind and memory.\n\n`;
    willContent += `____________________________\nWITNESS SIGNATURE\n\n`;
    willContent += `____________________________\nWITNESS SIGNATURE\n`;
    
    return willContent;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto p-4 flex-grow">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'assistant' ? 'bg-blue-50 p-3 rounded-lg' : ''
            } ${message.role === 'user' ? 'bg-gray-50 p-3 rounded-lg' : ''}`}
          >
            {message.role === 'assistant' && <div className="font-semibold mb-1">Skyler</div>}
            {message.role === 'user' && <div className="font-semibold mb-1">You</div>}
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4 bg-white">
        {isComplete && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">Your will has been completed!</p>
              <p className="text-sm text-green-700">You can now save, print or make final adjustments.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/wills')}>
              View All Wills
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isProcessing}
            className="flex-grow"
            aria-label="Message input"
          />
          
          {recordingSupported && (
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={toggleVoiceInput} 
              disabled={isProcessing}
              className={isRecording ? "bg-red-100 text-red-700 border-red-300" : ""}
              aria-label="Toggle voice input"
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isProcessing}
            aria-label="Send message"
          >
            {isProcessing ? "Sending..." : "Send"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
        
        {isRecording && (
          <div className="mt-2 text-xs text-red-500 animate-pulse flex items-center">
            <Mic className="h-3 w-3 mr-1" /> Recording... Speak clearly. Click the mic button again to stop.
          </div>
        )}
      </div>
    </div>
  );
}
