import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageList } from './chat/MessageList';
import { InputArea } from './chat/InputArea';
import { Contact, Message as MessageType } from './types';
import { useSystemNotifications } from '@/hooks/use-system-notifications';

interface SkylerAssistantProps {
  templateId: string;
  templateName: string;
  onComplete: (data: {
    responses: Record<string, any>;
    contacts: Contact[];
    generatedWill: string;
  }) => void;
}

export function SkylerAssistant({ templateId, templateName, onComplete }: SkylerAssistantProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResponses, setExtractedResponses] = useState<Record<string, any>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [generatedWill, setGeneratedWill] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReadyToComplete, setIsReadyToComplete] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [dataCollectionProgress, setDataCollectionProgress] = useState({
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
    }
    
    // Name at beginning of sentence
    const nameMatchStart = messageContent.match(/^([A-Z][a-z]+ [A-Z][a-z]+)(?:\.|,| here)/i);
    if (nameMatchStart && nameMatchStart[1] && !updates.fullName) {
      updates.fullName = nameMatchStart[1];
      setDataCollectionProgress(prev => ({ ...prev, personalInfo: true }));
      console.log("Extracted name from start:", nameMatchStart[1]);
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
    
    setExtractedResponses(prev => ({ ...prev, ...updates }));
    return updates;
  }, [contacts, extractedResponses, exchangeCount, assetsList, beneficiaries]);
  
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
        contacts,
        generatedWill: generatedWillContent
      });
      
    } catch (error) {
      console.error("Error generating will:", error);
      
      toast({
        title: "Generation Error",
        description: "There was a problem generating your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateWillContent = (templateId: string, responses: Record<string, any>) => {
    const fullName = responses.fullName || 'Name not provided';
    const executorName = responses.executorName || 'Executor not specified';
    const executorEmail = responses.executorEmail ? `Email: ${responses.executorEmail}` : 'Email not provided';
    const executorPhone = responses.executorPhone ? `Phone: ${responses.executorPhone}` : 'Phone not provided';
    const maritalStatus = responses.maritalStatus || 'Marital status not specified';
    const spouseInfo = responses.spouseName ? ` to ${responses.spouseName}` : '';
    const hasChildren = responses.hasChildren || (responses.childrenNames ? true : false);
    const childrenNames = responses.childrenNames || 'Children not specified';
    const propertyAddress = responses.propertyAddress ? `${responses.propertyAddress}` : 'No property specified';
    const vehicleDetails = responses.vehicle ? `${responses.vehicle}` : 'No vehicle specified';
    const guardianName = responses.guardianName || 'Guardian not specified';
    const bequestsDetails = responses.bequestsDetails || 'No specific bequests';
    const residualEstate = responses.residualEstate || 'Not specified';
    const currentDate = new Date().toLocaleDateString();
    
    if (templateId === 'digital-assets') {
      return `DIGITAL ASSET WILL AND TESTAMENT OF ${fullName.toUpperCase()}

I, ${fullName}, being of sound mind, declare this to be my Digital Asset Will and Testament.

ARTICLE I: DIGITAL EXECUTOR
I appoint ${executorName} as my Digital Executor with authority to manage all my digital assets.
${executorEmail}
${executorPhone}

ARTICLE II: CRYPTOCURRENCY ASSETS
${responses.digitalAssetsDetails?.includes('crypto') ? `My cryptocurrency assets include: ${responses.digitalAssetsDetails}` : 'I have no cryptocurrency assets.'}

ARTICLE III: NFT ASSETS
${responses.digitalAssetsDetails?.includes('nft') ? `My NFT holdings include: ${responses.digitalAssetsDetails}` : 'I have no NFT assets.'}

ARTICLE IV: SOCIAL MEDIA ACCOUNTS
${responses.digitalAssetsDetails?.includes('social') ? `My social media accounts include: ${responses.digitalAssetsDetails}` : 'My social media accounts should be handled according to the individual platform policies.'}

ARTICLE V: EMAIL ACCOUNTS
${responses.digitalAssetsDetails?.includes('email') ? `My email accounts include: ${responses.digitalAssetsDetails}` : 'My email accounts should be closed after important information is saved.'}

ARTICLE VI: ACCESS INFORMATION
${responses.digitalAssetsDetails?.includes('password') ? `My access information is stored in: ${responses.digitalAssetsDetails}` : 'I have provided separate secure instructions for accessing my digital accounts.'}

ARTICLE VII: DIGITAL LEGACY PREFERENCES
My preferences for my digital legacy are: ${responses.digitalLegacyPreferences || 'I wish for my digital assets to be preserved where possible and deleted where appropriate, at the discretion of my Digital Executor.'}

Digitally signed by: ${fullName}
Date: ${currentDate}`;
    } else {
      return `LAST WILL AND TESTAMENT OF ${fullName.toUpperCase()}

I, ${fullName}, being of sound mind, declare this to be my Last Will and Testament.

ARTICLE I: REVOCATION
I revoke all previous wills and codicils.

ARTICLE II: FAMILY INFORMATION
I am ${maritalStatus}${spouseInfo}.
${hasChildren ? `I have the following children: ${childrenNames}.` : 'I have no children.'}

ARTICLE III: EXECUTOR
I appoint ${executorName} as the Executor of this Will.
${executorEmail}
${executorPhone}
${responses.alternateExecutor ? `If they are unable or unwilling to serve, I appoint ${responses.alternateExecutorName} as alternate Executor.` : ''}

${responses.guardianNeeded ? `ARTICLE IV: GUARDIAN
If needed, I appoint ${guardianName} as guardian of my minor children.` : ''}

ARTICLE ${responses.guardianNeeded ? 'V' : 'IV'}: DISPOSITION OF PROPERTY
${responses.specificBequests ? `I make the following specific bequests: ${bequestsDetails}` : ''}

${responses.propertyAddress ? `I own a property located at ${propertyAddress}.` : ''}
${responses.vehicle ? `I own a vehicle described as: ${vehicleDetails}.` : ''}

I give all my remaining property to ${residualEstate}.

ARTICLE ${responses.guardianNeeded ? 'VI' : 'V'}: DIGITAL ASSETS
${responses.digitalAssets ? `I direct my Executor regarding my digital assets as follows: ${responses.digitalAssetsDetails}` : 'I authorize my Executor to access, modify, control, archive, transfer, and delete my digital assets.'}

Digitally signed by: ${fullName}
Date: ${currentDate}`;
    }
  };
  
  return (
    <div className="flex flex-col h-[70vh]">
      <Card className="flex-1 flex flex-col overflow-hidden h-full">
        <CardHeader className="flex-shrink-0 border-b p-4">
          <div className="flex items-center">
            <div className="bg-willtank-50 p-1 rounded-full">
              <Bot className="h-6 w-6 text-willtank-600" />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold">SKYLER - Will AI Assistant</h3>
              <p className="text-xs text-gray-500">Creating your {templateName}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden">
          <MessageList messages={messages} />
        </CardContent>

        <InputArea
          inputValue={inputValue}
          setInputValue={setInputValue}
          isProcessing={isProcessing || isGenerating}
          isRecording={isRecording}
          recordingSupported={recordingSupported}
          currentStage="unified"
          onSendMessage={handleSendMessage}
          onToggleVoiceInput={toggleVoiceInput}
          onCompleteInfo={handleGenerateWill}
          isReadyToComplete={isReadyToComplete && !isGenerating}
        />
      </Card>
    </div>
  );
}
