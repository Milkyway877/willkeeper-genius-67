
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Video, Upload, Save, ChevronRight, ChevronLeft, X, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WILL_SECTIONS } from '@/services/willProgressService';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface GuidedWillEditorProps {
  willContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  readOnly?: boolean;
  lastEditedSection?: string;
}

const GUIDED_QUESTIONS = [
  {
    section: WILL_SECTIONS.PERSONAL_INFO,
    questions: [
      { id: 'name', question: "What is your full legal name?", placeholder: "e.g., John Michael Doe", required: true },
      { id: 'address', question: "What is your current residential address?", placeholder: "e.g., 123 Main Street, City, State, ZIP", required: true },
      { id: 'marital', question: "What is your marital status?", placeholder: "e.g., Single, Married, Divorced, Widowed", required: true }
    ]
  },
  {
    section: WILL_SECTIONS.ASSETS,
    questions: [
      { id: 'real-estate', question: "List any real estate properties you own:", placeholder: "e.g., Primary residence at [address], Vacation home at [address]", required: true },
      { id: 'bank-accounts', question: "List your major financial accounts:", placeholder: "e.g., Savings accounts, Investment accounts (no need for account numbers)", required: true },
      { id: 'valuables', question: "List any valuable personal property:", placeholder: "e.g., Vehicles, Jewelry, Art collections", required: true }
    ]
  },
  {
    section: WILL_SECTIONS.BENEFICIARIES,
    questions: [
      { id: 'primary-beneficiaries', question: "Who are your primary beneficiaries?", placeholder: "e.g., Spouse: [Name], Children: [Names]", required: true },
      { id: 'secondary-beneficiaries', question: "Who are your secondary beneficiaries?", placeholder: "e.g., Siblings, Parents, or Charitable organizations", required: true },
      { id: 'specific-bequests', question: "Are there any specific items you want to leave to specific people?", placeholder: "e.g., Family heirloom to [Name]", required: false }
    ]
  },
  {
    section: WILL_SECTIONS.EXECUTORS,
    questions: [
      { id: 'executor', question: "Who do you want to name as your primary executor?", placeholder: "e.g., [Full Name], Relationship: [Relationship]", required: true },
      { id: 'alternate-executor', question: "Who do you want to name as your alternate executor?", placeholder: "e.g., [Full Name], Relationship: [Relationship]", required: true }
    ]
  },
  {
    section: WILL_SECTIONS.GUARDIANS,
    questions: [
      { id: 'guardians', question: "If you have minor children, who do you want to name as their guardian?", placeholder: "e.g., [Full Name], Relationship: [Relationship]", required: false },
      { id: 'alternate-guardians', question: "Who do you want to name as alternate guardian?", placeholder: "e.g., [Full Name], Relationship: [Relationship]", required: false }
    ]
  },
  {
    section: WILL_SECTIONS.DIGITAL_ASSETS,
    questions: [
      { id: 'digital-assets', question: "List your important digital assets:", placeholder: "e.g., Email accounts, Social media, Cryptocurrency", required: true },
      { id: 'digital-executor', question: "Who should handle your digital assets?", placeholder: "e.g., [Name] will manage digital accounts", required: true }
    ]
  },
  {
    section: WILL_SECTIONS.FINAL_WISHES,
    questions: [
      { id: 'funeral', question: "Do you have specific funeral or burial wishes?", placeholder: "e.g., Cremation, Traditional burial, Memorial service preferences", required: true },
      { id: 'final-messages', question: "Any final messages or instructions for your loved ones?", placeholder: "e.g., Personal messages, Life advice, Family values to pass on", required: false }
    ]
  }
];

interface Attachment {
  id: string;
  type: string;
  name: string;
  size: string;
  url?: string;
}

