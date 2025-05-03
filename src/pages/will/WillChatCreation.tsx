
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SkylerAssistant } from './components/SkylerAssistant';
import { WillPreview } from './components/WillPreview';
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
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [currentlyUpdatingField, setCurrentlyUpdatingField] = useState<string | null>(null);
  
  // Track content changes to highlight updated sections
  useEffect(() => {
    if (currentlyUpdatingField) {
      setHighlightedSection(currentlyUpdatingField);
      
      // Clear the highlight after 2 seconds
      const timer = setTimeout(() => {
        setHighlightedSection(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [editableContent, currentlyUpdatingField]);
  
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
    console.log("Assistant complete triggered with data:", data);
    
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
  
  // Handle real-time updates to chat inputs
  const handleChatInputChange = (field: string, value: any) => {
    // Update the willData structure
    setWillData((prev: any) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [field]: value
      }
    }));
    
    // Mark this field as currently updating for highlighting
    setCurrentlyUpdatingField(field);
    
    // Update the content with the new value
    // In a real implementation, this would use your generateWillContent function
    // For now, we'll do a simple string replacement
    setEditableContent((prev) => {
      let updated = prev;
      
      // Handle different field types
      if (field === 'fullName') {
        updated = updated.replace(/Full Name: .*$/m, `Full Name: ${value}`);
      } else if (field === 'executorName') {
        updated = updated.replace(/Executor: .*$/m, `Executor: ${value}`);
      } else if (field === 'beneficiaries') {
        // This would be more complex in reality
        updated = updated.replace(/Beneficiaries: .*$/m, `Beneficiaries: ${Array.isArray(value) ? value.join(', ') : value}`);
      }
      
      return updated;
    });
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
  
  // Handle text changes in the editable area
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
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
              ? 'Chat with Skyler to create your will - answer questions and provide information through the conversation.' 
              : 'Review and finalize your will document before saving.'}
          </p>
        </div>
        
        {stage === 'chat' && (
          <SkylerAssistant 
            templateId={selectedTemplate.id}
            templateName={selectedTemplate.title}
            onComplete={handleAssistantComplete}
            onInputChange={handleChatInputChange}
          />
        )}
        
        {stage === 'review' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Will Document</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyToClipboard}
                    >
                      Copy Text
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Review your will document carefully before finalizing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-6 bg-white">
                  <h3 className="font-medium mb-4">Document Preview</h3>
                  <WillPreview 
                    content={editableContent} 
                    highlightSection={highlightedSection}
                  />
                  
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-medium mb-4">Edit Content</h3>
                    <textarea
                      value={editableContent}
                      onChange={handleContentChange}
                      className="w-full min-h-[300px] p-4 border rounded-md text-sm font-mono"
                    ></textarea>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                          <dd>{willData?.responses?.fullName || 'Not specified'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Marital Status</dt>
                          <dd>{willData?.responses?.maritalStatus || 'Not specified'}</dd>
                        </div>
                        {willData?.responses?.spouseName && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Spouse</dt>
                            <dd>{willData?.responses?.spouseName}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Will Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Template</dt>
                          <dd>{selectedTemplate.title}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Executor</dt>
                          <dd>{willData?.responses?.executorName || 'Not specified'}</dd>
                        </div>
                        {willData?.responses?.guardianName && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Guardian</dt>
                            <dd>{willData?.responses?.guardianName}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStage('chat')}
                  >
                    Back to Chat
                  </Button>
                  
                  <Button
                    onClick={handleSaveWill}
                    disabled={isSaving}
                    className="bg-willtank-600 hover:bg-willtank-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin mr-2">◌</span>
                        Saving...
                      </>
                    ) : (
                      'Finalize & Save Will'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
