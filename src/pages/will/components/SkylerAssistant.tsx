import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageList } from './chat/MessageList';
import { InputArea } from './chat/InputArea';
import { Contact, Message as MessageType } from './types';
import { VideoRecorder } from './VideoRecorder';

interface SkylerAssistantProps {
  templateId: string;
  templateName: string;
  onComplete: (data: {
    responses: Record<string, any>;
    contacts: Contact[];
    documents: any[];
    videoBlob?: Blob;
    generatedWill: string;
  }) => void;
}

export function SkylerAssistant({ templateId, templateName, onComplete }: SkylerAssistantProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResponses, setExtractedResponses] = useState<Record<string, any>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [generatedWill, setGeneratedWill] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [dataCollectionProgress, setDataCollectionProgress] = useState({
    personalInfo: false,
    contacts: false,
    documents: false,
    video: false
  });
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const { toast } = useToast();
  
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
  }, [templateId, templateName]);
  
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
    const updates: Record<string, any> = {};
    
    // Personal information extraction
    const nameMatch = messageContent.match(/(?:my name is|I am|I'm) ([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (nameMatch && nameMatch[1]) {
      updates.fullName = nameMatch[1];
      setDataCollectionProgress(prev => ({ ...prev, personalInfo: true }));
    }
    
    // Marital status extraction
    if (/(?:I am|I'm) (single|married|divorced|widowed)/i.test(messageContent)) {
      const statusMatch = messageContent.match(/(?:I am|I'm) (single|married|divorced|widowed)/i);
      if (statusMatch && statusMatch[1]) {
        updates.maritalStatus = statusMatch[1].charAt(0).toUpperCase() + statusMatch[1].slice(1).toLowerCase();
      }
    }
    
    // Spouse information extraction
    const spouseMatch = messageContent.match(/(?:my spouse is|married to|wife is|husband is) ([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (spouseMatch && spouseMatch[1]) {
      updates.spouseName = spouseMatch[1];
    }
    
    // Contact extraction
    const executorMatch = messageContent.match(/(?:executor is|appointed) ([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (executorMatch && executorMatch[1]) {
      updates.executorName = executorMatch[1];
      
      // Check if we already have this contact
      const existingContact = contacts.find(c => c.name === executorMatch[1]);
      if (!existingContact) {
        const newContact: Contact = {
          id: `contact-${Date.now()}`,
          name: executorMatch[1],
          role: 'Executor',
          email: '',
          phone: '',
          address: ''
        };
        
        setContacts(prev => [...prev, newContact]);
      }
    }
    
    // Email pattern extraction
    const emailMatch = messageContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && emailMatch[0]) {
      const email = emailMatch[0];
      
      // Look for context to associate this email with a contact
      const lines = messageContent.split(/[.!?]/);
      for (const line of lines) {
        if (line.includes(email)) {
          for (const contact of contacts) {
            if (line.includes(contact.name)) {
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
      
      // Look for context to associate this phone with a contact
      const lines = messageContent.split(/[.!?]/);
      for (const line of lines) {
        if (line.includes(phone)) {
          for (const contact of contacts) {
            if (line.includes(contact.name)) {
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
    
    // Check if we have at least one executor with contact info
    if (contacts.some(c => c.role === 'Executor' && (c.email || c.phone))) {
      setDataCollectionProgress(prev => ({ ...prev, contacts: true }));
    }
    
    setExtractedResponses(prev => ({ ...prev, ...updates }));
    return updates;
  }, [contacts]);
  
  // Check if all required data has been collected
  useEffect(() => {
    const { personalInfo, contacts, documents, video } = dataCollectionProgress;
    
    // If personal info and contacts are collected, and we have at least one document or video
    if (personalInfo && contacts && (documents || video)) {
      setIsComplete(true);
    }
    
    // If all data is collected, generate the will
    if (personalInfo && contacts && documents && video && !isGenerating && !generatedWill) {
      handleGenerateWill();
    }
  }, [dataCollectionProgress]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    if (isRecording) {
      toggleVoiceInput();
    }
    
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
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
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });
      
      if (error) {
        throw new Error(`Error calling AI assistant: ${error.message}`);
      }
      
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
      }
      
      // If the AI indicates we should prompt for video, trigger video recording
      if (data?.triggerVideo) {
        setTimeout(() => {
          startVideoRecording();
        }, 1500);
      }
      
      // If the AI indicates all data is collected, generate the will
      if (data?.isComplete) {
        setIsComplete(true);
        if (!generatedWill && !isGenerating) {
          setTimeout(() => {
            handleGenerateWill();
          }, 2000);
        }
      }
      
      const aiMessage: MessageType = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
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
        timestamp: new Date()
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
  
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      const userMessage: MessageType = {
        id: `user-upload-${Date.now()}`,
        role: 'user',
        content: `I'm uploading a document called "${file.name}"`,
        timestamp: new Date(),
        type: 'file',
        fileName: file.name
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Check if the bucket exists before uploading
      const { data: buckets, error: bucketsError } = await supabase.storage
        .listBuckets();
      
      if (bucketsError) {
        console.error('Error checking buckets:', bucketsError);
        throw new Error(`Storage error: ${bucketsError.message}`);
      }

      // Log available buckets for debugging
      console.log('Available buckets:', buckets?.map(b => b.id));
      
      // Use "will-documents" bucket as defined in storage.sql
      const bucketId = 'will-documents';
      const bucketExists = buckets?.some(b => b.id === bucketId);
      
      if (!bucketExists) {
        throw new Error(`Bucket "${bucketId}" not found. Available buckets: ${buckets?.map(b => b.id).join(', ')}`);
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/will-documents/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucketId)
        .getPublicUrl(filePath);
      
      const newDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: fileExt,
        path: filePath,
        url: publicUrl,
        size: file.size
      };
      
      setDocuments(prev => [...prev, newDocument]);
      
      // Update data collection progress
      setDataCollectionProgress(prev => ({ ...prev, documents: true }));
      
      const assistantMessage: MessageType = {
        id: `assistant-upload-${Date.now()}`,
        role: 'assistant',
        content: `Thank you for uploading "${file.name}". This document has been added to your will. Tell me more about why this document is important for your estate planning.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      console.error("Error handling file upload:", error);
      
      const errorMessage: MessageType = {
        id: `error-upload-${Date.now()}`,
        role: 'system',
        content: `Error uploading file: ${error.message || "Unknown error"}. Please try again.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Upload Error",
        description: error.message || "There was a problem uploading your document. Please try again.",
        variant: "destructive"
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoButtonClick = () => {
    setShowVideoRecorder(true);
    
    const recordingMessage: MessageType = {
      id: `recording-start-${Date.now()}`,
      role: 'system',
      content: "Video recording has started. Speak clearly about your wishes and intentions. Click the stop button when you're finished.",
      timestamp: new Date(),
      type: 'video-start'
    };
    
    setMessages(prev => [...prev, recordingMessage]);
  };
  
  const handleVideoComplete = (blob: Blob) => {
    setVideoBlob(blob);
    setShowVideoRecorder(false);
    
    const videoURL = URL.createObjectURL(blob);
    
    const videoMessage: MessageType = {
      id: `video-${Date.now()}`,
      role: 'user',
      content: "I've recorded my video testament.",
      timestamp: new Date(),
      type: 'video',
      fileUrl: videoURL
    };
    
    setMessages(prev => [...prev, videoMessage]);
    
    // Update data collection progress
    setDataCollectionProgress(prev => ({ ...prev, video: true }));
    
    const assistantMessage: MessageType = {
      id: `assistant-video-${Date.now()}`,
      role: 'assistant',
      content: "Thank you for recording your video testament. This adds a personal touch to your will and can help clarify your intentions. Now that we have all the necessary information, I'll generate your will document.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
  };
  
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const recordingMessage: MessageType = {
        id: `recording-start-${Date.now()}`,
        role: 'system',
        content: "Video recording has started. Speak clearly about your wishes and intentions. Click the stop button when you're finished.",
        timestamp: new Date(),
        type: 'video-start'
      };
      
      setMessages(prev => [...prev, recordingMessage]);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        
        const videoURL = URL.createObjectURL(blob);
        
        const videoMessage: MessageType = {
          id: `video-${Date.now()}`,
          role: 'user',
          content: "I've recorded my video testament.",
          timestamp: new Date(),
          type: 'video',
          fileUrl: videoURL
        };
        
        setMessages(prev => [...prev, videoMessage]);
        
        // Update data collection progress
        setDataCollectionProgress(prev => ({ ...prev, video: true }));
        
        const assistantMessage: MessageType = {
          id: `assistant-video-${Date.now()}`,
          role: 'assistant',
          content: "Thank you for recording your video testament. This adds a personal touch to your will and can help clarify your intentions. Now that we have all the necessary information, I'll generate your will document.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorderRef.current.start();
      
    } catch (error) {
      console.error("Error starting video recording:", error);
      
      toast({
        title: "Recording Error",
        description: "There was a problem accessing your camera or microphone. Please check your permissions and try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };
  
  const handleGenerateWill = async () => {
    setIsGenerating(true);
    
    try {
      const finalResponses = { ...extractedResponses };
      
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
      
      const generatedWillContent = generateWillContent(templateId, finalResponses);
      setGeneratedWill(generatedWillContent);
      
      setTimeout(() => {
        const completionMessage: MessageType = {
          id: `completion-${Date.now()}`,
          role: 'system',
          content: "✅ Your will has been successfully generated! Now you can review and edit it before finalizing.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        
        onComplete({
          responses: finalResponses,
          contacts,
          documents,
          videoBlob: videoBlob || undefined,
          generatedWill: generatedWillContent
        });
      }, 2000);
      
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
    if (templateId === 'digital-assets') {
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
Date: ${new Date().toLocaleDateString()}
Witnesses: [Witness 1], [Witness 2]`;
    } else {
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
Date: ${new Date().toLocaleDateString()}
Witnesses: [Witness 1], [Witness 2]`;
    }
  };
  
  return (
    <div className="flex flex-col h-[70vh]">
      {showVideoRecorder ? (
        <VideoRecorder onRecordingComplete={handleVideoComplete} />
      ) : (
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
            <MessageList messages={messages} onStopRecording={stopVideoRecording} />
          </CardContent>

          <InputArea
            inputValue={inputValue}
            setInputValue={setInputValue}
            isProcessing={isProcessing}
            isRecording={isRecording}
            recordingSupported={recordingSupported}
            currentStage="unified"
            onSendMessage={handleSendMessage}
            onToggleVoiceInput={toggleVoiceInput}
            onFileButtonClick={handleFileButtonClick}
            onVideoButtonClick={handleVideoButtonClick}
          />
        </Card>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />

      <video ref={videoRef} style={{ display: 'none' }} />
    </div>
  );
}
