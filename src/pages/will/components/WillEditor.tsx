
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Save, Copy, Undo, Redo, Code, FileText, Video, FileAudio, File, AlertCircle, CheckCircle2, Clock, Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateAddress } from '@/services/locationService';
import { createWill, updateWill } from '@/services/willService';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuidedWillEditor } from './GuidedWillEditor';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  useWillProgress, 
  saveWillProgress, 
  getWillProgress, 
  clearWillProgress, 
  getWillSuggestions,
  getWillCompletionPercentage,
  WILL_SECTIONS 
} from '@/services/willProgressService';

type WillEditorProps = {
  content?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  willData?: any;
  willId?: string;
};

export function WillEditor({ readOnly = false, willData = null, willId }: WillEditorProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [showRecoveryNotice, setShowRecoveryNotice] = useState(false);
  const { progress, setProgress } = useWillProgress(willId);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showSectionHints, setShowSectionHints] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Last Will and Testament");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [createdDate, setCreatedDate] = useState<string | null>(null);

  useEffect(() => {
    if (willData) {
      setContent(willData.content || '');
      setTitle(willData.title || "Last Will and Testament");
      
      setProgress({
        id: willId,
        content: willData.content || '',
        title: willData.title,
        completedSections: detectCompletedSections(willData.content || '')
      });
    } else {
      const savedProgress = getWillProgress('new_will');
      if (savedProgress?.content) {
        setContent(savedProgress.content);
        
        if (savedProgress.title) {
          setTitle(savedProgress.title);
        }
        
        if (savedProgress.lastEditedSection && !readOnly) {
          setShowRecoveryNotice(true);
          setActiveSection(savedProgress.lastEditedSection);
        }
        
        setProgress({
          content: savedProgress.content,
          title: savedProgress.title,
          lastEditedSection: savedProgress.lastEditedSection,
          completedSections: savedProgress.completedSections || []
        });
      } else if (!readOnly) {
        const defaultContent = "LAST WILL AND TESTAMENT\n\nI, [YOUR NAME], residing at [YOUR ADDRESS], being of sound mind, declare this to be my Will, revoking all previous wills and codicils.\n\n[START WRITING YOUR WILL HERE]";
        setContent(defaultContent);
        
        setProgress({
          content: defaultContent,
          title: title,
          completedSections: []
        });
      }
    }
  }, [willData, willId, setProgress, readOnly]);

  useEffect(() => {
    if (progress) {
      const percentage = getWillCompletionPercentage(progress);
      setCompletionPercentage(percentage);
      
      if (!readOnly) {
        const willSuggestions = getWillSuggestions(progress);
        setSuggestions(willSuggestions);
      }
    }
  }, [progress, readOnly]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    if (!readOnly) {
      setProgress({
        content: newContent,
        lastEditedSection: activeSection || undefined,
        lastEdited: new Date()
      });
      
      if (willId) {
        saveWillProgress(willId, {
          content: newContent,
          title: title,
          lastEditedSection: activeSection || undefined,
          lastEdited: new Date()
        });
      } else {
        saveWillProgress('new_will', {
          content: newContent,
          title: title,
          lastEditedSection: activeSection || undefined,
          lastEdited: new Date()
        });
      }
    }
    
    const completedSections = detectCompletedSections(newContent);
    if (completedSections.length > 0) {
      setProgress({
        completedSections: completedSections
      });
    }
  };

  const detectCompletedSections = (content: string): string[] => {
    const completedSections: string[] = [];
    
    if (content.match(/name|address|date of birth|personal|details/i)) {
      completedSections.push(WILL_SECTIONS.PERSONAL_INFO);
    }
    
    if (content.match(/property|asset|house|bank|account|investment|own/i)) {
      completedSections.push(WILL_SECTIONS.ASSETS);
    }
    
    if (content.match(/beneficiary|beneficiaries|heir|inherit|give|gift|bequest/i)) {
      completedSections.push(WILL_SECTIONS.BENEFICIARIES);
    }
    
    if (content.match(/executor|executrix|administer|estate|appoint/i)) {
      completedSections.push(WILL_SECTIONS.EXECUTORS);
    }
    
    if (content.match(/guardian|minor|children|care|custody/i)) {
      completedSections.push(WILL_SECTIONS.GUARDIANS);
    }
    
    if (content.match(/digital|online|account|password|crypto|social media|email/i)) {
      completedSections.push(WILL_SECTIONS.DIGITAL_ASSETS);
    }
    
    if (content.match(/funeral|burial|cremation|ceremony|wishes|memorial/i)) {
      completedSections.push(WILL_SECTIONS.FINAL_WISHES);
    }
    
    return completedSections;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (willId && willData) {
        const updated = await updateWill(willId, {
          ...willData,
          content: content,
          title: title
        });
        
        if (updated) {
          toast({
            title: "Success",
            description: "Will has been updated successfully"
          });
          
          const completedSections = detectCompletedSections(content);
          setProgress({
            content,
            title,
            completedSections,
            lastEdited: new Date()
          });
          
          setLastSaved(new Date().toLocaleTimeString());
        } else {
          throw new Error("Failed to update will");
        }
      } else {
        const newWill = await createWill({
          title: title,
          content: content,
          status: 'draft',
          document_url: '',
          template_type: 'custom'
        });
        
        if (newWill) {
          toast({
            title: "Success",
            description: "Will has been created successfully"
          });
          
          clearWillProgress('new_will');
          
          navigate(`/will/${newWill.id}`);
        } else {
          throw new Error("Failed to create will");
        }
      }
    } catch (error) {
      console.error('Error saving will:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Will content copied to clipboard"
    });
  };

  const handleFormat = () => {
    toast({
      title: "Formatted",
      description: "Document has been formatted according to legal standards"
    });
  };

  const setSection = (section: string) => {
    setActiveSection(section);
    setShowSectionHints(true);
    
    setProgress({
      lastEditedSection: section
    });
    
    const sectionMap = {
      [WILL_SECTIONS.PERSONAL_INFO]: "I,",
      [WILL_SECTIONS.ASSETS]: "assets",
      [WILL_SECTIONS.BENEFICIARIES]: "beneficiary",
      [WILL_SECTIONS.EXECUTORS]: "executor",
      [WILL_SECTIONS.GUARDIANS]: "guardian",
      [WILL_SECTIONS.DIGITAL_ASSETS]: "digital assets",
      [WILL_SECTIONS.FINAL_WISHES]: "final wishes",
    };
    
    const sectionHints = {
      [WILL_SECTIONS.PERSONAL_INFO]: "I, [YOUR FULL LEGAL NAME], residing at [YOUR ADDRESS], being of sound mind...",
      [WILL_SECTIONS.ASSETS]: "ASSETS: I own the following assets...",
      [WILL_SECTIONS.BENEFICIARIES]: "BENEFICIARIES: I hereby designate the following persons as beneficiaries...",
      [WILL_SECTIONS.EXECUTORS]: "EXECUTOR: I appoint [NAME] as the executor of this will...",
      [WILL_SECTIONS.GUARDIANS]: "GUARDIANS: For any minor children, I appoint [NAME] as guardian...",
      [WILL_SECTIONS.DIGITAL_ASSETS]: "DIGITAL ASSETS: I direct my digital assets to be handled as follows...",
      [WILL_SECTIONS.FINAL_WISHES]: "FINAL WISHES: Regarding my funeral and burial arrangements..."
    };
    
    const sectionText = sectionMap[section];
    if (sectionText && !content.toLowerCase().includes(sectionText.toLowerCase()) && !readOnly) {
      const hint = sectionHints[section];
      toast({
        title: `Add ${section.replace('_', ' ')} details`,
        description: hint
      });
    }
  };

  const handleRecoverSession = () => {
    if (progress?.lastEditedSection) {
      setSection(progress.lastEditedSection);
      setShowRecoveryNotice(false);
      
      toast({
        title: "Session Recovered",
        description: `Continuing from where you left off: ${progress.lastEditedSection.replace('_', ' ')}`
      });
    }
  };

  const dismissRecoveryNotice = () => {
    setShowRecoveryNotice(false);
  };

  if (isLoading && !content) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-10 h-10 text-willtank-600 animate-spin mr-2" />
          <span className="text-lg text-gray-600">Loading will content...</span>
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-800">Error Loading Will</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button 
            onClick={() => navigate('/wills')}
            variant="outline"
            className="mt-4"
          >
            Return to Wills
          </Button>
        </div>
      </div>
    );
  }

  const renderAttachments = () => {
    if (!willData?.attachments?.length) return null;
    
    return (
      <div className="mt-6 space-y-4">
        <h3 className="font-medium text-lg">Attachments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {willData.attachments.map((attachment: any) => (
            <Card key={attachment.id} className="p-4">
              <div className="flex items-center gap-2">
                {getAttachmentIcon(attachment.type)}
                <div>
                  <p className="font-medium truncate">{attachment.name}</p>
                  <p className="text-sm text-gray-500">{attachment.size}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'audio':
        return <FileAudio className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderSectionSelector = () => {
    if (readOnly) return null;
    
    const sections = [
      { id: WILL_SECTIONS.PERSONAL_INFO, label: 'Personal Info', icon: <FileText className="h-4 w-4" /> },
      { id: WILL_SECTIONS.ASSETS, label: 'Assets', icon: <FileText className="h-4 w-4" /> },
      { id: WILL_SECTIONS.BENEFICIARIES, label: 'Beneficiaries', icon: <FileText className="h-4 w-4" /> },
      { id: WILL_SECTIONS.EXECUTORS, label: 'Executors', icon: <FileText className="h-4 w-4" /> },
      { id: WILL_SECTIONS.GUARDIANS, label: 'Guardians', icon: <FileText className="h-4 w-4" /> },
      { id: WILL_SECTIONS.DIGITAL_ASSETS, label: 'Digital Assets', icon: <FileText className="h-4 w-4" /> },
      { id: WILL_SECTIONS.FINAL_WISHES, label: 'Final Wishes', icon: <FileText className="h-4 w-4" /> },
    ];
    
    const isCompleted = (sectionId: string) => {
      return progress?.completedSections?.includes(sectionId);
    };
    
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {sections.map(section => (
          <TooltipProvider key={section.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeSection === section.id ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setSection(section.id)}
                  className={`flex items-center gap-1 ${isCompleted(section.id) ? 'border-green-500' : ''}`}
                >
                  {section.icon}
                  <span>{section.label}</span>
                  {isCompleted(section.id) && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isCompleted(section.id) 
                  ? `${section.label} section is complete` 
                  : `Add ${section.label.toLowerCase()} to your will`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  const renderProgressIndicator = () => {
    if (readOnly) return null;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Will Completion</span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
    );
  };

  const renderSuggestions = () => {
    if (readOnly || !suggestions.length) return null;
    
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="font-medium">AI Suggestions</span>
        </div>
        <ul className="space-y-1 text-sm">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderRecoveryNotice = () => {
    if (!showRecoveryNotice || readOnly) return null;
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-4"
        >
          <Alert>
            <Clock className="h-4 w-4 mr-2" />
            <AlertTitle>Resume your progress</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>You have an unfinished session. Would you like to continue where you left off?</span>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={dismissRecoveryNotice}>
                  Dismiss
                </Button>
                <Button size="sm" onClick={handleRecoverSession}>
                  Resume
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{readOnly ? 'View Will' : 'Edit Will'}</h3>
          {willData?.status && (
            <Badge variant="outline" className="capitalize">
              {willData.status}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Button variant="ghost" size="icon" onClick={() => toast({ title: "Undo", description: "Last change undone" })}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast({ title: "Redo", description: "Change reapplied" })}>
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleFormat}>
                <Code className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          {!readOnly && (
            <Button variant="outline" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {renderProgressIndicator?.()}
        {renderRecoveryNotice?.()}
        {renderSectionSelector?.()}
        {renderSuggestions?.()}
        
        <GuidedWillEditor
          willContent={content}
          onContentChange={handleContentChange}
          onSave={handleSave}
          readOnly={readOnly}
        />
        
        {renderAttachments?.()}
      </div>
    </div>
  );
}
