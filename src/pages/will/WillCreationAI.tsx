
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createWill } from '@/services/willService';
import { SkylerAssistant } from './components/SkylerAssistant';
import { WillPreview } from './components/WillPreview';
import { Book, FileText, ArrowLeft, Save, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { TemplateCard } from './components/TemplateCard';
import { templates } from './config/wizardSteps';
import { clearWillProgress } from '@/services/willProgressService';
import { useSystemNotifications } from '@/hooks/use-system-notifications';

export default function WillCreationAI() {
  const navigate = useNavigate();
  const { id: templateId } = useParams<{ id?: string }>();
  const { toast } = useToast();
  const { notifySuccess } = useSystemNotifications();

  const [selectedTemplate, setSelectedTemplate] = useState(
    templateId ? templates.find(t => t.id === templateId) : null
  );
  const [phase, setPhase] = useState<'template' | 'creation' | 'review' | 'signing'>('template');
  const [willData, setWillData] = useState<any>(null);
  const [splitView, setSplitView] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [signature, setSignature] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [signatureDate, setSignatureDate] = useState(new Date());

  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setPhase('creation');
      }
    }
  }, [templateId]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setPhase('creation');
    
    toast({
      title: "Template Selected",
      description: `You've selected the ${template.title} template.`,
    });
  };

  const handleAssistantComplete = async (data: any) => {
    setWillData(data);
    setEditableContent(data.generatedWill);
    setPhase('review');
    
    try {
      const will = {
        title: data.responses.fullName ? `Will of ${data.responses.fullName}` : 'My Will',
        status: 'draft',
        document_url: '',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: true,
        content: data.generatedWill
      };
      
      await createWill(will);
      
    } catch (error) {
      console.error("Error saving draft will:", error);
    }
  };

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
      
      notifySuccess("Will Finalized", "Your will has been successfully finalized and saved.");
      
      if (createdWill && createdWill.id) {
        clearWillProgress(createdWill.id);
        
        setTimeout(() => {
          navigate(`/will/${createdWill.id}`);
        }, 1000);
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
  
  const handleSignWill = () => {
    if (signature) {
      setIsSigned(true);
      setSignatureDate(new Date());
      
      const signedContent = editableContent + `\n\nDigitally signed by: ${signature}\nDate: ${new Date().toLocaleDateString()}`;
      setEditableContent(signedContent);
      
      toast({
        title: "Will Signed",
        description: "Your will has been digitally signed.",
      });
    } else {
      toast({
        title: "Signature Required",
        description: "Please enter your signature to continue.",
        variant: "destructive"
      });
    }
  };
  
  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose a Will Template</CardTitle>
          <CardDescription>
            Select the template that best fits your needs. SKYLER will guide you through the creation process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <TemplateCard 
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => handleTemplateSelect(template)}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCreation = () => (
    <div className="space-y-6">
      {selectedTemplate && (
        <SkylerAssistant 
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.title}
          onComplete={handleAssistantComplete}
        />
      )}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Review Your Will</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSplitView(!splitView)}
              >
                {splitView ? "Single View" : "Split View"}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
          <CardDescription>
            Review and edit your will document before finalizing. You can make changes to the document on the right.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`${splitView ? 'flex flex-col md:flex-row gap-6' : 'space-y-6'}`}>
            <div className={`${splitView ? 'w-full md:w-1/2' : ''} border rounded-md p-6 bg-gray-50`}>
              <h3 className="font-medium mb-4">Document Preview</h3>
              <WillPreview content={editableContent} />
            </div>
            
            {splitView && (
              <div className="w-full md:w-1/2 border rounded-md p-6">
                <h3 className="font-medium mb-4">Edit Document</h3>
                <textarea
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full min-h-[500px] p-4 border rounded-md text-sm font-mono"
                ></textarea>
              </div>
            )}
            
            {willData?.contacts && willData.contacts.length > 0 && (
              <div className="mt-8 border rounded-md p-6">
                <h3 className="font-medium mb-4">Key Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {willData.contacts.map((contact: any) => (
                    <div key={contact.id} className="border rounded-md p-4">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.role}</div>
                      {contact.email && <div className="text-sm">{contact.email}</div>}
                      {contact.phone && <div className="text-sm">{contact.phone}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 border rounded-md p-6">
              <h3 className="font-medium mb-4">Digital Signature</h3>
              {!isSigned ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Please enter your full legal name as your digital signature to finalize this will.
                  </p>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Your full legal name"
                      className="border rounded-md p-2"
                    />
                    <Button
                      onClick={handleSignWill}
                      disabled={!signature}
                      className="w-full"
                    >
                      Sign Will
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <p className="text-sm font-medium">Signed by:</p>
                    <p className="text-lg font-serif italic">{signature}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date:</p>
                    <p>{signatureDate.toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setPhase('creation')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Chat
              </Button>
              
              <Button
                onClick={handleSaveWill}
                disabled={isSaving || !isSigned}
                className={isSigned ? "pulse-animation" : ""}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save & Finalize Will
                  </>
                )}
              </Button>
            </div>
            
            {isSigned && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">
                  <strong>Tip:</strong> After saving your will, you can record a supporting video testament or upload additional documents in the Documents section of your dashboard.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {phase === 'template' ? 'Choose a Will Template' : 
             phase === 'creation' ? `Creating Your ${selectedTemplate?.title || 'Will'}` : 
             'Review Your Will'}
          </h1>
          <p className="text-gray-500">
            {phase === 'template' ? 'Select a template to start creating your will with SKYLER.' : 
             phase === 'creation' ? 'SKYLER will guide you through the will creation process.' : 
             'Review and finalize your will document before saving.'}
          </p>
        </div>
        
        {phase === 'template' && renderTemplateSelection()}
        {phase === 'creation' && renderCreation()}
        {phase === 'review' && renderReview()}
      </div>
      
      <style>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(155, 135, 245, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(155, 135, 245, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(155, 135, 245, 0);
          }
        }
      `}</style>
    </Layout>
  );
}
