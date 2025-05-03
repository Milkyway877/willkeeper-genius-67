import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageList } from './chat/MessageList';
import { InputArea } from './chat/InputArea';
import { Contact, Message as MessageType, SkylerAssistantProps } from './types';
import { useSystemNotifications } from '@/hooks/use-system-notifications';

export function SkylerAssistant({ 
  templateId, 
  templateName, 
  onComplete, 
  onInputChange
}: SkylerAssistantProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResponses, setExtractedResponses] = useState<Record<string, any>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [generatedWill, setGeneratedWill] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReadyToComplete, setIsReadyToComplete] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [dataCollectionProgress, setDataCollectionProgress({
    personalInfo: false,
    contacts: false,
    readyToComplete: false
  });
  const [assetsList, setAssetsList] = useState<string[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<string[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  
  const { toast } = useToast();
  const { notifyInfo } = useSystemNotifications();
  
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage(templateId, templateName);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecordingSupported(true);
    }
    
    // Add fallback timer to show the generate button after 5 messages if not shown already
    const timer = setTimeout(() => {
      if (!isReadyToComplete && messages.length >= 5) {
        console.log("Fallback timer activating ready to complete");
        setIsReadyToComplete(true);
      }
    }, 10000); // 10 seconds after component mount
    
    return () => clearTimeout(timer);
  }, [templateId, templateName]);
  
  // Add a separate useEffect to track message count and force button to appear
  useEffect(() => {
    // Force button to appear after 4 exchanges (8 messages - 4 from user, 4 from assistant)
    if (messages.length >= 7 && !isReadyToComplete) {
      console.log("Message count threshold reached - forcing ready to complete");
      setIsReadyToComplete(true);
    }
    
    // Update exchange count
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    setExchangeCount(userMessageCount);
  }, [messages, isReadyToComplete]);
  
  const getWelcomeMessage = (templateId: string, templateName: string) => {
    let welcomeMessage = `👋 Hello! I'm SKYLER, your AI will assistant. I'll guide you through creating a ${templateName} with a simple conversation. Let's start with the basics: What is your full legal name?`;
    
    if (templateId === 'digital-assets') {
      welcomeMessage = `👋 Hello! I'm SKYLER, your AI will assistant specializing in digital assets. I'll help you create a will that properly addresses your online accounts, cryptocurrency, and other digital property through a simple conversation. Let's start with the basics: What is your full legal name?`;
    } else if (templateId === 'living-trust') {
      welcomeMessage = `👋 Hello! I'm SKYLER, your AI will assistant specializing in living trusts. I'll guide you through creating a trust that can help manage your assets during your lifetime and distribute them after your passing. Let's start with the basics: What is your full legal name?`;
    } else if (templateId === 'family') {
      welcomeMessage = `👋 Hello! I'm SKYLER, your AI will assistant specializing in family-focused estate planning. I'll help you create a will that ensures your family is provided for according to your wishes. Let's start with the basics: What is your full legal name?`;
    } else if (templateId === 'business') {
      welcomeMessage = `👋 Hello! I'm SKYLER, your AI will assistant specializing in business succession planning. I'll help you create a will that addresses your business interests and succession plans. Let's start with the basics: What is your full legal name?`;
    } else if (templateId === 'charity') {
      welcomeMessage = `👋 Hello! I'm SKYLER, your AI will assistant specializing in charitable giving. I'll help you create a will that includes your philanthropic wishes. Let's start with the basics: What is your full legal name?`;
    }
    
    return welcomeMessage;
  };
  
  const initSpeechRecognition = useCallback(() => {
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
  }, [recordingSupported]);
  
  const toggleVoiceInput = useCallback(() => {
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
  }, [isRecording, initSpeechRecognition]);
  
  // Enhanced information extraction to handle all types of data
  const extractInformation = useCallback((messageContent: string) => {
    const updates: Record<string, any> = {...extractedResponses};
    
    // Personal information extraction
    const nameMatch = messageContent.match(/(?:my name is|I am|I'm|name is|I'm called) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
    if (nameMatch && nameMatch[1]) {
      updates.fullName = nameMatch[1];
      setDataCollectionProgress(prev => ({ ...prev, personalInfo: true }));
      console.log("Extracted name:", nameMatch[1]);
      
      // Call onInputChange if provided
      if (onInputChange) {
        onInputChange('fullName', nameMatch[1]);
      }
    }
    
    // Name at beginning of sentence
    const nameMatchStart = messageContent.match(/^([A-Z][a-z]+ [A-Z][a-z]+)(?:\.|,| here)/i);
    if (nameMatchStart && nameMatchStart[1] && !updates.fullName) {
      updates.fullName = nameMatchStart[1];
      setDataCollectionProgress(prev => ({ ...prev, personalInfo: true }));
      console.log("Extracted name from start:", nameMatchStart[1]);
      
      // Call onInputChange if provided
      if (onInputChange) {
        onInputChange('fullName', nameMatchStart[1]);
      }
    }
    
    // Extract any name mentioned along with "my name"
    if (messageContent.toLowerCase().includes("my name") && !updates.fullName) {
      const words = messageContent.split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        if (words[i].toLowerCase() === "name" && 
            i > 0 && words[i-1].toLowerCase() === "my" && 
            i+1 < words.length && 
            words[i+1].charAt(0) === words[i+1].charAt(0).toUpperCase()) {
          const nameParts = [];
          for (let j = i+1; j < words.length && words[j].charAt(0) === words[j].charAt(0).toUpperCase(); j++) {
            nameParts.push(words[j].replace(/[,.;:!?]$/, ''));
          }
          if (nameParts.length > 0) {
            updates.fullName = nameParts.join(' ');
            
            // Call onInputChange if provided
            if (onInputChange) {
              onInputChange('fullName', updates.fullName);
            }
          }
          break;
        }
      }
    }
    
    // Marital status extraction
    if (/(?:I am|I'm) (single|married|divorced|widowed)/i.test(messageContent)) {
      const statusMatch = messageContent.match(/(?:I am|I'm) (single|married|divorced|widowed)/i);
      if (statusMatch && statusMatch[1]) {
        updates.maritalStatus = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1).toLowerCase();
        console.log("Extracted marital status:", updates.maritalStatus);
        
        // Call onInputChange if provided
        if (onInputChange) {
          onInputChange('maritalStatus', updates.maritalStatus);
        }
      }
    }
    
    // Spouse information extraction
    const spouseMatch = messageContent.match(/(?:my spouse is|married to|wife is|husband is|partner is) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
    if (spouseMatch && spouseMatch[1]) {
      updates.spouseName = spouseMatch[1];
      console.log("Extracted spouse name:", spouseMatch[1]);
    }
    
    // Children extraction - multiple patterns
    const childrenMatch = messageContent.match(/(?:I have|with) (?:a|one|1) (?:child|daughter|son)(?: named| called)? ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
    if (childrenMatch && childrenMatch[1]) {
      updates.hasChildren = true;
      updates.childrenNames = childrenMatch[1];
      const newBeneficiary = childrenMatch[1];
      if (!beneficiaries.includes(newBeneficiary)) {
        setBeneficiaries(prev => [...prev, newBeneficiary]);
      }
      console.log("Extracted child:", childrenMatch[1]);
    }
    
    // Children mentioned with name
    const childMentionMatch = messageContent.match(/(?:my|the) (?:child|daughter|son) (?:is )?(?:called |named )?([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
    if (childMentionMatch && childMentionMatch[1] && !updates.childrenNames) {
      updates.hasChildren = true;
      updates.childrenNames = childMentionMatch[1];
      const newBeneficiary = childMentionMatch[1];
      if (!beneficiaries.includes(newBeneficiary)) {
        setBeneficiaries(prev => [...prev, newBeneficiary]);
      }
      console.log("Extracted child from mention:", childMentionMatch[1]);
    }
    
    // Extract beneficiaries/children from "leave to" phrases
    const leaveToMatch = messageContent.match(/leave (?:everything |all |my (?:estate |property |assets |belongings ))?to (?:my (?:daughter|son|child) )?([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
    if (leaveToMatch && leaveToMatch[1]) {
      const newBeneficiary = leaveToMatch[1].trim();
      if (!beneficiaries.includes(newBeneficiary)) {
        setBeneficiaries(prev => [...prev, newBeneficiary]);
        updates.leaveTo = newBeneficiary;
      }
      console.log("Extracted beneficiary from 'leave to':", newBeneficiary);
    }
    
    // Contact extraction - multiple patterns for executor
    const executorMatches = [
      messageContent.match(/(?:executor is|appointed|choose|want|designate) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i),
      messageContent.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)+) (?:as|to be|will be|should be) (?:my|the) executor/i),
      messageContent.match(/(?:my|the) executor (?:is|should be|will be) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i)
    ];
    
    for (const match of executorMatches) {
      if (match && match[1]) {
        updates.executorName = match[1];
        console.log("Extracted executor:", match[1]);
        
        // Check if we already have this contact
        const existingContact = contacts.find(c => c.name.toLowerCase() === match[1].toLowerCase());
        if (!existingContact) {
          const newContact: Contact = {
            id: `contact-${Date.now()}`,
            name: match[1],
            role: 'Executor',
            email: '',
            phone: '',
            address: ''
          };
          
          setContacts(prev => [...prev, newContact]);
          setDataCollectionProgress(prev => ({ ...prev, contacts: true }));
        }
        break;
      }
    }
    
    // Guardian extraction - multiple patterns
    const guardianMatches = [
      messageContent.match(/(?:guardian for|guardian is|guardian|take care of) (?:my|the) (?:child|children|daughter|son)(?:ren)? (?:is |would be |will be |should be )?([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i),
      messageContent.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)+) (?:as|to be|will be|should be) (?:my|the) guardian/i),
      messageContent.match(/(?:appoint|designate|choose) ([A-Z][a-z]+(?: [A-Z][a-z]+)+) (?:as|to be) (?:the |my )?guardian/i)
    ];
    
    for (const match of guardianMatches) {
      if (match && match[1]) {
        updates.guardianName = match[1];
        updates.guardianNeeded = true;
        console.log("Extracted guardian:", match[1]);
        
        // Check if we already have this contact
        const existingContact = contacts.find(c => c.name.toLowerCase() === match[1].toLowerCase());
        if (!existingContact) {
          const newContact: Contact = {
            id: `contact-${Date.now()}`,
            name: match[1],
            role: 'Guardian',
            email: '',
            phone: '',
            address: ''
          };
          
          setContacts(prev => [...prev, newContact]);
        }
        break;
      }
    }
    
    // Asset extraction - property/house
    const propertyMatches = [
      messageContent.match(/(?:I have|I own|my house|my property|my home)(?: is| at)? (?:located at |at )?([\d]+ [A-Za-z]+ (?:Road|Street|Avenue|Drive|Lane|Place|Blvd|Boulevard|Way|Court|Terrace|Circle)[, ]+[A-Za-z]+(?:[, ]+[A-Za-z]+)?)/i),
      messageContent.match(/(?:house|property|home) (?:at|on) ([\d]+ [A-Za-z]+ (?:Road|Street|Avenue|Drive|Lane|Place|Blvd|Boulevard|Way|Court|Terrace|Circle))/i)
    ];
    
    for (const match of propertyMatches) {
      if (match && match[1]) {
        updates.propertyAddress = match[1];
        const newAsset = `House at ${match[1]}`;
        if (!assetsList.includes(newAsset)) {
          setAssetsList(prev => [...prev, newAsset]);
        }
        console.log("Extracted property:", match[1]);
        break;
      }
    }
    
    // Asset extraction - vehicles
    const vehicleMatches = [
      messageContent.match(/(?:I have|I own|my car|my vehicle) (?:is |a )?((?:[A-Za-z]+ )?[A-Za-z]+ [A-Za-z0-9]+)/i),
      messageContent.match(/(?:drive|own|have) (?:a |an )?([A-Za-z]+ (?:car|vehicle|truck|SUV|motorcycle|van|bus))/i),
    ];
    
    for (const match of vehicleMatches) {
      if (match && match[1]) {
        updates.vehicle = match[1];
        const newAsset = `Vehicle: ${match[1]}`;
        if (!assetsList.includes(newAsset)) {
          setAssetsList(prev => [...prev, newAsset]);
        }
        console.log("Extracted vehicle:", match[1]);
        break;
      }
    }
    
    // Email pattern extraction
    const emailMatch = messageContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && emailMatch[0]) {
      const email = emailMatch[0];
      console.log("Extracted email:", email);
      
      // Associate with executor by default if we have one
      if (updates.executorName || extractedResponses.executorName) {
        updates.executorEmail = email;
        
        // Update the executor contact if it exists
        const executorName = updates.executorName || extractedResponses.executorName;
        if (executorName) {
          setContacts(prev => prev.map(c => 
            c.name.toLowerCase() === executorName.toLowerCase() ? { ...c, email: email } : c
          ));
        }
      }
      
      // Look for context to associate this email with a contact
      const lines = messageContent.split(/[.!?]/);
      for (const line of lines) {
        if (line.includes(email)) {
          for (const contact of contacts) {
            if (line.toLowerCase().includes(contact.name.toLowerCase())) {
              // Update the contact's email
              setContacts(prev => prev.map(c => 
                c.id === contact.id ? { ...c, email: email } : c
              ));
              break;
            }
          }
        }
      }
    }
    
    // Phone number pattern extraction
    const phoneMatches = messageContent.match(/(\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
    if (phoneMatches && phoneMatches.length > 0) {
      const phone = phoneMatches[0];
      console.log("Extracted phone:", phone);
      
      // Associate with executor by default if we have one
      if (updates.executorName || extractedResponses.executorName) {
        updates.executorPhone = phone;
        
        // Update the executor contact if it exists
        const executorName = updates.executorName || extractedResponses.executorName;
        if (executorName) {
          setContacts(prev => prev.map(c => 
            c.name.toLowerCase() === executorName.toLowerCase() ? { ...c, phone: phone } : c
          ));
        }
      }
      
      // Look for context to associate this phone with a contact
      const lines = messageContent.split(/[.!?]/);
      for (const line of lines) {
        if (line.includes(phone)) {
          for (const contact of contacts) {
            if (line.toLowerCase().includes(contact.name.toLowerCase())) {
              // Update the contact's phone
              setContacts(prev => prev.map(c => 
                c.id === contact.id ? { ...c, phone: phone } : c
              ));
              break;
            }
          }
        }
      }
    }
    
    // Manually force ready status after a few exchanges
    if (exchangeCount >= 3 && (updates.fullName || extractedResponses.fullName)) {
      console.log("Enough exchanges detected - setting ready status");
      setIsReadyToComplete(true);
      setDataCollectionProgress(prev => ({ ...prev, readyToComplete: true }));
    }
    
    // Extract general address information
    const addressPattern = /(?:I live|address is|located|reside|stay)(?:s)? (?:at|in|on) ([^,.]+(?:Road|Street|Avenue|Drive|Lane|Place|Blvd|Boulevard|Way|Court|Terrace|Circle)[^,.]+)/i;
    const addressMatches = messageContent.match(addressPattern);
    if (addressMatches && addressMatches[1] && !updates.propertyAddress) {
      updates.propertyAddress = addressMatches[1].trim();
      console.log("Extracted general address:", updates.propertyAddress);
    }
    
    // Whenever we update important fields, notify via onInputChange
    if (updates.executorName && onInputChange) {
      onInputChange('executorName', updates.executorName);
    }
    
    if (updates.guardianName && onInputChange) {
      onInputChange('guardianName', updates.guardianName);
    }
    
    if (updates.propertyAddress && onInputChange) {
      onInputChange('propertyAddress', updates.propertyAddress);
    }
    
    if (updates.vehicle && onInputChange) {
      onInputChange('vehicle', updates.vehicle);
    }
    
    if (updates.spouseName && onInputChange) {
      onInputChange('spouseName', updates.spouseName);
    }
    
    if (updates.childrenNames && onInputChange) {
      onInputChange('childrenNames', updates.childrenNames);
    }
    
    setExtractedResponses(prev => ({ ...prev, ...updates }));
    return updates;
  }, [contacts, extractedResponses, exchangeCount, assetsList, beneficiaries, onInputChange]);
  
  // Check if all required data has been collected
  useEffect(() => {
    const { personalInfo, contacts: contactsCollected, readyToComplete } = dataCollectionProgress;
    
    // Only need minimal information
    if ((personalInfo || extractedResponses.fullName) && 
        (contactsCollected || contacts.length > 0 || extractedResponses.executorName)) {
      setIsReadyToComplete(true);
      console.log("Setting ready to complete based on data collection progress");
    }
    
    // Always allow generation after 4 exchanges
    if (messages.filter(m => m.role === 'user').length >= 4 && !isReadyToComplete) {
      setIsReadyToComplete(true);
      console.log("Setting ready to complete based on exchange count");
    }
  }, [dataCollectionProgress, contacts.length, extractedResponses, messages, isReadyToComplete]);
  
  // Enhanced function to extract all relevant conversation content
  const extractConversationContent = useCallback(() => {
    const extractedContent: Record<string, any> = { ...extractedResponses };
    const allText = messages.map(m => m.content).join(' ');
    
    // Try to extract more information from the entire conversation context
    // Name pattern
    if (!extractedContent.fullName) {
      const nameMatches = allText.match(/(?:my name is|I am|I'm|name is|I'm called) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/ig);
      if (nameMatches && nameMatches.length > 0) {
        const nameMatch = nameMatches[0].match(/(?:my name is|I am|I'm|name is|I'm called) ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/i);
        if (nameMatch && nameMatch[1]) {
          extractedContent.fullName = nameMatch[1];
        }
      }
    }
    
    // Extract residential/property address
    if (!extractedContent.propertyAddress) {
      const addressPattern = /(?:I live|address is|located|reside|stay)(?:s)? (?:at|in|on) ([^,.]+(?:Road|Street|Avenue|Drive|Lane|Place|Blvd|Boulevard|Way|Court|Terrace|Circle)[^,.]+)/i;
      const addressMatches = allText.match(addressPattern);
      if (addressMatches && addressMatches[1]) {
        extractedContent.propertyAddress = addressMatches[1].trim();
      }
    }
    
    // Extract specifics from all user messages
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
    
    // Extract vehicle information
    if (!extractedContent.vehicle) {
      const vehiclePattern = /(?:I have|I own|my car|my vehicle) (?:is |a )?((?:[A-Za-z]+ )?[A-Za-z]+ [A-Za-z0-9]+)/i;
      const vehicleMatches = userMessages.match(vehiclePattern);
      if (vehicleMatches && vehicleMatches[1]) {
        extractedContent.vehicle = vehicleMatches[1];
      }
    }
    
    // Add assets to bequests
    if (assetsList.length > 0) {
      extractedContent.specificBequests = true;
      extractedContent.bequestsDetails = assetsList.join(', ');
    }
    
    // Add beneficiaries
    if (beneficiaries.length > 0) {
      const beneficiaryText = beneficiaries.length === 1 
        ? beneficiaries[0]
        : beneficiaries.slice(0, -1).join(', ') + ' and ' + beneficiaries[beneficiaries.length - 1];
        
      extractedContent.residualEstate = beneficiaryText;
    } else if (extractedContent.childrenNames) {
      extractedContent.residualEstate = extractedContent.childrenNames;
    } else if (extractedContent.leaveTo) {
      extractedContent.residualEstate = extractedContent.leaveTo;
    }
    
    return extractedContent;
  }, [messages, extractedResponses, assetsList, beneficiaries]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    if (isRecording) {
      toggleVoiceInput();
    }
    
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Extract information locally before sending to the edge function
      const extractedInfo = extractInformation(userMessage.content);
      
      const functionName = 'unified-will-assistant';
      const requestBody = {
        query: userMessage.content,
        template_type: templateId,
        conversation_history: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        progress: dataCollectionProgress,
        extracted_data: {
          ...extractedResponses,
          ...extractedInfo
        },
        contacts: contacts
      };
      
      console.log("Sending to edge function:", requestBody);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });
      
      if (error) {
        throw new Error(`Error calling AI assistant: ${error.message}`);
      }
      
      console.log("Response from edge function:", data);
      
      const aiResponse = data?.response || "I'm sorry, I couldn't generate a response. Let's try again.";
      
      // Update contacts if the AI response contains contact information
      if (data?.contacts && data.contacts.length > 0) {
        // Merge with existing contacts, avoiding duplicates
        const updatedContacts = [...contacts];
        
        data.contacts.forEach((newContact: Contact) => {
          const existingIndex = updatedContacts.findIndex(c => c.id === newContact.id);
          
          if (existingIndex >= 0) {
            updatedContacts[existingIndex] = {
              ...updatedContacts[existingIndex],
              ...newContact
            };
          } else {
            updatedContacts.push(newContact);
          }
        });
        
        setContacts(updatedContacts);
      }
      
      // Update extracted data from AI processing
      if (data?.extracted_data) {
        setExtractedResponses(prev => ({ ...prev, ...data.extracted_data }));
      }
      
      // Update progress indicators
      if (data?.progress) {
        setDataCollectionProgress(prev => ({ ...prev, ...data.progress }));
        
        // Check if we're ready to complete based on the progress
        if (data.progress.readyToComplete) {
          setIsReadyToComplete(true);
        }
      }
      
      // Always check isComplete from response
      if (data?.isComplete) {
        setIsReadyToComplete(true);
      }
      
      const aiMessage: MessageType = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Force ready status after a few exchanges
      if (messages.filter(m => m.role === 'user').length >= 3) {
        setIsReadyToComplete(true);
      }
      
      if (session?.user?.id) {
        try {
          const saveResponse = await fetch('https://ksiinmxsycosnpchutuw.supabase.co/functions/v1/save-will-conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              conversation_data: [...messages, userMessage, aiMessage].map(m => ({
                role: m.role,
                content: m.content,
                timestamp: m.timestamp
              })),
              extracted_responses: { ...extractedResponses, ...extractedInfo },
              template_type: templateId,
              user_id: session.user.id
            }),
          });
          
          if (saveResponse.ok) {
            console.log("Saved will conversation data");
          }
        } catch (saveError) {
          console.error("Error calling save-will-conversation function:", saveError);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      
      const errorMessage: MessageType = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: "I'm sorry, I encountered an error. Let's try again.",
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Communication Error",
        description: "There was a problem connecting to the AI assistant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleGenerateWill = async () => {
    setIsGenerating(true);
    
    try {
      // Extract more comprehensive data from the conversation
      const finalResponses = extractConversationContent();
      
      // Add contact information to responses
      contacts.forEach(contact => {
        if (contact.role === 'Executor') {
          finalResponses.executorName = contact.name;
          finalResponses.executorEmail = contact.email;
          finalResponses.executorPhone = contact.phone;
        } else if (contact.role === 'Alternate Executor') {
          finalResponses.alternateExecutor = true;
          finalResponses.alternateExecutorName = contact.name;
        } else if (contact.role === 'Guardian') {
          finalResponses.guardianNeeded = true;
          finalResponses.guardianName = contact.name;
        }
      });
      
      // Add assets information
      if (assetsList.length > 0) {
        finalResponses.specificBequests = true;
        finalResponses.bequestsDetails = assetsList.join(', ');
      }
      
      console.log("Final extracted data for will generation:", finalResponses);
      console.log("Assets list:", assetsList);
      console.log("Beneficiaries list:", beneficiaries);
      console.log("Contacts list:", contacts);
      
      const generatedWillContent = generateWillContent(templateId, finalResponses);
      setGeneratedWill(generatedWillContent);
      
      const completionMessage: MessageType = {
        id: `completion-${Date.now()}`,
        role: 'system',
        content: "✅ Your will has been successfully generated! You can now review and edit it before finalizing.",
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      notifyInfo("Will Generated", "Your will has been generated successfully. You can now review and finalize it.");
      
      onComplete({
        responses: finalResponses,
