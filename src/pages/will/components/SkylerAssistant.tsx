import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  User,
  Bot,
  ArrowRight,
  Loader2,
  Check,
  Mic,
  MicOff,
  Paperclip,
  FileText,
  Video,
  Camera,
  Upload,
  Sparkles,
} from 'lucide-react';

type MessageRole = 'user' | 'assistant' | 'system';
type StageType = 'information' | 'contacts' | 'documents' | 'video' | 'review';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  type?: 'text' | 'file' | 'video';
  fileUrl?: string;
  fileName?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: string;
}

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
  const [currentStage, setCurrentStage] = useState<StageType>('information');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResponses, setExtractedResponses] = useState<Record<string, any>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [generatedWill, setGeneratedWill] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const getWelcomeMessage = (templateId: string, templateName: string) => {
    let welcomeMessage = `👋 Hello! I'm SKYLER, your AI will assistant. I'll guide you through creating a ${templateName}. Let's start with the basics: What is your full legal name?`;
    
    if (templateId === 'digital-assets') {
      welcomeMessage = `👋 Hello! I'm SKYLER, your AI will assistant specializing in digital assets. I'll help you create a will that properly addresses your online accounts, cryptocurrency, and other digital property. Let's start with the basics: What is your full legal name?`;
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
  
  const extractInformation = useCallback(() => {
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
    const responses: Record<string, any> = {};
    
    const nameMatch = userMessages.find(msg => 
      /^(my name is|I am|I'm) ([A-Z][a-z]+ [A-Z][a-z]+)/i.test(msg)
    );
    if (nameMatch) {
      const nameRegex = /^(?:my name is|I am|I'm) ([A-Z][a-z]+ [A-Z][a-z]+)/i;
      const match = nameMatch.match(nameRegex);
      if (match && match[1]) {
        responses.fullName = match[1];
      }
    }
    
    const maritalStatusMatch = userMessages.find(msg => 
      /(single|married|divorced|widowed)/i.test(msg) && 
      /status/i.test(msg)
    );
    if (maritalStatusMatch) {
      if (maritalStatusMatch.match(/single/i)) responses.maritalStatus = 'Single';
      else if (maritalStatusMatch.match(/married/i)) responses.maritalStatus = 'Married';
      else if (maritalStatusMatch.match(/divorced/i)) responses.maritalStatus = 'Divorced';
      else if (maritalStatusMatch.match(/widowed/i)) responses.maritalStatus = 'Widowed';
    }
    
    if (templateId === 'digital-assets') {
      const digitalAssetsMatch = userMessages.find(msg => 
        /(cryptocurrency|crypto|bitcoin|ethereum|nft|digital assets|online accounts)/i.test(msg)
      );
      if (digitalAssetsMatch) {
        responses.digitalAssets = true;
        responses.digitalAssetsDetails = digitalAssetsMatch;
      }
    }
    
    setExtractedResponses(prev => ({ ...prev, ...responses }));
    return responses;
  }, [messages, templateId]);
  
  const checkContactsComplete = useCallback(() => {
    if (currentStage !== 'contacts') return false;
    
    const aiExplicitlyConfirmed = messages.some(m => 
      m.role === 'assistant' && 
      (
        m.content.toLowerCase().includes('all contact information has been collected successfully') ||
        m.content.toLowerCase().includes('contact collection phase is complete') ||
        m.content.toLowerCase().includes('contact collection phase is now complete') ||
        m.content.toLowerCase().includes('fantastic! thank you for confirming')
      ) &&
      !messages.some(next => 
        next.timestamp > m.timestamp && 
        next.role === 'assistant' && 
        (
          next.content.toLowerCase().includes('could you provide') || 
          next.content.toLowerCase().includes('can you give me') ||
          next.content.toLowerCase().includes('please provide')
        )
      )
    );
    
    if (aiExplicitlyConfirmed) {
      return true;
    }
    
    const aiStillAsking = messages.some(m => 
      m.role === 'assistant' && 
      (
        m.content.toLowerCase().includes('could you provide') || 
        m.content.toLowerCase().includes('can you give me') ||
        m.content.toLowerCase().includes('please provide')
      ) &&
      !messages.some(next => next.timestamp > m.timestamp && next.role === 'user')
    );
    
    if (aiStillAsking) {
      return false;
    }
    
    const executorName = extractedResponses.executorName;
    const alternateExecutorName = extractedResponses.alternateExecutorName;
    const guardianName = extractedResponses.guardianName;
    
    let requiredContactsCollected = true;
    
    if (executorName) {
      const executorDetailsProvided = messages.some(m => 
        m.role === 'user' && 
        (m.content.toLowerCase().includes('executor') || m.content.toLowerCase().includes(executorName.toLowerCase())) &&
        (m.content.includes('@') || 
         m.content.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) || 
         m.content.match(/\d+ .+[,\s].+/)
        )
      );
      requiredContactsCollected = requiredContactsCollected && executorDetailsProvided;
    }
    
    if (alternateExecutorName) {
      const alternateExecutorDetailsProvided = messages.some(m => 
        m.role === 'user' && 
        (m.content.toLowerCase().includes('alternate') || m.content.toLowerCase().includes(alternateExecutorName.toLowerCase())) &&
        (m.content.includes('@') || 
         m.content.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) || 
         m.content.match(/\d+ .+[,\s].+/)
        )
      );
      requiredContactsCollected = requiredContactsCollected && alternateExecutorDetailsProvided;
    }
    
    if (guardianName) {
      const guardianDetailsProvided = messages.some(m => 
        m.role === 'user' && 
        (m.content.toLowerCase().includes('guardian') || m.content.toLowerCase().includes(guardianName.toLowerCase())) &&
        (m.content.includes('@') || 
         m.content.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) || 
         m.content.match(/\d+ .+[,\s].+/)
        )
      );
      requiredContactsCollected = requiredContactsCollected && guardianDetailsProvided;
    }
    
    return requiredContactsCollected && !aiStillAsking;
  }, [currentStage, messages, extractedResponses]);
  
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
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || '';
      
      let functionName = 'gpt-will-assistant';
      let requestBody: any = {
        query: inputValue,
        template_type: templateId,
        conversation_history: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        current_stage: currentStage
      };
      
      if (currentStage === 'contacts') {
        functionName = 'will-contacts-assistant';
        requestBody = {
          ...requestBody,
          extracted_responses: extractedResponses
        };
      } else if (currentStage === 'documents') {
        functionName = 'will-documents-assistant';
        requestBody = {
          ...requestBody,
          extracted_responses: extractedResponses,
          contacts: contacts
        };
      } else if (currentStage === 'video') {
        functionName = 'will-video-assistant';
      }
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
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
      
      checkForStageCompletion(aiResponse);
      
      const responses = extractInformation();
      
      if (session?.user?.id) {
        try {
          const saveResponse = await fetch('https://ksiinmxsycosnpchutuw.supabase.co/functions/v1/save-will-conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              conversation_data: [...messages, userMessage, aiMessage].map(m => ({
                role: m.role,
                content: m.content,
                timestamp: m.timestamp
              })),
              extracted_responses: responses,
              template_type: templateId,
              user_id: session.user.id
            }),
          });
          
          if (saveResponse.ok) {
            const saveData = await saveResponse.json();
            console.log("Saved will conversation data:", saveData);
            
            if (saveData.extracted_entities) {
              setExtractedResponses(prev => ({ ...prev, ...saveData.extracted_entities }));
            }
          } else {
            console.error("Error saving will conversation:", await saveResponse.text());
          }
        } catch (saveError) {
          console.error("Error calling save-will-conversation function:", saveError);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      
      const errorMessage: Message = {
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
  
  const checkForStageCompletion = (aiResponse: string) => {
    const completionPhrases = [
      "we have all the information",
      "we've collected all the necessary information",
      "that completes all the",
      "we now have everything we need",
      "that covers all the essential information",
      "now ready for the next step",
      "let's proceed to the next stage",
      "now i have all the information needed",
      "contact collection phase is complete",
      "fantastic! thank you for confirming"
    ];
    
    const phraseMatches = completionPhrases.some(phrase => 
      aiResponse.toLowerCase().includes(phrase.toLowerCase())
    );
    
    let isComplete = false;
    
    if (currentStage === 'contacts') {
      const hasFollowUpQuestion = aiResponse.toLowerCase().includes('could you') || 
                                  aiResponse.toLowerCase().includes('please provide') ||
                                  aiResponse.toLowerCase().includes('can you give me');
      
      isComplete = phraseMatches && !hasFollowUpQuestion;
    } else {
      isComplete = phraseMatches || messages.length >= 15;
    }
    
    if (isComplete) {
      setTimeout(() => {
        const stageCompleteMessage: Message = {
          id: `stage-complete-${Date.now()}`,
          role: 'system',
          content: getStageCompletionMessage(currentStage, getNextStage(currentStage)),
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, stageCompleteMessage]);
      }, 1000);
    }
  };
  
  const getNextStage = (currentStage: StageType): StageType => {
    switch (currentStage) {
      case 'information':
        return 'contacts';
      case 'contacts':
        return 'documents';
      case 'documents':
        return 'video';
      case 'video':
        return 'review';
      default:
        return 'review';
    }
  };
  
  const getStageCompletionMessage = (currentStage: StageType, nextStage: StageType) => {
    switch (currentStage) {
      case 'information':
        return "✅ Great! We've collected all the necessary information about your wishes and requirements. Now let's gather contact information for the key people mentioned in your will.";
      case 'contacts':
        return "✅ All contact information has been collected successfully. Next, let's upload any supporting documents for your will.";
      case 'documents':
        return "✅ Thank you for uploading the documents. Now, let's record a video testament to add a personal touch to your will.";
      case 'video':
        return "✅ Video testament recorded successfully. Let's review everything before finalizing your will.";
      default:
        return "✅ Stage completed. Let's move to the next step.";
    }
  };
  
  const handleStageTransition = () => {
    if (currentStage === 'contacts' && !checkContactsComplete()) {
      toast({
        title: "Contact Information Incomplete",
        description: "Please provide all required contact information before continuing.",
        variant: "destructive"
      });
      return;
    }
    
    const nextStage = getNextStage(currentStage);
    
    setCurrentStage(nextStage);
    
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: `welcome-${nextStage}-${Date.now()}`,
        role: 'assistant',
        content: getStageWelcomeMessage(nextStage),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, welcomeMessage]);
    }, 500);
  };
  
  const getStageWelcomeMessage = (stage: StageType) => {
    switch (stage) {
      case 'contacts':
        return "Now let's collect contact information for the people you mentioned. Let's start with your executor. Could you provide their full name, email, phone number, and address?";
      case 'documents':
        return "Now I'd like you to upload any supporting documents for your will. This could include property deeds, insurance policies, or any other relevant documents. You can click the paperclip icon to upload a document.";
      case 'video':
        return "Let's record a video testament to accompany your will. This can provide a personal touch and help clarify your intentions. When you're ready, click the camera icon to start recording.";
      case 'review':
        return "Let's review all the information you've provided before generating your will. If everything looks correct, we can proceed with generating the final will document.";
      default:
        return "Let's continue with the next step of creating your will.";
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
      const userMessage: Message = {
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
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/will-documents/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('will-documents')
        .upload(filePath, file);
      
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('will-documents')
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
      
      const assistantMessage: Message = {
        id: `assistant-upload-${Date.now()}`,
        role: 'assistant',
        content: `Thank you for uploading "${file.name}". This document has been added to your will. Do you have any other documents to upload?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error("Error handling file upload:", error);
      
      toast({
        title: "Upload Error",
        description: "There was a problem uploading your document. Please try again.",
        variant: "destructive"
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
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
        
        const videoMessage: Message = {
          id: `video-${Date.now()}`,
          role: 'user',
          content: "I've recorded my video testament.",
          timestamp: new Date(),
          type: 'video',
          fileUrl: videoURL
        };
        
        setMessages(prev => [...prev, videoMessage]);
        
        const assistantMessage: Message = {
          id: `assistant-video-${Date.now()}`,
          role: 'assistant',
          content: "Thank you for recording your video testament. This will be a valuable addition to your will. Is there anything else you'd like to add before we review everything?",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorderRef.current.start();
      
      const recordingMessage: Message = {
        id: `recording-start-${Date.now()}`,
        role: 'system',
        content: "Video recording has started. Speak clearly about your wishes and intentions. Click the stop button when you're finished.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, recordingMessage]);
      
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
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleGenerateWill = async () => {
    setIsGenerating(true);
    
    try {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 95) {
          clearInterval(progressInterval);
        }
        setProgress(progress);
      }, 200);
      
      const finalResponses = extractInformation();
      
      const generatedWillContent = generateWillContent(templateId, finalResponses);
      setGeneratedWill(generatedWillContent);
      
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        const completionMessage: Message = {
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
      
      setIsGenerating(false);
      setProgress(0);
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
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
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
                            <span className="text-xs font-semibold text-willtank-600">SKYLER</span>
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
                      
                      {message.type === 'file' ? (
                        <div className="flex items-center text-sm">
                          <Paperclip className="h-4 w-4 mr-2" />
                          <span>Uploaded: {message.fileName}</span>
                        </div>
                      ) : message.type === 'video' ? (
                        <div className="space-y-2">
                          <p className="text-sm">{message.content}</p>
                          <video 
                            src={message.fileUrl} 
                            controls 
                            className="w-full h-auto rounded border"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      ) : (
                        <p className="whitespace-pre-line text-sm">{message.content}</p>
                      )}
                      
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
                        <span className="text-xs font-semibold text-willtank-600">SKYLER</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-willtank-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-willtank-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 bg-willtank-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        
        {currentStage === 'video' && videoRef.current && streamRef.current && (
          <div className="p-4 border-t bg-gray-50">
            <div className="relative">
              <video 
                ref={videoRef} 
                className="w-full h-auto rounded border"
                style={{ maxHeight: '200px' }}
                muted 
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={stopVideoRecording}
              >
                Stop Recording
              </Button>
            </div>
          </div>
        )}
        
        {currentStage === 'review' && isGenerating ? (
          <div className="p-4 border-t">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Generating your will document</span>
                <span className="text-sm">{progress}%</span>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <p className="text-sm text-gray-500">
                {progress < 30 && "Analyzing your responses..."}
                {progress >= 30 && progress < 60 && "Structuring your will document..."}
                {progress >= 60 && progress < 90 && "Generating legal clauses..."}
                {progress >= 90 && "Finalizing your document..."}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <Input
                placeholder={isProcessing ? "SKYLER is thinking..." : "Type your message..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="flex-grow"
              />
              
              {recordingSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={isRecording ? "bg-willtank-100 text-willtank-700" : ""}
                  onClick={toggleVoiceInput}
                  disabled={isProcessing}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              
              {currentStage === 'documents' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleFileButtonClick}
                    disabled={isProcessing}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </>
              )}
              
              {currentStage === 'video' && !streamRef.current && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={startVideoRecording}
                  disabled={isProcessing}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                type="button"
                disabled={!inputValue.trim() || isProcessing}
                size="icon"
                onClick={handleSendMessage}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {messages.some(m => m.id.startsWith('stage-complete')) && (
              <div className="mt-4">
                <Button
                  onClick={handleStageTransition}
                  className="w-full"
                  disabled={currentStage === 'contacts' && !checkContactsComplete()}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue to {getNextStage(currentStage) === 'contacts' ? 'Contact Collection' : 
                    getNextStage(currentStage) === 'documents' ? 'Document Upload' :
                    getNextStage(currentStage) === 'video' ? 'Video Testament' : 'Review'}
                </Button>
              </div>
            )}
            
            {currentStage === 'review' && !isGenerating && messages.length > 5 && (
              <div className="mt-4">
                <Button
                  onClick={handleGenerateWill}
                  className="w-full pulse-animation"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate My Will Document
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
      
      <style>{`
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
      `}</style>
    </div>
  );
}
