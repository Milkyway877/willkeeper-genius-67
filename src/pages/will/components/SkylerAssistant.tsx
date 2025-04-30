
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageList } from './chat/MessageList';
import { InputArea } from './chat/InputArea';
import { Contact, Message as MessageType } from './types';
import { Button } from '@/components/ui/button';

interface SkylerAssistantProps {
  templateId: string;
  templateName: string;
  onComplete: (data: {
    responses: Record<string, any>;
    contacts: Contact[];
    documents?: any[];
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
  const [isComplete, setIsComplete] = useState(false);
  const [showForceComplete, setShowForceComplete] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [dataCollectionProgress, setDataCollectionProgress] = useState({
    personalInfo: false,
    contacts: false
  });
  
  const recognitionRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  
  const { toast } = useToast();
  
  // Initialize with welcome message
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

    // Show force complete button after 6 messages
    const checkMessageCount = () => {
      if (messageCount >= 6 && !showForceComplete) {
        setShowForceComplete(true);
      }
    };

    checkMessageCount();
  }, [templateId, templateName, messageCount, showForceComplete]);
  
  const getWelcomeMessage = (templateId: string, templateName: string) => {
    const baseMessage = `👋 Hello! I'm SKYLER, your AI will assistant. I'll guide you through creating a ${templateName} through a simple conversation. Let's start with the basics:`;
    
    const questions = [
      "• What is your full legal name?",
      "• What is your marital status (single, married, divorced, widowed)?",
      "• Do you have any children? If yes, please provide their names and ages.",
      "• Who would you like to appoint as the executor of your will?",
      "• Do you have any specific bequests you'd like to include?",
      "• How would you like your remaining assets to be distributed?"
    ];
    
    let specializedQuestions: string[] = [];
    
    if (templateId === 'digital-assets') {
      specializedQuestions = [
        "• What digital assets do you own (cryptocurrency, online accounts, digital files)?",
        "• Who should have access to your digital assets?",
        "• Do you have any specific instructions for your social media accounts?"
      ];
    } else if (templateId === 'living-trust') {
      specializedQuestions = [
        "• Who would you like to name as trustee?",
        "• Who are the beneficiaries of your trust?",
        "• Under what conditions should assets be distributed?"
      ];
    } else if (templateId === 'family') {
      specializedQuestions = [
        "• Who are your immediate family members?",
        "• Do you have any guardianship provisions for minor children?",
        "• Are there any family heirlooms you want to specifically address?"
      ];
    } else if (templateId === 'business') {
      specializedQuestions = [
        "• What business interests do you own?",
        "• Who should take over your business interests?",
        "• Do you have a business succession plan in place?"
      ];
    } else if (templateId === 'charity') {
      specializedQuestions = [
        "• Which charitable organizations would you like to include in your will?",
        "• What type of charitable gifts would you like to make?",
        "• Do you want to establish any charitable trusts?"
      ];
    }
    
    const combinedQuestions = [...questions, ...specializedQuestions];
    const questionsText = combinedQuestions.join("\n");
    
    return `${baseMessage}\n\nI'll be asking you about:\n${questionsText}\n\nLet's begin with your full legal name.`;
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
  
  const extractInformation = useCallback((messageContent: string) => {
    console.log("Extracting information from:", messageContent);
    const updates: Record<string, any> = {};
    
    // Personal information extraction
    const nameMatch = messageContent.match(/(?:my name is|I am|I'm) ([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (nameMatch && nameMatch[1]) {
      updates.fullName = nameMatch[1];
      setDataCollectionProgress(prev => ({ ...prev, personalInfo: true }));
      console.log("Extracted name:", nameMatch[1]);
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
    const spouseMatch = messageContent.match(/(?:my spouse is|married to|wife is|husband is) ([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (spouseMatch && spouseMatch[1]) {
      updates.spouseName = spouseMatch[1];
      console.log("Extracted spouse name:", spouseMatch[1]);
    }
    
    // Contact extraction
    const executorMatch = messageContent.match(/(?:executor is|appointed) ([A-Z][a-z]+ [A-Z][a-z]+)/i);
    if (executorMatch && executorMatch[1]) {
      updates.executorName = executorMatch[1];
      console.log("Extracted executor:", executorMatch[1]);
      
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
      console.log("Extracted email:", email);
      
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
      console.log("Extracted phone:", phone);
      
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
      console.log("Contact data collection complete");
    }
    
    setExtractedResponses(prev => ({ ...prev, ...updates }));
    return updates;
  }, [contacts]);
  
  // Check if all required data has been collected and show completion message
  useEffect(() => {
    console.log("Progress check:", dataCollectionProgress);
    console.log("Contacts:", contacts);
    console.log("Is complete:", isComplete);
    console.log("Generated will:", generatedWill ? "exists" : "not generated");

    const { personalInfo, contacts: contactsCollected } = dataCollectionProgress;
    
    // If personal info and contacts are collected
    if (personalInfo && contactsCollected && !isGenerating && !generatedWill && !isComplete) {
      console.log("Setting isComplete to true");
      setIsComplete(true);
      
      const completionMessage: MessageType = {
        id: `completion-ready-${Date.now()}`,
        role: 'assistant',
        content: "✅ Great! I have all the necessary information to generate your will. Click the 'Generate Will' button below when you're ready.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
    }
  }, [dataCollectionProgress, isGenerating, generatedWill, isComplete, contacts]);
  
  // Track message count for force complete button
  useEffect(() => {
    setMessageCount(messages.length);
  }, [messages]);

  // Force completion function
  const forceCompletion = () => {
    if (!isComplete && !generatedWill) {
      console.log("Forcing completion");
      setIsComplete(true);
      
      // Check if we have minimum required data
      if (!dataCollectionProgress.personalInfo && extractedResponses.fullName) {
        setDataCollectionProgress(prev => ({ ...prev, personalInfo: true }));
      }
      
      if (!dataCollectionProgress.contacts && contacts.length > 0) {
        setDataCollectionProgress(prev => ({ ...prev, contacts: true }));
      }
      
      // If we don't have an executor yet, create a placeholder
      if (!contacts.some(c => c.role === 'Executor')) {
        const newExecutor: Contact = {
          id: `contact-${Date.now()}`,
          name: "Executor to be specified",
          role: 'Executor',
          email: '',
          phone: '',
          address: ''
        };
        
        setContacts(prev => [...prev, newExecutor]);
      }
      
      // Add completion message
      const completionMessage: MessageType = {
        id: `forced-completion-${Date.now()}`,
        role: 'assistant',
        content: "✅ I've gathered enough information to generate your will. Click the 'Generate Will' button below to continue.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
    }
  };
  
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
      
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: requestBody
        });
        
        if (error) {
          throw new Error(`Error calling AI assistant: ${error.message}`);
        }
        
        const aiResponse = data?.response || "I'll continue gathering information for your will. What else would you like to share?";
        
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
        
        // If the AI indicates all data is collected, update completion status
        if (data?.isComplete) {
          setIsComplete(true);
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
      } catch (aiError) {
        console.error("Error with AI function:", aiError);
        
        // Fallback response if the Edge Function fails
        const fallbackMessage: MessageType = {
          id: `ai-fallback-${Date.now()}`,
          role: 'assistant',
          content: "I've recorded your information. Can you tell me more about what you'd like to include in your will?",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
        
        // After a few messages, start showing the force complete button
        if (messages.length > 5) {
          setShowForceComplete(true);
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

  const generateWillContent = (templateId: string, data: Record<string, any>) => {
    // This is improved to generate better structured wills based on the template
    const fullName = data.fullName || 'Unknown Name';
    const spouseName = data.spouseName || 'Not Specified';
    const executorName = data.executorName || 'Not Specified';
    const maritalStatus = data.maritalStatus || 'Not Specified';
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    let content = `LAST WILL AND TESTAMENT OF ${fullName.toUpperCase()}\n\n`;
    content += `I, ${fullName}, a resident of [Your City], being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.\n\n`;
    
    if (maritalStatus.toLowerCase() === 'married' && spouseName) {
      content += `ARTICLE I: MARRIAGE\nI declare that I am married to ${spouseName}.\n\n`;
    } else {
      content += `ARTICLE I: MARITAL STATUS\nI declare that I am ${maritalStatus}.\n\n`;
    }
    
    content += `ARTICLE II: EXECUTOR\nI hereby nominate and appoint ${executorName} as Executor of this Will.\n\n`;
    
    content += `ARTICLE III: DISTRIBUTION OF ESTATE\nI direct that all my debts, funeral expenses, and costs of administering my estate be paid as soon as practicable after my death.\n\n`;
    
    // Add more specific content based on the template type
    if (templateId === 'digital-assets') {
      content += `ARTICLE IV: DIGITAL ASSETS\nI direct that my digital assets, including online accounts, cryptocurrency, and digital files, be distributed as follows: ${data.digitalAssetsDetails || '[To be specified]'}.\n\n`;
      content += `ARTICLE V: PASSWORD ACCESS\nI have provided my executor with instructions on how to access my password manager and digital accounts in a separate confidential document.\n\n`;
    } else if (templateId === 'family') {
      if (data.hasChildren) {
        content += `ARTICLE IV: CHILDREN\nI have the following children: ${data.childrenNames || '[Names to be specified]'}.\n\n`;
        content += `ARTICLE V: GUARDIANSHIP\nIf needed, I appoint ${data.guardianName || '[Guardian name to be specified]'} as guardian of my minor children.\n\n`;
      }
      content += `ARTICLE ${data.hasChildren ? 'VI' : 'IV'}: FAMILY PROVISIONS\nI direct that my assets be distributed to my family members as follows: ${data.familyDistribution || '[To be specified]'}.\n\n`;
    } else if (templateId === 'business') {
      content += `ARTICLE IV: BUSINESS INTERESTS\nI direct that my business interests be handled as follows: ${data.businessDetails || '[To be specified]'}.\n\n`;
      content += `ARTICLE V: SUCCESSION PLAN\nMy business succession plan is as follows: ${data.successorDetails || '[To be specified]'}.\n\n`;
    } else if (templateId === 'charity') {
      content += `ARTICLE IV: CHARITABLE CONTRIBUTIONS\nI direct that the following charitable contributions be made from my estate: ${data.charityDetails || '[To be specified]'}.\n\n`;
      content += `ARTICLE V: CHARITABLE REMAINDER TRUST\nI establish a charitable remainder trust as follows: ${data.trustDetails || '[To be specified]'}.\n\n`;
    } else if (templateId === 'living-trust') {
      content += `ARTICLE IV: TRUST PROVISIONS\nThe following assets shall be held in trust under the following conditions: ${data.trustDetails || '[To be specified]'}.\n\n`;
      content += `ARTICLE V: TRUSTEE POWERS\nThe trustee shall have the following powers: ${data.trusteePowers || '[To be specified]'}.\n\n`;
    } else {
      content += `ARTICLE IV: SPECIFIC BEQUESTS\nI make the following specific bequests: ${data.specificBequests || '[To be specified]'}.\n\n`;
      content += `ARTICLE V: RESIDUARY ESTATE\nI give, devise, and bequeath my residuary estate as follows: ${data.residuaryDistribution || '[To be specified]'}.\n\n`;
    }
    
    content += `ARTICLE ${templateId === 'digital-assets' || templateId === 'family' || templateId === 'business' || templateId === 'charity' || templateId === 'living-trust' ? 'VI' : 'VI'}: RESIDUARY ESTATE\nI give, devise, and bequeath all the rest, residue, and remainder of my estate to: ${data.residuaryBeneficiary || '[To be specified]'}.\n\n`;
    
    content += `IN WITNESS WHEREOF, I have hereunto set my hand to this, my Last Will and Testament, on this ${currentDate}.\n\n`;
    
    content += `____________________________\n${fullName}, Testator\n\n`;
    
    content += `WITNESSES:\nThe foregoing instrument was signed, published, and declared by ${fullName} as their Last Will and Testament, in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses.\n\n`;
    
    content += `____________________________\nWitness 1 Signature\n\n`;
    content += `____________________________\nWitness 1 Name\n\n`;
    content += `____________________________\nWitness 1 Address\n\n`;
    
    content += `____________________________\nWitness 2 Signature\n\n`;
    content += `____________________________\nWitness 2 Name\n\n`;
    content += `____________________________\nWitness 2 Address\n\n`;
    
    return content;
  };
  
  const handleGenerateWill = () => {
    console.log("Generating will with data:", extractedResponses);
    console.log("Contacts:", contacts);

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
          generatedWill: generatedWillContent
        });
        
        setIsGenerating(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error generating will:", error);
      setIsGenerating(false);
      
      toast({
        title: "Generation Error",
        description: "There was a problem generating your will. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-willtank-50 flex items-center">
        <div className="flex items-center">
          <div className="mr-4 bg-willtank-100 p-2 rounded-full">
            <Bot className="h-6 w-6 text-willtank-700" />
          </div>
          <div>
            <h3 className="text-lg font-medium">SKYLER</h3>
            <p className="text-sm text-gray-500">AI Will Assistant</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto p-0 relative">
        <MessageList messages={messages} />
        
        {isComplete && !generatedWill && (
          <div className="p-4 bg-green-50 border-t border-green-100 flex justify-center">
            <button 
              onClick={handleGenerateWill}
              disabled={isGenerating}
              className={`px-6 py-3 text-white rounded-full shadow-lg flex items-center justify-center transform transition-transform duration-300 ${
                isGenerating 
                  ? "bg-gray-400" 
                  : "bg-gradient-to-r from-willtank-600 to-willtank-700 hover:scale-105 pulse-animation"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Generating Your Will...
                </>
              ) : (
                <>Generate Your Will</>
              )}
            </button>
          </div>
        )}
        
        {showForceComplete && !isComplete && !generatedWill && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Button 
              variant="outline"
              onClick={forceCompletion}
              className="flex items-center"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Information Collection
            </Button>
          </div>
        )}
      </CardContent>
      
      <div className="p-4 border-t border-gray-200">
        <InputArea 
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSubmit={handleSendMessage}
          isSubmitting={isProcessing}
          placeholder="Type your message here..."
          onVoiceToggle={recordingSupported ? toggleVoiceInput : undefined}
          isRecording={isRecording}
        />
      </div>
      
      <style>
        {`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(155, 135, 245, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(155, 135, 245, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(155, 135, 245, 0);
          }
        }
        `}
      </style>
    </Card>
  );
}
