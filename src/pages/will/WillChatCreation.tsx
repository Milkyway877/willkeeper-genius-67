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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateWillContent } from '@/utils/willTemplateUtils';
import { WillPreviewSection } from './components/WillPreviewSection';

export default function WillChatCreation() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [stage, setStage] = useState<'chat' | 'review'>('chat');
  const [willData, setWillData] = useState<any>(null);
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // New state for real-time preview
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [currentResponses, setCurrentResponses] = useState<Record<string, any>>({});
  const [currentContacts, setCurrentContacts] = useState<any[]>([]);
  const [livePreviewContent, setLivePreviewContent] = useState<string>('');
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 768);
  
  // Effect to handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Find the template based on the URL parameter
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        
        // Initialize with an empty placeholder rather than a fully-formed document with errors
        setLivePreviewContent('Your will document will appear here as you chat with Skyler...');
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
  
  // Handle real-time input changes from the assistant
  const handleInputChange = (data: { 
    responses: Record<string, any>; 
    contacts: any[]; 
    partialWill: string 
  }) => {
    setCurrentResponses(data.responses);
    setCurrentContacts(data.contacts);
    
    // Only update preview content if we have enough meaningful data
    if (Object.keys(data.responses).length > 0) {
      // Use the partialWill directly from the assistant if provided
      if (data.partialWill && data.partialWill.trim()) {
        setLivePreviewContent(data.partialWill);
      } else {
        // Otherwise generate from template and responses
        const templateContent = `
LAST WILL AND TESTAMENT

I, [Full Name], residing at [Address], being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils previously made by me.

ARTICLE I: PERSONAL INFORMATION
I declare that I was born on [Date of Birth] and that I am creating this will to ensure my wishes are carried out after my death.

ARTICLE II: APPOINTMENT OF EXECUTOR
I appoint [Executor Name] to serve as the Executor of my estate. If they are unable or unwilling to serve, I appoint [Alternate Executor Name] to serve as alternate Executor.

ARTICLE III: BENEFICIARIES
I bequeath my assets to the following beneficiaries:
[Beneficiary details to be added]

ARTICLE IV: SPECIFIC BEQUESTS
[Specific bequests to be added]

ARTICLE V: RESIDUAL ESTATE
I give all the rest and residue of my estate to [Beneficiary names and distribution details].

ARTICLE VI: FINAL ARRANGEMENTS
[Final arrangements to be added]

Digitally signed by: [Full Name]
Date: ${new Date().toLocaleDateString()}
        `;
        
        // Only generate content if we have meaningful responses
        const updatedContent = generateWillContent(data.responses, templateContent);
        setLivePreviewContent(updatedContent);
      }
    }
  };
  
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
        status: 'draft' as const,
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
        status: 'active' as const,
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
              ? 'Chat with Skyler to create your will - answer questions and provide information through the conversation.' 
              : 'Review and finalize your will document before saving.'}
          </p>
        </div>
        
        {stage === 'chat' && (
          isMobileView ? (
            <div className="space-y-4">
              <Tabs defaultValue="chat" onValueChange={(value) => setActiveTab(value as 'chat' | 'preview')}>
                <TabsList className="w-full">
                  <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1">Live Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="mt-2">
                  <SkylerAssistant 
                    templateId={selectedTemplate.id}
                    templateName={selectedTemplate.title}
                    onComplete={handleAssistantComplete}
                    onInputChange={handleInputChange}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Live Document Preview</CardTitle>
                      <CardDescription>
                        This preview updates as you chat with Skyler
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {livePreviewContent && Object.keys(currentResponses).length > 0 ? (
                        <div className="bg-gray-50 border rounded-md p-4 max-h-[60vh] overflow-y-auto font-serif">
                          <WillPreview content={livePreviewContent} />
                        </div>
                      ) : (
                        <div className="bg-gray-50 border rounded-md p-4 text-center text-gray-500 italic">
                          Start chatting with Skyler to see your will document preview
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <SkylerAssistant 
                  templateId={selectedTemplate.id}
                  templateName={selectedTemplate.title}
                  onComplete={handleAssistantComplete}
                  onInputChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-1">
                <WillPreviewSection 
                  content={livePreviewContent}
                />
              </div>
            </div>
          )
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
                  <WillPreview content={editableContent} />
                  
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-medium mb-4">Edit Content</h3>
                    <textarea
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
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
