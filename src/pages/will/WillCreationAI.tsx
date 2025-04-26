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
import { Book, FileText, User, Video, ArrowLeft, Sparkles, Save, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { TemplateCard } from './components/TemplateCard';

// Enhanced templates with more options
const templates = [
  {
    id: 'traditional',
    title: 'Traditional Will',
    description: 'A comprehensive traditional will covering all your assets and wishes.',
    icon: <Book className="h-6 w-6 text-willtank-600" />,
    tags: ['Most Popular', 'Comprehensive'],
    features: [
      'Complete asset distribution',
      'Executor appointment',
      'Guardian designation',
      'Specific bequests'
    ]
  },
  {
    id: 'digital-assets',
    title: 'Digital Assets Will',
    description: 'Specialized will for digital assets like cryptocurrencies, online accounts, and digital memorabilia.',
    icon: <FileText className="h-6 w-6 text-willtank-600" />,
    tags: ['Modern', 'Digital Focus'],
    features: [
      'Cryptocurrency handling',
      'Social media accounts',
      'Digital collections & NFTs',
      'Password management'
    ]
  },
  {
    id: 'living-trust',
    title: 'Living Trust',
    description: 'Create a living trust to manage your assets during your lifetime and distribute them after death.',
    icon: <User className="h-6 w-6 text-willtank-600" />,
    tags: ['Advanced', 'Legal Protection'],
    features: [
      'Asset protection',
      'Probate avoidance',
      'Privacy preservation',
      'Flexible management'
    ]
  },
  {
    id: 'family',
    title: 'Family Protection Will',
    description: 'A will specifically designed to protect and provide for your family members.',
    icon: <User className="h-6 w-6 text-willtank-600" />,
    tags: ['Family Focused', 'Protection'],
    features: [
      'Minor children provisions',
      'Education funding',
      'Family heirlooms',
      'Staged distributions'
    ]
  },
  {
    id: 'business',
    title: 'Business Succession Will',
    description: 'Plan for the transition of your business interests and ensure continuity.',
    icon: <FileText className="h-6 w-6 text-willtank-600" />,
    tags: ['Business', 'Succession'],
    features: [
      'Business valuation',
      'Successor appointment',
      'Transition strategy',
      'Partner agreements'
    ]
  },
  {
    id: 'charity',
    title: 'Charitable Giving Will',
    description: 'Create a legacy through charitable giving and philanthropic planning.',
    icon: <User className="h-6 w-6 text-willtank-600" />,
    tags: ['Philanthropy', 'Legacy'],
    features: [
      'Charity designations',
      'Donation structures',
      'Tax optimization',
      'Legacy planning'
    ]
  }
];

export default function WillCreationAI() {
  const navigate = useNavigate();
  const { id: templateId } = useParams<{ id?: string }>();
  const { toast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState(
    templateId ? templates.find(t => t.id === templateId) : null
  );
  const [phase, setPhase] = useState<'template' | 'creation' | 'review'>('template');
  const [willData, setWillData] = useState<any>(null);
  const [splitView, setSplitView] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      // Save will to the database
      const will = {
        title: data.responses.fullName ? `Will of ${data.responses.fullName}` : 'My Will',
        status: 'draft',
        document_url: '',
        template_type: selectedTemplate?.id || 'traditional',
        ai_generated: true,
        content: data.generatedWill
      };
      
      await createWill(will);
      
      // Save contacts and documents if provided
      if (data.contacts && data.contacts.length > 0) {
        // Save contacts code would go here
      }
      
      if (data.documents && data.documents.length > 0) {
        // Save documents code would go here
      }
      
    } catch (error) {
      console.error("Error saving will data:", error);
    }
  };

  const handleSaveWill = async () => {
    if (!willData) return;
    
    setIsSaving(true);
    
    try {
      // Update the will content
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
        title: "Will Saved",
        description: "Your will has been successfully saved.",
      });
      
      if (createdWill && createdWill.id) {
        setTimeout(() => {
          navigate(`/will/${createdWill.id}`);
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error saving will:", error);
      
      toast({
        title: "Error",
        description: "There was a problem saving your will. Please try again.",
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
            {/* Preview section */}
            <div className={`${splitView ? 'w-full md:w-1/2' : ''} border rounded-md p-6 bg-gray-50`}>
              <h3 className="font-medium mb-4">Document Preview</h3>
              <WillPreview content={editableContent} />
            </div>
            
            {/* Editable section */}
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
            
            {/* Supporting documents */}
            {willData?.documents && willData.documents.length > 0 && (
              <div className="mt-8 border rounded-md p-6">
                <h3 className="font-medium mb-4">Supporting Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {willData.documents.map((doc: any) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-willtank-600" />
                          <span className="text-sm font-medium truncate">{doc.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Video testament */}
            {willData?.videoBlob && (
              <div className="mt-8 border rounded-md p-6">
                <h3 className="font-medium mb-4">Video Testament</h3>
                <video 
                  src={URL.createObjectURL(willData.videoBlob)} 
                  controls 
                  className="w-full h-auto rounded border"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
            
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
                disabled={isSaving}
                className="pulse-animation"
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
      
      <style>
        {`
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
        `}
      </style>
    </Layout>
  );
}
