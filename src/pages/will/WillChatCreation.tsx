import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SkylerAssistant } from './components/SkylerAssistant';
import { WillReviewStep } from './components/WillReviewStep';
import { templates } from './config/wizardSteps';
import { createWill } from '@/services/willService';

export default function WillChatCreation() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [stage, setStage] = useState<'chat' | 'review'>('chat');
  const [willData, setWillData] = useState<any>(null);
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Find the template based on the URL parameter
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      } else {
        toast({
          title: "Template Not Found",
          description: "The requested template could not be found. Redirecting to template selection.",
          variant: "destructive"
        });
        navigate('/will/create');
      }
    }
  }, [templateId, navigate, toast]);
  
  // When the AI assistant completes all questions, this function will be called
  const handleAssistantComplete = async (data: any) => {
    setWillData(data);
    setEditableContent(data.generatedWill || '');
    setStage('review');
    
    toast({
      title: "Will Draft Created",
      description: "Your will has been drafted based on your responses. Please review it now."
    });
    
    try {
      // Save the draft will to the database
      const will = {
        title: data.responses.fullName ? `Will of ${data.responses.fullName}` : 'My Will',
        status: 'draft',
        document_url: '',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: true,
        content: data.generatedWill || ''
      };
      
      await createWill(will);
    } catch (error) {
      console.error("Error saving draft will:", error);
      toast({
        title: "Error Saving Draft",
        description: "There was a problem saving your will draft. Your responses are still preserved.",
        variant: "destructive"
      });
    }
  };
  
  // Handle the finalization of the will after review
  const handleSaveWill = async () => {
    if (!willData) return;
    
    setIsSaving(true);
    
    try {
      const will = {
        title: willData.responses.fullName ? `Will of ${willData.responses.fullName}` : 'My Will',
        status: 'active',
        document_url: '',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: true,
        content: editableContent
      };
      
      const createdWill = await createWill(will);
      
      toast({
        title: "Will Finalized",
        description: "Your will has been successfully saved. You can access it anytime from your dashboard.",
      });
      
      if (createdWill && createdWill.id) {
        setTimeout(() => {
          navigate(`/wills`);
        }, 1500);
      }
      
    } catch (error) {
      console.error("Error finalizing will:", error);
      
      toast({
        title: "Error",
        description: "There was a problem finalizing your will. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editableContent);
    
    toast({
      title: "Copied",
      description: "Will content copied to clipboard.",
    });
  };

  if (!selectedTemplate) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin h-8 w-8 border-4 border-willtank-600 border-t-transparent rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {stage === 'chat' 
              ? `Creating Your ${selectedTemplate.title}` 
              : 'Review Your Will'}
          </h1>
          <p className="text-gray-500">
            {stage === 'chat' 
              ? 'Chat with Skyler to create your will - answer questions about your personal information, beneficiaries, and specific wishes.' 
              : 'Review and finalize your will document before saving. You can edit sections and add your signature.'}
          </p>
        </div>
        
        {stage === 'chat' && (
          <SkylerAssistant 
            templateId={selectedTemplate.id}
            templateName={selectedTemplate.title}
            onComplete={handleAssistantComplete}
          />
        )}
        
        {stage === 'review' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Review Your Will</CardTitle>
                </div>
                <CardDescription>
                  Review your will document carefully, make any necessary edits, and add your signature before finalizing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WillReviewStep 
                  editableContent={editableContent}
                  splitView={false}
                  setSplitView={() => {}}
                  handleContentChange={(e) => setEditableContent(e.target.value)}
                  handleCopyToClipboard={handleCopyToClipboard}
                  responses={willData?.responses || {}}
                  contacts={willData?.contacts || []}
                  selectedTemplate={selectedTemplate}
                  isCreatingWill={isSaving}
                  progress={isSaving ? 50 : 0}
                  handleFinalizeWill={handleSaveWill}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
