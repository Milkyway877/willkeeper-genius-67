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
  
  // Enhanced extraction function to be more reliable
  const extractPreviewInfo = () => {
    // Extract info from current input as user types for real-time preview
    let updatedInfo = { ...userInfo };
    let contentUpdated = false;
    let updatedField = "";
    
    console.log("[WillChat] Extracting preview info from input:", inputValue);
    
    // Check for direct name input (just a name with no other context)
    if (inputValue.trim().split(' ').length >= 2 && 
        /^[A-Z][a-z]+ [A-Z][a-z]+$/i.test(inputValue.trim()) && 
        !updatedInfo.fullName) {
      updatedInfo.fullName = inputValue.trim();
      updatedInfo.updatedFields.name = true;
      updatedField = "PERSONAL INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found direct name input:", updatedInfo.fullName);
    }
    
    // Try to extract full name - more lenient regex
    const nameMatch = inputValue.match(/(?:my name is|I am|I'm|name|call me|I go by|named|I'm called|this is) ([A-Za-z\s.'-]+)/i);
    if (nameMatch && nameMatch[1] && updatedInfo.fullName !== nameMatch[1].trim()) {
      updatedInfo.fullName = nameMatch[1].trim();
      updatedInfo.updatedFields.name = true;
      updatedField = "PERSONAL INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found name in input:", updatedInfo.fullName);
    }
    
    // Try to extract marital status with improved matching
    if (inputValue.match(/single|never married|not married|unmarried/i) && updatedInfo.maritalStatus !== "single") {
      updatedInfo.maritalStatus = "single";
      updatedInfo.updatedFields.maritalStatus = true;
      updatedField = "FAMILY INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found marital status in input: single");
    } else if (inputValue.match(/married|I have a (husband|wife|spouse)|my (husband|wife|spouse)/i) && updatedInfo.maritalStatus !== "married") {
      updatedInfo.maritalStatus = "married";
      updatedInfo.updatedFields.maritalStatus = true;
      updatedField = "FAMILY INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found marital status in input: married");
    } else if (inputValue.match(/divorced|separated/i) && updatedInfo.maritalStatus !== "divorced") {
      updatedInfo.maritalStatus = "divorced";
      updatedInfo.updatedFields.maritalStatus = true;
      updatedField = "FAMILY INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found marital status in input: divorced");
    } else if (inputValue.match(/widowed|widow|widower/i) && updatedInfo.maritalStatus !== "widowed") {
      updatedInfo.maritalStatus = "widowed";
      updatedInfo.updatedFields.maritalStatus = true;
      updatedField = "FAMILY INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found marital status in input: widowed");
    }
    
    // Try to extract spouse name with improved matching
    const spouseMatch = inputValue.match(/(?:wife|husband|spouse)(?:'s| is| name is| named|:) ([A-Za-z\s.'-]+)/i);
    if (spouseMatch && spouseMatch[1] && updatedInfo.spouseName !== spouseMatch[1].trim()) {
      updatedInfo.spouseName = spouseMatch[1].trim();
      updatedInfo.updatedFields.spouseName = true;
      updatedField = "FAMILY INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found spouse name in input:", updatedInfo.spouseName);
    }
    
    // Try to extract address info with improved matching
    const addressMatch = inputValue.match(/address|live|reside|residing|location|stay|residence/i);
    if (addressMatch && inputValue.length > 10) {
      // Get the text after the matched term
      const afterAddressMatch = inputValue.substring(addressMatch.index! + addressMatch[0].length);
      if (afterAddressMatch.length > 5 && updatedInfo.address !== afterAddressMatch.trim()) {
        updatedInfo.address = afterAddressMatch.trim();
        updatedInfo.updatedFields.address = true;
        updatedField = "RESIDENCE";
        contentUpdated = true;
        console.log("[WillChat] Found address in input:", updatedInfo.address);
      }
    }
    
    // Try to extract children information with improved matching
    const childrenMatch = 
      inputValue.match(/children|have (\d+) (child|children|kids|son|daughter)/i) || 
      inputValue.match(/my (child|children|kids|son|daughter)/i);
    
    if (childrenMatch) {
      // Extract names that might follow
      const possibleNames = inputValue.substring(childrenMatch.index! + childrenMatch[0].length);
      if (possibleNames.length > 3) {
        const names = possibleNames.split(/,\s*|\s+and\s+|\s+&\s+/).filter(Boolean).map(n => n.trim());
        if (names.length > 0 && JSON.stringify(updatedInfo.children) !== JSON.stringify(names)) {
          updatedInfo.children = names;
          updatedInfo.updatedFields.children = true;
          updatedField = "FAMILY INFORMATION";
          contentUpdated = true;
          console.log("[WillChat] Found children in input:", updatedInfo.children);
        }
      }
    }
    
    // Try to extract executor information with improved matching
    const executorMatch = inputValue.match(/executor(?:'s| is| will be| should be| name is|:) ([A-Za-z\s.'-]+)/i);
    if (executorMatch && executorMatch[1] && updatedInfo.executor !== executorMatch[1].trim()) {
      updatedInfo.executor = executorMatch[1].trim();
      updatedInfo.updatedFields.executor = true;
      updatedField = "EXECUTOR";
      contentUpdated = true;
      console.log("[WillChat] Found executor in input:", updatedInfo.executor);
    }
    
    // If we found new information, update will content for real-time preview
    if (contentUpdated) {
      updatedInfo.lastUpdatedField = updatedField;
      setUserInfo(updatedInfo); // Update the state
      generateAndUpdateWillContent(updatedInfo); // Generate new content with updated info
      console.log("[WillChat] Content updated from user typing, updated field:", updatedField);
    }
  };
  
  // Enhanced extraction function to process all messages
  const extractAndUpdateInfo = () => {
    let updatedInfo = { ...userInfo };
    let contentUpdated = false;
    let updatedField = "";
    
    console.log("[WillChat] Extracting info from all messages");
    
    // Look through user messages to extract information
    for (const message of messages) {
      // Skip system messages
      if (message.role === 'system') {
        continue;
      }
      
      const content = message.content;
      
      // Check for direct name input (just a name with no other context)
      if (message.role === 'user' && 
          content.trim().split(' ').length >= 2 && 
          /^[A-Za-z][a-z]+ [A-Za-z][a-z]+$/i.test(content.trim()) &&
          !updatedInfo.fullName) {
        updatedInfo.fullName = content.trim();
        updatedInfo.updatedFields.name = true;
        updatedField = "PERSONAL INFORMATION";
        contentUpdated = true;
        console.log("[WillChat] Found direct name input:", updatedInfo.fullName);
      }
      
      // Extract full name with improved matching
      const nameMatch = content.match(/(?:my name is|I am|I'm|name|call me|I go by|named|me llamo|this is) ([A-Za-z\s.'-]+)/i);
      if (nameMatch && nameMatch[1] && updatedInfo.fullName !== nameMatch[1].trim()) {
        updatedInfo.fullName = nameMatch[1].trim();
        updatedInfo.updatedFields.name = true;
        updatedField = "PERSONAL INFORMATION";
        contentUpdated = true;
        console.log("[WillChat] Found name:", updatedInfo.fullName);
      }
      
      // Extract marital status with improved matching
      if (content.match(/single|never married|not married|unmarried/i) && updatedInfo.maritalStatus !== "single") {
        updatedInfo.maritalStatus = "single";
        updatedInfo.updatedFields.maritalStatus = true;
        updatedField = "FAMILY INFORMATION";
        contentUpdated = true;
        console.log("[WillChat] Found marital status: single");
      } else if (content.match(/married|I have a (husband|wife|spouse)|my (husband|wife|spouse)/i) && updatedInfo.maritalStatus !== "married") {
        updatedInfo.maritalStatus = "married";
        updatedInfo.updatedFields.maritalStatus = true;
        updatedField = "FAMILY INFORMATION";
        contentUpdated = true;
        console.log("[WillChat] Found marital status: married");
      } else if (content.match(/divorced|separated/i) && updatedInfo.maritalStatus !== "divorced") {
        updatedInfo.maritalStatus = "divorced";
        updatedInfo.updatedFields.maritalStatus = true;
        updatedField = "FAMILY INFORMATION";
        contentUpdated = true;
        console.log("[WillChat] Found marital status: divorced");
      } else if (content.match(/widowed|widow|widower/i) && updatedInfo.maritalStatus !== "widowed") {
        updatedInfo.maritalStatus = "widowed";
        updatedInfo.updatedFields.maritalStatus = true;
        updatedField = "FAMILY INFORMATION";
        contentUpdated = true;
        console.log("[WillChat] Found marital status: widowed");
      }
      
      // Extract spouse name with improved matching
      if (updatedInfo.maritalStatus === "married") {
        const spouseMatch = content.match(/(?:wife|husband|spouse)(?:'s| is| name is| named|:) ([A-Za-z\s.'-]+)/i);
        if (spouseMatch && spouseMatch[1] && updatedInfo.spouseName !== spouseMatch[1].trim()) {
          updatedInfo.spouseName = spouseMatch[1].trim();
          updatedInfo.updatedFields.spouseName = true;
          updatedField = "FAMILY INFORMATION";
          contentUpdated = true;
          console.log("[WillChat] Found spouse name:", updatedInfo.spouseName);
        }
      }
      
      // Extract executor information with improved matching
      const executorMatch = content.match(/executor(?:'s| is| will be| should be| name is|:) ([A-Za-z\s.'-]+)/i);
      if (executorMatch && executorMatch[1] && updatedInfo.executor !== executorMatch[1].trim()) {
        updatedInfo.executor = executorMatch[1].trim();
        updatedInfo.updatedFields.executor = true;
        updatedField = "EXECUTOR";
        contentUpdated = true;
        console.log("[WillChat] Found executor:", updatedInfo.executor);
      }
      
      // Extract address with improved matching
      const addressMatch = content.match(/address|live|reside|residing|location|stay|residence/i);
      if (addressMatch && message.role === 'user') {
        // Get the text after the matched term
        const afterAddressMatch = content.substring(addressMatch.index! + addressMatch[0].length);
        if (afterAddressMatch.length > 5 && updatedInfo.address !== afterAddressMatch.trim()) {
          updatedInfo.address = afterAddressMatch.trim();
          updatedInfo.updatedFields.address = true;
          updatedField = "RESIDENCE";
          contentUpdated = true;
          console.log("[WillChat] Found address:", updatedInfo.address);
          
          // Try to extract city, state, zip from address
          const cityStateMatch = updatedInfo.address.match(/([^,]+),\s*([A-Z]{2})\s*(\d{5}(-\d{4})?)/i);
          if (cityStateMatch) {
            updatedInfo.city = cityStateMatch[1].trim();
            updatedInfo.state = cityStateMatch[2].trim();
            updatedInfo.zipCode = cityStateMatch[3].trim();
            updatedInfo.updatedFields.cityState = true;
            console.log("[WillChat] Extracted city/state/zip:", updatedInfo.city, updatedInfo.state, updatedInfo.zipCode);
          }
        }
      }
      
      // Extract children information with improved matching
      const childrenMatch = 
        content.match(/children|have (\d+) (child|children|kids|son|daughter)/i) || 
        content.match(/my (child|children|kids|son|daughter)/i);
      
      if (childrenMatch && message.role === 'user') {
        // Extract names that might follow
        const possibleNames = content.substring(childrenMatch.index! + childrenMatch[0].length);
        if (possibleNames.length > 3) {
          const names = possibleNames.split(/,\s*|\s+and\s+|\s+&\s+/).filter(Boolean).map(n => n.trim());
          if (names.length > 0 && JSON.stringify(updatedInfo.children) !== JSON.stringify(names)) {
            updatedInfo.children = names;
            updatedInfo.updatedFields.children = true;
            updatedField = "FAMILY INFORMATION";
            contentUpdated = true;
            console.log("[WillChat] Found children:", updatedInfo.children);
          }
        }
      }
      
      // Extract asset information with improved matching
      if (message.role === 'user') {
        // Look for common assets like house, car, bank account
        if (content.match(/house|property|real estate|land|apartment|condo/i)) {
          const newAsset = {
            name: "Real Estate",
            value: content
          };
          
          if (!updatedInfo.assets.some(a => a.name === newAsset.name)) {
            updatedInfo.assets.push(newAsset);
            updatedInfo.updatedFields.assets = true;
            updatedField = "DISTRIBUTION OF ESTATE";
            contentUpdated = true;
            console.log("[WillChat] Found asset: Real Estate");
          }
        } 
        
        if (content.match(/car|vehicle|automobile/i)) {
          const newAsset = {
            name: "Vehicle",
            value: content
          };
          
          if (!updatedInfo.assets.some(a => a.name === newAsset.name)) {
            updatedInfo.assets.push(newAsset);
            updatedInfo.updatedFields.assets = true;
            updatedField = "DISTRIBUTION OF ESTATE";
            contentUpdated = true;
            console.log("[WillChat] Found asset: Vehicle");
          }
        }
        
        if (content.match(/savings|bank account|checking|investment|money/i)) {
          const newAsset = {
            name: "Financial Assets",
            value: content
          };
          
          if (!updatedInfo.assets.some(a => a.name === newAsset.name)) {
            updatedInfo.assets.push(newAsset);
            updatedInfo.updatedFields.assets = true;
            updatedField = "DISTRIBUTION OF ESTATE";
            contentUpdated = true;
            console.log("[WillChat] Found asset: Financial Assets");
          }
        }
      }
      
      // Extract digital assets for digital asset wills
      if (templateId === 'digital-assets' && message.role === 'user') {
        if (content.match(/digital|online|account|social media|email|crypto|bitcoin|ethereum/i)) {
          const assetType = content.match(/digital|online|account|social media|email|crypto|bitcoin|ethereum/i)?.[0] || "Digital Asset";
          const newDigitalAsset = {
            type: assetType,
            details: `${assetType} account`
          };
          
          if (!updatedInfo.digitalAssets.some(a => a.type === newDigitalAsset.type)) {
            updatedInfo.digitalAssets.push(newDigitalAsset);
            updatedInfo.updatedFields.digitalAssets = true;
            updatedField = "DIGITAL ASSETS";
            contentUpdated = true;
            console.log("[WillChat] Found digital asset:", assetType);
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
    
    // Check if the user is directly inputting their name (first message)
    if (messages.length === 1 && messages[0].role === 'assistant') {
      const possibleName = userMessage.content.trim();
      // If it looks like a name (2+ words, capitalized), use it directly
      if (possibleName.split(' ').length >= 2 && 
          /^[A-Za-z][a-z]+ [A-Za-z][a-z]+$/i.test(possibleName)) {
        const tempUpdatedInfo = { 
          ...userInfo, 
          fullName: possibleName,
          updatedFields: { ...userInfo.updatedFields, name: true },
          lastUpdatedField: "PERSONAL INFORMATION"
        };
        setUserInfo(tempUpdatedInfo);
        generateAndUpdateWillContent(tempUpdatedInfo);
        console.log("[WillChat] Direct name input detected and applied:", possibleName);
      }
    }
    
    // Extract information immediately from the user's message
    // to update the preview without waiting for the AI response
    let tempUpdatedInfo = { ...userInfo };
    let tempContentUpdated = false;
    let tempUpdatedField = "";
    
    // Extract full name - more lenient regex
    const nameMatch = userMessage.content.match(/(?:my name is|I am|I'm|name|call me) ([A-Za-z\s.'-]+)/i);
    if (nameMatch && nameMatch[1] && tempUpdatedInfo.fullName !== nameMatch[1].trim()) {
      tempUpdatedInfo.fullName = nameMatch[1].trim();
      tempUpdatedInfo.updatedFields.name = true;
      tempUpdatedField = "PERSONAL INFORMATION";
      tempContentUpdated = true;
      console.log("[WillChat] Found name in user message:", tempUpdatedInfo.fullName);
    }
    
    // Check for direct name input (just a name)
    else if (userMessage.content.trim().split(' ').length >= 2 && 
             /^[A-Za-z][a-z]+ [A-Za-z][a-z]+$/i.test(userMessage.content.trim()) &&
             !tempUpdatedInfo.fullName) {
      tempUpdatedInfo.fullName = userMessage.content.trim();
      tempUpdatedInfo.updatedFields.name = true;
      tempUpdatedField = "PERSONAL INFORMATION";
      tempContentUpdated = true;
      console.log("[WillChat] Found direct name input in message:", tempUpdatedInfo.fullName);
    }
    
    // Extract marital status - more lenient regex
    if (userMessage.content.match(/single|never married|not married|unmarried/i) && tempUpdatedInfo.maritalStatus !== "single") {
      tempUpdatedInfo.maritalStatus = "single";
      tempUpdatedInfo.updatedFields.maritalStatus = true;
      tempUpdatedField = "FAMILY INFORMATION";
      tempContentUpdated = true;
    } else if (userMessage.content.match(/married|I have a (husband|wife|spouse)|my (husband|wife|spouse)/i) && tempUpdatedInfo.maritalStatus !== "married") {
      tempUpdatedInfo.maritalStatus = "married";
      tempUpdatedInfo.updatedFields.maritalStatus = true;
      tempUpdatedField = "FAMILY INFORMATION";
      tempContentUpdated = true;
    }
    
    // Extract other information as in the main extraction function
    // This is a simplified version for immediate feedback
    
    if (tempContentUpdated) {
      // Update state and content immediately for responsive feedback
      tempUpdatedInfo.lastUpdatedField = tempUpdatedField;
      setUserInfo(tempUpdatedInfo);
      generateAndUpdateWillContent(tempUpdatedInfo);
      console.log("[WillChat] Content updated immediately after user message");
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
  
  const extractInfoFromAIResponse = (aiResponse: string) => {
    // This function extracts info from AI responses
    // Often AI will confirm information or suggest next steps
    let updatedInfo = { ...userInfo };
    let contentUpdated = false;
    let updatedField = "";
    
    console.log("[WillChat] Extracting info from AI response:", aiResponse.substring(0, 50) + "...");
    
    // Check for confirmation of user name - more lenient regex
    const nameConfirmMatch = aiResponse.match(/(?:Thank you|thanks|Hello|Hi),\s+([A-Za-z\s.'-]+)/i);
    if (nameConfirmMatch && nameConfirmMatch[1]) {
      const possibleName = nameConfirmMatch[1].trim();
      // Only use confirmed name if it's at least two words (first and last name)
      if (possibleName.includes(" ") && possibleName.length > 3 && !updatedInfo.fullName) {
        updatedInfo.fullName = possibleName;
        updatedInfo.updatedFields.name = true;
        updatedField = "PERSONAL INFORMATION";
        contentUpdated = true;
        console.log("[WillChat] Found name confirmation in AI response:", updatedInfo.fullName);
      }
    }
    
    // Look for direct name confirmation
    const directNameMatch = aiResponse.match(/your name is ([A-Za-z\s.'-]+)/i);
    if (directNameMatch && directNameMatch[1] && !updatedInfo.fullName) {
      updatedInfo.fullName = directNameMatch[1].trim();
      updatedInfo.updatedFields.name = true;
      updatedField = "PERSONAL INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found direct name confirmation in AI response:", updatedInfo.fullName);
    }
    
    // Check for confirmation of marital status
    if (aiResponse.match(/you are single|you mentioned you're single|you mentioned being single/i) && !updatedInfo.maritalStatus) {
      updatedInfo.maritalStatus = "single";
      updatedInfo.updatedFields.maritalStatus = true;
      updatedField = "FAMILY INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found marital status confirmation in AI response: single");
    } else if (aiResponse.match(/you are married|you mentioned you're married|you mentioned being married/i) && !updatedInfo.maritalStatus) {
      updatedInfo.maritalStatus = "married";
      updatedInfo.updatedFields.maritalStatus = true;
      updatedField = "FAMILY INFORMATION";
      contentUpdated = true;
      console.log("[WillChat] Found marital status confirmation in AI response: married");
    }
    
    // Extract executor information
    const executorConfirm = aiResponse.match(/executor will be ([A-Za-z\s.'-]+)/i) || 
                           aiResponse.match(/appointed ([A-Za-z\s.'-]+) as.*executor/i);
    
    if (executorConfirm && executorConfirm[1] && !updatedInfo.executor) {
      updatedInfo.executor = executorConfirm[1].trim();
      updatedInfo.updatedFields.executor = true;
      updatedField = "EXECUTOR";
      contentUpdated = true;
      console.log("[WillChat] Found executor confirmation in AI response:", updatedInfo.executor);
    }
    
    if (contentUpdated) {
      updatedInfo.lastUpdatedField = updatedField;
      console.log("[WillChat] Content updated from AI response, new info:", JSON.stringify(updatedInfo));
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
${info.beneficiaries && info.beneficiaries.length > 0 ? 
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
