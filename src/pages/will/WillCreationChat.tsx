
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WillPreview } from './components/WillPreview';
import { createWill, updateWill } from '@/services/willService';
import { WillChat } from './components/WillChat';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Save } from 'lucide-react';

// Will template info type
interface WillTemplate {
  id: string;
  name: string;
}

export default function WillCreationChat() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [willDraft, setWillDraft] = useState<{ id?: string; title: string; content: string; status: string }>({
    title: '',
    content: '',
    status: 'draft'
  });
  
  const [template, setTemplate] = useState<WillTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize the will template info
  useEffect(() => {
    const initializeTemplate = async () => {
      if (!templateId) {
        toast({
          title: "Error",
          description: "No template selected. Please select a template first.",
          variant: "destructive",
        });
        navigate('/will/create');
        return;
      }
      
      // Get template name based on ID
      const templateName = getTemplateNameById(templateId);
      
      setTemplate({
        id: templateId,
        name: templateName
      });
      
      try {
        // Create initial draft will if not already created
        const initialDraft = {
          title: `${templateName} Draft`,
          status: 'draft',
          template_type: templateId,
          document_url: '',
          content: getInitialContent(templateId)
        };
        
        // Get the draft ID from localStorage if it exists
        const draftWillId = localStorage.getItem('currentWillDraftId');
        
        if (draftWillId) {
          // Load existing draft
          setWillDraft(prev => ({ ...prev, id: draftWillId }));
        } else {
          // Create a new draft
          const result = await createWill(initialDraft);
          if (result && result.id) {
            localStorage.setItem('currentWillDraftId', result.id);
            setWillDraft(prev => ({ ...prev, id: result.id, content: initialDraft.content }));
          }
        }
      } catch (error) {
        console.error('Error creating will draft:', error);
        toast({
          title: "Error",
          description: "There was a problem creating your will draft. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeTemplate();
  }, [templateId, navigate, toast]);
  
  // Update progress based on content
  useEffect(() => {
    const minLength = 200; // Minimum content length for a complete will
    const maxLength = 3000; // Target content length for a fully complete will
    
    if (willDraft.content) {
      const contentLength = willDraft.content.length;
      const calculatedProgress = Math.min(Math.max(Math.floor((contentLength - minLength) * 100 / (maxLength - minLength)), 0), 100);
      setProgress(calculatedProgress);
    }
  }, [willDraft.content]);
  
  // Function to update will content from chat with debounce
  const updateWillContent = async (newContent: string) => {
    // Immediately update local state for real-time preview
    setWillDraft(prev => ({ ...prev, content: newContent }));
    
    if (willDraft.id) {
      // Implement debounced saving to reduce API calls
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        if (isSaving) return;
        
        setIsSaving(true);
        try {
          await updateWill(willDraft.id, { content: newContent });
          console.log('Will content saved successfully');
        } catch (error) {
          console.error('Error updating will content:', error);
        } finally {
          setIsSaving(false);
        }
      }, 2000); // 2 second debounce
    }
  };
  
  // Helper function to get template name by ID
  const getTemplateNameById = (id: string): string => {
    const templateMap: Record<string, string> = {
      'basic': 'Basic Will',
      'family': 'Family Protection Will',
      'business': 'Business Owner Will',
      'complex': 'Complex Estate Will',
      'living': 'Living Will & Healthcare Directives',
      'digital-assets': 'Digital Assets Will'
    };
    
    return templateMap[id] || 'Custom Will';
  };
  
  // Generate an initial placeholder content for the will template
  const getInitialContent = (templateId: string): string => {
    const placeholders: Record<string, string> = {
      'basic': 'LAST WILL AND TESTAMENT\n\nI, [Your Name], being of sound mind, declare this to be my Last Will and Testament.',
      'family': 'FAMILY PROTECTION WILL\n\nI, [Your Name], being of sound mind, declare this to be my Last Will and Testament, with special provisions for the care and protection of my family.',
      'business': 'BUSINESS OWNER WILL\n\nI, [Your Name], being of sound mind, declare this to be my Last Will and Testament, with special provisions for my business assets and succession planning.',
      'complex': 'COMPLEX ESTATE WILL\n\nI, [Your Name], being of sound mind, declare this to be my Last Will and Testament, addressing my extensive holdings and complex distribution wishes.',
      'living': 'LIVING WILL AND HEALTHCARE DIRECTIVES\n\nI, [Your Name], being of sound mind, declare these to be my Healthcare Directives and wishes regarding medical treatment.',
      'digital-assets': 'DIGITAL ASSETS WILL\n\nI, [Your Name], being of sound mind, declare this to be my Last Will and Testament, with special provisions for my digital assets, accounts and properties.'
    };
    
    return placeholders[templateId] || 'LAST WILL AND TESTAMENT\n\nI, [Your Name], being of sound mind, declare this to be my Last Will and Testament.';
  };
  
  const handleSaveAndExit = async () => {
    if (willDraft.id) {
      try {
        // Clear any pending save timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        
        await updateWill(willDraft.id, willDraft);
        toast({
          title: "Will draft saved",
          description: "Your will draft has been saved. You can continue editing later.",
          variant: "default",
        });
        navigate('/wills');
      } catch (error) {
        console.error('Error saving will draft:', error);
        toast({
          title: "Error",
          description: "There was a problem saving your will draft. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-10 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Preparing your will creation experience...</h2>
            <Progress value={45} className="w-[300px] mb-4" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!template) {
    return (
      <Layout>
        <div className="container mx-auto py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Template not found</h2>
            <p className="mb-6">We couldn't find the template you selected. Please try again.</p>
            <Button onClick={() => navigate('/will/create')}>
              Select a Template
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex flex-col py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/will/create')}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">{template?.name} Creation</h1>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                {progress}% Complete
              </span>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleSaveAndExit}
              disabled={isSaving}
            >
              <Save className="mr-1 h-4 w-4" />
              Save & Exit
            </Button>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: Chat Interface */}
            <div className="border rounded-lg h-[calc(100vh-200px)] overflow-hidden">
              <div className="bg-slate-50 p-3 border-b">
                <h2 className="font-medium">Chat with Skyler, Your AI Will Assistant</h2>
              </div>
              <WillChat 
                templateId={templateId}
                templateName={template.name}
                onContentUpdate={updateWillContent}
                willContent={willDraft.content}
              />
            </div>
            
            {/* Right Column: Document Preview */}
            <div className="border rounded-lg h-[calc(100vh-200px)] overflow-auto">
              <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                <h2 className="font-medium">Will Document Preview</h2>
                <span className="text-xs text-gray-500">Updates in real-time as you chat</span>
              </div>
              <div className="p-1">
                <WillPreview content={willDraft.content} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