export function GuidedWillEditor({ willContent, onContentChange, onSave, readOnly = false, lastEditedSection = WILL_SECTIONS.PERSONAL_INFO }: GuidedWillEditorProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [missingRequiredFields, setMissingRequiredFields] = useState<string[]>([]);
  const contentUpdatedRef = useRef(false);
  const { toast } = useToast();
  
  // Find the section index from section ID
  const findSectionIndex = (sectionId: string): number => {
    const index = GUIDED_QUESTIONS.findIndex(section => section.section === sectionId);
    return index >= 0 ? index : 0;
  };
  
  // Initialize with the last edited section if available
  useEffect(() => {
    if (lastEditedSection && !isInitialized) {
      const sectionIndex = findSectionIndex(lastEditedSection);
      setCurrentSection(sectionIndex);
    }
  }, [lastEditedSection, isInitialized]);
  
  // Parse existing will content into answers only once on initial load
  useEffect(() => {
    if (willContent && !isInitialized) {
      // Simple parsing logic - this could be enhanced based on your will format
      const parsedAnswers: Record<string, string> = {};
      let parsedAttachments: Attachment[] = [];
      
      // Parse answers from will content
      GUIDED_QUESTIONS.forEach(section => {
        section.questions.forEach(q => {
          const match = willContent.match(new RegExp(`${q.question}\\s*([^\\n]+)`));
          if (match?.[1]) {
            parsedAnswers[q.id] = match[1].trim();
          }
        });
      });
      
      // Look for attachment references in the will content
      const documentMatch = willContent.match(/Document:\s*([^\n]+)/g);
      const videoMatch = willContent.match(/Video:\s*([^\n]+)/g);
      
      if (documentMatch) {
        documentMatch.forEach((match, index) => {
          const name = match.replace(/Document:\s*/, '').trim();
          parsedAttachments.push({
            id: `doc-${index}`,
            type: 'document',
            name,
            size: '1.2 MB' // Placeholder size
          });
        });
      }
      
      if (videoMatch) {
        videoMatch.forEach((match, index) => {
          const name = match.replace(/Video:\s*/, '').trim();
          parsedAttachments.push({
            id: `video-${index}`,
            type: 'video',
            name,
            size: '8.4 MB' // Placeholder size
          });
        });
      }
      
      setAnswers(parsedAnswers);
      setAttachments(parsedAttachments);
      setIsInitialized(true);
    }
  }, [willContent, isInitialized]);

  // Separate effect for updating content to avoid unnecessary rerenders
  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(prevAnswers => {
      const newAnswers = { ...prevAnswers, [questionId]: value };
      
      // Mark that content has been updated
      contentUpdatedRef.current = true;
      
      // Generate updated will content
      let newContent = generateWillContent(newAnswers, attachments);
      
      // Only update parent component when we have a complete content update
      onContentChange(newContent);
      
      return newAnswers;
    });
  };

  const generateWillContent = (currentAnswers: Record<string, string>, currentAttachments: Attachment[]) => {
    let newContent = "LAST WILL AND TESTAMENT\n\n";
    
    GUIDED_QUESTIONS.forEach(section => {
      newContent += `\n== ${section.section.replace(/_/g, ' ').toUpperCase()} ==\n\n`;
      section.questions.forEach(q => {
        if (currentAnswers[q.id]) {
          newContent += `${q.question}\n${currentAnswers[q.id]}\n\n`;
        }
      });
    });
    
    if (currentAttachments.length > 0) {
      newContent += "\n== ATTACHMENTS ==\n\n";
      
      const documents = currentAttachments.filter(a => a.type === 'document');
      const videos = currentAttachments.filter(a => a.type === 'video');
      
      if (documents.length > 0) {
        newContent += "Documents:\n";
        documents.forEach(doc => {
          newContent += `Document: ${doc.name}\n`;
        });
        newContent += "\n";
      }
      
      if (videos.length > 0) {
        newContent += "Videos:\n";
        videos.forEach(video => {
          newContent += `Video: ${video.name}\n`;
        });
        newContent += "\n";
      }
    }
    
    return newContent;
  };

  const addAttachment = (type: string, name: string) => {
    const newAttachment: Attachment = {
      id: `${type}-${Date.now()}`,
      type,
      name,
      size: type === 'video' ? '10.4 MB' : '1.8 MB' // Placeholder sizes
    };
    
    setAttachments(prev => {
      const updated = [...prev, newAttachment];
      // Update will content with the new attachment
      const newContent = generateWillContent(answers, updated);
      onContentChange(newContent);
      return updated;
    });
    
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} added`,
      description: `${name} has been added to your will.`
    });
  };

  const removeAttachment = (id: string) => {
    const attachmentToRemove = attachments.find(a => a.id === id);
    
    if (!attachmentToRemove) return;
    
    // Check if this is a required attachment type
    const isRequiredType = attachmentToRemove.type === 'document' || attachmentToRemove.type === 'video';
    const hasOtherOfSameType = attachments.some(a => a.type === attachmentToRemove.type && a.id !== id);
    
    if (isRequiredType && !hasOtherOfSameType) {
      // Cannot remove the last required attachment of this type
      toast({
        title: "Cannot remove attachment",
        description: `Please upload a replacement ${attachmentToRemove.type} before removing this one.`,
        variant: "destructive"
      });
      return;
    }
    
    setAttachments(prev => {
      const updated = prev.filter(a => a.id !== id);
      // Update will content with the updated attachments
      const newContent = generateWillContent(answers, updated);
      onContentChange(newContent);
      return updated;
    });
    
    toast({
      title: "Attachment removed",
      description: `${attachmentToRemove.name} has been removed from your will.`
    });
  };

  const handleSave = () => {
    // Check for required fields in the current section
    const currentQuestions = GUIDED_QUESTIONS[currentSection].questions;
    const missingFields: string[] = [];
    
    currentQuestions.forEach(q => {
      if (q.required && (!answers[q.id] || answers[q.id].trim() === '')) {
        missingFields.push(q.id);
      }
    });
    
    if (missingFields.length > 0) {
      setShowValidationErrors(true);
      setMissingRequiredFields(missingFields);
      
      toast({
        title: "Missing required information",
        description: "Please fill in all required fields before saving.",
        variant: "destructive"
      });
      
      return;
    }
    
    onSave();
    toast({
      title: "Will Updated",
      description: "Your will has been saved successfully."
    });
    
    // Reset validation states
    setShowValidationErrors(false);
    setMissingRequiredFields([]);
  };

  const handleNavigateSection = (direction: 'next' | 'prev') => {
    // Check for required fields in current section before navigating
    if (direction === 'next') {
      const currentQuestions = GUIDED_QUESTIONS[currentSection].questions;
      const missingFields: string[] = [];
      
      currentQuestions.forEach(q => {
        if (q.required && (!answers[q.id] || answers[q.id].trim() === '')) {
          missingFields.push(q.id);
        }
      });
      
      if (missingFields.length > 0) {
        setShowValidationErrors(true);
        setMissingRequiredFields(missingFields);
        
        toast({
          title: "Missing required information",
          description: "Please fill in all required fields before continuing.",
          variant: "destructive"
        });
        
        return;
      }
    }
    
    // Navigate to next/prev section
    if (direction === 'next' && currentSection < GUIDED_QUESTIONS.length - 1) {
      setCurrentSection(curr => curr + 1);
      setShowValidationErrors(false);
      setMissingRequiredFields([]);
    } else if (direction === 'prev' && currentSection > 0) {
      setCurrentSection(curr => curr - 1);
      setShowValidationErrors(false);
      setMissingRequiredFields([]);
    }
  };

  const renderSectionProgress = () => {
    const totalSections = GUIDED_QUESTIONS.length;
    const progressPercentage = ((currentSection + 1) / totalSections) * 100;
    
    return (
      <div className="mt-2 mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Section {currentSection + 1} of {totalSections}</span>
          <span>{GUIDED_QUESTIONS[currentSection].section.replace(/_/g, ' ')}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    );
  };

  const isFieldRequired = (questionId: string) => {
    for (const section of GUIDED_QUESTIONS) {
      for (const question of section.questions) {
        if (question.id === questionId) {
          return !!question.required;
        }
      }
    }
    return false;
  };

  const isFieldMissing = (questionId: string) => {
    return showValidationErrors && 
           missingRequiredFields.includes(questionId);
  };

  const currentSectionData = GUIDED_QUESTIONS[currentSection];

  if (readOnly) {
    return (
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {willContent}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          You are editing your will. Answer the questions below to update your will content.
          Progress through each section using the navigation buttons.
        </AlertDescription>
      </Alert>

      {renderSectionProgress()}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">
          {currentSectionData.section.replace(/_/g, ' ').toUpperCase()}
        </h3>
        
        <div className="space-y-6">
          {currentSectionData.questions.map((q) => {
            const isRequired = isFieldRequired(q.id);
            const isMissing = isFieldMissing(q.id);
            
            return (
              <div key={q.id} className="space-y-2">
                <label className={`block font-medium text-sm ${isMissing ? 'text-red-600' : 'text-gray-700'}`}>
                  {q.question}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className={`min-h-[100px] ${isMissing ? 'border-red-500' : ''}`}
                  disabled={readOnly}
                />
                {isMissing && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    This field is required
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => handleNavigateSection('prev')}
          disabled={currentSection === 0}
        >
          <ChevronLeft className="mr-2" />
          Previous Section
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2" />
            Save Progress
          </Button>
        </div>

        <Button
          onClick={() => handleNavigateSection('next')}
          disabled={currentSection === GUIDED_QUESTIONS.length - 1}
        >
          Next Section
          <ChevronRight className="ml-2" />
        </Button>
      </div>

      {currentSection === GUIDED_QUESTIONS.length - 1 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Attachments and Media</h3>
          
          {/* Show existing attachments */}
          {attachments.length > 0 && (
            <div className="mb-6">
              <h4 className="text-base font-medium mb-2">Current Attachments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex justify-between items-center p-3 border rounded bg-white">
                    <div className="flex items-center gap-2">
                      {attachment.type === 'document' ? 
                        <FileText className="text-blue-500" /> : 
                        <Video className="text-red-500" />
                      }
                      <div>
                        <div className="font-medium">{attachment.name}</div>
                        <div className="text-sm text-gray-500">{attachment.size}</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4"
              onClick={() => addAttachment('video', `Video Message ${new Date().toLocaleDateString()}`)}
            >
              <Video className="mr-2" />
              {attachments.some(a => a.type === 'video') ? 'Add Another Video Message' : 'Record New Video Message'}
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4"
              onClick={() => addAttachment('document', `Document ${new Date().toLocaleDateString()}`)}
            >
              <FileText className="mr-2" />
              {attachments.some(a => a.type === 'document') ? 'Add More Documents' : 'Upload Documents'}
            </Button>
            <Button variant="outline" className="h-auto py-4">
              <Upload className="mr-2" />
              Upload Additional Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
